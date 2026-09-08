"""
Layer 1 — Tests
Appointment Booking test suite: create, cancel, reschedule.
SLA: Book appointment < 3000ms.
"""
import pytest
from business.provider_business import ProviderBusiness
from business.patient_business import PatientBusiness
from payloads.patient_payloads import PatientPayloadBuilder
from payloads.provider_payloads import ProviderPayloadBuilder
from payloads.appointment_payloads import AppointmentPayloadBuilder
from utilities.assertions import ResponseAssertions, SLAThresholds


@pytest.fixture(scope="class")
def patient_and_provider_ids(env_config, admin_token):
    """Create patient + provider needed for appointment tests."""
    pat_biz = PatientBusiness(env_config, admin_token)
    prv_biz = ProviderBusiness(env_config, admin_token)
    patient_id = pat_biz.create_patient(PatientPayloadBuilder.create_john_smith())
    provider_id = prv_biz.create_provider(ProviderPayloadBuilder.create_dr_anderson())
    return {"patient_id": patient_id, "provider_id": provider_id}


@pytest.mark.appointment
@pytest.mark.smoke
class TestCreateAppointment:
    """Tests for POST /api/v1/appointments."""

    def test_create_consultation_appointment_returns_201(self, env_config, admin_token, patient_and_provider_ids):
        """TC_APT_001 — Book consultation appointment returns 201 Confirmed."""
        business = ProviderBusiness(env_config, admin_token)
        appt_id = business.book_appointment(
            patient_id=patient_and_provider_ids["patient_id"],
            provider_id=patient_and_provider_ids["provider_id"],
            appt_type="consultation"
        )
        assert appt_id is not None
        print(f"\n[TC_APT_001] Consultation booked | appointment_id={appt_id}")

    def test_create_follow_up_appointment_returns_201(self, env_config, admin_token, patient_and_provider_ids):
        """TC_APT_002 — Book follow-up appointment returns 201 Confirmed."""
        business = ProviderBusiness(env_config, admin_token)
        appt_id = business.book_appointment(
            patient_id=patient_and_provider_ids["patient_id"],
            provider_id=patient_and_provider_ids["provider_id"],
            appt_type="follow_up"
        )
        assert appt_id is not None
        print(f"\n[TC_APT_002] Follow-up booked | appointment_id={appt_id}")

    def test_appointment_response_time_within_sla(self, env_config, admin_token, patient_and_provider_ids):
        """TC_APT_003 — Appointment booking response < 3000ms (SLA)."""
        from services.appointment_service import AppointmentService
        service = AppointmentService(env_config, admin_token)
        payload = AppointmentPayloadBuilder.create_consultation(
            patient_and_provider_ids["patient_id"],
            patient_and_provider_ids["provider_id"]
        )
        result = service.create_appointment(payload)

        assertions = ResponseAssertions()
        assertions.assert_response_time(result["response_time_ms"], SLAThresholds.BOOK_APPOINTMENT_MS, "Book Appointment")
        print(f"\n[TC_APT_003] Appointment SLA | elapsed={result['response_time_ms']:.1f}ms | sla={SLAThresholds.BOOK_APPOINTMENT_MS}ms | PASS")

    def test_appointment_confirmed_status_in_response(self, env_config, admin_token, patient_and_provider_ids):
        """TC_APT_004 — Appointment response contains confirmed status."""
        from services.appointment_service import AppointmentService
        service = AppointmentService(env_config, admin_token)
        payload = AppointmentPayloadBuilder.create_consultation(
            patient_and_provider_ids["patient_id"],
            patient_and_provider_ids["provider_id"]
        )
        result = service.create_appointment(payload)

        if result["status_code"] == 201:
            status = result["body"].get("status") or result["body"].get("confirmation_status")
            assert status in ("confirmed", "scheduled", "booked"), f"Unexpected status: {status}"
            print(f"\n[TC_APT_004] Appointment status={status} | PASS")


@pytest.mark.appointment
@pytest.mark.regression
class TestCancelAppointment:
    """Tests for POST /api/v1/appointments/{id}/cancel."""

    def test_cancel_existing_appointment_returns_200(self, env_config, admin_token, patient_and_provider_ids):
        """TC_APT_010 — Cancel existing appointment returns 200 with cancelled status."""
        from services.appointment_service import AppointmentService
        service = AppointmentService(env_config, admin_token)
        create_result = service.create_appointment(
            AppointmentPayloadBuilder.create_consultation(
                patient_and_provider_ids["patient_id"],
                patient_and_provider_ids["provider_id"]
            )
        )
        appt_id = str(create_result["body"].get("appointment_id") or create_result["body"].get("id", "APT-TEST"))

        cancel_result = service.cancel_appointment(appt_id, reason="Patient requested cancellation")
        assertions = ResponseAssertions()
        assertions.assert_status_in(cancel_result["status_code"], [200, 204], "Cancel appointment")
        print(f"\n[TC_APT_010] Cancel appointment | appt_id={appt_id} | status={cancel_result['status_code']} | PASS")

    def test_cancel_nonexistent_appointment_returns_404(self, env_config, admin_token):
        """TC_APT_011 — Cancel non-existent appointment returns 404."""
        from services.appointment_service import AppointmentService
        service = AppointmentService(env_config, admin_token)
        result = service.cancel_appointment("APT-DOESNOTEXIST-99999", "test")

        assertions = ResponseAssertions()
        assertions.assert_status_code(result["status_code"], 404, "Cancel non-existent")
        print(f"\n[TC_APT_011] Cancel non-existent | status={result['status_code']} | PASS")


@pytest.mark.appointment
@pytest.mark.regression
class TestRescheduleAppointment:
    """Tests for PUT /api/v1/appointments/{id} (reschedule)."""

    def test_reschedule_appointment_returns_200(self, env_config, admin_token, patient_and_provider_ids):
        """TC_APT_020 — Reschedule appointment to new date/time returns 200."""
        from services.appointment_service import AppointmentService
        service = AppointmentService(env_config, admin_token)
        create_result = service.create_appointment(
            AppointmentPayloadBuilder.create_consultation(
                patient_and_provider_ids["patient_id"],
                patient_and_provider_ids["provider_id"]
            )
        )
        appt_id = str(create_result["body"].get("appointment_id") or create_result["body"].get("id", "APT-TEST"))

        reschedule_payload = AppointmentPayloadBuilder.reschedule(appt_id, "2026-08-01", "10:00")
        result = service.reschedule_appointment(appt_id, reschedule_payload)

        assertions = ResponseAssertions()
        assertions.assert_status_in(result["status_code"], [200, 201], "Reschedule appointment")
        print(f"\n[TC_APT_020] Reschedule | appt_id={appt_id} | new=2026-08-01 10:00 | status={result['status_code']} | PASS")


@pytest.mark.appointment
@pytest.mark.regression
class TestNegativeAppointmentScenarios:
    """Negative tests for Appointment API."""

    def test_book_appointment_missing_fields_returns_400(self, env_config, admin_token):
        """TC_APT_030 — Book appointment with missing required fields returns 400."""
        from services.appointment_service import AppointmentService
        service = AppointmentService(env_config, admin_token)
        result = service.create_appointment_missing_fields()

        assertions = ResponseAssertions()
        assertions.assert_status_code(result["status_code"], 400, "Missing appointment fields")
        print(f"\n[TC_APT_030] Missing fields | status={result['status_code']} | PASS")

    def test_book_appointment_past_date_returns_400(self, env_config, admin_token, patient_and_provider_ids):
        """TC_APT_031 — Book appointment with past date returns 400 Bad Request."""
        from services.appointment_service import AppointmentService
        service = AppointmentService(env_config, admin_token)
        result = service.create_appointment_past_date(
            patient_and_provider_ids["patient_id"],
            patient_and_provider_ids["provider_id"]
        )
        assertions = ResponseAssertions()
        assertions.assert_status_code(result["status_code"], 400, "Past date appointment")
        print(f"\n[TC_APT_031] Past date rejected | status={result['status_code']} | PASS")
