"""
ai_services.py — AI pipeline: transcription, classification, deduplication.

Offline-first design: every function has a fallback path that activates when
the API key is missing OR when any external call fails. The demo never crashes
due to a missing key or flaky network.

Assumptions (stated per spec instruction §0 rule 5):
- ChromaDB collection name is "grievances_v1"; changing this requires
  re-seeding (collection name is not configurable via env to keep it simple).
- The sentence-transformer model is downloaded once to ~/.cache/huggingface;
  subsequent runs are offline-capable.
- Haversine distance uses the WGS-84 mean Earth radius (6371 km).
"""

from __future__ import annotations

import io
import logging
import math
from typing import Optional

from app.config import settings

logger = logging.getLogger(__name__)

# ── Lazy-loaded singletons (only initialised if actually called) ───────────────
_chroma_client = None
_chroma_collection = None
_embedder = None
_openai_client = None

CHROMA_COLLECTION_NAME = "grievances_v1"


# ── Internal helpers ──────────────────────────────────────────────────────────

def _get_openai_client():
    """Return a cached OpenAI client, or None if the key is absent."""
    global _openai_client
    if _openai_client is None and settings.openai_available:
        try:
            from openai import OpenAI
            _openai_client = OpenAI(api_key=settings.openai_api_key)
        except Exception as exc:
            logger.warning("Failed to init OpenAI client: %s", exc)
    return _openai_client


def _get_embedder():
    """Return a cached SentenceTransformer instance, or None on failure."""
    global _embedder
    if _embedder is None:
        try:
            from sentence_transformers import SentenceTransformer
            _embedder = SentenceTransformer("all-MiniLM-L6-v2")
            logger.info("SentenceTransformer loaded successfully.")
        except Exception as exc:
            logger.warning(
                "SentenceTransformer unavailable (no internet? missing torch?): %s. "
                "Deduplication disabled for this session.",
                exc,
            )
    return _embedder


def _get_chroma_collection():
    """Return a cached ChromaDB collection, or None on failure."""
    global _chroma_client, _chroma_collection
    if _chroma_collection is None:
        try:
            import chromadb
            _chroma_client = chromadb.PersistentClient(path="./chroma_store")
            _chroma_collection = _chroma_client.get_or_create_collection(
                name=CHROMA_COLLECTION_NAME,
                metadata={"hnsw:space": "cosine"},
            )
            logger.info("ChromaDB collection '%s' ready.", CHROMA_COLLECTION_NAME)
        except Exception as exc:
            logger.warning(
                "ChromaDB unavailable: %s. Deduplication disabled for this session.", exc
            )
    return _chroma_collection


def _haversine_meters(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Return the great-circle distance in metres between two WGS-84 coordinates."""
    R = 6_371_000  # Earth radius in metres
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    d_phi = math.radians(lat2 - lat1)
    d_lambda = math.radians(lon2 - lon1)
    a = math.sin(d_phi / 2) ** 2 + math.cos(phi1) * math.cos(phi2) * math.sin(d_lambda / 2) ** 2
    return R * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))


# ── Keyword-rule fallback classifier ─────────────────────────────────────────

_CATEGORY_KEYWORDS: dict[str, list[str]] = {
    "SANITATION": [
        "garbage", "waste", "trash", "drain", "sewage", "stink", "smell",
        "litter", "toilet", "sanitation", "filth", "rubbish", "dustbin",
    ],
    "ROADS": [
        "pothole", "road", "street", "footpath", "pavement", "crack", "broken road",
        "signal", "divider", "speed bump", "highway", "bridge",
    ],
    "ELECTRICITY": [
        "power", "electricity", "light", "electric", "outage", "blackout",
        "voltage", "wire", "pole", "transformer", "spark",
    ],
    "WATER": [
        "water", "pipe", "leak", "flood", "waterlog", "tap", "supply", "drain",
        "overflow", "blockage", "puddle", "sewer",
    ],
}

_URGENCY_KEYWORDS: set[str] = {
    "urgent", "emergency", "danger", "unsafe", "injured", "collapse",
    "critical", "fire", "accident", "severe", "immediate",
}


def _keyword_classify(text: str) -> dict:
    """
    Deterministic fallback classifier.

    Returns the same dict shape as the LLM path:
    {category, priority_score (1–5), urgency_summary}

    Logic:
    - Category: whichever bucket has the most keyword matches (ties → OTHER).
    - Priority: 5 if any urgency keyword found, else 3 (medium default).
    - urgency_summary: a canned string appropriate for the classification.
    """
    lower = text.lower()

    # Count keyword hits per category
    scores: dict[str, int] = {cat: 0 for cat in _CATEGORY_KEYWORDS}
    for cat, kws in _CATEGORY_KEYWORDS.items():
        for kw in kws:
            if kw in lower:
                scores[cat] += 1

    best_cat = max(scores, key=lambda c: scores[c])
    category = best_cat if scores[best_cat] > 0 else "OTHER"

    # Priority
    has_urgency = any(kw in lower for kw in _URGENCY_KEYWORDS)
    priority_score = 5 if has_urgency else 3

    urgency_summary = (
        "Urgent issue requiring immediate attention."
        if has_urgency
        else f"Reported {category.lower()} issue, assigned standard priority."
    )

    return {
        "category": category,
        "priority_score": priority_score,
        "urgency_summary": urgency_summary,
    }


# ── Public API ────────────────────────────────────────────────────────────────

def transcribe_audio(file_bytes: bytes, filename: str) -> str:
    """
    Transcribe audio bytes using OpenAI Whisper.

    Fallback: if OPENAI_API_KEY is unset or the call fails, returns a
    placeholder string and logs a warning — never raises.
    """
    client = _get_openai_client()
    if client is None:
        logger.warning(
            "transcribe_audio: OpenAI key not configured — returning offline placeholder."
        )
        return "[transcription unavailable in offline demo mode]"

    try:
        file_tuple = (filename, io.BytesIO(file_bytes), "audio/webm")
        response = client.audio.transcriptions.create(
            model="whisper-1",
            file=file_tuple,
            language="en",
        )
        transcript = response.text.strip()
        logger.info("Whisper transcription: %s chars", len(transcript))
        return transcript if transcript else "[empty transcription returned by Whisper]"
    except Exception as exc:
        logger.warning("Whisper call failed (%s) — returning offline placeholder.", exc)
        return "[transcription unavailable in offline demo mode]"


def classify_grievance(text: str) -> dict:
    """
    Classify a grievance text, returning category, priority_score, urgency_summary.

    Primary path: GPT-4o-mini prompted for strict JSON output.
    Fallback: deterministic keyword-rule engine (always implemented, never a stub).

    Return shape:
        {
            "category": "SANITATION" | "ROADS" | "ELECTRICITY" | "WATER" | "OTHER",
            "priority_score": 1–5,
            "urgency_summary": str,
        }
    """
    client = _get_openai_client()
    if client is None:
        logger.info("classify_grievance: no API key — using keyword fallback.")
        return _keyword_classify(text)

    system_prompt = (
        "You are a municipal grievance classification AI. "
        "Classify the complaint into exactly one of: SANITATION, ROADS, ELECTRICITY, WATER, OTHER. "
        "Assign a priority_score from 1 (low) to 5 (critical emergency). "
        "Write a brief urgency_summary (≤20 words). "
        "RESPOND WITH VALID JSON ONLY, no markdown fences. "
        'Schema: {"category": str, "priority_score": int, "urgency_summary": str}'
    )

    try:
        import json

        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": text[:2000]},  # Cap token usage
            ],
            temperature=0,
            max_tokens=120,
        )
        raw = response.choices[0].message.content.strip()
        result = json.loads(raw)

        # Validate and clamp priority_score
        category = result.get("category", "OTHER").upper()
        if category not in {"SANITATION", "ROADS", "ELECTRICITY", "WATER", "OTHER"}:
            category = "OTHER"
        priority_score = max(1, min(5, int(result.get("priority_score", 3))))
        urgency_summary = str(result.get("urgency_summary", ""))

        return {
            "category": category,
            "priority_score": priority_score,
            "urgency_summary": urgency_summary,
        }
    except Exception as exc:
        logger.warning(
            "GPT classification failed (%s) — falling back to keyword engine.", exc
        )
        return _keyword_classify(text)


def check_and_link_duplicates(
    new_id: str,
    new_text: str,
    lat: Optional[float],
    lng: Optional[float],
) -> tuple[bool, Optional[str]]:
    """
    Check if the new grievance is a duplicate of an existing one.

    Algorithm:
    1. Embed new_text with all-MiniLM-L6-v2.
    2. Query ChromaDB for the 5 nearest neighbours by cosine similarity.
    3. For each candidate above DEDUP_SIMILARITY_THRESHOLD:
       - If both have lat/lng, also check haversine distance ≤ DEDUP_RADIUS_METERS.
       - If either location is missing, skip geographic check (text similarity alone
         is sufficient for the demo; in production you'd want stricter rules).
    4. Always upsert the new embedding into the collection.

    Returns:
        (is_duplicate: bool, parent_id: str | None)

    On any ChromaDB/embedder failure: returns (False, None) — submission succeeds
    without dedup for this entry.
    """
    embedder = _get_embedder()
    collection = _get_chroma_collection()

    if embedder is None or collection is None:
        logger.warning(
            "check_and_link_duplicates: embedding/vector-store unavailable — skipping dedup."
        )
        return False, None

    try:
        # 1. Embed the new text
        embedding: list[float] = embedder.encode(new_text, normalize_embeddings=True).tolist()

        # 2. Query for nearest neighbours (only if the collection is non-empty)
        is_duplicate = False
        parent_id: Optional[str] = None

        collection_count = collection.count()
        if collection_count > 0:
            n_results = min(5, collection_count)
            results = collection.query(
                query_embeddings=[embedding],
                n_results=n_results,
                include=["metadatas", "distances"],
            )

            ids_list = results.get("ids", [[]])[0]
            distances = results.get("distances", [[]])[0]
            metadatas = results.get("metadatas", [[]])[0]

            # ChromaDB cosine distance = 1 − cosine_similarity
            similarity_threshold = settings.dedup_similarity_threshold
            radius = settings.dedup_radius_meters

            for candidate_id, distance, metadata in zip(ids_list, distances, metadatas):
                similarity = 1.0 - distance  # Convert distance → similarity
                if similarity < similarity_threshold:
                    continue  # Not similar enough

                # Geographic check — only when both records have coordinates
                candidate_lat = metadata.get("lat")
                candidate_lng = metadata.get("lng")
                if (
                    lat is not None
                    and lng is not None
                    and candidate_lat is not None
                    and candidate_lng is not None
                ):
                    dist_m = _haversine_meters(lat, lng, float(candidate_lat), float(candidate_lng))
                    if dist_m > radius:
                        # Semantically similar but geographically distant — NOT a duplicate
                        logger.info(
                            "Dedup: similar text (%.2f) but %.0fm apart — not merging.",
                            similarity,
                            dist_m,
                        )
                        continue

                # Passed both checks — it's a duplicate
                is_duplicate = True
                parent_id = candidate_id
                logger.info(
                    "Duplicate detected: new=%s is a duplicate of existing=%s (similarity=%.2f).",
                    new_id,
                    candidate_id,
                    similarity,
                )
                break

        # 3. Always store the new embedding (even if it's a duplicate — keeps index accurate)
        collection.upsert(
            ids=[new_id],
            embeddings=[embedding],
            metadatas=[{
                "lat": lat if lat is not None else "",
                "lng": lng if lng is not None else "",
            }],
        )

        return is_duplicate, parent_id

    except Exception as exc:
        logger.warning("Dedup pipeline error (%s) — skipping dedup for this entry.", exc)
        return False, None
