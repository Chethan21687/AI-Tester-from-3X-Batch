"""
Layer 6 — Utilities
Captures API error responses (4xx/5xx) as JSON snapshots in /screenshots/.
Equivalent of screenshot capture for API testing contexts.
"""
import json
import os
from datetime import datetime
from pathlib import Path


_SCREENSHOT_DIR = Path(__file__).parent.parent / "screenshots"
_SCREENSHOT_DIR.mkdir(exist_ok=True)


class ScreenshotManager:
    """Saves API response dumps when status is 400 or 500 class errors."""

    def capture_error_response(
        self,
        method: str,
        url: str,
        status_code: int,
        response_body: str,
        correlation_id: str,
        request_payload: dict = None
    ) -> str:
        timestamp = datetime.utcnow().strftime("%Y%m%dT%H%M%SZ")
        filename = f"error_{status_code}_{timestamp}_{correlation_id[:8]}.json"
        filepath = _SCREENSHOT_DIR / filename

        snapshot = {
            "captured_at": datetime.utcnow().isoformat() + "Z",
            "correlation_id": correlation_id,
            "request": {
                "method": method,
                "url": url,
                "payload": request_payload or {}
            },
            "response": {
                "status_code": status_code,
                "body_raw": response_body
            }
        }

        # Attempt to parse response body as JSON for readability
        try:
            snapshot["response"]["body"] = json.loads(response_body)
        except (json.JSONDecodeError, TypeError):
            snapshot["response"]["body"] = response_body

        with open(filepath, "w", encoding="utf-8") as fh:
            json.dump(snapshot, fh, indent=2)

        print(f"\n[ERROR SNAPSHOT] Status {status_code} captured → {filepath}")
        return str(filepath)

    @staticmethod
    def list_snapshots() -> list[str]:
        return [str(f) for f in sorted(_SCREENSHOT_DIR.glob("error_*.json"))]

    @staticmethod
    def cleanup_snapshots() -> int:
        count = 0
        for f in _SCREENSHOT_DIR.glob("error_*.json"):
            f.unlink()
            count += 1
        return count
