"""
Layer 8 — Configuration
Environment selector and credential manager for Healthcare API Framework.
HIPAA: Credentials never logged. SSL enforced in staging/production.
"""

import json
import os
from dataclasses import dataclass
from pathlib import Path
from typing import Optional


@dataclass
class EnvironmentConfig:
    name: str
    base_url: str
    timeout: int
    max_retries: int
    verify_ssl: bool
    response_time_sla: dict


_CREDENTIALS_PATH = Path(__file__).parent / "credentials.json"

ENVIRONMENTS: dict[str, EnvironmentConfig] = {
    "local": EnvironmentConfig(
        name="local",
        base_url="http://localhost:8080/api/v1",
        timeout=30,
        max_retries=3,
        verify_ssl=False,
        response_time_sla={"login": 2000, "search_patient": 3000, "create_patient": 5000, "book_appointment": 3000},
    ),
    "staging": EnvironmentConfig(
        name="staging",
        base_url="https://staging-api.healthcare.example.com/api/v1",
        timeout=30,
        max_retries=3,
        verify_ssl=True,
        response_time_sla={"login": 2000, "search_patient": 3000, "create_patient": 5000, "book_appointment": 3000},
    ),
    "production": EnvironmentConfig(
        name="production",
        base_url="https://api.healthcare.example.com/api/v1",
        timeout=60,
        max_retries=5,
        verify_ssl=True,
        response_time_sla={"login": 2000, "search_patient": 3000, "create_patient": 5000, "book_appointment": 3000},
    ),
    "sandbox": EnvironmentConfig(
        name="sandbox",
        base_url="https://sandbox-api.healthcare.example.com/api/v1",
        timeout=30,
        max_retries=3,
        verify_ssl=True,
        response_time_sla={"login": 2000, "search_patient": 3000, "create_patient": 5000, "book_appointment": 3000},
    ),
}


class EnvironmentManager:
    """Resolves active environment and exposes credentials."""

    @staticmethod
    def get_config(env_name: Optional[str] = None) -> EnvironmentConfig:
        env = env_name or os.environ.get("ENV", "staging")
        if env not in ENVIRONMENTS:
            raise ValueError(f"Unknown environment '{env}'. Valid options: {list(ENVIRONMENTS.keys())}")
        return ENVIRONMENTS[env]

    @staticmethod
    def get_credentials() -> dict:
        with open(_CREDENTIALS_PATH, "r") as fh:
            return json.load(fh)

    @classmethod
    def get_user_credentials(cls, role: str = "admin") -> dict:
        creds = cls.get_credentials()
        users = creds.get("basic_auth", {})
        if role not in users:
            raise ValueError(f"Unknown role '{role}'. Valid roles: {list(users.keys())}")
        return users[role]

    @classmethod
    def get_oauth_config(cls) -> dict:
        return cls.get_credentials()["oauth"]
