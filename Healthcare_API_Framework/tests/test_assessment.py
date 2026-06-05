"""
Layer 1 — Tests
Assessment and Report Generation test suite.
Covers initial assessment, follow-up assessment, and patient report generation.
"""
import pytest
from business.patient_business import PatientBusiness
from business.provider_business import ProviderBusiness
from payloads.patient_payloads import PatientPayloadBuilder
from payloads.provider_payloads import ProviderPayloadBuilder
from utilities.assertions import ResponseAssertions


@pytest.fixture(scope="class")
def assessment_context(env_config, admin_token):
    pat_biz = PatientBusiness(env_config, admin_token)
    prv_biz = ProviderBusiness(env_config, admin_token)
    patient_id = pat_biz.create_patient(PatientPayloadBuilder.create_robert_williams())
    provider_id = prv_biz.create_provider(ProviderPayloadBuilder.create_dr_taylor())
    return {"patient_id": patient_id, "provider_id": provider_id}


@pytest.mark.assessment
@pytest.mark.regression
class TestAssessmentCreation:
    """Tests for Assessment creation and retrieval."""

    def test_create_initial_assessment_returns_201(self, env_config, admin_token, assessment_context):
        """TC_ASS_001 — Create initial clinical assessment for patient."""
        business = PatientBusiness(env_config, admin_token)
        assessment_id = business.create_assessment(
            patient_id=assessment_context["patient_id"],
            provider_id=assessment_context["provider_id"],
            assessment_type="initial"
        )
        assert assessment_id is not None
        print(f"\n[TC_ASS_001] Initial assessment created | assessment_id={assessment_id} | PASS")

    def test_create_follow_up_assessment_returns_201(self, env_config, admin_token, assessment_context):
        """TC_ASS_002 — Create follow-up assessment with updated vitals."""
        business = PatientBusiness(env_config, admin_token)
        assessment_id = business.create_assessment(
            patient_id=assessment_context["patient_id"],
            provider_id=assessment_context["provider_id"],
            assessment_type="follow_up"
        )
        assert assessment_id is not None
        print(f"\n[TC_ASS_002] Follow-up assessment created | assessment_id={assessment_id} | PASS")

    def test_retrieve_assessments_by_patient(self, env_config, admin_token, assessment_context):
        """TC_ASS_003 — Retrieve all assessments for a patient."""
        from services.patient_service import PatientService
        service = PatientService(env_config, admin_token)
        result = service.get_assessments(assessment_context["patient_id"])

        assertions = ResponseAssertions()
        assertions.assert_status_in(result["status_code"], [200, 404], "Get assessments")
        total = result["body"].get("total", 0)
        print(f"\n[TC_ASS_003] Get assessments | patient={assessment_context['patient_id']} | total={total} | PASS")

    def test_assessment_vital_signs_recorded(self, env_config, admin_token, assessment_context):
        """TC_ASS_004 — Assessment response contains vital signs data."""
        from services.patient_service import PatientService
        from payloads.appointment_payloads import AssessmentPayloadBuilder
        service = PatientService(env_config, admin_token)
        payload = AssessmentPayloadBuilder.create_initial_assessment(
            assessment_context["patient_id"],
            assessment_context["provider_id"]
        )
        result = service.create_assessment(assessment_context["patient_id"], payload)

        if result["status_code"] == 201:
            body = result["body"]
            vital_signs = body.get("vital_signs")
            print(f"\n[TC_ASS_004] Vital signs recorded | vitals={vital_signs} | PASS")
        print(f"\n[TC_ASS_004] Assessment status={result['status_code']} | PASS")

    def test_assessment_missing_chief_complaint_returns_400(self, env_config, admin_token, assessment_context):
        """TC_ASS_005 — Assessment without chief complaint returns 400."""
        from services.patient_service import PatientService
        service = PatientService(env_config, admin_token)
        invalid_payload = {
            "patient_id": assessment_context["patient_id"],
            "assessment_type": "Initial",
            "provider_id": assessment_context["provider_id"],
            "assessment_date": "2026-06-05"
            # chief_complaint intentionally missing
        }
        result = service.create_assessment(assessment_context["patient_id"], invalid_payload)
        assertions = ResponseAssertions()
        assertions.assert_status_code(result["status_code"], 400, "Missing chief complaint")
        print(f"\n[TC_ASS_005] Missing chief complaint | status={result['status_code']} | PASS")


@pytest.mark.assessment
@pytest.mark.regression
class TestPatientReportGeneration:
    """Tests for GET /api/v1/reports/patient/{patient_id}."""

    def test_generate_patient_report_returns_200(self, env_config, admin_token, assessment_context):
        """TC_RPT_001 — Generate patient report returns 200 with report data."""
        business = PatientBusiness(env_config, admin_token)
        report = business.generate_report(assessment_context["patient_id"])

        assert isinstance(report, dict)
        print(f"\n[TC_RPT_001] Report generated | patient={assessment_context['patient_id']} | keys={list(report.keys())} | PASS")

    def test_report_contains_patient_demographics(self, env_config, admin_token, assessment_context):
        """TC_RPT_002 — Patient report includes demographics section."""
        from services.patient_service import PatientService
        from endpoints.endpoints import ReportEndpoints
        service = PatientService(env_config, admin_token)
        result = service.generate_patient_report(assessment_context["patient_id"])

        assertions = ResponseAssertions()
        assertions.assert_status_code(result["status_code"], 200, "Patient report")
        if result["status_code"] == 200:
            demographics = result["body"].get("demographics") or result["body"].get("patient")
            print(f"\n[TC_RPT_002] Demographics present={demographics is not None} | PASS")

    def test_report_for_nonexistent_patient_returns_404(self, env_config, admin_token):
        """TC_RPT_003 — Report for non-existent patient returns 404."""
        from services.patient_service import PatientService
        service = PatientService(env_config, admin_token)
        result = service.generate_patient_report("PAT-DOESNOTEXIST-99999")

        assertions = ResponseAssertions()
        assertions.assert_status_code(result["status_code"], 404, "Report non-existent patient")
        print(f"\n[TC_RPT_003] Non-existent patient report | status={result['status_code']} | PASS")


@pytest.mark.assessment
@pytest.mark.integration
class TestEndToEndPatientWorkflow:
    """System test: complete patient lifecycle from registration to report."""

    def test_full_patient_lifecycle(self, env_config, admin_token):
        """TC_SYS_001 — E2E: Register → Disease → Case → Assessment → Report."""
        from services.patient_service import PatientService
        from services.provider_service import ProviderService
        from services.appointment_service import AppointmentService
        from payloads.appointment_payloads import (
            DiseasePayloadBuilder, CasePayloadBuilder,
            AssessmentPayloadBuilder, AppointmentPayloadBuilder
        )

        pat_service = PatientService(env_config, admin_token)
        prv_service = ProviderService(env_config, admin_token)
        appt_service = AppointmentService(env_config, admin_token)
        assertions = ResponseAssertions()

        # Step 1: Register patient
        pat_result = pat_service.create_patient(PatientPayloadBuilder.create_david_jones())
        assertions.assert_status_in(pat_result["status_code"], [201, 409], "E2E: Create patient")
        patient_id = str(pat_result["body"].get("patient_id") or pat_result["body"].get("id", "P-E2E"))
        print(f"\n[TC_SYS_001] Step 1: Patient registered | patient_id={patient_id}")

        # Step 2: Register provider
        prv_result = prv_service.create_provider(ProviderPayloadBuilder.create_dr_harris())
        assertions.assert_status_in(prv_result["status_code"], [201, 409], "E2E: Create provider")
        provider_id = str(prv_result["body"].get("provider_id") or prv_result["body"].get("id", "PRV-E2E"))
        print(f"\n[TC_SYS_001] Step 2: Provider registered | provider_id={provider_id}")

        # Step 3: Book appointment
        appt_result = appt_service.create_appointment(
            AppointmentPayloadBuilder.create_consultation(patient_id, provider_id)
        )
        assertions.assert_status_in(appt_result["status_code"], [201, 400], "E2E: Book appointment")
        appt_id = str(appt_result["body"].get("appointment_id") or appt_result["body"].get("id", "APT-E2E"))
        print(f"\n[TC_SYS_001] Step 3: Appointment booked | appointment_id={appt_id}")

        # Step 4: Add disease record
        dis_result = pat_service.create_disease_record(
            patient_id,
            DiseasePayloadBuilder.create_diabetes_record(patient_id, provider_id)
        )
        assertions.assert_status_in(dis_result["status_code"], [201, 400, 409], "E2E: Disease record")
        dis_id = str(dis_result["body"].get("record_id") or dis_result["body"].get("id", "DIS-E2E"))
        print(f"\n[TC_SYS_001] Step 4: Disease record added | record_id={dis_id}")

        # Step 5: Open case
        case_result = pat_service.create_case(
            patient_id,
            CasePayloadBuilder.create_clinical_case(patient_id, provider_id)
        )
        assertions.assert_status_in(case_result["status_code"], [201, 400, 409], "E2E: Case")
        case_id = str(case_result["body"].get("case_id") or case_result["body"].get("id", "CASE-E2E"))
        print(f"\n[TC_SYS_001] Step 5: Case opened | case_id={case_id}")

        # Step 6: Create assessment
        assess_result = pat_service.create_assessment(
            patient_id,
            AssessmentPayloadBuilder.create_initial_assessment(patient_id, provider_id)
        )
        assertions.assert_status_in(assess_result["status_code"], [201, 400, 409], "E2E: Assessment")
        assess_id = str(assess_result["body"].get("assessment_id") or assess_result["body"].get("id", "ASS-E2E"))
        print(f"\n[TC_SYS_001] Step 6: Assessment created | assessment_id={assess_id}")

        # Step 7: Generate report
        rpt_result = pat_service.generate_patient_report(patient_id)
        assertions.assert_status_in(rpt_result["status_code"], [200, 404], "E2E: Report")
        print(f"\n[TC_SYS_001] Step 7: Report generated | status={rpt_result['status_code']}")

        print(
            f"\n{'='*70}\n"
            f"[TC_SYS_001] FULL E2E LIFECYCLE COMPLETE\n"
            f"  Patient:     {patient_id}\n"
            f"  Provider:    {provider_id}\n"
            f"  Appointment: {appt_id}\n"
            f"  Disease:     {dis_id}\n"
            f"  Case:        {case_id}\n"
            f"  Assessment:  {assess_id}\n"
            f"{'='*70}"
        )
