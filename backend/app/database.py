"""
database.py — SQLAlchemy engine, session factory, and init_db helper.

Design notes:
- Uses synchronous SQLAlchemy (not async) to keep the FastAPI dependency
  injection simple and avoid async context-manager complexity on SQLite.
- The engine is created once at module import; all routes use `get_db()`
  as a FastAPI dependency to obtain a scoped session.
- `init_db()` is called from `main.py` on startup — it creates all tables
  whose models are defined in models.py (import order matters; models.py
  is imported before init_db is called).
"""

from __future__ import annotations

from sqlalchemy import create_engine, event
from sqlalchemy.orm import DeclarativeBase, sessionmaker, Session

from app.config import settings


# ── Engine ────────────────────────────────────────────────────────────────────

# connect_args is only meaningful for SQLite; ignored by other dialects.
_connect_args: dict = {}
if settings.database_url.startswith("sqlite"):
    _connect_args = {"check_same_thread": False}

engine = create_engine(
    settings.database_url,
    connect_args=_connect_args,
    echo=False,        # Set True for SQL query logging during local dev
    pool_pre_ping=True,
)

# Enable WAL mode on SQLite for better concurrent-read performance
# (harmless no-op on other databases since the event won't fire).
@event.listens_for(engine, "connect")
def _set_sqlite_pragma(dbapi_conn, _connection_record):
    if settings.database_url.startswith("sqlite"):
        cursor = dbapi_conn.cursor()
        cursor.execute("PRAGMA journal_mode=WAL")
        cursor.close()


# ── Session factory ───────────────────────────────────────────────────────────

SessionLocal = sessionmaker(
    bind=engine,
    autocommit=False,
    autoflush=False,
    expire_on_commit=False,  # Keep ORM objects usable after commit (avoids lazy-load after close)
)


# ── Base class for all ORM models ─────────────────────────────────────────────

class Base(DeclarativeBase):
    pass


# ── FastAPI dependency ────────────────────────────────────────────────────────

def get_db():
    """Yield a database session; always close on exit (even on exceptions)."""
    db: Session = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# ── Table creation ────────────────────────────────────────────────────────────

def init_db() -> None:
    """Create all tables defined in models.py.

    Must be called AFTER models.py has been imported so SQLAlchemy's
    metadata registry knows about every table.
    """
    # Import here to register all models in Base.metadata before create_all
    import app.models  # noqa: F401
    Base.metadata.create_all(bind=engine)
