"""
Layer 4 — Endpoints
All API endpoint constants for Healthcare API Framework.
"""


class AuthEndpoints:
    LOGIN = "/auth/login"
    LOGOUT = "/auth/logout"
    REFRESH_TOKEN = "/auth/refresh"
    OAUTH_TOKEN = "/auth/token"


class PatientEndpoints:
    BASE = "/patients"
    SEARCH = "/patients/search"
    BY_ID = "/patients/{patient_id}"
    UPDATE = "/patients/{patient_id}"
    DELETE = "/patients/{patient_id}"
    MEDICAL_HISTORY = "/patients/{patient_id}/medical-history"

    @staticmethod
    def by_id(patient_id: str) -> str:
        return f"/patients/{patient_id}"

    @staticmethod
    def medical_history(patient_id: str) -> str:
        return f"/patients/{patient_id}/medical-history"


class ProviderEndpoints:
    BASE = "/providers"
    SEARCH = "/providers/search"
    BY_ID = "/providers/{provider_id}"
    UPDATE = "/providers/{provider_id}"
    DELETE = "/providers/{provider_id}"
    SCHEDULE = "/providers/{provider_id}/schedule"

    @staticmethod
    def by_id(provider_id: str) -> str:
        return f"/providers/{provider_id}"

    @staticmethod
    def schedule(provider_id: str) -> str:
        return f"/providers/{provider_id}/schedule"


class AppointmentEndpoints:
    BASE = "/appointments"
    BY_ID = "/appointments/{appointment_id}"
    CANCEL = "/appointments/{appointment_id}/cancel"
    RESCHEDULE = "/appointments/{appointment_id}/reschedule"
    BY_PATIENT = "/appointments/patient/{patient_id}"
    BY_PROVIDER = "/appointments/provider/{provider_id}"

    @staticmethod
    def by_id(appointment_id: str) -> str:
        return f"/appointments/{appointment_id}"

    @staticmethod
    def cancel(appointment_id: str) -> str:
        return f"/appointments/{appointment_id}/cancel"

    @staticmethod
    def by_patient(patient_id: str) -> str:
        return f"/appointments/patient/{patient_id}"


class DiseaseManagementEndpoints:
    BASE = "/disease-management"
    BY_PATIENT = "/disease-management/patient/{patient_id}"
    BY_ID = "/disease-management/{record_id}"

    @staticmethod
    def by_patient(patient_id: str) -> str:
        return f"/disease-management/patient/{patient_id}"

    @staticmethod
    def by_id(record_id: str) -> str:
        return f"/disease-management/{record_id}"


class CaseManagementEndpoints:
    BASE = "/cases"
    BY_PATIENT = "/cases/patient/{patient_id}"
    BY_ID = "/cases/{case_id}"

    @staticmethod
    def by_patient(patient_id: str) -> str:
        return f"/cases/patient/{patient_id}"

    @staticmethod
    def by_id(case_id: str) -> str:
        return f"/cases/{case_id}"


class AssessmentEndpoints:
    BASE = "/assessments"
    BY_PATIENT = "/assessments/patient/{patient_id}"
    BY_ID = "/assessments/{assessment_id}"

    @staticmethod
    def by_patient(patient_id: str) -> str:
        return f"/assessments/patient/{patient_id}"

    @staticmethod
    def by_id(assessment_id: str) -> str:
        return f"/assessments/{assessment_id}"


class MedicalRecordsEndpoints:
    BASE = "/medical-records"
    BY_PATIENT = "/medical-records/patient/{patient_id}"
    BY_ID = "/medical-records/{record_id}"

    @staticmethod
    def by_patient(patient_id: str) -> str:
        return f"/medical-records/patient/{patient_id}"


class PrescriptionEndpoints:
    BASE = "/prescriptions"
    BY_PATIENT = "/prescriptions/patient/{patient_id}"
    BY_ID = "/prescriptions/{prescription_id}"

    @staticmethod
    def by_patient(patient_id: str) -> str:
        return f"/prescriptions/patient/{patient_id}"


class ReportEndpoints:
    PATIENT_REPORT = "/reports/patient/{patient_id}"
    SUMMARY = "/reports/summary"

    @staticmethod
    def patient_report(patient_id: str) -> str:
        return f"/reports/patient/{patient_id}"
