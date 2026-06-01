from playwright.sync_api import Page, Locator, expect
from layers.6_pages.base_page import BasePage


class DashboardPage(BasePage):
    def __init__(self, page: Page):
        super().__init__(page)
        self.welcome_heading: Locator = page.get_by_role("heading", name="Welcome")
        self.stats_cards: Locator = page.get_by_test_id("stats-card")
        self.recent_orders_table: Locator = page.get_by_role("table", name="Recent orders")
        self.quick_actions_panel: Locator = page.get_by_test_id("quick-actions")
        self.notification_bell: Locator = page.get_by_role("button", name="Notifications")

    def goto(self) -> None:
        self.navigate("/dashboard")
        self.wait_for_load()

    def get_stat_value(self, stat_name: str) -> str:
        card = self.stats_cards.filter(has_text=stat_name)
        return card.get_by_test_id("stat-value").text_content() or ""

    def get_recent_order_count(self) -> int:
        rows = self.recent_orders_table.get_by_role("row")
        return rows.count() - 1  # subtract header row

    def click_quick_action(self, action_name: str) -> None:
        self.quick_actions_panel.get_by_role("button", name=action_name).click()

    def expect_welcome_message(self, user_name: str) -> None:
        expect(self.welcome_heading).to_contain_text(user_name)

    def expect_stats_visible(self) -> None:
        expect(self.stats_cards).to_have_count(4)
        expect(self.stats_cards.first).to_be_visible()
