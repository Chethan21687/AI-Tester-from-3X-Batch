import os
from dataclasses import dataclass


@dataclass
class Environment:
    base_url: str
    api_url: str
    admin_email: str
    admin_password: str


ENVIRONMENTS: dict[str, Environment] = {
    "local": Environment(
        base_url="http://localhost:3000",
        api_url="http://localhost:3000/api",
        admin_email="admin@local.com",
        admin_password="AdminLocal123!",
    ),
    "staging": Environment(
        base_url="https://staging.example.com",
        api_url="https://staging.example.com/api",
        admin_email=os.getenv("ADMIN_EMAIL", ""),
        admin_password=os.getenv("ADMIN_PASSWORD", ""),
    ),
    "production": Environment(
        base_url="https://example.com",
        api_url="https://example.com/api",
        admin_email=os.getenv("ADMIN_EMAIL", ""),
        admin_password=os.getenv("ADMIN_PASSWORD", ""),
    ),
}


def get_env() -> Environment:
    env_name = os.getenv("ENV", "local")
    return ENVIRONMENTS.get(env_name, ENVIRONMENTS["local"])
