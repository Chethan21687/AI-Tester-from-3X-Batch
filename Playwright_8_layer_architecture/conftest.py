import pytest
from playwright.sync_api import Page, APIRequestContext
from layers.1_config.environments import get_env
from layers.2_test_data.factories.user_factory import UserFactory
from layers.2_test_data.models.user_model import User, UserCredentials
from layers.3_api.clients.auth_api import AuthAPI
from layers.6_pages.login_page import LoginPage
from layers.6_pages.dashboard_page import DashboardPage
from layers.6_pages.checkout_page import CheckoutPage

ENV = get_env()


# ── Layer 4: Fixtures ────────────────────────────────────────────────────────

@pytest.fixture(scope="session")
def env():
    return ENV


@pytest.fixture
def admin_user(request: pytest.FixtureRequest) -> User:
    api: APIRequestContext = request.getfixturevalue("playwright").request.new_context(
        base_url=ENV.api_url
    )
    auth = AuthAPI(api, ENV.api_url)
    user = UserFactory.create_admin(email=f"admin-test-{id(request)}@test.com")
    created = auth.create_user(user)
    user.id = created.get("id")
    yield user
    if user.id:
        resp = auth.login(UserCredentials(email=ENV.admin_email, password=ENV.admin_password))
        auth.delete_user(user.id, resp.token)
    api.dispose()


@pytest.fixture
def regular_user(request: pytest.FixtureRequest) -> User:
    api: APIRequestContext = request.getfixturevalue("playwright").request.new_context(
        base_url=ENV.api_url
    )
    auth = AuthAPI(api, ENV.api_url)
    user = UserFactory.create(email=f"user-test-{id(request)}@test.com")
    created = auth.create_user(user)
    user.id = created.get("id")
    yield user
    if user.id:
        resp = auth.login(UserCredentials(email=ENV.admin_email, password=ENV.admin_password))
        auth.delete_user(user.id, resp.token)
    api.dispose()


@pytest.fixture
def authenticated_page(browser, regular_user: User, playwright) -> Page:
    api = playwright.request.new_context(base_url=ENV.api_url)
    auth = AuthAPI(api, ENV.api_url)
    resp = auth.login(UserCredentials(email=regular_user.email, password=regular_user.password))
    context = browser.new_context(
        storage_state={
            "cookies": [],
            "origins": [{
                "origin": ENV.base_url,
                "localStorage": [{"name": "auth_token", "value": resp.token}],
            }],
        }
    )
    page = context.new_page()
    yield page
    context.close()
    api.dispose()


@pytest.fixture
def admin_page(browser, admin_user: User, playwright) -> Page:
    api = playwright.request.new_context(base_url=ENV.api_url)
    auth = AuthAPI(api, ENV.api_url)
    resp = auth.login(UserCredentials(email=admin_user.email, password=admin_user.password))
    context = browser.new_context(
        storage_state={
            "cookies": [],
            "origins": [{
                "origin": ENV.base_url,
                "localStorage": [{"name": "auth_token", "value": resp.token}],
            }],
        }
    )
    page = context.new_page()
    yield page
    context.close()
    api.dispose()


# ── Page Object Fixtures ─────────────────────────────────────────────────────

@pytest.fixture
def login_page(page: Page) -> LoginPage:
    lp = LoginPage(page)
    lp.goto()
    return lp


@pytest.fixture
def dashboard_page(authenticated_page: Page) -> DashboardPage:
    dp = DashboardPage(authenticated_page)
    dp.goto()
    return dp


@pytest.fixture
def checkout_page(authenticated_page: Page) -> CheckoutPage:
    return CheckoutPage(authenticated_page)
