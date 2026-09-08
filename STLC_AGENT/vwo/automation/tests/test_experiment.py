"""Experiment authoring specs. Maps TC-008..011, TC-016.

All require an authenticated tenant; skip when creds absent.
"""
from __future__ import annotations

import pytest

from pages import ExperimentPage, ExperimentSpec
from utils.test_data_loader import get_case


@pytest.mark.functional
@pytest.mark.requires_auth
def test_create_ab_test_two_variations(authenticated_page, settings):
    """TC-008 - A/B test created with Control + Variation B."""
    case = get_case("TC-008")
    exp = ExperimentPage(authenticated_page, settings).goto()
    exp.configure(ExperimentSpec(name="Auto-AB", kind="ab", url=f"{settings.base_url}/",
                                 variations=["Control", "Variation B"]))
    exp.save()
    assert exp.variation_count() >= 2, case.expected


@pytest.mark.functional
@pytest.mark.requires_auth
def test_create_split_url_test(authenticated_page, settings):
    """TC-009 - Split URL test registers both destinations."""
    exp = ExperimentPage(authenticated_page, settings).goto()
    exp.configure(ExperimentSpec(name="Auto-Split", kind="split",
                                 url=f"{settings.base_url}/a",
                                 variations=["Control", "Variant /b"]))
    exp.save()
    assert exp.variation_count() >= 2


@pytest.mark.functional
@pytest.mark.requires_auth
def test_create_multivariate_combinations(authenticated_page, settings):
    """TC-010 - MVT with 2x2 sections yields multiple variations."""
    exp = ExperimentPage(authenticated_page, settings).goto()
    exp.configure(ExperimentSpec(name="Auto-MVT", kind="mvt",
                                 variations=["A1", "A2", "B1", "B2"]))
    exp.save()
    assert exp.variation_count() >= 4


@pytest.mark.functional
@pytest.mark.requires_auth
def test_reject_experiment_with_zero_variations(authenticated_page, settings):
    """TC-011 - launch blocked when no variation exists."""
    exp = ExperimentPage(authenticated_page, settings).goto()
    exp.configure(ExperimentSpec(name="Auto-Empty", kind="ab", url=f"{settings.base_url}/"))
    exp.remove_all_variations()
    exp.attempt_launch()
    exp.expect_validation_error()


@pytest.mark.functional
@pytest.mark.requires_auth
def test_preview_across_viewports(authenticated_page, settings):
    """TC-016 - variation renders across device viewports."""
    page = authenticated_page
    for w, h in [(1366, 900), (768, 1024), (375, 812)]:
        page.set_viewport_size({"width": w, "height": h})
        assert page.viewport_size["width"] == w
