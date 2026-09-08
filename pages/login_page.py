"""
Layer 6 — Pages: Login page.
"""

from playwright.sync_api import Page, expect

class LoginPage:
    def __init__(self, page: Page):
        self._page = page
        # user-facing locators for this page
        
    def goto(self):
        self._page.goto("/login")
        self.wait_for_load()

    def enter_username(self, username):
        username_input = self.get_by_label("Username")
        username_input.fill(username)

    def enter_password(self, password):
        password_input = self.get_by_label("Password")
        password_input.fill(password)
        
    def click_login_button(self):
        login_button = self.get_by_role('button', name='Login')
        login_button.click()
        
    def wait_for_load(self):
        self._page.wait_for_url(
            new_url_pattern='/dashboard',
            timeout=10_000
        )