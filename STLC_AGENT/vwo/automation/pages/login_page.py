"""Login page object. Role/label-based locators per test-plan anti-brittleness guidance."""
from __future__ import annotations

from playwright.sync_api import Page, Locator, expect

from config import Settings
from .base_page import BasePage


class LoginPage(BasePage):
    def __init__(self, page: Page, settings: Settings) -> None:
        super().__init__(page, settings)
        # Resilient locators: prefer accessible roles, fall back to common attrs.
        self.email_input: Locator = page.get_by_label("Email", exact=False).or_(
            page.locator("input[type='email'], input[name='username'], #login-username")
        ).first
        self.password_input: Locator = page.get_by_label("Password", exact=False).or_(
            page.locator("input[type='password'], #login-password")
        ).first
        self.sign_in_button: Locator = page.get_by_role("button", name="Sign In").or_(
            page.locator("button[type='submit']")
        ).first
        self.error_message: Locator = page.locator(
            "[role='alert'], .error, .notification--error, [data-qa='login-error']"
        ).first

    def goto(self) -> "LoginPage":
        self.page.goto(self.settings.login_url, wait_until="domcontentloaded")
        return self

    # ---- actions --------------------------------------------------------
    def login(self, email: str, password: str) -> None:
        self.email_input.fill(email)
        self.password_input.fill(password)
        self.sign_in_button.click()

    def submit_empty(self) -> None:
        self.sign_in_button.click()

    # ---- assertions -----------------------------------------------------
    def expect_login_form_visible(self) -> None:
        expect(self.email_input).to_be_visible()
        expect(self.password_input).to_be_visible()
        expect(self.sign_in_button).to_be_visible()

    def expect_error_visible(self) -> None:
        expect(self.error_message).to_be_visible()

    def is_email_invalid(self) -> bool:
        """HTML5 validity check for malformed email (no backend round-trip)."""
        return self.email_input.evaluate("el => !el.validity.valid")
