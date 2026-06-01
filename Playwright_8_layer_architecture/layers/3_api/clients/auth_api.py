from dataclasses import dataclass
from playwright.sync_api import APIRequestContext
from layers.3_api.base_api import BaseAPI
from layers.2_test_data.models.user_model import User, UserCredentials


@dataclass
class AuthResponse:
    token: str
    user: dict


class AuthAPI(BaseAPI):
    def __init__(self, request: APIRequestContext, base_url: str):
        super().__init__(request, base_url)

    def login(self, credentials: UserCredentials) -> AuthResponse:
        data = self._post("/auth/login", {"email": credentials.email, "password": credentials.password})
        return AuthResponse(token=data["token"], user=data["user"])

    def logout(self, token: str) -> None:
        self._request.post(
            f"{self._base_url}/auth/logout",
            headers={"Authorization": f"Bearer {token}"},
        )

    def create_user(self, user: User) -> dict:
        return self._post("/auth/register", {
            "email": user.email,
            "password": user.password,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "role": user.role,
        })

    def delete_user(self, user_id: str, admin_token: str) -> None:
        self._delete(f"/users/{user_id}", headers={"Authorization": f"Bearer {admin_token}"})
