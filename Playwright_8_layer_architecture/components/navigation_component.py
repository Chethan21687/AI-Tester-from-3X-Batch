"""Layer 5 — Component: VWO left-side navigation."""
from playwright.sync_api import Page, expect

from components.base_component import BaseComponent


class NavigationComponent(BaseComponent):
    def __init__(self, page: Page):
        super().__init__(page)
        self.nav = page.locator("[data-testid='main-nav'], .main-navigation, nav[role='navigation']")
        self.testing_link = page.get_by_role("link", name="Testing")
        self.insights_link = page.get_by_role("link", name="Insights")
        self.personalize_link = page.get_by_role("link", name="Personalize")
        self.reports_link = page.get_by_role("link", name="Reports")
        self.plan_link = page.get_by_role("link", name="Plan")
        self.settings_link = page.get_by_role("link", name="Settings")

    def go_to_testing(self):
        self.testing_link.click()
        self._page.wait_for_url("**/testing**", timeout=10_000)

    def go_to_insights(self):
        self.insights_link.click()
        self._page.wait_for_url("**/insights**", timeout=10_000)

    def go_to_personalize(self):
        self.personalize_link.click()
        self._page.wait_for_url("**/personalize**", timeout=10_000)

    def go_to_reports(self):
        self.reports_link.click()
        self._page.wait_for_url("**/reports**", timeout=10_000)

    def go_to_plan(self):
        self.plan_link.click()
        self._page.wait_for_url("**/plan**", timeout=10_000)

    def go_to_settings(self):
        self.settings_link.click()
        self._page.wait_for_url("**/settings**", timeout=10_000)

    def expect_navigation_visible(self):
        expect(self.nav).to_be_visible()
