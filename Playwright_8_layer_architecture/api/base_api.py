"""Layer 3 — API Base: wraps Playwright APIRequestContext; raises on non-2xx."""
import json
from typing import Any

from playwright.sync_api import APIRequestContext, APIResponse


class BaseAPI:
    def __init__(self, request: APIRequestContext, base_url: str, token: str | None = None):
        self._request = request
        self._base_url = base_url.rstrip("/")
        self._token = token

    def _headers(self) -> dict[str, str]:
        headers = {"Content-Type": "application/json", "Accept": "application/json"}
        if self._token:
            headers["Authorization"] = f"Bearer {self._token}"
        return headers

    def _url(self, path: str) -> str:
        return f"{self._base_url}/{path.lstrip('/')}"

    def _check(self, response: APIResponse, operation: str) -> APIResponse:
        if not response.ok:
            try:
                body = response.json()
            except Exception:
                body = response.text()
            raise RuntimeError(
                f"{operation} failed: HTTP {response.status} {response.status_text}\n{body}"
            )
        return response

    def get(self, path: str, params: dict | None = None) -> dict[str, Any]:
        response = self._request.get(
            self._url(path), headers=self._headers(), params=params or {}
        )
        return self._check(response, f"GET {path}").json()

    def post(self, path: str, payload: dict) -> dict[str, Any]:
        response = self._request.post(
            self._url(path), headers=self._headers(), data=json.dumps(payload)
        )
        return self._check(response, f"POST {path}").json()

    def put(self, path: str, payload: dict) -> dict[str, Any]:
        response = self._request.put(
            self._url(path), headers=self._headers(), data=json.dumps(payload)
        )
        return self._check(response, f"PUT {path}").json()

    def delete(self, path: str) -> dict[str, Any]:
        response = self._request.delete(self._url(path), headers=self._headers())
        return self._check(response, f"DELETE {path}").json()
