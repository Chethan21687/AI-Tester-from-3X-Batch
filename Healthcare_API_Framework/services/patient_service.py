"""
Layer 3 — Services
Patient CRUD service. All PHI access is audit-logged per HIPAA §164.312.
"""
from configuration.environments import EnvironmentConfig
from endpoints.endpoints import PatientEndpoints, DiseaseManagementEndpoints, CaseManagementEndpoints, AssessmentEndpoints, ReportEndpoints
from services.base_service import BaseService


class PatientService(BaseService):
    """CRUD operations for Patient records."""

    def __init__(self, env_config: EnvironmentConfig, token: str):
        super().__init__(env_config, token=token)

    def create_patient(self, payload: dict) -> dict:
        return self.post(PatientEndpoints.BASE, payload=payload)

    def search_patient(self, params: dict) -> dict:
        return self.get(PatientEndpoints.SEARCH, params=params)

    def get_patient_by_id(self, patient_id: str) -> dict:
        self._audit.log_phi_access("patient", patient_id, "READ")
        return self.get(PatientEndpoints.by_id(patient_id))

    def update_patient(self, patient_id: str, payload: dict) -> dict:
        self._audit.log_phi_access("patient", patient_id, "UPDATE")
        return self.put(PatientEndpoints.by_id(patient_id), payload=payload)

    def patch_patient(self, patient_id: str, payload: dict) -> dict:
        self._audit.log_phi_access("patient", patient_id, "PATCH")
        return self.patch(PatientEndpoints.by_id(patient_id), payload=payload)

    def delete_patient(self, patient_id: str) -> dict:
        self._audit.log_phi_access("patient", patient_id, "DELETE")
        return self.delete(PatientEndpoints.by_id(patient_id))

    def get_medical_history(self, patient_id: str) -> dict:
        self._audit.log_phi_access("medical_history", patient_id, "READ")
        return self.get(PatientEndpoints.medical_history(patient_id))

    # Disease Management
    def create_disease_record(self, patient_id: str, payload: dict) -> dict:
        return self.post(DiseaseManagementEndpoints.by_patient(patient_id), payload=payload)

    def get_disease_records(self, patient_id: str) -> dict:
        return self.get(DiseaseManagementEndpoints.by_patient(patient_id))

    def update_disease_record(self, record_id: str, payload: dict) -> dict:
        return self.put(DiseaseManagementEndpoints.by_id(record_id), payload=payload)

    # Case Management
    def create_case(self, patient_id: str, payload: dict) -> dict:
        return self.post(CaseManagementEndpoints.by_patient(patient_id), payload=payload)

    def get_cases(self, patient_id: str) -> dict:
        return self.get(CaseManagementEndpoints.by_patient(patient_id))

    def update_case(self, case_id: str, payload: dict) -> dict:
        return self.put(CaseManagementEndpoints.by_id(case_id), payload=payload)

    # Assessments
    def create_assessment(self, patient_id: str, payload: dict) -> dict:
        return self.post(AssessmentEndpoints.by_patient(patient_id), payload=payload)

    def get_assessments(self, patient_id: str) -> dict:
        return self.get(AssessmentEndpoints.by_patient(patient_id))

    # Reports
    def generate_patient_report(self, patient_id: str) -> dict:
        self._audit.log_phi_access("report", patient_id, "GENERATE")
        return self.get(ReportEndpoints.patient_report(patient_id))
