"""
Layer 6 — Utilities
JSON Schema validation for all Healthcare API responses.
"""
import jsonschema
from jsonschema import validate, ValidationError


AUTH_RESPONSE_SCHEMA = {
    "type": "object",
    "required": ["access_token", "token_type", "expires_in"],
    "properties": {
        "access_token": {"type": "string", "minLength": 20},
        "token_type": {"type": "string", "enum": ["Bearer", "bearer"]},
        "expires_in": {"type": "integer", "minimum": 1},
        "refresh_token": {"type": "string"},
        "scope": {"type": "string"}
    }
}

PATIENT_RESPONSE_SCHEMA = {
    "type": "object",
    "required": ["patient_id", "first_name", "last_name", "date_of_birth", "gender"],
    "properties": {
        "patient_id": {"type": "string", "minLength": 1},
        "first_name": {"type": "string", "minLength": 1},
        "last_name": {"type": "string", "minLength": 1},
        "date_of_birth": {"type": "string", "pattern": r"^\d{4}-\d{2}-\d{2}$"},
        "gender": {"type": "string", "enum": ["Male", "Female", "Other", "Unknown"]},
        "address": {
            "type": "object",
            "required": ["street", "city", "state", "zip_code"],
            "properties": {
                "street": {"type": "string"},
                "city": {"type": "string"},
                "state": {"type": "string", "minLength": 2, "maxLength": 2},
                "zip_code": {"type": "string", "pattern": r"^\d{5}(-\d{4})?$"},
                "country": {"type": "string"}
            }
        },
        "insurance": {"type": "object"},
        "created_at": {"type": "string"},
        "updated_at": {"type": "string"}
    }
}

PROVIDER_RESPONSE_SCHEMA = {
    "type": "object",
    "required": ["provider_id", "first_name", "last_name", "title", "specialty", "npi_number"],
    "properties": {
        "provider_id": {"type": "string", "minLength": 1},
        "first_name": {"type": "string", "minLength": 1},
        "last_name": {"type": "string", "minLength": 1},
        "title": {"type": "string", "enum": ["MD", "DO", "NP", "PA", "RN", "PharmD"]},
        "specialty": {"type": "string", "minLength": 1},
        "npi_number": {"type": "string", "minLength": 10, "maxLength": 10},
        "accepting_patients": {"type": "boolean"},
        "created_at": {"type": "string"}
    }
}

APPOINTMENT_RESPONSE_SCHEMA = {
    "type": "object",
    "required": ["appointment_id", "patient_id", "provider_id", "appointment_date", "status"],
    "properties": {
        "appointment_id": {"type": "string", "minLength": 1},
        "patient_id": {"type": "string", "minLength": 1},
        "provider_id": {"type": "string", "minLength": 1},
        "appointment_date": {"type": "string", "pattern": r"^\d{4}-\d{2}-\d{2}$"},
        "appointment_time": {"type": "string", "pattern": r"^\d{2}:\d{2}$"},
        "appointment_type": {"type": "string"},
        "status": {"type": "string", "enum": ["confirmed", "scheduled", "booked", "cancelled", "completed"]},
        "created_at": {"type": "string"}
    }
}

SEARCH_RESULTS_SCHEMA = {
    "type": "object",
    "required": ["total", "results"],
    "properties": {
        "total": {"type": "integer", "minimum": 0},
        "page": {"type": "integer"},
        "page_size": {"type": "integer"},
        "results": {"type": "array"}
    }
}

ERROR_RESPONSE_SCHEMA = {
    "type": "object",
    "required": ["error_code", "message"],
    "properties": {
        "error_code": {"type": "string"},
        "message": {"type": "string"},
        "details": {"type": ["string", "array", "object", "null"]},
        "correlation_id": {"type": "string"}
    }
}

SCHEMAS = {
    "auth_response": AUTH_RESPONSE_SCHEMA,
    "patient_response": PATIENT_RESPONSE_SCHEMA,
    "provider_response": PROVIDER_RESPONSE_SCHEMA,
    "appointment_response": APPOINTMENT_RESPONSE_SCHEMA,
    "search_results": SEARCH_RESULTS_SCHEMA,
    "error_response": ERROR_RESPONSE_SCHEMA,
}


class SchemaValidator:
    """Validates API responses against predefined JSON schemas."""

    def validate(self, response_body: dict, schema_name: str) -> tuple[bool, list[str]]:
        schema = SCHEMAS.get(schema_name)
        if not schema:
            raise ValueError(f"Unknown schema: '{schema_name}'. Available: {list(SCHEMAS.keys())}")
        errors = []
        try:
            validate(instance=response_body, schema=schema)
            return True, []
        except ValidationError as exc:
            errors.append(exc.message)
            return False, errors

    def assert_valid(self, response_body: dict, schema_name: str) -> None:
        valid, errors = self.validate(response_body, schema_name)
        assert valid, f"[SCHEMA INVALID] '{schema_name}': {'; '.join(errors)}"
