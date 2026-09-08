"""Layer 1 - Configuration. Dataclass-based settings; Chromium-only by design."""
from __future__ import annotations

import os
from dataclasses import dataclass, field


@dataclass(frozen=True)
class Credentials:
    """VWO login credentials sourced from environment variables."""
    email: str = field(default_factory=lambda: os.getenv("VWO_EMAIL", ""))
    password: str = field(default_factory=lambda: os.getenv("VWO_PASSWORD", ""))
    analyst_email: str = field(default_factory=lambda: os.getenv("VWO_ANALYST_EMAIL", ""))
    analyst_password: str = field(default_factory=lambda: os.getenv("VWO_ANALYST_PASSWORD", ""))

    @property
    def has_admin(self) -> bool:
        return bool(self.email and self.password)

    @property
    def has_analyst(self) -> bool:
        return bool(self.analyst_email and self.analyst_password)


@dataclass(frozen=True)
class Settings:
    """Global test settings. ENV var selects target; browser locked to Chromium."""
    env: str = field(default_factory=lambda: os.getenv("ENV", "staging"))
    base_url: str = field(default_factory=lambda: os.getenv("VWO_BASE_URL", "https://app.vwo.com"))
    browser: str = "chromium"  # immutable: suite is Chromium-only per PRD QA scope
    headless: bool = field(default_factory=lambda: os.getenv("HEADLESS", "true").lower() != "false")
    slow_mo: int = field(default_factory=lambda: int(os.getenv("SLOWMO", "0")))
    default_timeout_ms: int = 15_000
    nfr_editor_response_ms: int = 2_000  # PRD NFR: editor workflows respond within 2s
    credentials: Credentials = field(default_factory=Credentials)

    @property
    def login_url(self) -> str:
        return f"{self.base_url}/"


def get_settings() -> Settings:
    return Settings()
