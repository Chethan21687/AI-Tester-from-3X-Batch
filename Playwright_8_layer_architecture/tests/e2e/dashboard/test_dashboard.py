import pytest
from playwright.sync_api import expect
from layers.6_pages.dashboard_page import DashboardPage
from layers.7_helpers.assertions_helper import AssertionsHelper


@pytest.mark.describe("Dashboard")
class TestDashboard:
    def test_shows_welcome_message(self, dashboard_page: DashboardPage, regular_user):
        dashboard_page.expect_welcome_message(regular_user.first_name)

    def test_displays_all_stats_cards(self, dashboard_page: DashboardPage):
        dashboard_page.expect_stats_visible()

    def test_recent_orders_table_is_visible(self, dashboard_page: DashboardPage):
        expect(dashboard_page.recent_orders_table).to_be_visible()

    def test_quick_actions_panel_is_visible(self, dashboard_page: DashboardPage):
        expect(dashboard_page.quick_actions_panel).to_be_visible()

    def test_navigation_links_are_accessible(self, dashboard_page: DashboardPage):
        expect(dashboard_page.navigation.dashboard_link).to_be_visible()
        expect(dashboard_page.navigation.products_link).to_be_visible()
        expect(dashboard_page.navigation.orders_link).to_be_visible()

    def test_dashboard_nav_link_is_active(self, dashboard_page: DashboardPage):
        assert dashboard_page.navigation.is_active("dashboard")

    def test_logout_redirects_to_login(self, dashboard_page: DashboardPage):
        dashboard_page.header.logout()
        expect(dashboard_page._page).to_have_url("/login")

    @pytest.mark.smoke
    def test_page_title(self, dashboard_page: DashboardPage):
        AssertionsHelper.expect_page_heading(dashboard_page._page, "Dashboard")
