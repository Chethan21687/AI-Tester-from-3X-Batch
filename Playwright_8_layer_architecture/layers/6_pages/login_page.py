from playwright.sync_api import Page, Locator, expect
from layers.6_pages.base_page import BasePage
from layers.2_test_data.models.user_model import UserCredentials


class LoginPage(BasePage):
    def __init__(self, page: Page):
        super().__init__(page)
        self.email_input: Locator = page.get_by_label("Email")
        self.password_input: Locator = page.get_by_label("Password")
        self.submit_button: Locator = page.get_by_role("button", name="Sign in")
        self.error_alert: Locator = page.get_by_role("alert")
        self.forgot_password_link: Locator = page.get_by_role("link", name="Forgot password?")
        self.signup_link: Locator = page.get_by_role("link", name="Sign up")

    def goto(self) -> None:
        self.navigate("/login")

    def login(self, credentials: UserCredentials) -> None:
        self.email_input.fill(credentials.email)
        self.password_input.fill(credentials.password)
        self.submit_button.click()

    def expect_successful_login(self) -> None:
        expect(self._page).to_have_url("/dashboard")

    def expect_error(self, message: str) -> None:
        expect(self.error_alert).to_be_visible()
        expect(self.error_alert).to_contain_text(message)

    def expect_form_error(self, field: str, message: str) -> None:
        field_locator = self.email_input if field == "email" else self.password_input
        error_id = field_locator.get_attribute("aria-describedby")
        expect(self._page.locator(f"#{error_id}")).to_have_text(message)
