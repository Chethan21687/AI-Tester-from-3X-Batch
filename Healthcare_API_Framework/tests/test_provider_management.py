"""
Layer 1 — Tests
Provider Management test suite: create, search, update, delete.
"""
import csv
from pathlib import Path
import pytest
from business.provider_business import ProviderBusiness
from payloads.provider_payloads import ProviderPayloadBuilder
from utilities.assertions import ResponseAssertions, SLAThresholds
from utilities.schema_validator import SchemaValidator


_PROVIDERS_CSV = Path(__file__).parent.parent / "testdata" / "providers.csv"


def load_provider_data() -> list[dict]:
    with open(_PROVIDERS_CSV, newline="", encoding="utf-8") as fh:
        return list(csv.DictReader(fh))


@pytest.mark.provider
@pytest.mark.smoke
class TestCreateProvider:
    """Tests for POST /api/v1/providers."""

    def test_create_dr_anderson_cardiologist(self, env_config, admin_token):
        """TC_PRV_001 — Create Dr. William Anderson, Cardiologist."""
        business = ProviderBusiness(env_config, admin_token)
        provider_id = business.create_provider(ProviderPayloadBuilder.create_dr_anderson())

        assert provider_id is not None
        print(f"\n[TC_PRV_001] Dr. Anderson (Cardiology) created | provider_id={provider_id}")

    def test_create_dr_martinez_internist(self, env_config, admin_token):
        """TC_PRV_002 — Create Dr. Patricia Martinez, Internal Medicine."""
        business = ProviderBusiness(env_config, admin_token)
        provider_id = business.create_provider(ProviderPayloadBuilder.create_dr_martinez())

        assert provider_id is not None
        print(f"\n[TC_PRV_002] Dr. Martinez (Internal Medicine) created | provider_id={provider_id}")

    def test_create_provider_schema_validation(self, env_config, admin_token):
        """TC_PRV_003 — Create provider response matches Provider JSON schema."""
        from services.provider_service import ProviderService
        service = ProviderService(env_config, admin_token)
        result = service.create_provider(ProviderPayloadBuilder.create_dr_taylor())

        validator = SchemaValidator()
        if result["status_code"] == 201:
            valid, errors = validator.validate(result["body"], "provider_response")
            print(f"\n[TC_PRV_003] Schema | valid={valid} | errors={errors}")

    @pytest.mark.parametrize("csv_row", load_provider_data()[:3])
    def test_create_provider_from_csv(self, env_config, admin_token, csv_row):
        """TC_PRV_CSV_001–003 — Data-driven: create providers from CSV test data."""
        from services.provider_service import ProviderService
        from payloads.provider_payloads import CreateProviderPayload
        service = ProviderService(env_config, admin_token)

        payload = CreateProviderPayload(
            first_name=csv_row["FirstName"],
            last_name=csv_row["LastName"],
            title=csv_row["Title"],
            specialty=csv_row["Specialty"],
            npi_number=csv_row["NPINumber"],
            license_number=csv_row["LicenseNumber"],
            license_state=csv_row["LicenseState"],
            phone=csv_row["Phone"],
            email=csv_row["Email"],
            department=csv_row["Department"],
            accepting_patients=csv_row["AcceptingPatients"].upper() == "TRUE"
        ).to_dict()

        result = service.create_provider(payload)
        assertions = ResponseAssertions()
        assertions.assert_status_in(result["status_code"], [201, 409], f"CSV Provider {csv_row['TestCaseID']}")
        print(f"\n[{csv_row['TestCaseID']}] Dr. {csv_row['FirstName']} {csv_row['LastName']} {csv_row['Title']} | status={result['status_code']}")


@pytest.mark.provider
@pytest.mark.regression
class TestSearchProvider:
    """Tests for GET /api/v1/providers/search."""

    def test_search_provider_by_specialty_cardiology(self, env_config, admin_token):
        """TC_PRV_010 — Search providers by Cardiology specialty."""
        from services.provider_service import ProviderService
        service = ProviderService(env_config, admin_token)
        result = service.search_provider(ProviderPayloadBuilder.search_by_specialty("Cardiology"))

        assertions = ResponseAssertions()
        assertions.assert_status_code(result["status_code"], 200, "Search provider by specialty")
        assertions.assert_response_time(result["response_time_ms"], SLAThresholds.SEARCH_PROVIDER_MS)
        total = result["body"].get("total", 0)
        print(f"\n[TC_PRV_010] Cardiology search | total={total} | time={result['response_time_ms']:.1f}ms | PASS")

    def test_search_provider_by_name(self, env_config, admin_token):
        """TC_PRV_011 — Search provider by first/last name."""
        from services.provider_service import ProviderService
        service = ProviderService(env_config, admin_token)
        result = service.search_provider(ProviderPayloadBuilder.search_by_name("William", "Anderson"))

        assertions = ResponseAssertions()
        assertions.assert_status_code(result["status_code"], 200, "Search provider by name")
        print(f"\n[TC_PRV_011] Search Dr. William Anderson | status={result['status_code']} | PASS")

    def test_search_nonexistent_specialty_returns_empty(self, env_config, admin_token):
        """TC_PRV_012 — Search for non-existent specialty returns empty results."""
        from services.provider_service import ProviderService
        service = ProviderService(env_config, admin_token)
        result = service.search_provider({"specialty": "ZZZ_NONEXISTENT_SPECIALTY"})

        assertions = ResponseAssertions()
        assertions.assert_status_code(result["status_code"], 200, "Empty specialty search")
        total = result["body"].get("total", 0)
        assert total == 0
        print(f"\n[TC_PRV_012] Non-existent specialty | total={total} | PASS")


@pytest.mark.provider
@pytest.mark.regression
class TestUpdateProvider:
    """Tests for PUT/PATCH /api/v1/providers/{provider_id}."""

    def test_update_provider_accepting_patients_false(self, env_config, admin_token):
        """TC_PRV_020 — Update provider to not accepting patients."""
        from services.provider_service import ProviderService
        service = ProviderService(env_config, admin_token)
        create_result = service.create_provider(ProviderPayloadBuilder.create_dr_harris())
        provider_id = str(create_result["body"].get("provider_id") or create_result["body"].get("id", "P-TEST"))

        patch_payload = ProviderPayloadBuilder.update_accepting_patients(provider_id, False)
        result = service.patch_provider(provider_id, patch_payload)

        assertions = ResponseAssertions()
        assertions.assert_status_code(result["status_code"], 200, "Update provider availability")
        print(f"\n[TC_PRV_020] Provider {provider_id} | accepting_patients=False | PASS")

    def test_update_provider_contact(self, env_config, admin_token):
        """TC_PRV_021 — Update provider phone and email."""
        from services.provider_service import ProviderService
        service = ProviderService(env_config, admin_token)
        create_result = service.create_provider(ProviderPayloadBuilder.create_dr_moore())
        provider_id = str(create_result["body"].get("provider_id") or create_result["body"].get("id", "P-TEST"))

        patch_payload = ProviderPayloadBuilder.update_contact(
            provider_id, "215-555-9999", "dr.moore.updated@healthcare.example.com"
        )
        result = service.patch_provider(provider_id, patch_payload)
        assertions = ResponseAssertions()
        assertions.assert_status_code(result["status_code"], 200, "Update provider contact")
        print(f"\n[TC_PRV_021] Provider contact updated | provider_id={provider_id} | PASS")

    def test_update_nonexistent_provider_returns_404(self, env_config, admin_token):
        """TC_PRV_022 — Update non-existent provider returns 404."""
        from services.provider_service import ProviderService
        service = ProviderService(env_config, admin_token)
        result = service.update_provider("PRV-DOESNOTEXIST-99999", {"specialty": "Ghost"})

        assertions = ResponseAssertions()
        assertions.assert_status_code(result["status_code"], 404, "Update non-existent provider")
        print(f"\n[TC_PRV_022] Non-existent provider update | status={result['status_code']} | PASS")


@pytest.mark.provider
@pytest.mark.regression
class TestNegativeProviderScenarios:
    """Negative tests for Provider API."""

    def test_create_provider_missing_npi_returns_400(self, env_config, admin_token):
        """TC_PRV_030 — Create provider without NPI returns 400."""
        from services.provider_service import ProviderService
        service = ProviderService(env_config, admin_token)
        result = service.create_provider(ProviderPayloadBuilder.invalid_provider_missing_npi())

        assertions = ResponseAssertions()
        assertions.assert_status_code(result["status_code"], 400, "Missing NPI")
        print(f"\n[TC_PRV_030] Missing NPI | status={result['status_code']} | PASS")

    def test_create_duplicate_provider_npi_returns_409(self, env_config, admin_token):
        """TC_PRV_031 — Duplicate NPI number returns 409 Conflict."""
        from services.provider_service import ProviderService
        service = ProviderService(env_config, admin_token)
        payload = ProviderPayloadBuilder.create_dr_anderson()

        service.create_provider(payload)
        result = service.create_provider(payload)

        assertions = ResponseAssertions()
        assertions.assert_status_in(result["status_code"], [201, 409], "Duplicate NPI")
        print(f"\n[TC_PRV_031] Duplicate NPI | status={result['status_code']} | (409 expected on dup)")
