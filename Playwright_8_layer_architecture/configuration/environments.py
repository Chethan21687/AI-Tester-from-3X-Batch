"""Layer 1 — Config: ENV var selects target environment."""
import os
from dataclasses import dataclass, field


@dataclass
class EnvironmentConfig:
    base_url: str
    api_base_url: str
    timeout_ms: int = 30_000
    slow_mo_ms: int = 0
    headless: bool = True
    verify_ssl: bool = True


_ENVIRONMENTS: dict[str, EnvironmentConfig] = {
    "local": EnvironmentConfig(
        base_url="http://localhost:3000",
        api_base_url="http://localhost:3000/api/v2",
        headless=False,
        verify_ssl=False,
    ),
    "staging": EnvironmentConfig(
        base_url="https://app.vwo.com",
        api_base_url="https://app.vwo.com/api/v2",
        headless=True,
    ),
    "production": EnvironmentConfig(
        base_url="https://app.vwo.com",
        api_base_url="https://app.vwo.com/api/v2",
        headless=True,
    ),
}


def get_config() -> EnvironmentConfig:
    env = os.getenv("ENV", "staging").lower()
    if env not in _ENVIRONMENTS:
        raise ValueError(f"Unknown ENV '{env}'. Valid: {list(_ENVIRONMENTS)}")
    return _ENVIRONMENTS[env]


def get_credentials() -> tuple[str, str]:
    email = os.getenv("VWO_EMAIL", "")
    password = os.getenv("VWO_PASSWORD", "")
    if not email or not password:
        raise EnvironmentError(
            "VWO_EMAIL and VWO_PASSWORD environment variables must be set."
        )
    return email, password
