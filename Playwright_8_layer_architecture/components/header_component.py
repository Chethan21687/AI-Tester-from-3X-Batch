"""Layer 5 — Component: VWO top navigation header."""
from playwright.sync_api import Page, expect

from components.base_component import BaseComponent


class HeaderComponent(BaseComponent):
    def __init__(self, page: Page):
        super().__init__(page)
        self.user_menu = page.locator("[data-testid='user-menu'], .user-menu, .header-user")
        self.account_name = page.locator("[data-testid='account-name'], .account-name")
        self.notifications = page.locator("[data-testid='notifications'], .notifications-icon")

    def is_logged_in(self) -> bool:
        return self.user_menu.is_visible()

    def open_user_menu(self):
        self.user_menu.click()

    def click_logout(self):
        self.open_user_menu()
        self._page.get_by_role("menuitem", name="Logout").click()

    def get_user_display_name(self) -> str:
        return self.account_name.inner_text()

    def expect_logged_in(self):
        expect(self.user_menu).to_be_visible()
