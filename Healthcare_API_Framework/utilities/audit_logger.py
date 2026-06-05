"""
Layer 6 — Utilities
HIPAA-compliant audit logger. Masks PHI fields before writing to log.
Audit trail required under HIPAA §164.312(b).
"""
import logging
import re
import uuid
from datetime import datetime
from pathlib import Path

_LOG_DIR = Path(__file__).parent.parent / "logs"
_LOG_DIR.mkdir(exist_ok=True)

_PHI_PATTERNS = {
    "ssn": re.compile(r"\b\d{3}-\d{2}-\d{4}\b"),
    "phone": re.compile(r"\b\d{3}[-.\s]\d{3}[-.\s]\d{4}\b"),
    "email": re.compile(r"\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b"),
    "dob": re.compile(r"\b(19|20)\d{2}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])\b"),
}

_MASKED_FIELDS = {"password", "client_secret", "access_token", "refresh_token", "ssn_last4"}


def _mask_phi(message: str) -> str:
    """Replace PHI patterns with REDACTED markers for HIPAA compliance."""
    result = message
    result = _PHI_PATTERNS["ssn"].sub("[SSN-REDACTED]", result)
    result = _PHI_PATTERNS["phone"].sub("[PHONE-REDACTED]", result)
    result = _PHI_PATTERNS["email"].sub("[EMAIL-REDACTED]", result)
    result = _PHI_PATTERNS["dob"].sub("[DOB-REDACTED]", result)
    return result


class AuditLogger:
    """HIPAA audit trail for all PHI API access."""

    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._instance._setup()
        return cls._instance

    def _setup(self):
        self._logger = logging.getLogger("healthcare.audit")
        if not self._logger.handlers:
            handler = logging.FileHandler(_LOG_DIR / "audit.log", encoding="utf-8")
            handler.setFormatter(logging.Formatter(
                "%(asctime)s | AUDIT | %(message)s",
                datefmt="%Y-%m-%dT%H:%M:%SZ"
            ))
            self._logger.addHandler(handler)
            self._logger.setLevel(logging.INFO)
            self._logger.propagate = False

    def log_api_access(
        self,
        method: str,
        endpoint: str,
        status_code: int,
        correlation_id: str,
        response_time_ms: float,
        user_id: str = "system"
    ) -> None:
        message = (
            f"ACCESS | user={user_id} | method={method} | endpoint={endpoint} "
            f"| status={status_code} | time_ms={response_time_ms:.1f} | corr_id={correlation_id}"
        )
        self._logger.info(_mask_phi(message))

    def log_phi_access(self, resource: str, patient_id: str, action: str, user_id: str = "system") -> None:
        self._logger.info(
            f"PHI_ACCESS | user={user_id} | resource={resource} | patient_id={patient_id} | action={action}"
        )

    def log_auth_event(self, event: str, user_id: str, success: bool) -> None:
        self._logger.info(f"AUTH | event={event} | user={user_id} | success={success}")

    def log_error(self, endpoint: str, error_code: int, correlation_id: str, message: str) -> None:
        safe_msg = _mask_phi(message)
        self._logger.warning(
            f"ERROR | endpoint={endpoint} | status={error_code} | corr_id={correlation_id} | msg={safe_msg}"
        )
