"""
Layer 5 — Payloads
Authentication request payload builders.
HIPAA: Credentials are never stored in logs; payloads are transient.
"""
from dataclasses import dataclass, asdict
from typing import Optional


@dataclass
class LoginPayload:
    username: str
    password: str
    grant_type: str = "password"

    def to_dict(self) -> dict:
        return asdict(self)


@dataclass
class OAuthPayload:
    client_id: str
    client_secret: str
    grant_type: str = "client_credentials"
    scope: str = "patient/*.read patient/*.write"

    def to_dict(self) -> dict:
        return asdict(self)


@dataclass
class TokenRefreshPayload:
    refresh_token: str
    grant_type: str = "refresh_token"

    def to_dict(self) -> dict:
        return asdict(self)


class AuthPayloadBuilder:
    """Factory for authentication payloads."""

    @staticmethod
    def login(username: str, password: str) -> dict:
        return LoginPayload(username=username, password=password).to_dict()

    @staticmethod
    def oauth_client_credentials(client_id: str, client_secret: str, scope: Optional[str] = None) -> dict:
        payload = OAuthPayload(client_id=client_id, client_secret=client_secret)
        if scope:
            payload.scope = scope
        return payload.to_dict()

    @staticmethod
    def refresh_token(refresh_token: str) -> dict:
        return TokenRefreshPayload(refresh_token=refresh_token).to_dict()
