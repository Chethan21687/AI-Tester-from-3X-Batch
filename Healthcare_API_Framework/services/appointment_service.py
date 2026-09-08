"""
Layer 3 — Services
Appointment booking, cancellation, and rescheduling service.
"""
from configuration.environments import EnvironmentConfig
from endpoints.endpoints import AppointmentEndpoints
from services.base_service import BaseService


class AppointmentService(BaseService):
    """Operations for Appointment management."""

    def __init__(self, env_config: EnvironmentConfig, token: str):
        super().__init__(env_config, token=token)

    def create_appointment(self, payload: dict) -> dict:
        return self.post(AppointmentEndpoints.BASE, payload=payload)

    def get_appointment_by_id(self, appointment_id: str) -> dict:
        return self.get(AppointmentEndpoints.by_id(appointment_id))

    def cancel_appointment(self, appointment_id: str, reason: str = "") -> dict:
        return self.post(AppointmentEndpoints.cancel(appointment_id), payload={"reason": reason})

    def reschedule_appointment(self, appointment_id: str, payload: dict) -> dict:
        return self.put(AppointmentEndpoints.by_id(appointment_id), payload=payload)

    def get_appointments_by_patient(self, patient_id: str) -> dict:
        return self.get(AppointmentEndpoints.by_patient(patient_id))

    def get_appointments_by_provider(self, provider_id: str) -> dict:
        return self.get(AppointmentEndpoints.by_provider(provider_id))

    def create_appointment_missing_fields(self) -> dict:
        return self.post(AppointmentEndpoints.BASE, payload={"patient_id": "P001"})

    def create_appointment_past_date(self, patient_id: str, provider_id: str) -> dict:
        return self.post(AppointmentEndpoints.BASE, payload={
            "patient_id": patient_id,
            "provider_id": provider_id,
            "appointment_date": "2020-01-01",
            "appointment_time": "09:00",
            "appointment_type": "Consultation",
            "reason_for_visit": "Test with past date"
        })
