"""
Layer 2 — Business
Authentication business logic. Manages token lifecycle and role-based login.
HIPAA: Token stored in-memory only; credentials sourced from credentials.json.
"""
from configuration.environments import EnvironmentConfig, EnvironmentManager
from services.auth_service import AuthService
from utilities.assertions import ResponseAssertions
from utilities.output_manager import OutputManager


class AuthBusiness:
    """Orchestrates authentication flow and token management."""

    def __init__(self, env_config: EnvironmentConfig):
        self.env_config = env_config
        self.service = AuthService(env_config)
        self.assertions = ResponseAssertions()
        self.output = OutputManager()
        self._token_cache: dict[str, str] = {}

    def login_as_admin(self) -> str:
        creds = EnvironmentManager.get_user_credentials("admin")
        return self._login_and_cache("admin", creds["username"], creds["password"])

    def login_as_doctor(self) -> str:
        creds = EnvironmentManager.get_user_credentials("doctor")
        return self._login_and_cache("doctor", creds["username"], creds["password"])

    def login_as_patient(self) -> str:
        creds = EnvironmentManager.get_user_credentials("patient")
        return self._login_and_cache("patient", creds["username"], creds["password"])

    def login_with_oauth(self) -> str:
        oauth = EnvironmentManager.get_oauth_config()
        result = self.service.oauth_login(
            client_id=oauth["client_id"],
            client_secret=oauth["client_secret"],
            scope=oauth.get("scope")
        )
        self.output.print_response(
            test_name="OAuth Client Credentials Login",
            method="POST",
            url=result["url"],
            status_code=result["status_code"],
            response_time_ms=result["response_time_ms"],
            correlation_id=result["correlation_id"],
            expected_status=200
        )
        self.assertions.assert_status_code(result["status_code"], 200, "OAuth Login")
        return self.assertions.assert_token_present(result["body"])

    def _login_and_cache(self, role: str, username: str, password: str) -> str:
        result = self.service.login(username=username, password=password)
        self.output.print_response(
            test_name=f"Login as {role}",
            method="POST",
            url=result["url"],
            status_code=result["status_code"],
            response_time_ms=result["response_time_ms"],
            correlation_id=result["correlation_id"],
            expected_status=200
        )
        self.assertions.assert_status_code(result["status_code"], 200, f"Login {role}")
        self.assertions.assert_response_time(
            result["response_time_ms"],
            self.env_config.response_time_sla["login"],
            "Login"
        )
        token = self.assertions.assert_token_present(result["body"])
        self._token_cache[role] = token
        return token

    def get_cached_token(self, role: str) -> str:
        if role not in self._token_cache:
            raise RuntimeError(f"No cached token for role '{role}'. Call login first.")
        return self._token_cache[role]

    def refresh_token(self, refresh_token: str) -> str:
        result = self.service.refresh_token(refresh_token)
        self.assertions.assert_status_code(result["status_code"], 200, "Token Refresh")
        return self.assertions.assert_token_present(result["body"])

    # Negative test flows
    def login_invalid_credentials(self) -> dict:
        result = self.service.login_invalid_credentials()
        self.output.print_response(
            test_name="Login with invalid credentials",
            method="POST",
            url=result["url"],
            status_code=result["status_code"],
            response_time_ms=result["response_time_ms"],
            correlation_id=result["correlation_id"],
            expected_status=401
        )
        return result

    def login_empty_credentials(self) -> dict:
        result = self.service.login_empty_credentials()
        self.output.print_response(
            test_name="Login with empty credentials",
            method="POST",
            url=result["url"],
            status_code=result["status_code"],
            response_time_ms=result["response_time_ms"],
            correlation_id=result["correlation_id"],
            expected_status=400
        )
        return result
