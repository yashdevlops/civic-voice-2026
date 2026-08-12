"""
seed_demo.py — Demo data seeder + live duplicate simulation.

Usage:
    python -m app.seed_demo              # Seed users, complaints, projects
    python -m app.seed_demo --simulate   # Only run the duplicate simulation

Idempotency: checks for existing rows by phone (users) or title (grievances,
projects) before inserting, so re-running before a second demo doesn't produce
duplicates or errors.

Important: grievances are submitted via the live HTTP API (not direct DB inserts)
so that the full AI pipeline (classification + embedding) runs and the ChromaDB
vector store is correctly populated. The backend must be running before seeding.
"""

from __future__ import annotations

import argparse
import sys
import time

import httpx

# ── Configuration ─────────────────────────────────────────────────────────────

BASE_URL = "http://localhost:8000"

# Geographic cluster: a small neighbourhood in Bhubaneswar, Odisha, India.
# Coordinates are realistic; dedup radius tests will work correctly.
BASE_LAT = 20.2961
BASE_LNG = 85.8245

# Demo users
DEMO_USERS = [
    {"name": "Priya Nayak", "phone": "9000000001", "role": "CITIZEN"},
    {"name": "Officer Ramesh Kumar", "phone": "9000000002", "role": "DEPT_OFFICER"},
]

# 8 realistic grievances spread across 4 categories.
# lat/lng offsets are in degrees (~±30m each step ≈ ~0.0003°).
DEMO_GRIEVANCES = [
    {
        "title": "Overflowing garbage bin near Saheed Nagar market",
        "description": (
            "The municipal garbage bin at the corner of Saheed Nagar market has been "
            "overflowing for the past 5 days. Garbage is spilling onto the footpath "
            "and causing a severe stink. Flies and stray dogs are congregating. "
            "Immediate sanitation attention required."
        ),
        "address": "Saheed Nagar Market, Bhubaneswar",
        "lat_offset": 0.0000,
        "lng_offset": 0.0000,
        "category_hint": None,  # Let AI classify
    },
    {
        "title": "Deep pothole on Janpath road causing accidents",
        "description": (
            "There is a very deep pothole on the main Janpath road near the State Museum "
            "intersection. Two two-wheelers have already skidded because of it this week. "
            "The pothole is approximately 60cm wide and 15cm deep. Very unsafe, urgent repair needed."
        ),
        "address": "Janpath Road near State Museum, Bhubaneswar",
        "lat_offset": 0.0003,
        "lng_offset": 0.0002,
        "category_hint": None,
    },
    {
        "title": "Street light not working for 2 weeks — Unit-4",
        "description": (
            "The street light pole at Unit-4 housing colony lane 3 has not been working "
            "for the past two weeks. The area is completely dark at night. Women residents "
            "feel unsafe. Please fix the electricity supply or replace the bulb urgently."
        ),
        "address": "Unit-4, Housing Colony Lane 3, Bhubaneswar",
        "lat_offset": -0.0002,
        "lng_offset": 0.0004,
        "category_hint": None,
    },
    {
        "title": "Water supply pipe burst flooding the road",
        "description": (
            "A municipal water supply pipe has burst near Kalpana Square. Water is gushing "
            "out and flooding the main road, making it impassable. There is risk of the "
            "road foundation collapsing. Emergency repair is needed immediately."
        ),
        "address": "Kalpana Square, Bhubaneswar",
        "lat_offset": 0.0005,
        "lng_offset": -0.0003,
        "category_hint": None,
    },
    {
        "title": "Drain blocked causing waterlogging in Nayapalli",
        "description": (
            "The storm drain on Nayapalli main road is completely blocked with silt and debris. "
            "After each rain, the area gets waterlogged for hours making it difficult for "
            "residents and shopkeepers. The blockage needs to be cleared urgently."
        ),
        "address": "Nayapalli Main Road, Bhubaneswar",
        "lat_offset": 0.0001,
        "lng_offset": 0.0006,
        "category_hint": None,
    },
    {
        "title": "Transformer making loud buzzing noise — fire risk",
        "description": (
            "The electrical transformer near the Vani Vihar colony entrance has started "
            "making a very loud buzzing sound and sparking occasionally at night. Residents "
            "fear a fire hazard. The situation is dangerous — please send an electrical team "
            "to inspect immediately."
        ),
        "address": "Vani Vihar Colony Entrance, Bhubaneswar",
        "lat_offset": -0.0004,
        "lng_offset": -0.0001,
        "category_hint": None,
    },
    {
        "title": "No water supply for 3 days — Chandrasekharpur",
        "description": (
            "Residents in Chandrasekharpur sector-6 have had no water supply for three "
            "consecutive days. The water tankers provided are inadequate for the number of "
            "families. Elderly and children are badly affected. Please restore piped water "
            "supply urgently."
        ),
        "address": "Chandrasekharpur Sector 6, Bhubaneswar",
        "lat_offset": 0.0002,
        "lng_offset": -0.0005,
        "category_hint": None,
    },
    {
        "title": "Road surface completely broken on Budheswari colony road",
        "description": (
            "The entire surface of Budheswari colony road internal lane has been broken up "
            "due to recent water-main repair work that was done two months ago, but the road "
            "was never repaired afterwards. It is full of rubble and sharp edges. "
            "Vehicles and pedestrians are being hurt regularly."
        ),
        "address": "Budheswari Colony Internal Lane, Bhubaneswar",
        "lat_offset": -0.0001,
        "lng_offset": -0.0004,
        "category_hint": None,
    },
]

# 3 participatory projects
DEMO_PROJECTS = [
    {
        "title": "Solar-Powered Street Lights — Ward 12",
        "description": (
            "Install 50 solar-powered LED street lights across Ward 12 residential lanes "
            "to improve night safety and reduce municipality electricity costs by an estimated "
            "₹2 lakh per year."
        ),
        "budget_allocated": 1500000.0,  # ₹15 lakh
        "target_votes": 200,
        "current_votes": 167,
        "category": "ELECTRICITY",
        "status": "VOTING",
    },
    {
        "title": "Community Waste Segregation Centre — Saheed Nagar",
        "description": (
            "Build a modern waste segregation and composting centre for Saheed Nagar ward. "
            "Expected to reduce landfill load by 40% and create 15 green-collar jobs "
            "for local residents."
        ),
        "budget_allocated": 2200000.0,  # ₹22 lakh
        "target_votes": 150,
        "current_votes": 150,  # Fully funded
        "category": "SANITATION",
        "status": "FUNDED",
    },
    {
        "title": "Road Resurfacing — Nayapalli Internal Roads",
        "description": (
            "Complete resurfacing of 3.2 km of internal colony roads in Nayapalli using "
            "high-durability bituminous concrete. Includes proper storm-water drain "
            "channels to prevent seasonal waterlogging."
        ),
        "budget_allocated": 4500000.0,  # ₹45 lakh
        "target_votes": 300,
        "current_votes": 89,
        "category": "ROADS",
        "status": "VOTING",
    },
]


# ── API helpers ───────────────────────────────────────────────────────────────

def _wait_for_backend(max_retries: int = 10) -> None:
    """Poll /health until the backend is up, or abort."""
    for attempt in range(max_retries):
        try:
            r = httpx.get(f"{BASE_URL}/health", timeout=3)
            if r.status_code == 200:
                print(f"✅ Backend is up (attempt {attempt + 1}).")
                return
        except Exception:
            pass
        print(f"⏳ Waiting for backend... attempt {attempt + 1}/{max_retries}")
        time.sleep(2)
    print("❌ Backend not reachable. Is `uvicorn app.main:app --port 8000` running?")
    sys.exit(1)


def _seed_user(client: httpx.Client, user_data: dict) -> str | None:
    """
    Create a user by inserting directly into the DB via SQLAlchemy.

    We bypass the HTTP API here because there's no public user-creation endpoint
    (users are provisioned by admins in production; seed script has DB access).
    Returns the user's ID (existing or newly created).
    """
    # Import here to ensure app context is available
    from app.database import SessionLocal
    from app.models import User, UserRole

    db = SessionLocal()
    try:
        existing = db.query(User).filter(User.phone == user_data["phone"]).first()
        if existing:
            print(f"  ↩  User '{user_data['name']}' already exists (id={existing.id}).")
            return existing.id

        user = User(
            name=user_data["name"],
            phone=user_data["phone"],
            role=UserRole(user_data["role"]),
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        print(f"  ✅ Created user '{user.name}' (id={user.id}).")
        return user.id
    finally:
        db.close()


def _seed_grievance(client: httpx.Client, grievance_data: dict, citizen_id: str) -> dict | None:
    """Submit a grievance via the live API. Returns the response dict or None on failure."""
    # Idempotency: check if a grievance with this title already exists
    from app.database import SessionLocal
    from app.models import Grievance as GrievanceModel

    db = SessionLocal()
    try:
        existing = db.query(GrievanceModel).filter(
            GrievanceModel.title == grievance_data["title"]
        ).first()
        if existing:
            print(f"  ↩  Grievance '{grievance_data['title'][:50]}...' already exists.")
            return {"id": existing.id, "title": existing.title}
    finally:
        db.close()

    lat = BASE_LAT + grievance_data["lat_offset"]
    lng = BASE_LNG + grievance_data["lng_offset"]

    data = {
        "title": grievance_data["title"],
        "description": grievance_data["description"],
        "address": grievance_data.get("address", ""),
        "citizen_id": citizen_id,
        "latitude": str(lat),
        "longitude": str(lng),
    }

    try:
        r = client.post(f"{BASE_URL}/api/grievances/submit", data=data, timeout=30)
        r.raise_for_status()
        result = r.json()
        status_flag = "🔴 DUPLICATE" if result.get("is_duplicate") else "✅"
        print(
            f"  {status_flag} Submitted: '{result['title'][:50]}' "
            f"| category={result['category']} | priority={result['priority_score']}"
        )
        return result
    except Exception as exc:
        print(f"  ❌ Failed to submit '{grievance_data['title'][:50]}': {exc}")
        return None


def _seed_project(project_data: dict) -> None:
    """Insert a participatory project directly into the DB (no HTTP endpoint for creation)."""
    from app.database import SessionLocal
    from app.models import ParticipatoryProject, ProjectStatus

    db = SessionLocal()
    try:
        existing = db.query(ParticipatoryProject).filter(
            ParticipatoryProject.title == project_data["title"]
        ).first()
        if existing:
            print(f"  ↩  Project '{project_data['title'][:50]}' already exists.")
            return

        project = ParticipatoryProject(
            title=project_data["title"],
            description=project_data["description"],
            budget_allocated=project_data["budget_allocated"],
            target_votes=project_data["target_votes"],
            current_votes=project_data["current_votes"],
            category=project_data["category"],
            status=ProjectStatus(project_data["status"]),
        )
        db.add(project)
        db.commit()
        print(f"  ✅ Created project '{project.title[:50]}' (status={project.status.value}).")
    finally:
        db.close()


# ── Duplicate simulation ──────────────────────────────────────────────────────

def simulate_duplicate_submission(citizen_id: str) -> None:
    """
    Submit a near-duplicate of the first seeded grievance (garbage bin / Saheed Nagar).

    The wording is paraphrased (not identical) and the coordinates are shifted
    ~10-20m to simulate a second citizen reporting the same issue from nearby.
    This triggers the real ChromaDB + haversine dedup pipeline end-to-end.
    """
    print("\n🎬 LIVE DUPLICATE SIMULATION — submitting near-duplicate complaint...")
    print("   (Wording paraphrased, coordinates ~15m from original)")

    # ~15m north of the original garbage complaint (BASE_LAT + 0.00013°)
    sim_lat = BASE_LAT + 0.00013
    sim_lng = BASE_LNG + 0.00005

    data = {
        "title": "Rubbish pile overflowing at Saheed Nagar market corner",
        "description": (
            "The waste collection point at Saheed Nagar market has not been cleared "
            "in days. There is a huge pile of rubbish overflowing onto the street, "
            "creating a very bad smell and attracting stray animals. "
            "Please arrange garbage collection immediately."
        ),
        "address": "Near Saheed Nagar Market, Bhubaneswar",
        "citizen_id": citizen_id,
        "latitude": str(sim_lat),
        "longitude": str(sim_lng),
    }

    with httpx.Client() as client:
        try:
            r = client.post(f"{BASE_URL}/api/grievances/submit", data=data, timeout=30)
            r.raise_for_status()
            result = r.json()

            print("\n📊 SIMULATION RESULT:")
            print(f"   New ticket ID        : {result['id']}")
            print(f"   is_duplicate         : {result['is_duplicate']}")
            print(f"   parent_grievance_id  : {result.get('parent_grievance_id', 'N/A')}")
            print(f"   upvote_count         : {result.get('upvote_count', 'N/A')}")
            print(f"   category             : {result['category']}")
            print(f"   priority_score       : {result['priority_score']}")

            if result.get("is_duplicate"):
                print("\n✅ DEDUP PIPELINE WORKING: Duplicate correctly detected and merged!")
                print("   The DuplicateAlertModal will appear on the citizen's screen.")
                print(
                    "   Parent ticket upvote_count incremented — "
                    "showing community impact aggregation."
                )
            else:
                print("\n⚠️  No duplicate detected. Possible reasons:")
                print("   - ChromaDB/sentence-transformers not available (offline mode)")
                print("   - Similarity below threshold (check DEDUP_SIMILARITY_THRESHOLD)")
                print("   - Original grievances not yet seeded (run without --simulate first)")

        except Exception as exc:
            print(f"\n❌ Simulation failed: {exc}")


# ── Main ──────────────────────────────────────────────────────────────────────

def main() -> None:
    parser = argparse.ArgumentParser(description="Seed demo data for the Civic Grievance platform.")
    parser.add_argument(
        "--simulate",
        action="store_true",
        help="Only run the duplicate simulation (requires prior seeding).",
    )
    args = parser.parse_args()

    # Wait for backend
    _wait_for_backend()

    if args.simulate:
        # For simulation we need a citizen ID — try to find the seeded one
        from app.database import SessionLocal
        from app.models import User

        db = SessionLocal()
        try:
            citizen = db.query(User).filter(User.phone == "9000000001").first()
            if not citizen:
                print("❌ Seeded citizen user not found. Run without --simulate first.")
                sys.exit(1)
            citizen_id = citizen.id
        finally:
            db.close()

        simulate_duplicate_submission(citizen_id)
        return

    print("\n═══════════════════════════════════════════")
    print("  CIVIC GRIEVANCE PLATFORM — DEMO SEEDER   ")
    print("═══════════════════════════════════════════\n")

    # ── Step 1: Seed users ────────────────────────────────────────────────────
    print("📋 Seeding users...")
    user_ids: dict[str, str] = {}
    for user_data in DEMO_USERS:
        uid = _seed_user(None, user_data)
        if uid:
            user_ids[user_data["phone"]] = uid

    citizen_id = user_ids.get("9000000001", "demo-citizen")
    print(f"   Citizen ID for submissions: {citizen_id}\n")

    # ── Step 2: Seed grievances via live API ──────────────────────────────────
    print("📝 Seeding grievances via live API (runs full AI pipeline)...")
    with httpx.Client() as client:
        for g_data in DEMO_GRIEVANCES:
            _seed_grievance(client, g_data, citizen_id)
            # Small delay to avoid overwhelming the local server
            time.sleep(0.5)

    # ── Step 3: Seed projects ─────────────────────────────────────────────────
    print("\n💰 Seeding participatory projects...")
    for p_data in DEMO_PROJECTS:
        _seed_project(p_data)

    print("\n═══════════════════════════════════════════")
    print("  SEEDING COMPLETE                          ")
    print("═══════════════════════════════════════════")
    print("\nNext steps:")
    print("  • Open http://localhost:3000 to see the platform")
    print("  • Run with --simulate to trigger a live duplicate detection on stage")
    print("  • python -m app.seed_demo --simulate\n")


if __name__ == "__main__":
    main()
