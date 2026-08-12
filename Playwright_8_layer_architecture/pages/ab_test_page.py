"""Layer 6 — Pages: VWO A/B Test creation and management page."""
from playwright.sync_api import Page, expect

from pages.base_page import BasePage


class ABTestPage(BasePage):
    def __init__(self, page: Page):
        super().__init__(page)
        # List view
        self.create_button = page.get_by_role("button", name="Create")
        self.ab_test_option = page.get_by_role("menuitem", name="A/B Test")
        self.split_url_option = page.get_by_role("menuitem", name="Split URL Test")
        self.mvt_option = page.get_by_role("menuitem", name="Multivariate Test")

        # Creation wizard
        self.test_url_input = page.get_by_placeholder("Enter URL to test")
        self.test_name_input = page.get_by_label("Test Name")
        self.next_button = page.get_by_role("button", name="Next")
        self.finish_button = page.get_by_role("button", name="Finish")
        self.save_button = page.get_by_role("button", name="Save")

        # Variation panel
        self.add_variation_button = page.get_by_role("button", name="Add Variation")
        self.variation_list = page.locator("[data-testid='variation-list'], .variations-panel")

        # Goals tab
        self.goals_tab = page.get_by_role("tab", name="Goals")
        self.add_goal_button = page.get_by_role("button", name="Add Goal")
        self.goal_name_input = page.get_by_label("Goal Name")
        self.goal_type_select = page.get_by_label("Goal Type")

        # Audience tab
        self.audience_tab = page.get_by_role("tab", name="Audience")
        self.add_condition_button = page.get_by_role("button", name="Add Condition")

        # Launch controls
        self.start_button = page.get_by_role("button", name="Start Test")
        self.pause_button = page.get_by_role("button", name="Pause")
        self.stop_button = page.get_by_role("button", name="Stop")
        self.confirm_button = page.get_by_role("button", name="Confirm")

        # Status badge
        self.status_badge = page.locator(
            "[data-testid='test-status'], .test-status-badge, .status-indicator"
        )

        # Results / SmartStats
        self.results_tab = page.get_by_role("tab", name="Results")
        self.smartstats_panel = page.locator(
            "[data-testid='smartstats'], .smartstats-panel, .stats-container"
        )
        self.probability_values = page.locator(
            "[data-testid='probability'], .probability-value, .bayesian-probability"
        )

    def goto(self):
        self._page.goto("/testing")
        self.wait_for_load()

    def create_ab_test(self, url: str, name: str):
        self.create_button.click()
        self.ab_test_option.click()
        self.test_url_input.fill(url)
        self.test_name_input.fill(name)
        self.next_button.click()
        self._page.wait_for_load_state("domcontentloaded")

    def create_split_url_test(self, control_url: str, variation_url: str, name: str):
        self.create_button.click()
        self.split_url_option.click()
        self._page.get_by_label("Control URL").fill(control_url)
        self._page.get_by_label("Variation URL").fill(variation_url)
        self.test_name_input.fill(name)
        self.next_button.click()

    def add_variation(self, variation_name: str | None = None) -> int:
        self.add_variation_button.click()
        count = self.variation_list.locator(".variation-item, [data-testid='variation-item']").count()
        return count

    def set_goal(self, name: str, goal_type: str = "Click", selector: str = ".cta-button"):
        self.goals_tab.click()
        self.add_goal_button.click()
        self.goal_name_input.fill(name)
        self.goal_type_select.select_option(goal_type)
        self._page.get_by_label("CSS Selector").fill(selector)
        self.save_button.click()

    def set_audience_condition(self, condition: str, operator: str, value: str):
        self.audience_tab.click()
        self.add_condition_button.click()
        self._page.get_by_label("Condition").select_option(condition)
        self._page.get_by_label("Operator").select_option(operator)
        self._page.get_by_label("Value").fill(value)
        self.save_button.click()

    def start_test(self):
        self.start_button.click()
        if self.confirm_button.is_visible(timeout=3_000):
            self.confirm_button.click()
        self._page.wait_for_load_state("domcontentloaded")

    def pause_test(self):
        self.pause_button.click()
        if self.confirm_button.is_visible(timeout=3_000):
            self.confirm_button.click()

    def stop_test(self):
        self.stop_button.click()
        if self.confirm_button.is_visible(timeout=3_000):
            self.confirm_button.click()

    def get_status(self) -> str:
        return self.status_badge.inner_text().strip().lower()

    def open_results(self):
        self.results_tab.click()
        self._page.wait_for_load_state("domcontentloaded")

    def get_probability_values(self) -> list[str]:
        return self.probability_values.all_inner_texts()

    def expect_test_created(self):
        expect(self.status_badge).to_be_visible(timeout=10_000)

    def expect_status(self, status: str):
        expect(self.status_badge).to_contain_text(status, ignore_case=True)

    def expect_smartstats_visible(self):
        self.open_results()
        expect(self.smartstats_panel).to_be_visible(timeout=10_000)

    def expect_variations_count(self, count: int):
        expect(
            self.variation_list.locator(".variation-item, [data-testid='variation-item']")
        ).to_have_count(count)
