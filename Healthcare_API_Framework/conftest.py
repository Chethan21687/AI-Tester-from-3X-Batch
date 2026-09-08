"""
Root conftest.py — pytest session fixtures.
Manages authentication tokens and shared environment config for all tests.
"""
import sys
import os
import pytest
from pathlib import Path

# Ensure all layers are importable from any test file
sys.path.insert(0, str(Path(__file__).parent))

from configuration.environments import EnvironmentManager, EnvironmentConfig
from business.auth_business import AuthBusiness


@pytest.fixture(scope="session")
def env_config() -> EnvironmentConfig:
    return EnvironmentManager.get_config()


@pytest.fixture(scope="session")
def auth_business(env_config) -> AuthBusiness:
    return AuthBusiness(env_config)


@pytest.fixture(scope="session")
def admin_token(auth_business) -> str:
    return auth_business.login_as_admin()


@pytest.fixture(scope="session")
def doctor_token(auth_business) -> str:
    return auth_business.login_as_doctor()


@pytest.fixture(scope="session")
def patient_token(auth_business) -> str:
    return auth_business.login_as_patient()
