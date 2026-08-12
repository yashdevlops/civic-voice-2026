"""
config.py — Centralised environment-variable loading via pydantic-settings.

ALL configuration is read here. Business-logic files import `settings`,
never `os.getenv` directly. This means configuration is validated at startup
and any missing required vars surface immediately with a clear error message.
"""

from __future__ import annotations

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    # ── Database ──────────────────────────────────────────────────────────────
    database_url: str = Field(
        default="sqlite:///./civic_grievance.db",
        description="SQLAlchemy database URL. SQLite by default; swap to Postgres via env.",
    )

    # ── OpenAI (optional) ─────────────────────────────────────────────────────
    openai_api_key: str = Field(
        default="",
        description="OpenAI API key. Leave empty to use offline fallbacks.",
    )

    # ── Deduplication ─────────────────────────────────────────────────────────
    dedup_similarity_threshold: float = Field(
        default=0.85,
        ge=0.0,
        le=1.0,
        description="Cosine-similarity floor for marking a complaint as duplicate.",
    )
    dedup_radius_meters: float = Field(
        default=100.0,
        ge=1.0,
        description="Geographic radius in metres within which duplicates are merged.",
    )

    # ── File Storage ──────────────────────────────────────────────────────────
    upload_dir: str = Field(
        default="./uploads",
        description="Local directory for uploaded files. Replace with S3/GCS in production.",
    )

    # ── CORS ──────────────────────────────────────────────────────────────────
    cors_origins: str = Field(
        default="http://localhost:3000",
        description="Comma-separated list of allowed CORS origins.",
    )

    @property
    def cors_origins_list(self) -> list[str]:
        """Parse the comma-separated CORS origins string into a list."""
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]

    @property
    def openai_available(self) -> bool:
        """True only when a non-empty API key is configured."""
        return bool(self.openai_api_key and self.openai_api_key.strip())


# Singleton — import this everywhere, never instantiate Settings() again.
settings = Settings()
