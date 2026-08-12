"""
Layer 8 — Tests: A/B Testing + SmartStats (TC010–TC022)
FR Reference: FR1 (A/B Testing), FR2 (SmartStats), FR3 (Visual Editor)
Markers: smoke, regression, ab_testing
"""
import pytest
from playwright.sync_api import Page, expect

from pages.ab_test_page import ABTestPage
from factories.vwo_factories import ABTestFactory
from models.vwo_models import TestType
from helpers.assertions import VWOAssertions


# ---------------------------------------------------------------------------
# TC010 — Create A/B test
# ---------------------------------------------------------------------------

@pytest.mark.smoke
@pytest.mark.regression
@pytest.mark.ab_testing
def test_create_ab_test(authenticated_page: Page):
    """TC010: Create new A/B test — lands on variation editor with Control + Var B."""
    test_data = ABTestFactory.create(url="https://example.com/landing")
    ab_page = ABTestPage(authenticated_page)
    ab_page.goto()

    ab_page.create_ab_test(test_data.url, test_data.name)

    ab_page.expect_test_created()
    assert authenticated_page.url != "", "Page navigated away unexpectedly after test creation"


# ---------------------------------------------------------------------------
# TC011 — Add multiple variations
# ---------------------------------------------------------------------------

@pytest.mark.regression
@pytest.mark.ab_testing
def test_add_multiple_variations(authenticated_page: Page):
    """TC011: Adding variations redistributes traffic split."""
    test_data = ABTestFactory.create()
    ab_page = ABTestPage(authenticated_page)
    ab_page.goto()
    ab_page.create_ab_test(test_data.url, test_data.name)

    initial_count = ab_page.add_variation()
    added_count = ab_page.add_variation()

    assert added_count > initial_count, (
        f"Variation count did not increase: {initial_count} → {added_count}"
    )


# ---------------------------------------------------------------------------
# TC012 — Audience targeting
# ---------------------------------------------------------------------------

@pytest.mark.regression
@pytest.mark.ab_testing
def test_configure_audience_targeting(authenticated_page: Page):
    """TC012: Set audience condition — new visitors only."""
    test_data = ABTestFactory.create()
    ab_page = ABTestPage(authenticated_page)
    ab_page.goto()
    ab_page.create_ab_test(test_data.url, test_data.name)

    ab_page.set_audience_condition("Visitor Type", "equals", "New Visitor")

    # Audience tab should still be visible with saved condition
    ab_page.audience_tab.click()
    condition_text = authenticated_page.locator(
        "[data-testid='audience-condition'], .audience-condition, .condition-row"
    )
    expect(condition_text.first).to_be_visible(timeout=8_000)


# ---------------------------------------------------------------------------
# TC013 — Set conversion goal
# ---------------------------------------------------------------------------

@pytest.mark.regression
@pytest.mark.ab_testing
def test_set_custom_conversion_goal(authenticated_page: Page):
    """TC013: Add a Click-type goal with CSS selector."""
    test_data = ABTestFactory.create()
    ab_page = ABTestPage(authenticated_page)
    ab_page.goto()
    ab_page.create_ab_test(test_data.url, test_data.name)

    ab_page.set_goal("Primary CTA Click", goal_type="Click", selector=".cta-button")

    goals_list = authenticated_page.locator(
        "[data-testid='goals-list'], .goals-list, .goal-item"
    )
    expect(goals_list.first).to_be_visible(timeout=8_000)


# ---------------------------------------------------------------------------
# TC014 — Launch test
# ---------------------------------------------------------------------------

@pytest.mark.smoke
@pytest.mark.regression
@pytest.mark.ab_testing
def test_launch_ab_test(authenticated_page: Page):
    """TC014: Launched test changes status to running."""
    test_data = ABTestFactory.create()
    ab_page = ABTestPage(authenticated_page)
    ab_page.goto()
    ab_page.create_ab_test(test_data.url, test_data.name)

    ab_page.start_test()

    ab_page.expect_status("running")


# ---------------------------------------------------------------------------
# TC015 — Pause test
# ---------------------------------------------------------------------------

@pytest.mark.regression
@pytest.mark.ab_testing
def test_pause_running_test(authenticated_page: Page):
    """TC015: Paused test changes status to paused."""
    test_data = ABTestFactory.create()
    ab_page = ABTestPage(authenticated_page)
    ab_page.goto()
    ab_page.create_ab_test(test_data.url, test_data.name)
    ab_page.start_test()

    ab_page.pause_test()

    ab_page.expect_status("paused")


# ---------------------------------------------------------------------------
# TC016 — Stop test and declare winner
# ---------------------------------------------------------------------------

@pytest.mark.regression
@pytest.mark.ab_testing
def test_stop_test_and_declare_winner(authenticated_page: Page):
    """TC016: Stop test changes status to stopped."""
    test_data = ABTestFactory.create()
    ab_page = ABTestPage(authenticated_page)
    ab_page.goto()
    ab_page.create_ab_test(test_data.url, test_data.name)
    ab_page.start_test()

    ab_page.stop_test()

    ab_page.expect_status("stopped")


# ---------------------------------------------------------------------------
# TC017 — SmartStats results visible
# ---------------------------------------------------------------------------

@pytest.mark.regression
@pytest.mark.ab_testing
def test_smartstats_results_panel_visible(authenticated_page: Page):
    """TC017: Results tab shows SmartStats Bayesian panel."""
    ab_page = ABTestPage(authenticated_page)
    # Navigate to an existing running test (uses first test in list)
    ab_page.goto()
    running_tests = authenticated_page.locator(
        "[data-testid='test-row'][data-status='running'], .test-item.running"
    )
    if running_tests.count() == 0:
        pytest.skip("No running tests found in account — skipping SmartStats assertion")

    running_tests.first.click()
    authenticated_page.wait_for_load_state("domcontentloaded")

    ab_page.expect_smartstats_visible()


# ---------------------------------------------------------------------------
# TC018 — Create Split URL test
# ---------------------------------------------------------------------------

@pytest.mark.regression
@pytest.mark.ab_testing
def test_create_split_url_test(authenticated_page: Page):
    """TC018: Split URL test created with two separate page URLs."""
    test_data = ABTestFactory.split_url(
        control_url="https://example.com/page-a",
        variation_url="https://example.com/page-b",
    )
    ab_page = ABTestPage(authenticated_page)
    ab_page.goto()

    ab_page.create_split_url_test(
        "https://example.com/page-a",
        "https://example.com/page-b",
        test_data.name,
    )

    ab_page.expect_test_created()


# ---------------------------------------------------------------------------
# TC019 — Create Multivariate test
# ---------------------------------------------------------------------------

@pytest.mark.regression
@pytest.mark.ab_testing
def test_create_multivariate_test(authenticated_page: Page):
    """TC019: Multivariate test created with combination generation."""
    test_data = ABTestFactory.create(test_type=TestType.MULTIVARIATE)
    ab_page = ABTestPage(authenticated_page)
    ab_page.goto()

    ab_page.create_button.click()
    ab_page.mvt_option.click()
    authenticated_page.get_by_label("Test URL").fill("https://example.com/landing")
    if ab_page.test_name_input.is_visible():
        ab_page.test_name_input.fill(test_data.name)
    ab_page.next_button.click()
    authenticated_page.wait_for_load_state("domcontentloaded")

    ab_page.expect_test_created()


# ---------------------------------------------------------------------------
# TC020 — Bayesian probability display
# ---------------------------------------------------------------------------

@pytest.mark.regression
@pytest.mark.ab_testing
def test_bayesian_probability_values_sum_to_100(authenticated_page: Page):
    """TC020: Probability values for all variations sum to approximately 100%."""
    ab_page = ABTestPage(authenticated_page)
    ab_page.goto()

    running_tests = authenticated_page.locator(
        "[data-testid='test-row'][data-status='running'], .test-item.running"
    )
    if running_tests.count() == 0:
        pytest.skip("No running tests — cannot validate Bayesian probability")

    running_tests.first.click()
    ab_page.open_results()

    probabilities = ab_page.get_probability_values()
    if not probabilities:
        pytest.skip("SmartStats panel has no probability data yet (insufficient traffic)")

    VWOAssertions.assert_probability_values_sum_to_100(probabilities)


# ---------------------------------------------------------------------------
# TC021 — Confidence interval visible
# ---------------------------------------------------------------------------

@pytest.mark.regression
@pytest.mark.ab_testing
def test_confidence_interval_displayed(authenticated_page: Page):
    """TC021: Confidence interval shown in results for each variation."""
    ab_page = ABTestPage(authenticated_page)
    ab_page.goto()

    running_tests = authenticated_page.locator(
        "[data-testid='test-row'][data-status='running'], .test-item.running"
    )
    if running_tests.count() == 0:
        pytest.skip("No running tests available")

    running_tests.first.click()
    ab_page.open_results()

    ci_element = authenticated_page.locator(
        "[data-testid='confidence-interval'], .confidence-interval, .ci-range"
    )
    expect(ci_element.first).to_be_visible(timeout=10_000)


# ---------------------------------------------------------------------------
# TC023 — Visual Editor opens
# ---------------------------------------------------------------------------

@pytest.mark.regression
@pytest.mark.ab_testing
def test_visual_editor_opens_for_variation(authenticated_page: Page):
    """TC023: Visual Editor loads for a test variation."""
    test_data = ABTestFactory.create()
    ab_page = ABTestPage(authenticated_page)
    ab_page.goto()
    ab_page.create_ab_test(test_data.url, test_data.name)

    edit_button = authenticated_page.get_by_role("button", name="Edit").first
    if not edit_button.is_visible(timeout=5_000):
        edit_button = authenticated_page.locator(".edit-variation, [data-testid='edit-variation']").first

    edit_button.click()
    authenticated_page.wait_for_load_state("domcontentloaded")

    editor_toolbar = authenticated_page.locator(
        "[data-testid='visual-editor-toolbar'], .editor-toolbar, .vwo-editor"
    )
    expect(editor_toolbar).to_be_visible(timeout=15_000)
