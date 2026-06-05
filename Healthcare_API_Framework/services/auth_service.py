"""
Layer 3 — Services
Authentication service. Handles login, token refresh, and OAuth client credentials.
HIPAA: Credentials transmitted over HTTPS only. Tokens not persisted to disk.
"""
from configuration.environments import EnvironmentConfig
from endpoints.endpoints import AuthEndpoints
from payloads.auth_payloads import AuthPayloadBuilder
from services.base_service import BaseService


class AuthService(BaseService):
    """Handles authentication against Healthcare API."""

    def __init__(self, env_config: EnvironmentConfig):
        super().__init__(env_config, token=None)

    def login(self, username: str, password: str) -> dict:
        payload = AuthPayloadBuilder.login(username=username, password=password)
        return self.post(AuthEndpoints.LOGIN, payload=payload)

    def oauth_login(self, client_id: str, client_secret: str, scope: str = None) -> dict:
        payload = AuthPayloadBuilder.oauth_client_credentials(
            client_id=client_id,
            client_secret=client_secret,
            scope=scope
        )
        return self.post(AuthEndpoints.OAUTH_TOKEN, payload=payload)

    def refresh_token(self, refresh_token: str) -> dict:
        payload = AuthPayloadBuilder.refresh_token(refresh_token=refresh_token)
        return self.post(AuthEndpoints.REFRESH_TOKEN, payload=payload)

    def logout(self) -> dict:
        return self.post(AuthEndpoints.LOGOUT, payload={})

    def login_invalid_credentials(self) -> dict:
        payload = AuthPayloadBuilder.login(
            username="invalid_user@healthcare.example.com",
            password="WrongPassword123!"
        )
        return self.post(AuthEndpoints.LOGIN, payload=payload)

    def login_empty_credentials(self) -> dict:
        return self.post(AuthEndpoints.LOGIN, payload={"username": "", "password": ""})
