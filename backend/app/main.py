"""
main.py — FastAPI application entry point.

Registers all REST endpoints, the WebSocket route, static file serving,
and CORS middleware. Calls init_db() on startup.

Error-handling contract:
- 400 for bad/missing input.
- 404 for missing resources.
- 500 is never intentionally surfaced; all unexpected exceptions are caught
  and re-raised as 500 with a generic message (so stack traces stay server-side).
"""

from __future__ import annotations

import logging
import os
import shutil
import uuid
from pathlib import Path
from typing import Optional

from fastapi import (
    Depends,
    FastAPI,
    File,
    Form,
    HTTPException,
    UploadFile,
    WebSocket,
    WebSocketDisconnect,
)
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.ai_services import check_and_link_duplicates, classify_grievance, transcribe_audio
from app.config import settings
from app.database import get_db, init_db
from app.models import (
    Grievance,
    GrievanceCategory,
    GrievanceStatus,
    ParticipatoryProject,
    ProjectStatus,
    ResolutionEvidence,
    User,
)
from app.schemas import (
    CategoryCount,
    GrievanceCreateResponse,
    GrievancePublic,
    ProjectOut,
    ResolutionEvidenceOut,
    StatsOut,
    VoteRequest,
)
from app.websocket_manager import manager

# ── Logging ───────────────────────────────────────────────────────────────────

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)-8s | %(name)s | %(message)s",
)
logger = logging.getLogger(__name__)

# ── App factory ───────────────────────────────────────────────────────────────

app = FastAPI(
    title="Civic Grievance Triage API",
    description="Evidence-grounded grievance management + participatory budgeting platform.",
    version="1.0.0",
)

# CORS — allow the Next.js dev server (and any additional configured origins)
# CORS – allow all origins for tunnel/demo access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Startup ───────────────────────────────────────────────────────────────────

@app.on_event("startup")
def startup_event() -> None:
    # Ensure upload directory exists
    Path(settings.upload_dir).mkdir(parents=True, exist_ok=True)
    # Create DB tables and seed demo data
    init_db()
    try:
        from app.database import SessionLocal
        import app.seed_demo as seed_demo

        db = SessionLocal()
        try:
            if hasattr(seed_demo, "seed_data"):
                seed_demo.seed_data(db)
            elif hasattr(seed_demo, "main"):
                try:
                    seed_demo.main([])
                except TypeError:
                    pass
        finally:
            db.close()
    except Exception as e:
        logger.warning("Seeding skipped or error: %s", e)
    logger.info("Database initialised. Upload dir: %s", settings.upload_dir)


# ── Static file serving ───────────────────────────────────────────────────────
# Serve uploaded images/audio at /static/uploads/<filename>
# In production: replace with a CDN URL, presigned S3, etc. — no code changes
# needed beyond updating the URL prefix stored in DB records.

@app.on_event("startup")
def mount_static() -> None:
    upload_path = Path(settings.upload_dir).resolve()
    app.mount("/static/uploads", StaticFiles(directory=str(upload_path)), name="uploads")


# ── Helpers ───────────────────────────────────────────────────────────────────

def _save_upload(file: UploadFile) -> str:
    """Save an UploadFile to the uploads directory and return its relative URL path."""
    ext = Path(file.filename or "file").suffix or ""
    filename = f"{uuid.uuid4()}{ext}"
    dest = Path(settings.upload_dir) / filename
    with dest.open("wb") as f:
        shutil.copyfileobj(file.file, f)
    return f"/static/uploads/{filename}"


# ── Health check ──────────────────────────────────────────────────────────────

@app.get("/health", tags=["Meta"])
def health_check():
    return {
        "status": "ok",
        "openai_available": settings.openai_available,
        "ws_connections": manager.active_count,
    }


# ── WebSocket ─────────────────────────────────────────────────────────────────

@app.websocket("/ws/live-updates")
async def websocket_endpoint(ws: WebSocket):
    await manager.connect(ws)
    try:
        while True:
            # We don't process inbound messages — just hold the connection open.
            # `receive_text` keeps the coroutine alive and surfaces disconnects.
            await ws.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(ws)


# ── Grievance endpoints ───────────────────────────────────────────────────────

@app.post("/api/grievances/submit", response_model=GrievanceCreateResponse, tags=["Grievances"])
async def submit_grievance(
    description: Optional[str] = Form(default=None),
    title: Optional[str] = Form(default=None),
    latitude: Optional[float] = Form(default=None),
    longitude: Optional[float] = Form(default=None),
    address: Optional[str] = Form(default=None),
    citizen_id: Optional[str] = Form(default=None),
    audio: Optional[UploadFile] = File(default=None),
    image: Optional[UploadFile] = File(default=None),
    db: Session = Depends(get_db),
):
    """
    Submit a new grievance. Requires at least description OR an audio file.

    Pipeline:
    1. Transcribe audio (if provided).
    2. Merge transcription + text description.
    3. Classify (category, priority, urgency_summary).
    4. Deduplication check.
    5. Persist to DB.
    6. Broadcast WebSocket event.
    """
    # 1. Validate: need at least some textual content
    audio_bytes: Optional[bytes] = None
    audio_filename: Optional[str] = None
    if audio and audio.filename:
        audio_bytes = await audio.read()
        audio_filename = audio.filename

    if not description and not audio_bytes:
        raise HTTPException(
            status_code=400,
            detail="Either 'description' text or an 'audio' file is required.",
        )

    # 2. Transcription
    transcript: str = ""
    audio_url: Optional[str] = None
    if audio_bytes and audio_filename:
        transcript = transcribe_audio(audio_bytes, audio_filename)
        # Save audio file
        audio_file_path = Path(settings.upload_dir) / f"{uuid.uuid4()}{Path(audio_filename).suffix}"
        audio_file_path.write_bytes(audio_bytes)
        audio_url = f"/static/uploads/{audio_file_path.name}"

    # Combine sources: audio transcript takes priority, description supplements
    combined_text = " ".join(filter(None, [transcript, description])).strip()
    if not combined_text:
        combined_text = "[No description provided]"

    # 3. Image upload
    image_url: Optional[str] = None
    if image and image.filename:
        image_url = _save_upload(image)

    # 4. Classify
    try:
        classification = classify_grievance(combined_text)
    except Exception as exc:
        logger.error("Classification error (should not reach here): %s", exc)
        classification = {"category": "OTHER", "priority_score": 3, "urgency_summary": ""}

    category_str = classification.get("category", "OTHER")
    priority_score = classification.get("priority_score", 3)
    urgency_summary = classification.get("urgency_summary", "")

    # Map category string to enum (with fallback)
    try:
        category = GrievanceCategory(category_str)
    except ValueError:
        category = GrievanceCategory.OTHER

    # 5. Auto-generate title if not provided
    if not title:
        title = f"{category.value.title()} Issue — {combined_text[:60].strip()}..."

    # 6. Deduplication
    grievance_id = str(uuid.uuid4())
    is_duplicate, parent_id = check_and_link_duplicates(
        grievance_id, combined_text, latitude, longitude
    )

    # 7. Persist
    grievance = Grievance(
        id=grievance_id,
        title=title,
        description=combined_text,
        category=category,
        status=GrievanceStatus.OPEN,
        priority_score=priority_score,
        latitude=latitude,
        longitude=longitude,
        address=address,
        image_url=image_url,
        audio_url=audio_url,
        is_duplicate=is_duplicate,
        parent_grievance_id=parent_id,
        upvote_count=1,
        citizen_id=citizen_id,
    )
    db.add(grievance)

    # If duplicate: increment the parent's upvote_count
    if is_duplicate and parent_id:
        parent = db.get(Grievance, parent_id)
        if parent:
            parent.upvote_count += 1

    db.commit()
    db.refresh(grievance)

    # 8. Broadcast WebSocket event
    await manager.broadcast({
        "event": "new_grievance",
        "data": GrievancePublic.model_validate(grievance).model_dump(mode="json"),
    })

    # Build response — include urgency_summary which is not in the DB model
    response = GrievanceCreateResponse.model_validate(grievance)
    # urgency_summary lives only in the response (AI output), not persisted
    response_dict = response.model_dump()
    response_dict["urgency_summary"] = urgency_summary
    return response_dict


@app.get("/api/grievances/public", response_model=list[GrievancePublic], tags=["Grievances"])
def get_public_grievances(
    category: Optional[str] = None,
    status: Optional[str] = None,
    db: Session = Depends(get_db),
):
    """Return non-duplicate grievances sorted by priority DESC, created_at DESC."""
    query = db.query(Grievance).filter(Grievance.is_duplicate == False)  # noqa: E712

    if category:
        try:
            cat_enum = GrievanceCategory(category.upper())
            query = query.filter(Grievance.category == cat_enum)
        except ValueError:
            raise HTTPException(status_code=400, detail=f"Invalid category: {category}")

    if status:
        try:
            status_enum = GrievanceStatus(status.upper())
            query = query.filter(Grievance.status == status_enum)
        except ValueError:
            raise HTTPException(status_code=400, detail=f"Invalid status: {status}")

    grievances = (
        query.order_by(Grievance.priority_score.desc(), Grievance.created_at.desc())
        .all()
    )
    return [GrievancePublic.model_validate(g) for g in grievances]


@app.get("/api/grievances/{grievance_id}", response_model=GrievancePublic, tags=["Grievances"])
def get_grievance(grievance_id: str, db: Session = Depends(get_db)):
    """Return a single grievance by ID. 404 if not found."""
    g = db.get(Grievance, grievance_id)
    if not g:
        raise HTTPException(status_code=404, detail="Grievance not found.")
    return GrievancePublic.model_validate(g)


@app.get(
    "/api/grievances/citizen/{citizen_id}",
    response_model=list[GrievancePublic],
    tags=["Grievances"],
)
def get_citizen_grievances(citizen_id: str, db: Session = Depends(get_db)):
    """Return all grievances (including duplicates) submitted by a specific citizen."""
    grievances = (
        db.query(Grievance)
        .filter(Grievance.citizen_id == citizen_id)
        .order_by(Grievance.created_at.desc())
        .all()
    )
    return [GrievancePublic.model_validate(g) for g in grievances]


@app.post(
    "/api/grievances/{grievance_id}/resolve",
    response_model=GrievancePublic,
    tags=["Grievances"],
)
async def resolve_grievance(
    grievance_id: str,
    comments: str = Form(..., description="Officer's resolution notes (required)."),
    officer_id: Optional[str] = Form(default=None),
    proof_image: Optional[UploadFile] = File(default=None),
    db: Session = Depends(get_db),
):
    """
    Resolve a grievance with evidence.
    Creates a ResolutionEvidence record, sets status to RESOLVED,
    and broadcasts a WebSocket event.
    """
    grievance = db.get(Grievance, grievance_id)
    if not grievance:
        raise HTTPException(status_code=404, detail="Grievance not found.")

    if not comments.strip():
        raise HTTPException(status_code=400, detail="'comments' field cannot be empty.")

    # Save proof image if provided
    proof_image_url: Optional[str] = None
    if proof_image and proof_image.filename:
        proof_image_url = _save_upload(proof_image)

    # Create evidence record
    evidence = ResolutionEvidence(
        grievance_id=grievance_id,
        officer_id=officer_id,
        proof_image_url=proof_image_url,
        comments=comments,
    )
    db.add(evidence)

    # Update grievance status
    grievance.status = GrievanceStatus.RESOLVED
    db.commit()
    db.refresh(grievance)

    # Broadcast
    await manager.broadcast({
        "event": "grievance_resolved",
        "data": GrievancePublic.model_validate(grievance).model_dump(mode="json"),
    })

    return GrievancePublic.model_validate(grievance)


# ── Admin stats ───────────────────────────────────────────────────────────────

@app.get("/api/admin/stats", response_model=StatsOut, tags=["Admin"])
def get_admin_stats(db: Session = Depends(get_db)):
    """Return dashboard statistics: totals, dedup count, resolve %, category breakdown."""
    total_reported = db.query(func.count(Grievance.id)).scalar() or 0
    auto_deduplicated = (
        db.query(func.count(Grievance.id)).filter(Grievance.is_duplicate == True).scalar() or 0  # noqa: E712
    )
    resolved_count = (
        db.query(func.count(Grievance.id))
        .filter(Grievance.status == GrievanceStatus.RESOLVED)
        .scalar() or 0
    )

    # Resolved % is of non-duplicate grievances (the "real" tickets)
    real_tickets = total_reported - auto_deduplicated
    resolved_percent = round((resolved_count / real_tickets * 100) if real_tickets > 0 else 0.0, 1)

    # Category breakdown (non-duplicate only)
    category_rows = (
        db.query(Grievance.category, func.count(Grievance.id))
        .filter(Grievance.is_duplicate == False)  # noqa: E712
        .group_by(Grievance.category)
        .all()
    )
    by_category = [
        CategoryCount(category=row[0].value, count=row[1]) for row in category_rows
    ]

    return StatsOut(
        total_reported=total_reported,
        auto_deduplicated=auto_deduplicated,
        resolved_percent=resolved_percent,
        by_category=by_category,
    )


# ── Participatory Budgeting ───────────────────────────────────────────────────

@app.get("/api/budgeting/projects", response_model=list[ProjectOut], tags=["Budgeting"])
def get_projects(db: Session = Depends(get_db)):
    """Return all participatory projects sorted by current votes DESC."""
    projects = (
        db.query(ParticipatoryProject)
        .order_by(ParticipatoryProject.current_votes.desc())
        .all()
    )
    return [ProjectOut.model_validate(p) for p in projects]


@app.post(
    "/api/budgeting/{project_id}/vote",
    response_model=ProjectOut,
    tags=["Budgeting"],
)
async def vote_for_project(
    project_id: str,
    body: VoteRequest,
    db: Session = Depends(get_db),
):
    """
    Cast a vote for a budgeting project.
    - Increments current_votes.
    - Auto-flips status to FUNDED when current_votes >= target_votes.
    - Broadcasts a WebSocket event.
    """
    project = db.get(ParticipatoryProject, project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found.")

    if project.status == ProjectStatus.FUNDED:
        raise HTTPException(
            status_code=400,
            detail="This project is already fully funded and no longer accepts votes.",
        )

    project.current_votes += 1
    if project.current_votes >= project.target_votes:
        project.status = ProjectStatus.FUNDED

    db.commit()
    db.refresh(project)

    await manager.broadcast({
        "event": "project_vote",
        "data": ProjectOut.model_validate(project).model_dump(mode="json"),
    })

    return ProjectOut.model_validate(project)

import os
import uvicorn

if __name__ == "__main__":
    port = int(os.getenv("PORT", 8000))
    uvicorn.run("app.main:app", host="0.0.0.0", port=port, reload=False)
    
