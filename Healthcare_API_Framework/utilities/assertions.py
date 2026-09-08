"""
Layer 6 — Utilities
Response assertion helpers. Validates status codes, response times, and field values.
"""
from typing import Any, Optional


class ResponseAssertions:
    """Assertion helpers for API response validation."""

    @staticmethod
    def assert_status_code(actual: int, expected: int, context: str = "") -> None:
        assert actual == expected, (
            f"[ASSERTION FAILED] {context} | Expected status={expected}, got status={actual}"
        )

    @staticmethod
    def assert_status_in(actual: int, expected: list[int], context: str = "") -> None:
        assert actual in expected, (
            f"[ASSERTION FAILED] {context} | Expected status in {expected}, got status={actual}"
        )

    @staticmethod
    def assert_response_time(actual_ms: float, sla_ms: float, operation: str = "") -> None:
        assert actual_ms <= sla_ms, (
            f"[SLA BREACH] {operation} | Limit={sla_ms}ms, actual={actual_ms:.1f}ms"
        )

    @staticmethod
    def assert_field_present(response: dict, field_path: str) -> Any:
        """Navigate dot-notation field_path and assert existence. Returns value."""
        keys = field_path.split(".")
        current = response
        for key in keys:
            if not isinstance(current, dict) or key not in current:
                raise AssertionError(f"[ASSERTION FAILED] Field '{field_path}' not found in response")
            current = current[key]
        assert current is not None, f"[ASSERTION FAILED] Field '{field_path}' is None"
        return current

    @staticmethod
    def assert_field_equals(response: dict, field_path: str, expected: Any) -> None:
        keys = field_path.split(".")
        current = response
        for key in keys:
            current = current[key]
        assert current == expected, (
            f"[ASSERTION FAILED] '{field_path}': expected='{expected}', actual='{current}'"
        )

    @staticmethod
    def assert_field_not_empty(response: dict, field_path: str) -> Any:
        keys = field_path.split(".")
        current = response
        for key in keys:
            current = current[key]
        assert current not in (None, "", [], {}), (
            f"[ASSERTION FAILED] Field '{field_path}' is empty"
        )
        return current

    @staticmethod
    def assert_list_not_empty(response: dict, field_path: str) -> list:
        keys = field_path.split(".")
        current = response
        for key in keys:
            current = current[key]
        assert isinstance(current, list) and len(current) > 0, (
            f"[ASSERTION FAILED] '{field_path}' expected non-empty list, got: {current}"
        )
        return current

    @staticmethod
    def assert_token_present(response: dict) -> str:
        token = response.get("access_token") or response.get("token")
        assert token, f"[ASSERTION FAILED] No access_token/token in auth response"
        assert len(token) > 20, f"[ASSERTION FAILED] Token too short: {len(token)} chars"
        return token

    @staticmethod
    def assert_patient_id_generated(response: dict) -> str:
        patient_id = response.get("patient_id") or response.get("id")
        assert patient_id, f"[ASSERTION FAILED] No patient_id in create response"
        return str(patient_id)

    @staticmethod
    def assert_appointment_confirmed(response: dict) -> str:
        status = response.get("status") or response.get("confirmation_status")
        assert status in ("confirmed", "scheduled", "booked"), (
            f"[ASSERTION FAILED] Appointment not confirmed: status='{status}'"
        )
        appt_id = response.get("appointment_id") or response.get("id")
        assert appt_id, f"[ASSERTION FAILED] No appointment_id in response"
        return str(appt_id)

    @staticmethod
    def assert_hipaa_fields_absent(response_log: str) -> None:
        """Verify PHI not present in plain text logs (HIPAA §164.312)."""
        import re
        ssn_pattern = re.compile(r"\b\d{3}-\d{2}-\d{4}\b")
        assert not ssn_pattern.search(response_log), "[HIPAA VIOLATION] SSN pattern found in log output"


class SLAThresholds:
    LOGIN_MS = 2000
    SEARCH_PATIENT_MS = 3000
    CREATE_PATIENT_MS = 5000
    BOOK_APPOINTMENT_MS = 3000
    SEARCH_PROVIDER_MS = 3000
    UPDATE_PATIENT_MS = 3000
    DELETE_PATIENT_MS = 3000
