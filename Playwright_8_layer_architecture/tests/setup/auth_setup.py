"""
Run once to store authenticated browser state:
  pytest tests/setup/auth_setup.py

Saves storage state to playwright/.auth/user.json for reuse.
"""
import json
import os
import pytest
from playwright.sync_api import Page, expect
from layers.1_config.environments import get_env

ENV = get_env()
AUTH_FILE = "playwright/.auth/user.json"


@pytest.fixture(scope="session", autouse=True)
def store_auth_state(browser):
    os.makedirs("playwright/.auth", exist_ok=True)
    context = browser.new_context()
    page = context.new_page()
    page.goto(f"{ENV.base_url}/login")
    page.get_by_label("Email").fill(ENV.admin_email)
    page.get_by_label("Password").fill(ENV.admin_password)
    page.get_by_role("button", name="Sign in").click()
    expect(page).to_have_url(f"{ENV.base_url}/dashboard")
    context.storage_state(path=AUTH_FILE)
    context.close()
    print(f"\nAuth state saved to {AUTH_FILE}")
