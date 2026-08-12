"""
models.py — SQLAlchemy ORM models for the civic grievance platform.

Key design decisions:
- String UUIDs as primary keys avoid ID-collision between seed data and live
  demo submissions, and match realistic distributed-system practice.
- All timestamps are UTC; frontend is responsible for local formatting.
- Grievance.parent_grievance_id is a self-referential FK pointing to another
  Grievance — this is how the dedup system chains duplicates without
  duplicating any data.
"""

from __future__ import annotations

import enum
import uuid
from datetime import datetime, timezone

from sqlalchemy import (
    Boolean,
    DateTime,
    Enum as SAEnum,
    Float,
    ForeignKey,
    Integer,
    String,
    Text,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


# ── Helpers ───────────────────────────────────────────────────────────────────

def _uuid() -> str:
    return str(uuid.uuid4())


def _now() -> datetime:
    return datetime.now(timezone.utc)


# ── Enums ─────────────────────────────────────────────────────────────────────

class UserRole(str, enum.Enum):
    CITIZEN = "CITIZEN"
    MUNICIPAL_ADMIN = "MUNICIPAL_ADMIN"
    DEPT_OFFICER = "DEPT_OFFICER"


class GrievanceCategory(str, enum.Enum):
    SANITATION = "SANITATION"
    ROADS = "ROADS"
    ELECTRICITY = "ELECTRICITY"
    WATER = "WATER"
    OTHER = "OTHER"


class GrievanceStatus(str, enum.Enum):
    OPEN = "OPEN"
    IN_PROGRESS = "IN_PROGRESS"
    RESOLVED = "RESOLVED"
    REJECTED = "REJECTED"


class ProjectStatus(str, enum.Enum):
    PROPOSED = "PROPOSED"
    VOTING = "VOTING"
    FUNDED = "FUNDED"
    IN_PROGRESS = "IN_PROGRESS"
    COMPLETED = "COMPLETED"


# ── Models ────────────────────────────────────────────────────────────────────

class User(Base):
    __tablename__ = "users"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_uuid)
    name: Mapped[str] = mapped_column(String(120), nullable=False)
    # Phone is the natural unique identifier for citizens in India
    phone: Mapped[str] = mapped_column(String(20), unique=True, nullable=False)
    role: Mapped[UserRole] = mapped_column(
        SAEnum(UserRole, values_callable=lambda e: [x.value for x in e]),
        nullable=False,
        default=UserRole.CITIZEN,
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=_now, nullable=False
    )

    # Relationships
    grievances: Mapped[list["Grievance"]] = relationship(
        "Grievance", back_populates="citizen", foreign_keys="Grievance.citizen_id"
    )
    resolutions: Mapped[list["ResolutionEvidence"]] = relationship(
        "ResolutionEvidence", back_populates="officer"
    )


class Grievance(Base):
    __tablename__ = "grievances"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_uuid)
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    category: Mapped[GrievanceCategory] = mapped_column(
        SAEnum(GrievanceCategory, values_callable=lambda e: [x.value for x in e]),
        nullable=False,
        default=GrievanceCategory.OTHER,
    )
    status: Mapped[GrievanceStatus] = mapped_column(
        SAEnum(GrievanceStatus, values_callable=lambda e: [x.value for x in e]),
        nullable=False,
        default=GrievanceStatus.OPEN,
    )
    # priority_score: 1 (low) to 5 (critical). Set by AI or fallback classifier.
    priority_score: Mapped[int] = mapped_column(Integer, nullable=False, default=3)

    # Geographic fields — nullable so audio/text-only submissions succeed
    latitude: Mapped[float | None] = mapped_column(Float, nullable=True)
    longitude: Mapped[float | None] = mapped_column(Float, nullable=True)
    address: Mapped[str | None] = mapped_column(String(400), nullable=True)

    # Media attachments — nullable
    image_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    audio_url: Mapped[str | None] = mapped_column(String(500), nullable=True)

    # Deduplication
    is_duplicate: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    parent_grievance_id: Mapped[str | None] = mapped_column(
        String(36),
        ForeignKey("grievances.id", ondelete="SET NULL"),
        nullable=True,
    )
    upvote_count: Mapped[int] = mapped_column(Integer, nullable=False, default=1)

    # Citizen FK — nullable so anonymous/demo submissions work
    citizen_id: Mapped[str | None] = mapped_column(
        String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=_now, nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=_now, onupdate=_now, nullable=False
    )

    # Relationships
    citizen: Mapped["User | None"] = relationship(
        "User", back_populates="grievances", foreign_keys=[citizen_id]
    )
    parent: Mapped["Grievance | None"] = relationship(
        "Grievance", remote_side="Grievance.id", foreign_keys=[parent_grievance_id]
    )
    evidence: Mapped[list["ResolutionEvidence"]] = relationship(
        "ResolutionEvidence", back_populates="grievance", cascade="all, delete-orphan"
    )


class ResolutionEvidence(Base):
    __tablename__ = "resolution_evidence"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_uuid)
    grievance_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("grievances.id", ondelete="CASCADE"), nullable=False
    )
    officer_id: Mapped[str | None] = mapped_column(
        String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True
    )
    proof_image_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    comments: Mapped[str] = mapped_column(Text, nullable=False)
    resolved_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=_now, nullable=False
    )

    # Relationships
    grievance: Mapped["Grievance"] = relationship("Grievance", back_populates="evidence")
    officer: Mapped["User | None"] = relationship("User", back_populates="resolutions")


class ParticipatoryProject(Base):
    __tablename__ = "participatory_projects"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_uuid)
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    budget_allocated: Mapped[float] = mapped_column(Float, nullable=False)
    target_votes: Mapped[int] = mapped_column(Integer, nullable=False)
    current_votes: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    category: Mapped[str] = mapped_column(String(50), nullable=False)
    status: Mapped[ProjectStatus] = mapped_column(
        SAEnum(ProjectStatus, values_callable=lambda e: [x.value for x in e]),
        nullable=False,
        default=ProjectStatus.PROPOSED,
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=_now, nullable=False
    )
