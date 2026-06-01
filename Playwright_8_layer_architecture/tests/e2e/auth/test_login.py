import pytest
from playwright.sync_api import expect
from layers.6_pages.login_page import LoginPage
from layers.2_test_data.models.user_model import UserCredentials
from layers.7_helpers.assertions_helper import AssertionsHelper


@pytest.mark.describe("Login functionality")
class TestLogin:
    def test_login_with_valid_credentials(self, login_page: LoginPage, regular_user):
        login_page.login(UserCredentials(email=regular_user.email, password=regular_user.password))
        login_page.expect_successful_login()

    def test_shows_error_for_invalid_credentials(self, login_page: LoginPage):
        login_page.login(UserCredentials(email="wrong@test.com", password="wrongpass"))
        login_page.expect_error("Invalid email or password")

    def test_shows_error_for_empty_email(self, login_page: LoginPage):
        login_page.login(UserCredentials(email="", password="SomePass123!"))
        login_page.expect_form_error("email", "Email is required")

    def test_shows_error_for_empty_password(self, login_page: LoginPage):
        login_page.login(UserCredentials(email="user@test.com", password=""))
        login_page.expect_form_error("password", "Password is required")

    def test_forgot_password_link_navigates(self, login_page: LoginPage):
        login_page.forgot_password_link.click()
        expect(login_page._page).to_have_url("/forgot-password")

    def test_signup_link_navigates(self, login_page: LoginPage):
        login_page.signup_link.click()
        expect(login_page._page).to_have_url("/signup")

    @pytest.mark.parametrize("email", [
        "notanemail",
        "missing@domain",
        "@nodomain.com",
    ])
    def test_shows_error_for_invalid_email_format(self, login_page: LoginPage, email: str):
        login_page.login(UserCredentials(email=email, password="SomePass123!"))
        login_page.expect_form_error("email", "Enter a valid email address")
