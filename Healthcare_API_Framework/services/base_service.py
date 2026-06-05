"""
Layer 3 — Services
Base HTTP service. All concrete services inherit from this class.
HIPAA: HTTPS enforced for non-local envs. PHI not logged. Correlation IDs on all requests.
"""
import time
import uuid
import requests
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry
from typing import Optional, Dict, Any

from configuration.environments import EnvironmentConfig
from utilities.audit_logger import AuditLogger
from utilities.screenshot_manager import ScreenshotManager
from utilities.output_manager import OutputManager


class BaseService:
    """Foundation HTTP client for Healthcare API Framework."""

    _ERROR_STATUSES = {400, 401, 403, 404, 409, 422, 500, 502, 503, 504}

    def __init__(self, env_config: EnvironmentConfig, token: Optional[str] = None):
        self.env_config = env_config
        self.base_url = env_config.base_url
        self.token = token
        self.session = self._create_session()
        self._audit = AuditLogger()
        self._screenshots = ScreenshotManager()
        self.output = OutputManager()

    def _create_session(self) -> requests.Session:
        session = requests.Session()
        retry_strategy = Retry(
            total=self.env_config.max_retries,
            backoff_factor=1.0,
            status_forcelist=[429, 503, 504],
            allowed_methods=["GET", "POST", "PUT", "PATCH", "DELETE"]
        )
        adapter = HTTPAdapter(max_retries=retry_strategy)
        session.mount("http://", adapter)
        session.mount("https://", adapter)
        return session

    def set_token(self, token: str) -> None:
        self.token = token

    def _build_headers(self, correlation_id: str) -> Dict[str, str]:
        headers = {
            "Content-Type": "application/json",
            "Accept": "application/json",
            "X-Correlation-ID": correlation_id,
            "X-Request-ID": str(uuid.uuid4()),
        }
        if self.token:
            headers["Authorization"] = f"Bearer {self.token}"
        return headers

    def _execute(
        self,
        method: str,
        endpoint: str,
        payload: Optional[Dict[str, Any]] = None,
        params: Optional[Dict[str, Any]] = None
    ) -> dict:
        url = f"{self.base_url}{endpoint}"
        correlation_id = str(uuid.uuid4())
        headers = self._build_headers(correlation_id)

        start = time.perf_counter()
        try:
            resp = self.session.request(
                method=method,
                url=url,
                headers=headers,
                json=payload,
                params=params,
                timeout=self.env_config.timeout,
                verify=self.env_config.verify_ssl
            )
        except requests.exceptions.ConnectionError as exc:
            return {
                "status_code": 0,
                "response_time_ms": 0.0,
                "url": url,
                "correlation_id": correlation_id,
                "body": {},
                "error": f"ConnectionError: {exc}"
            }
        except requests.exceptions.Timeout:
            return {
                "status_code": 408,
                "response_time_ms": self.env_config.timeout * 1000.0,
                "url": url,
                "correlation_id": correlation_id,
                "body": {},
                "error": "Request timed out"
            }

        response_time_ms = (time.perf_counter() - start) * 1000

        self._audit.log_api_access(
            method=method,
            endpoint=endpoint,
            status_code=resp.status_code,
            correlation_id=correlation_id,
            response_time_ms=response_time_ms
        )

        if resp.status_code in self._ERROR_STATUSES:
            self._screenshots.capture_error_response(
                method=method,
                url=url,
                status_code=resp.status_code,
                response_body=resp.text,
                correlation_id=correlation_id,
                request_payload=payload
            )

        try:
            body = resp.json()
        except ValueError:
            body = {"raw": resp.text}

        return {
            "status_code": resp.status_code,
            "response_time_ms": round(response_time_ms, 2),
            "url": url,
            "correlation_id": correlation_id,
            "body": body,
            "headers": dict(resp.headers)
        }

    def get(self, endpoint: str, params: Optional[Dict] = None) -> dict:
        return self._execute("GET", endpoint, params=params)

    def post(self, endpoint: str, payload: Dict[str, Any]) -> dict:
        return self._execute("POST", endpoint, payload=payload)

    def put(self, endpoint: str, payload: Dict[str, Any]) -> dict:
        return self._execute("PUT", endpoint, payload=payload)

    def patch(self, endpoint: str, payload: Dict[str, Any]) -> dict:
        return self._execute("PATCH", endpoint, payload=payload)

    def delete(self, endpoint: str) -> dict:
        return self._execute("DELETE", endpoint)
