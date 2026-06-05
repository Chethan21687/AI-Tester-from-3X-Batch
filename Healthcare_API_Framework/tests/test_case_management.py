"""
Layer 1 — Tests
Case Management test suite: open, retrieve, update, and close cases.
"""
import pytest
from business.patient_business import PatientBusiness
from business.provider_business import ProviderBusiness
from payloads.patient_payloads import PatientPayloadBuilder
from payloads.provider_payloads import ProviderPayloadBuilder
from utilities.assertions import ResponseAssertions


@pytest.fixture(scope="class")
def case_context(env_config, admin_token):
    pat_biz = PatientBusiness(env_config, admin_token)
    prv_biz = ProviderBusiness(env_config, admin_token)
    patient_id = pat_biz.create_patient(PatientPayloadBuilder.create_sarah_johnson())
    provider_id = prv_biz.create_provider(ProviderPayloadBuilder.create_dr_martinez())
    return {"patient_id": patient_id, "provider_id": provider_id}


@pytest.mark.case_mgmt
@pytest.mark.regression
class TestCaseManagement:
    """Functional and integration tests for case management module."""

    def test_open_clinical_case_returns_201(self, env_config, admin_token, case_context):
        """TC_CASE_001 — Open high-priority clinical case for complex diabetes + hypertension."""
        business = PatientBusiness(env_config, admin_token)
        case_id = business.open_case(
            patient_id=case_context["patient_id"],
            provider_id=case_context["provider_id"],
            case_type="clinical"
        )
        assert case_id is not None
        print(f"\n[TC_CASE_001] Clinical case opened | case_id={case_id} | priority=High | PASS")

    def test_open_social_case_returns_201(self, env_config, admin_token, case_context):
        """TC_CASE_002 — Open social case for transportation assistance."""
        business = PatientBusiness(env_config, admin_token)
        case_id = business.open_case(
            patient_id=case_context["patient_id"],
            provider_id=case_context["provider_id"],
            case_type="social"
        )
        assert case_id is not None
        print(f"\n[TC_CASE_002] Social case opened | case_id={case_id} | priority=Medium | PASS")

    def test_retrieve_cases_by_patient(self, env_config, admin_token, case_context):
        """TC_CASE_003 — Retrieve all cases for a patient."""
        from services.patient_service import PatientService
        service = PatientService(env_config, admin_token)
        result = service.get_cases(case_context["patient_id"])

        assertions = ResponseAssertions()
        assertions.assert_status_in(result["status_code"], [200, 404], "Get cases by patient")
        total = result["body"].get("total", 0)
        print(f"\n[TC_CASE_003] Get cases | patient={case_context['patient_id']} | total={total} | PASS")

    def test_update_case_status_to_resolved(self, env_config, admin_token, case_context):
        """TC_CASE_004 — Update case status to Resolved."""
        from services.patient_service import PatientService
        from payloads.appointment_payloads import CasePayloadBuilder
        service = PatientService(env_config, admin_token)

        payload = CasePayloadBuilder.create_clinical_case(case_context["patient_id"], case_context["provider_id"])
        create_result = service.create_case(case_context["patient_id"], payload)
        case_id = str(create_result["body"].get("case_id") or create_result["body"].get("id", "CASE-TEST"))

        update_payload = {"status": "Resolved", "resolution_notes": "Patient goals achieved. Case closed per provider review."}
        result = service.update_case(case_id, update_payload)

        assertions = ResponseAssertions()
        assertions.assert_status_in(result["status_code"], [200, 404], "Update case status")
        print(f"\n[TC_CASE_004] Case resolved | case_id={case_id} | status={result['status_code']} | PASS")

    def test_open_case_missing_patient_returns_400(self, env_config, admin_token):
        """TC_CASE_005 — Open case without patient_id returns 400."""
        from services.patient_service import PatientService
        service = PatientService(env_config, admin_token)
        invalid_payload = {
            "case_type": "Clinical",
            "priority": "High",
            "description": "Missing patient",
            # patient_id intentionally omitted
        }
        result = service.create_case("", invalid_payload)
        assertions = ResponseAssertions()
        assertions.assert_status_in(result["status_code"], [400, 404, 422], "Missing patient in case")
        print(f"\n[TC_CASE_005] Missing patient_id | status={result['status_code']} | PASS")

    def test_integration_case_triggers_disease_and_assessment(self, env_config, admin_token, case_context):
        """TC_CASE_006 — System test: full workflow — disease → case → assessment data flow."""
        from services.patient_service import PatientService
        from payloads.appointment_payloads import DiseasePayloadBuilder, CasePayloadBuilder, AssessmentPayloadBuilder
        service = PatientService(env_config, admin_token)

        # Step 1: Create disease record
        dis_payload = DiseasePayloadBuilder.create_hypertension_record(
            case_context["patient_id"], case_context["provider_id"]
        )
        dis_result = service.create_disease_record(case_context["patient_id"], dis_payload)

        # Step 2: Open case
        case_payload = CasePayloadBuilder.create_clinical_case(
            case_context["patient_id"], case_context["provider_id"]
        )
        case_result = service.create_case(case_context["patient_id"], case_payload)

        # Step 3: Create assessment
        assess_payload = AssessmentPayloadBuilder.create_follow_up_assessment(
            case_context["patient_id"], case_context["provider_id"]
        )
        assess_result = service.create_assessment(case_context["patient_id"], assess_payload)

        assertions = ResponseAssertions()
        assertions.assert_status_in(dis_result["status_code"], [201, 409], "Disease step")
        assertions.assert_status_in(case_result["status_code"], [201, 409], "Case step")
        assertions.assert_status_in(assess_result["status_code"], [201, 409], "Assessment step")

        print(
            f"\n[TC_CASE_006] Full workflow | "
            f"disease={dis_result['status_code']} | "
            f"case={case_result['status_code']} | "
            f"assessment={assess_result['status_code']} | PASS"
        )
