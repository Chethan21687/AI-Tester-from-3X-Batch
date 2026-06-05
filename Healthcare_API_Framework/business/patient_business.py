"""
Layer 2 — Business
Patient business logic. Orchestrates patient CRUD, disease, case, assessment, and report flows.
"""
from configuration.environments import EnvironmentConfig
from services.patient_service import PatientService
from payloads.patient_payloads import PatientPayloadBuilder
from payloads.appointment_payloads import DiseasePayloadBuilder, CasePayloadBuilder, AssessmentPayloadBuilder
from utilities.assertions import ResponseAssertions, SLAThresholds
from utilities.output_manager import OutputManager
from utilities.schema_validator import SchemaValidator


class PatientBusiness:
    """Full patient lifecycle: create, search, update, delete, reports."""

    def __init__(self, env_config: EnvironmentConfig, token: str):
        self.service = PatientService(env_config, token)
        self.assertions = ResponseAssertions()
        self.output = OutputManager()
        self.validator = SchemaValidator()

    # ── Create ────────────────────────────────────────────────────────────────

    def create_patient(self, payload: dict) -> str:
        result = self.service.create_patient(payload)
        name = f"{payload.get('first_name', '')} {payload.get('last_name', '')}"
        self.output.print_response(
            test_name=f"Create Patient: {name}",
            method="POST",
            url=result["url"],
            status_code=result["status_code"],
            response_time_ms=result["response_time_ms"],
            correlation_id=result["correlation_id"],
            response_body=result["body"],
            expected_status=201
        )
        self.assertions.assert_status_code(result["status_code"], 201, "Create Patient")
        self.assertions.assert_response_time(result["response_time_ms"], SLAThresholds.CREATE_PATIENT_MS)
        patient_id = self.assertions.assert_patient_id_generated(result["body"])
        print(f"[CREATE PATIENT] Patient ID generated: {patient_id} | Name: {name}")
        return patient_id

    # ── Search ────────────────────────────────────────────────────────────────

    def search_by_name(self, first_name: str, last_name: str) -> list:
        params = PatientPayloadBuilder.search_by_name(first_name, last_name)
        result = self.service.search_patient(params)
        self.output.print_response(
            test_name=f"Search Patient: {first_name} {last_name}",
            method="GET",
            url=result["url"],
            status_code=result["status_code"],
            response_time_ms=result["response_time_ms"],
            correlation_id=result["correlation_id"],
            response_body=result["body"],
            expected_status=200
        )
        self.assertions.assert_status_code(result["status_code"], 200, "Search Patient by Name")
        self.assertions.assert_response_time(result["response_time_ms"], SLAThresholds.SEARCH_PATIENT_MS)
        records = result["body"].get("results", [])
        print(f"[SEARCH PATIENT] Query: {first_name} {last_name} | Found: {len(records)} record(s)")
        return records

    def search_by_id(self, patient_id: str) -> dict:
        result = self.service.get_patient_by_id(patient_id)
        self.output.print_response(
            test_name=f"Get Patient by ID: {patient_id}",
            method="GET",
            url=result["url"],
            status_code=result["status_code"],
            response_time_ms=result["response_time_ms"],
            correlation_id=result["correlation_id"],
            response_body=result["body"],
            expected_status=200
        )
        self.assertions.assert_status_code(result["status_code"], 200, "Get Patient by ID")
        print(f"[GET PATIENT] ID: {patient_id} | Status: {result['status_code']}")
        return result["body"]

    # ── Update ────────────────────────────────────────────────────────────────

    def update_patient_address(self, patient_id: str, street: str, city: str, state: str, zip_code: str) -> dict:
        payload = PatientPayloadBuilder.update_address(patient_id, street, city, state, zip_code)
        result = self.service.update_patient(patient_id, payload)
        self.output.print_response(
            test_name=f"Update Patient Address: {patient_id}",
            method="PUT",
            url=result["url"],
            status_code=result["status_code"],
            response_time_ms=result["response_time_ms"],
            correlation_id=result["correlation_id"],
            response_body=result["body"],
            expected_status=200
        )
        self.assertions.assert_status_code(result["status_code"], 200, "Update Patient")
        print(f"[UPDATE PATIENT] ID: {patient_id} | New address: {street}, {city}, {state} {zip_code}")
        return result["body"]

    def update_patient_diagnosis(self, patient_id: str, diagnosis: str) -> dict:
        payload = PatientPayloadBuilder.update_diagnosis(patient_id, diagnosis)
        result = self.service.patch_patient(patient_id, payload)
        self.output.print_response(
            test_name=f"Update Patient Diagnosis: {patient_id}",
            method="PATCH",
            url=result["url"],
            status_code=result["status_code"],
            response_time_ms=result["response_time_ms"],
            correlation_id=result["correlation_id"],
            expected_status=200
        )
        self.assertions.assert_status_code(result["status_code"], 200, "Patch Patient Diagnosis")
        print(f"[PATCH PATIENT] ID: {patient_id} | New diagnosis: {diagnosis}")
        return result["body"]

    # ── Delete ────────────────────────────────────────────────────────────────

    def delete_patient(self, patient_id: str) -> None:
        result = self.service.delete_patient(patient_id)
        self.output.print_response(
            test_name=f"Delete Patient: {patient_id}",
            method="DELETE",
            url=result["url"],
            status_code=result["status_code"],
            response_time_ms=result["response_time_ms"],
            correlation_id=result["correlation_id"],
            expected_status=204
        )
        self.assertions.assert_status_code(result["status_code"], 204, "Delete Patient")
        print(f"[DELETE PATIENT] ID: {patient_id} | Successfully deleted")

    # ── Disease Management ────────────────────────────────────────────────────

    def add_disease_record(self, patient_id: str, provider_id: str, disease_type: str = "diabetes") -> str:
        builders = {
            "diabetes": DiseasePayloadBuilder.create_diabetes_record,
            "hypertension": DiseasePayloadBuilder.create_hypertension_record
        }
        payload = builders.get(disease_type, DiseasePayloadBuilder.create_diabetes_record)(patient_id, provider_id)
        result = self.service.create_disease_record(patient_id, payload)
        self.output.print_response(
            test_name=f"Add Disease Record: {disease_type} for {patient_id}",
            method="POST",
            url=result["url"],
            status_code=result["status_code"],
            response_time_ms=result["response_time_ms"],
            correlation_id=result["correlation_id"],
            expected_status=201
        )
        self.assertions.assert_status_code(result["status_code"], 201, "Create Disease Record")
        record_id = result["body"].get("record_id") or result["body"].get("id")
        print(f"[DISEASE MGMT] Record ID: {record_id} | Type: {disease_type} | Patient: {patient_id}")
        return str(record_id)

    # ── Case Management ───────────────────────────────────────────────────────

    def open_case(self, patient_id: str, provider_id: str, case_type: str = "clinical") -> str:
        builders = {
            "clinical": CasePayloadBuilder.create_clinical_case,
            "social": CasePayloadBuilder.create_social_case
        }
        payload = builders.get(case_type, CasePayloadBuilder.create_clinical_case)(patient_id, provider_id)
        result = self.service.create_case(patient_id, payload)
        self.output.print_response(
            test_name=f"Open Case: {case_type} for {patient_id}",
            method="POST",
            url=result["url"],
            status_code=result["status_code"],
            response_time_ms=result["response_time_ms"],
            correlation_id=result["correlation_id"],
            expected_status=201
        )
        self.assertions.assert_status_code(result["status_code"], 201, "Create Case")
        case_id = result["body"].get("case_id") or result["body"].get("id")
        print(f"[CASE MGMT] Case ID: {case_id} | Type: {case_type} | Patient: {patient_id}")
        return str(case_id)

    # ── Assessment ────────────────────────────────────────────────────────────

    def create_assessment(self, patient_id: str, provider_id: str, assessment_type: str = "initial") -> str:
        builders = {
            "initial": AssessmentPayloadBuilder.create_initial_assessment,
            "follow_up": AssessmentPayloadBuilder.create_follow_up_assessment
        }
        payload = builders.get(assessment_type, AssessmentPayloadBuilder.create_initial_assessment)(patient_id, provider_id)
        result = self.service.create_assessment(patient_id, payload)
        self.output.print_response(
            test_name=f"Create Assessment: {assessment_type} for {patient_id}",
            method="POST",
            url=result["url"],
            status_code=result["status_code"],
            response_time_ms=result["response_time_ms"],
            correlation_id=result["correlation_id"],
            expected_status=201
        )
        self.assertions.assert_status_code(result["status_code"], 201, "Create Assessment")
        assessment_id = result["body"].get("assessment_id") or result["body"].get("id")
        print(f"[ASSESSMENT] ID: {assessment_id} | Type: {assessment_type} | Patient: {patient_id}")
        return str(assessment_id)

    # ── Reports ───────────────────────────────────────────────────────────────

    def generate_report(self, patient_id: str) -> dict:
        result = self.service.generate_patient_report(patient_id)
        self.output.print_response(
            test_name=f"Generate Patient Report: {patient_id}",
            method="GET",
            url=result["url"],
            status_code=result["status_code"],
            response_time_ms=result["response_time_ms"],
            correlation_id=result["correlation_id"],
            response_body=result["body"],
            expected_status=200
        )
        self.assertions.assert_status_code(result["status_code"], 200, "Generate Report")
        print(f"[REPORT] Generated for patient: {patient_id} | URL: {result['url']}")
        return result["body"]
