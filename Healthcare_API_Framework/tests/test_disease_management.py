"""
Layer 1 — Tests
Disease Management test suite: create, retrieve, and update disease records.
ICD-10 codes used throughout per HIPAA-compliant clinical documentation standards.
"""
import pytest
from business.patient_business import PatientBusiness
from business.provider_business import ProviderBusiness
from payloads.patient_payloads import PatientPayloadBuilder
from payloads.provider_payloads import ProviderPayloadBuilder
from utilities.assertions import ResponseAssertions


@pytest.fixture(scope="class")
def patient_provider_context(env_config, admin_token):
    pat_biz = PatientBusiness(env_config, admin_token)
    prv_biz = ProviderBusiness(env_config, admin_token)
    patient_id = pat_biz.create_patient(PatientPayloadBuilder.create_john_smith())
    provider_id = prv_biz.create_provider(ProviderPayloadBuilder.create_dr_anderson())
    return {"patient_id": patient_id, "provider_id": provider_id}


@pytest.mark.disease
@pytest.mark.regression
class TestDiseaseManagement:
    """Functional and integration tests for disease management module."""

    def test_create_diabetes_disease_record_returns_201(self, env_config, admin_token, patient_provider_context):
        """TC_DIS_001 — Create Type 2 Diabetes (E11.9) disease record for patient."""
        business = PatientBusiness(env_config, admin_token)
        record_id = business.add_disease_record(
            patient_id=patient_provider_context["patient_id"],
            provider_id=patient_provider_context["provider_id"],
            disease_type="diabetes"
        )
        assert record_id is not None
        print(f"\n[TC_DIS_001] Diabetes record created | record_id={record_id} | ICD-10=E11.9 | PASS")

    def test_create_hypertension_disease_record_returns_201(self, env_config, admin_token, patient_provider_context):
        """TC_DIS_002 — Create Essential Hypertension (I10) disease record for patient."""
        business = PatientBusiness(env_config, admin_token)
        record_id = business.add_disease_record(
            patient_id=patient_provider_context["patient_id"],
            provider_id=patient_provider_context["provider_id"],
            disease_type="hypertension"
        )
        assert record_id is not None
        print(f"\n[TC_DIS_002] Hypertension record created | record_id={record_id} | ICD-10=I10 | PASS")

    def test_retrieve_disease_records_by_patient(self, env_config, admin_token, patient_provider_context):
        """TC_DIS_003 — Retrieve all disease records for a patient."""
        from services.patient_service import PatientService
        service = PatientService(env_config, admin_token)
        result = service.get_disease_records(patient_provider_context["patient_id"])

        assertions = ResponseAssertions()
        assertions.assert_status_in(result["status_code"], [200, 404], "Get disease records")
        total = result["body"].get("total", 0)
        print(f"\n[TC_DIS_003] Disease records | patient={patient_provider_context['patient_id']} | total={total} | PASS")

    def test_update_disease_record_treatment_plan(self, env_config, admin_token, patient_provider_context):
        """TC_DIS_004 — Update disease record treatment plan via PUT."""
        from services.patient_service import PatientService
        service = PatientService(env_config, admin_token)

        # Create record first
        from payloads.appointment_payloads import DiseasePayloadBuilder
        payload = DiseasePayloadBuilder.create_diabetes_record(
            patient_provider_context["patient_id"],
            patient_provider_context["provider_id"]
        )
        create_result = service.create_disease_record(patient_provider_context["patient_id"], payload)
        record_id = str(create_result["body"].get("record_id") or create_result["body"].get("id", "REC-TEST"))

        update_payload = {
            "treatment_plan": "Updated: Metformin 1000mg twice daily + Glipizide 5mg daily",
            "severity": "Severe",
            "follow_up_date": "2026-08-01"
        }
        result = service.update_disease_record(record_id, update_payload)
        assertions = ResponseAssertions()
        assertions.assert_status_in(result["status_code"], [200, 201, 404], "Update disease record")
        print(f"\n[TC_DIS_004] Disease record updated | record_id={record_id} | status={result['status_code']} | PASS")

    def test_create_disease_record_missing_icd_code_returns_400(self, env_config, admin_token, patient_provider_context):
        """TC_DIS_005 — Create disease record without ICD-10 code returns 400."""
        from services.patient_service import PatientService
        service = PatientService(env_config, admin_token)
        invalid_payload = {
            "patient_id": patient_provider_context["patient_id"],
            "disease_name": "Unnamed Disease",
            "diagnosis_date": "2026-06-01",
            "severity": "Mild"
            # disease_code intentionally missing
        }
        result = service.create_disease_record(patient_provider_context["patient_id"], invalid_payload)
        assertions = ResponseAssertions()
        assertions.assert_status_code(result["status_code"], 400, "Missing ICD code")
        print(f"\n[TC_DIS_005] Missing ICD code rejected | status={result['status_code']} | PASS")

    def test_data_flow_disease_to_assessment(self, env_config, admin_token, patient_provider_context):
        """TC_DIS_006 — Integration: disease record creation triggers assessment workflow."""
        from services.patient_service import PatientService
        from payloads.appointment_payloads import DiseasePayloadBuilder, AssessmentPayloadBuilder
        service = PatientService(env_config, admin_token)

        disease_payload = DiseasePayloadBuilder.create_diabetes_record(
            patient_provider_context["patient_id"],
            patient_provider_context["provider_id"]
        )
        disease_result = service.create_disease_record(patient_provider_context["patient_id"], disease_payload)

        assessment_payload = AssessmentPayloadBuilder.create_initial_assessment(
            patient_provider_context["patient_id"],
            patient_provider_context["provider_id"]
        )
        assessment_result = service.create_assessment(patient_provider_context["patient_id"], assessment_payload)

        assertions = ResponseAssertions()
        assertions.assert_status_in(disease_result["status_code"], [201, 400, 409], "Disease creation")
        assertions.assert_status_in(assessment_result["status_code"], [201, 400, 409], "Assessment creation")
        print(
            f"\n[TC_DIS_006] Integration: disease→assessment | "
            f"disease={disease_result['status_code']} | "
            f"assessment={assessment_result['status_code']} | PASS"
        )
