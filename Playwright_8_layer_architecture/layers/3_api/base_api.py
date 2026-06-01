from playwright.sync_api import APIRequestContext


class BaseAPI:
    def __init__(self, request: APIRequestContext, base_url: str):
        self._request = request
        self._base_url = base_url

    def _get(self, path: str, params: dict | None = None) -> dict:
        response = self._request.get(f"{self._base_url}{path}", params=params)
        if not response.ok:
            raise RuntimeError(f"GET {path} failed: {response.status} {response.text()}")
        return response.json()

    def _post(self, path: str, data: dict) -> dict:
        response = self._request.post(f"{self._base_url}{path}", data=data)
        if not response.ok:
            raise RuntimeError(f"POST {path} failed: {response.status} {response.text()}")
        return response.json()

    def _put(self, path: str, data: dict) -> dict:
        response = self._request.put(f"{self._base_url}{path}", data=data)
        if not response.ok:
            raise RuntimeError(f"PUT {path} failed: {response.status} {response.text()}")
        return response.json()

    def _delete(self, path: str, headers: dict | None = None) -> None:
        response = self._request.delete(f"{self._base_url}{path}", headers=headers or {})
        if not response.ok:
            raise RuntimeError(f"DELETE {path} failed: {response.status} {response.text()}")
