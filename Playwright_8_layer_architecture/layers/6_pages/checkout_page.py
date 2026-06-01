from dataclasses import dataclass
from playwright.sync_api import Page, Locator, expect
from layers.6_pages.base_page import BasePage


@dataclass
class ShippingDetails:
    first_name: str
    last_name: str
    address: str
    city: str
    postal_code: str


@dataclass
class PaymentCard:
    number: str
    expiry: str
    cvc: str


class CheckoutPage(BasePage):
    def __init__(self, page: Page):
        super().__init__(page)
        self.order_summary: Locator = page.get_by_test_id("order-summary")
        self.first_name_input: Locator = page.get_by_label("First name")
        self.last_name_input: Locator = page.get_by_label("Last name")
        self.address_input: Locator = page.get_by_label("Street address")
        self.city_input: Locator = page.get_by_label("City")
        self.postal_code_input: Locator = page.get_by_label("Postal code")
        payment_frame = page.frame_locator("#payment-iframe")
        self.card_number_input: Locator = payment_frame.get_by_label("Card number")
        self.card_expiry_input: Locator = payment_frame.get_by_label("Expiry date")
        self.card_cvc_input: Locator = payment_frame.get_by_label("CVC")
        self.place_order_button: Locator = page.get_by_role("button", name="Place order")
        self.order_confirmation: Locator = page.get_by_test_id("order-confirmation")

    def goto(self) -> None:
        self.navigate("/checkout")
        self.wait_for_load()

    def fill_shipping_details(self, details: ShippingDetails) -> None:
        self.first_name_input.fill(details.first_name)
        self.last_name_input.fill(details.last_name)
        self.address_input.fill(details.address)
        self.city_input.fill(details.city)
        self.postal_code_input.fill(details.postal_code)

    def fill_payment_details(self, card: PaymentCard) -> None:
        self.card_number_input.fill(card.number)
        self.card_expiry_input.fill(card.expiry)
        self.card_cvc_input.fill(card.cvc)

    def get_order_total(self) -> str:
        return self.order_summary.get_by_test_id("order-total").text_content() or ""

    def place_order(self) -> None:
        self.place_order_button.click()

    def expect_order_confirmed(self, order_id: str | None = None) -> None:
        expect(self.order_confirmation).to_be_visible()
        if order_id:
            expect(self.order_confirmation).to_contain_text(order_id)
