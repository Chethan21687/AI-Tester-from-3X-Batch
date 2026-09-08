"""
Layer 2 — Business
Provider business logic. CRUD and schedule management.
"""
from configuration.environments import EnvironmentConfig
from services.provider_service import ProviderService
from services.appointment_service import AppointmentService
from payloads.provider_payloads import ProviderPayloadBuilder
from payloads.appointment_payloads import AppointmentPayloadBuilder
from utilities.assertions import ResponseAssertions, SLAThresholds
from utilities.output_manager import OutputManager
from utilities.schema_validator import SchemaValidator


class ProviderBusiness:
    """Full provider lifecycle and appointment booking."""

    def __init__(self, env_config: EnvironmentConfig, token: str):
        self.provider_service = ProviderService(env_config, token)
        self.appt_service = AppointmentService(env_config, token)
        self.assertions = ResponseAssertions()
        self.output = OutputManager()
        self.validator = SchemaValidator()

    def create_provider(self, payload: dict) -> str:
        full_name = f"Dr. {payload.get('first_name', '')} {payload.get('last_name', '')} {payload.get('title', '')}"
        result = self.provider_service.create_provider(payload)
        self.output.print_response(
            test_name=f"Create Provider: {full_name}",
            method="POST",
            url=result["url"],
            status_code=result["status_code"],
            response_time_ms=result["response_time_ms"],
            correlation_id=result["correlation_id"],
            response_body=result["body"],
            expected_status=201
        )
        self.assertions.assert_status_code(result["status_code"], 201, "Create Provider")
        provider_id = result["body"].get("provider_id") or result["body"].get("id")
        assert provider_id, "[ASSERTION FAILED] No provider_id in create response"
        print(f"[CREATE PROVIDER] ID: {provider_id} | Name: {full_name}")
        return str(provider_id)

    def search_by_specialty(self, specialty: str) -> list:
        params = ProviderPayloadBuilder.search_by_specialty(specialty)
        result = self.provider_service.search_provider(params)
        self.output.print_response(
            test_name=f"Search Provider by Specialty: {specialty}",
            method="GET",
            url=result["url"],
            status_code=result["status_code"],
            response_time_ms=result["response_time_ms"],
            correlation_id=result["correlation_id"],
            expected_status=200
        )
        self.assertions.assert_status_code(result["status_code"], 200, "Search Provider")
        self.assertions.assert_response_time(result["response_time_ms"], SLAThresholds.SEARCH_PROVIDER_MS)
        records = result["body"].get("results", [])
        print(f"[SEARCH PROVIDER] Specialty: {specialty} | Found: {len(records)} provider(s)")
        return records

    def update_provider_availability(self, provider_id: str, accepting: bool) -> dict:
        payload = ProviderPayloadBuilder.update_accepting_patients(provider_id, accepting)
        result = self.provider_service.patch_provider(provider_id, payload)
        self.output.print_response(
            test_name=f"Update Provider Availability: {provider_id}",
            method="PATCH",
            url=result["url"],
            status_code=result["status_code"],
            response_time_ms=result["response_time_ms"],
            correlation_id=result["correlation_id"],
            expected_status=200
        )
        self.assertions.assert_status_code(result["status_code"], 200, "Update Provider")
        print(f"[PROVIDER] ID: {provider_id} | accepting_patients: {accepting}")
        return result["body"]

    def delete_provider(self, provider_id: str) -> None:
        result = self.provider_service.delete_provider(provider_id)
        self.output.print_response(
            test_name=f"Delete Provider: {provider_id}",
            method="DELETE",
            url=result["url"],
            status_code=result["status_code"],
            response_time_ms=result["response_time_ms"],
            correlation_id=result["correlation_id"],
            expected_status=204
        )
        self.assertions.assert_status_code(result["status_code"], 204, "Delete Provider")
        print(f"[DELETE PROVIDER] ID: {provider_id} | Successfully deleted")

    def book_appointment(self, patient_id: str, provider_id: str, appt_type: str = "consultation") -> str:
        builders = {
            "consultation": AppointmentPayloadBuilder.create_consultation,
            "follow_up": AppointmentPayloadBuilder.create_follow_up
        }
        payload = builders.get(appt_type, AppointmentPayloadBuilder.create_consultation)(patient_id, provider_id)
        result = self.appt_service.create_appointment(payload)
        self.output.print_response(
            test_name=f"Book Appointment: {appt_type}",
            method="POST",
            url=result["url"],
            status_code=result["status_code"],
            response_time_ms=result["response_time_ms"],
            correlation_id=result["correlation_id"],
            response_body=result["body"],
            expected_status=201
        )
        self.assertions.assert_status_code(result["status_code"], 201, "Book Appointment")
        self.assertions.assert_response_time(result["response_time_ms"], SLAThresholds.BOOK_APPOINTMENT_MS)
        appt_id = self.assertions.assert_appointment_confirmed(result["body"])
        print(f"[APPOINTMENT] ID: {appt_id} | Type: {appt_type} | Patient: {patient_id} | Provider: {provider_id}")
        return appt_id
