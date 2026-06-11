"""Dashboard page object. Landing surface after successful auth."""
from __future__ import annotations

from playwright.sync_api import Page, Locator, expect

from config import Settings
from .base_page import BasePage


class DashboardPage(BasePage):
    def __init__(self, page: Page, settings: Settings) -> None:
        super().__init__(page, settings)
        self.user_menu: Locator = page.get_by_role("button", name="Account").or_(
            page.locator("[data-qa='user-menu'], .user-avatar")
        ).first
        self.create_button: Locator = page.get_by_role("button", name="Create").or_(
            page.get_by_role("link", name="Create")
        ).first
        self.main_nav: Locator = page.get_by_role("navigation").first

    def goto(self) -> "DashboardPage":
        self.page.goto(f"{self.settings.base_url}/dashboard", wait_until="domcontentloaded")
        return self

    def expect_loaded(self) -> None:
        expect(self.main_nav).to_be_visible()

    def is_authenticated(self) -> bool:
        return "login" not in self.page.url.lower()

    def first_focusable_reachable_by_keyboard(self) -> bool:
        """Tab once; confirm focus lands on an interactive element (keyboard a11y)."""
        self.page.keyboard.press("Tab")
        tag = self.page.evaluate("() => document.activeElement && document.activeElement.tagName")
        return tag in {"A", "BUTTON", "INPUT", "SELECT", "TEXTAREA"}
