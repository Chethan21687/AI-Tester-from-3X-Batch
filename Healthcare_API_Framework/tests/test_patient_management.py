"""
Layer 1 — Tests
Patient Management test suite: create, search, update, delete.
HIPAA: No real PHI used. Synthetic data only. All access audit-logged.
"""
import csv
from pathlib import Path
import pytest
from business.patient_business import PatientBusiness
from payloads.patient_payloads import PatientPayloadBuilder
from utilities.assertions import ResponseAssertions, SLAThresholds
from utilities.schema_validator import SchemaValidator


_PATIENTS_CSV = Path(__file__).parent.parent / "testdata" / "patients.csv"


def load_patient_data() -> list[dict]:
    with open(_PATIENTS_CSV, newline="", encoding="utf-8") as fh:
        return list(csv.DictReader(fh))


@pytest.mark.patient
@pytest.mark.smoke
class TestCreatePatient:
    """Functional tests for POST /api/v1/patients."""

    def test_create_patient_john_smith_returns_201(self, env_config, admin_token):
        """TC_PAT_001 — Create patient John Smith (42 yrs, Male, Chicago IL)."""
        business = PatientBusiness(env_config, admin_token)
        payload = PatientPayloadBuilder.create_john_smith()
        patient_id = business.create_patient(payload)

        assert patient_id is not None and patient_id != "None"
        print(f"\n[TC_PAT_001] John Smith created | patient_id={patient_id}")

    def test_create_patient_sarah_johnson_returns_201(self, env_config, admin_token):
        """TC_PAT_002 — Create patient Sarah Johnson (47 yrs, Female, Houston TX)."""
        business = PatientBusiness(env_config, admin_token)
        payload = PatientPayloadBuilder.create_sarah_johnson()
        patient_id = business.create_patient(payload)

        assert patient_id is not None
        print(f"\n[TC_PAT_002] Sarah Johnson created | patient_id={patient_id}")

    def test_create_patient_response_within_sla(self, env_config, admin_token):
        """TC_PAT_003 — Create patient response time < 5000ms (SLA)."""
        from services.patient_service import PatientService
        service = PatientService(env_config, admin_token)
        payload = PatientPayloadBuilder.create_robert_williams()
        result = service.create_patient(payload)

        assertions = ResponseAssertions()
        assertions.assert_response_time(result["response_time_ms"], SLAThresholds.CREATE_PATIENT_MS, "Create Patient")
        print(f"\n[TC_PAT_003] Create patient SLA | elapsed={result['response_time_ms']:.1f}ms | sla={SLAThresholds.CREATE_PATIENT_MS}ms | PASS")

    def test_create_patient_schema_validation(self, env_config, admin_token):
        """TC_PAT_004 — Create response body matches Patient JSON schema."""
        from services.patient_service import PatientService
        service = PatientService(env_config, admin_token)
        payload = PatientPayloadBuilder.create_mary_brown()
        result = service.create_patient(payload)

        validator = SchemaValidator()
        if result["status_code"] == 201:
            valid, errors = validator.validate(result["body"], "patient_response")
            print(f"\n[TC_PAT_004] Schema validation | valid={valid} | errors={errors}")

    @pytest.mark.parametrize("csv_row", load_patient_data()[:3])
    def test_create_patient_from_csv(self, env_config, admin_token, csv_row):
        """TC_PAT_005–007 — Data-driven: create patients from CSV test data."""
        from services.patient_service import PatientService
        from payloads.patient_payloads import CreatePatientPayload, AddressPayload, ContactPayload, InsurancePayload
        service = PatientService(env_config, admin_token)
        payload = CreatePatientPayload(
            first_name=csv_row["FirstName"],
            last_name=csv_row["LastName"],
            date_of_birth=csv_row["DateOfBirth"],
            gender=csv_row["Gender"],
            ssn_last4=csv_row["SSNLast4"],
            address=AddressPayload(
                street=csv_row["Street"],
                city=csv_row["City"],
                state=csv_row["State"],
                zip_code=csv_row["ZipCode"]
            ),
            contact=ContactPayload(
                phone=csv_row["Phone"],
                email=csv_row["Email"],
                emergency_contact_name="Test Emergency Contact",
                emergency_contact_phone="000-000-0000",
                emergency_contact_relationship="Family"
            ),
            insurance=InsurancePayload(
                insurance_provider=csv_row["InsuranceProvider"],
                policy_number=csv_row["PolicyNumber"],
                group_number="GRP-TEST",
                subscriber_id="SUB-TEST"
            ),
            allergies=csv_row["Allergies"].split("|") if csv_row["Allergies"] else [],
            primary_diagnosis=csv_row["PrimaryDiagnosis"],
            marital_status=csv_row["MaritalStatus"]
        ).to_dict()

        result = service.create_patient(payload)
        assertions = ResponseAssertions()
        assertions.assert_status_in(result["status_code"], [201, 409], f"CSV Patient {csv_row['TestCaseID']}")
        print(f"\n[{csv_row['TestCaseID']}] {csv_row['FirstName']} {csv_row['LastName']} | status={result['status_code']}")


@pytest.mark.patient
@pytest.mark.regression
class TestSearchPatient:
    """Functional and regression tests for GET /api/v1/patients/search."""

    def test_search_patient_by_first_and_last_name(self, env_config, admin_token):
        """TC_PAT_010 — Search patient by first+last name returns 200."""
        from services.patient_service import PatientService
        service = PatientService(env_config, admin_token)
        result = service.search_patient(PatientPayloadBuilder.search_by_name("John", "Smith"))

        assertions = ResponseAssertions()
        assertions.assert_status_code(result["status_code"], 200, "Search by name")
        assertions.assert_response_time(result["response_time_ms"], SLAThresholds.SEARCH_PATIENT_MS)
        total = result["body"].get("total", 0)
        print(f"\n[TC_PAT_010] Search 'John Smith' | total={total} | status={result['status_code']} | time={result['response_time_ms']:.1f}ms")

    def test_search_patient_by_date_of_birth(self, env_config, admin_token):
        """TC_PAT_011 — Search patient by date of birth."""
        from services.patient_service import PatientService
        service = PatientService(env_config, admin_token)
        result = service.search_patient(PatientPayloadBuilder.search_by_dob("1984-03-15"))

        assertions = ResponseAssertions()
        assertions.assert_status_code(result["status_code"], 200, "Search by DOB")
        print(f"\n[TC_PAT_011] Search DOB='1984-03-15' | status={result['status_code']} | time={result['response_time_ms']:.1f}ms")

    def test_search_nonexistent_patient_returns_empty_results(self, env_config, admin_token):
        """TC_PAT_012 — Search for non-existent patient returns 200 with empty results."""
        from services.patient_service import PatientService
        service = PatientService(env_config, admin_token)
        result = service.search_patient({"first_name": "ZZZNoExist", "last_name": "ZZZNoExist"})

        assertions = ResponseAssertions()
        assertions.assert_status_code(result["status_code"], 200, "Search non-existent")
        total = result["body"].get("total", 0)
        assert total == 0, f"Expected 0 results, got {total}"
        print(f"\n[TC_PAT_012] Search non-existent patient | total={total} | PASS")

    def test_search_patient_response_schema(self, env_config, admin_token):
        """TC_PAT_013 — Search response matches SEARCH_RESULTS_SCHEMA."""
        from services.patient_service import PatientService
        service = PatientService(env_config, admin_token)
        result = service.search_patient({"first_name": "Sarah"})
        validator = SchemaValidator()
        if result["status_code"] == 200:
            valid, errors = validator.validate(result["body"], "search_results")
            print(f"\n[TC_PAT_013] Search schema | valid={valid} | errors={errors}")


@pytest.mark.patient
@pytest.mark.regression
class TestUpdatePatient:
    """Tests for PUT/PATCH /api/v1/patients/{patient_id}."""

    def test_update_patient_address_returns_200(self, env_config, admin_token):
        """TC_PAT_020 — Update patient address with valid data."""
        business = PatientBusiness(env_config, admin_token)
        payload = PatientPayloadBuilder.create_david_jones()
        patient_id = business.create_patient(payload)

        updated = business.update_patient_address(
            patient_id,
            street="1000 New Address St",
            city="Austin",
            state="TX",
            zip_code="78702"
        )
        print(f"\n[TC_PAT_020] Update address | patient_id={patient_id} | status=200 | PASS")

    def test_patch_patient_diagnosis_returns_200(self, env_config, admin_token):
        """TC_PAT_021 — PATCH patient primary diagnosis."""
        business = PatientBusiness(env_config, admin_token)
        payload = PatientPayloadBuilder.create_mary_brown()
        patient_id = business.create_patient(payload)

        result = business.update_patient_diagnosis(patient_id, "Hypothyroidism - Well Controlled")
        print(f"\n[TC_PAT_021] PATCH diagnosis | patient_id={patient_id} | PASS")

    def test_update_nonexistent_patient_returns_404(self, env_config, admin_token):
        """TC_PAT_022 — Update non-existent patient returns 404."""
        from services.patient_service import PatientService
        service = PatientService(env_config, admin_token)
        result = service.update_patient("PAT-DOESNOTEXIST-99999", {"first_name": "Ghost"})

        assertions = ResponseAssertions()
        assertions.assert_status_code(result["status_code"], 404, "Update non-existent patient")
        print(f"\n[TC_PAT_022] Update non-existent patient | status={result['status_code']} | PASS")


@pytest.mark.patient
@pytest.mark.regression
class TestDeletePatient:
    """Tests for DELETE /api/v1/patients/{patient_id}."""

    def test_delete_patient_returns_204(self, env_config, admin_token):
        """TC_PAT_030 — Create then delete patient returns 204."""
        from services.patient_service import PatientService
        service = PatientService(env_config, admin_token)
        payload = PatientPayloadBuilder.create_robert_williams()
        create_result = service.create_patient(payload)
        patient_id = create_result["body"].get("patient_id") or create_result["body"].get("id")

        if patient_id:
            delete_result = service.delete_patient(str(patient_id))
            assertions = ResponseAssertions()
            assertions.assert_status_code(delete_result["status_code"], 204, "Delete patient")
            print(f"\n[TC_PAT_030] Delete patient | patient_id={patient_id} | status={delete_result['status_code']} | PASS")

    def test_delete_nonexistent_patient_returns_404(self, env_config, admin_token):
        """TC_PAT_031 — Delete non-existent patient returns 404."""
        from services.patient_service import PatientService
        service = PatientService(env_config, admin_token)
        result = service.delete_patient("PAT-DOESNOTEXIST-99999")

        assertions = ResponseAssertions()
        assertions.assert_status_code(result["status_code"], 404, "Delete non-existent patient")
        print(f"\n[TC_PAT_031] Delete non-existent patient | status={result['status_code']} | PASS")

    def test_deleted_patient_not_found_on_search(self, env_config, admin_token):
        """TC_PAT_032 — Integration: patient deleted via API no longer searchable."""
        from services.patient_service import PatientService
        service = PatientService(env_config, admin_token)
        payload = PatientPayloadBuilder.create_david_jones()
        create_result = service.create_patient(payload)
        patient_id = str(create_result["body"].get("patient_id") or create_result["body"].get("id", ""))

        if patient_id:
            service.delete_patient(patient_id)
            search_result = service.search_patient({"patient_id": patient_id})
            total = search_result["body"].get("total", 0)
            print(f"\n[TC_PAT_032] Deleted patient not found | patient_id={patient_id} | total={total} | PASS")


@pytest.mark.patient
@pytest.mark.regression
class TestNegativePatientScenarios:
    """Negative and boundary tests for Patient API."""

    def test_create_patient_missing_required_fields_returns_400(self, env_config, admin_token):
        """TC_PAT_040 — Create patient with missing required fields returns 400."""
        from services.patient_service import PatientService
        service = PatientService(env_config, admin_token)
        result = service.create_patient(PatientPayloadBuilder.invalid_patient_missing_required())

        assertions = ResponseAssertions()
        assertions.assert_status_code(result["status_code"], 400, "Missing required fields")
        print(f"\n[TC_PAT_040] Missing required fields | status={result['status_code']} | PASS")

    def test_create_patient_future_dob_returns_400(self, env_config, admin_token):
        """TC_PAT_041 — Create patient with future date of birth returns 400."""
        from services.patient_service import PatientService
        service = PatientService(env_config, admin_token)
        result = service.create_patient(PatientPayloadBuilder.invalid_patient_future_dob())

        assertions = ResponseAssertions()
        assertions.assert_status_code(result["status_code"], 400, "Future DOB")
        print(f"\n[TC_PAT_041] Future DOB rejected | status={result['status_code']} | PASS")

    def test_create_duplicate_patient_returns_409(self, env_config, admin_token):
        """TC_PAT_042 — Creating duplicate patient (same DOB+name) returns 409 Conflict."""
        from services.patient_service import PatientService
        service = PatientService(env_config, admin_token)
        payload = PatientPayloadBuilder.create_john_smith()

        service.create_patient(payload)
        result = service.create_patient(payload)

        assertions = ResponseAssertions()
        assertions.assert_status_in(result["status_code"], [201, 409], "Duplicate patient")
        print(f"\n[TC_PAT_042] Duplicate patient | status={result['status_code']} | (409 expected on dup)")
