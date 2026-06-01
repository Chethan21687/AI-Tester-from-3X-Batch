import pytest
from playwright.sync_api import expect
from layers.6_pages.checkout_page import CheckoutPage, ShippingDetails, PaymentCard
from layers.7_helpers.test_data_helper import TestDataHelper
from layers.7_helpers.assertions_helper import AssertionsHelper
from layers.7_helpers.wait_helper import WaitHelper


VALID_SHIPPING = ShippingDetails(
    first_name="Jane",
    last_name="Doe",
    address="123 Test Street",
    city="Testville",
    postal_code="12345",
)


@pytest.mark.describe("Checkout / Cart")
class TestCart:
    def test_checkout_page_loads(self, checkout_page: CheckoutPage):
        checkout_page.goto()
        AssertionsHelper.expect_page_heading(checkout_page._page, "Checkout")

    def test_order_summary_is_visible(self, checkout_page: CheckoutPage):
        checkout_page.goto()
        expect(checkout_page.order_summary).to_be_visible()

    def test_complete_checkout_flow(self, checkout_page: CheckoutPage):
        checkout_page.goto()
        checkout_page.fill_shipping_details(VALID_SHIPPING)
        card = TestDataHelper.test_credit_card()
        checkout_page.fill_payment_details(PaymentCard(**card))
        status = WaitHelper.for_api_response(
            checkout_page._page,
            "**/api/orders",
            checkout_page.place_order,
        )
        assert status == 201
        checkout_page.expect_order_confirmed()

    def test_shows_error_for_empty_shipping_fields(self, checkout_page: CheckoutPage):
        checkout_page.goto()
        checkout_page.place_order_button.click()
        AssertionsHelper.expect_field_error(
            checkout_page._page, "First name", "First name is required"
        )

    def test_cart_count_updates_in_header(self, authenticated_page):
        from layers.6_pages.base_page import BasePage
        page = authenticated_page
        page.goto("/products")
        initial_count = page.get_by_test_id("cart-count").text_content() or "0"
        page.get_by_role("button", name="Add to cart").first.click()
        cart_count = page.get_by_test_id("cart-count")
        expect(cart_count).not_to_have_text(initial_count)

    @pytest.mark.smoke
    def test_checkout_requires_authentication(self, page):
        page.goto("/checkout")
        expect(page).to_have_url("/login")
