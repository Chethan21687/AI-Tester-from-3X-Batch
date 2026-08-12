"""Layer 6 — Pages: VWO login page."""
from playwright.sync_api import Page, expect

from pages.base_page import BasePage


class LoginPage(BasePage):
    def __init__(self, page: Page):
        super().__init__(page)
        self.email_input = page.get_by_label("Email", exact=False)
        self.password_input = page.get_by_label("Password", exact=False)
        self.sign_in_button = page.get_by_role("button", name="Sign In")
        self.error_message = page.locator(
            "[data-testid='login-error'], .login-error, .alert-error, .error-message"
        )
        self.forgot_password_link = page.get_by_role("link", name="Forgot password")
        self.two_fa_input = page.get_by_placeholder("Enter verification code")

    def goto(self):
        self._page.goto("/login")
        self.wait_for_load()

    def login(self, email: str, password: str):
        self.email_input.fill(email)
        self.password_input.fill(password)
        self.sign_in_button.click()

    def login_and_wait_dashboard(self, email: str, password: str, timeout: int = 15_000):
        self.login(email, password)
        self._page.wait_for_url("**/dashboard**", timeout=timeout)

    def enter_2fa_code(self, code: str):
        self.two_fa_input.fill(code)
        self._page.get_by_role("button", name="Verify").click()

    def expect_error_visible(self):
        expect(self.error_message).to_be_visible()

    def expect_error_contains(self, text: str):
        expect(self.error_message).to_contain_text(text)

    def expect_on_login_page(self):
        expect(self.sign_in_button).to_be_visible()
        expect(self._page).to_have_url(pattern=".*login.*")

    def expect_email_validation_error(self):
        error = self._page.locator("input[type='email']:invalid, [data-testid='email-error']")
        expect(error).to_be_visible()

    def click_forgot_password(self):
        self.forgot_password_link.click()
