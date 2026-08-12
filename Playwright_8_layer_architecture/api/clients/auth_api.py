"""Layer 3 — API Client: VWO authentication endpoints."""
from playwright.sync_api import APIRequestContext

from api.base_api import BaseAPI


class AuthAPI(BaseAPI):
    def __init__(self, request: APIRequestContext, base_url: str):
        super().__init__(request, base_url)

    def login(self, email: str, password: str) -> dict:
        """POST /auth/login → returns token and user info."""
        return self.post(
            "/auth/login",
            {"username": email, "password": password},
        )

    def get_token(self, email: str, password: str) -> str:
        """Authenticate and return Bearer token."""
        response = self.login(email, password)
        token = (
            response.get("data", {}).get("token")
            or response.get("token")
            or response.get("access_token")
        )
        if not token:
            raise RuntimeError(f"Token not found in auth response: {response}")
        return token

    def logout(self, token: str) -> dict:
        """POST /auth/logout with Bearer token."""
        self._token = token
        return self.post("/auth/logout", {})
