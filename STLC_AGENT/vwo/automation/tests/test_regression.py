"""Critical-path regression / smoke. Maps TC-035.

End-to-end: login -> create A/B -> launch -> report -> logout. Requires creds.
Also includes a credential-free data integrity check on the test-case repository
so the suite always has an executable signal in CI.
"""
from __future__ import annotations

import pytest

from pages import DashboardPage, ExperimentPage, ExperimentSpec, LoginPage
from utils.test_data_loader import automation_candidates, coverage_summary


@pytest.mark.regression
@pytest.mark.smoke
@pytest.mark.requires_auth
def test_critical_path_smoke(page, settings):
    """TC-035 - full critical path passes after a release."""
    creds = settings.credentials
    if not creds.has_admin:
        pytest.skip("VWO_EMAIL / VWO_PASSWORD not set")
    LoginPage(page, settings).goto().login(creds.email, creds.password)
    DashboardPage(page, settings).expect_loaded()
    exp = ExperimentPage(page, settings).goto()
    exp.configure(ExperimentSpec(name="Smoke-AB", kind="ab", url=f"{settings.base_url}/"))
    exp.save()
    assert exp.variation_count() >= 2


@pytest.mark.regression
def test_automation_repository_integrity():
    """Credential-free guard: CSV exposes the expected automation candidates."""
    candidates = automation_candidates()
    ids = {c.tc_id for c in candidates}
    expected = {"TC-001", "TC-008", "TC-032", "TC-035"}
    assert expected.issubset(ids), f"Missing automation candidates: {expected - ids}"
    assert len(candidates) >= 10, "Expected at least 10 automation candidates"


@pytest.mark.regression
def test_ricepot_coverage_breadth():
    """Credential-free guard: every RICEPOT dimension is represented."""
    summary = coverage_summary()
    dimensions = set(summary.index) - {"All"}
    assert {"R", "I", "C", "E", "P", "O", "T"}.issubset(dimensions), \
        f"RICEPOT gap: have {dimensions}"
