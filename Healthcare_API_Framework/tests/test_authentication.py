"""
Layer 1 — Tests
Authentication test suite: login, OAuth, token refresh, negative cases.
SLA: Login response < 2000ms.
"""
import pytest
from business.auth_business import AuthBusiness
from utilities.assertions import ResponseAssertions, SLAThresholds


@pytest.mark.auth
@pytest.mark.smoke
class TestAuthentication:
    """Functional, Integration, and System tests for Authentication API."""

    # ── Positive Tests ────────────────────────────────────────────────────────

    def test_admin_login_returns_200_and_token(self, env_config):
        """TC_AUTH_001 — Admin login succeeds with valid credentials."""
        business = AuthBusiness(env_config)
        token = business.login_as_admin()

        assert token is not None, "Access token must not be None"
        assert len(token) > 20, f"Token too short: {len(token)} chars"
        print(f"\n[TC_AUTH_001] Admin login successful | Token length: {len(token)} chars")

    def test_doctor_login_returns_200_and_token(self, env_config):
        """TC_AUTH_002 — Doctor/provider login succeeds with valid credentials."""
        business = AuthBusiness(env_config)
        token = business.login_as_doctor()

        assert token is not None
        print(f"\n[TC_AUTH_002] Doctor login successful | Token: {token[:20]}...")

    def test_patient_login_returns_200_and_token(self, env_config):
        """TC_AUTH_003 — Patient login succeeds with valid credentials."""
        business = AuthBusiness(env_config)
        token = business.login_as_patient()

        assert token is not None
        print(f"\n[TC_AUTH_003] Patient login successful | Token: {token[:20]}...")

    def test_login_response_time_within_sla(self, env_config):
        """TC_AUTH_004 — Login response time < 2000ms (SLA)."""
        from services.auth_service import AuthService
        from configuration.environments import EnvironmentManager
        import time

        service = AuthService(env_config)
        creds = EnvironmentManager.get_user_credentials("admin")

        start = time.perf_counter()
        result = service.login(creds["username"], creds["password"])
        elapsed_ms = (time.perf_counter() - start) * 1000

        assertions = ResponseAssertions()
        assertions.assert_response_time(result["response_time_ms"], SLAThresholds.LOGIN_MS, "Admin Login")
        print(f"\n[TC_AUTH_004] Login SLA check | elapsed={result['response_time_ms']:.1f}ms | sla={SLAThresholds.LOGIN_MS}ms | PASS")

    def test_oauth_client_credentials_flow(self, env_config):
        """TC_AUTH_005 — OAuth2 client_credentials grant returns access token."""
        business = AuthBusiness(env_config)
        token = business.login_with_oauth()

        assert token is not None
        print(f"\n[TC_AUTH_005] OAuth2 token obtained | Token: {token[:20]}...")

    # ── Negative Tests ────────────────────────────────────────────────────────

    def test_login_invalid_credentials_returns_401(self, env_config):
        """TC_AUTH_006 — Invalid credentials returns 401 Unauthorized."""
        business = AuthBusiness(env_config)
        result = business.login_invalid_credentials()

        assertions = ResponseAssertions()
        assertions.assert_status_in(result["status_code"], [401, 403], "Invalid credentials")
        print(f"\n[TC_AUTH_006] Invalid credentials | status={result['status_code']} | PASS (expected 401/403)")

    def test_login_empty_credentials_returns_400(self, env_config):
        """TC_AUTH_007 — Empty credentials returns 400 Bad Request."""
        business = AuthBusiness(env_config)
        result = business.login_empty_credentials()

        assertions = ResponseAssertions()
        assertions.assert_status_code(result["status_code"], 400, "Empty credentials")
        print(f"\n[TC_AUTH_007] Empty credentials | status={result['status_code']} | PASS")

    def test_request_with_no_token_returns_401(self, env_config):
        """TC_AUTH_008 — Request without Authorization header returns 401."""
        from services.patient_service import PatientService

        service = PatientService(env_config, token=None)
        result = service.get_patient_by_id("P-DUMMY-001")

        assertions = ResponseAssertions()
        assertions.assert_status_in(result["status_code"], [401, 403], "No token")
        print(f"\n[TC_AUTH_008] No auth token | status={result['status_code']} | PASS")

    def test_request_with_expired_token_returns_401(self, env_config):
        """TC_AUTH_009 — Expired token returns 401 Unauthorized."""
        from services.patient_service import PatientService

        expired_token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.EXPIRED.SIGNATURE"
        service = PatientService(env_config, token=expired_token)
        result = service.get_patient_by_id("P-DUMMY-001")

        assertions = ResponseAssertions()
        assertions.assert_status_in(result["status_code"], [401, 403], "Expired token")
        print(f"\n[TC_AUTH_009] Expired token | status={result['status_code']} | PASS")

    # ── Integration Tests ─────────────────────────────────────────────────────

    def test_token_used_for_patient_api_call(self, env_config, admin_token):
        """TC_AUTH_010 — Token obtained from login is accepted by Patient API."""
        from services.patient_service import PatientService

        service = PatientService(env_config, token=admin_token)
        result = service.search_patient({"first_name": "John"})

        assertions = ResponseAssertions()
        assertions.assert_status_in(result["status_code"], [200, 404], "Token used for patient search")
        print(f"\n[TC_AUTH_010] Token accepted by Patient API | status={result['status_code']} | PASS")
