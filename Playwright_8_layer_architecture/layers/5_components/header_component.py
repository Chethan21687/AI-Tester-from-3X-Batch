from playwright.sync_api import Page, Locator
from layers.5_components.base_component import BaseComponent


class HeaderComponent(BaseComponent):
    def __init__(self, page: Page):
        super().__init__(page, page.get_by_role("banner"))
        self.logo: Locator = self._root.get_by_role("link", name="home")
        self.user_menu: Locator = self._root.get_by_role("button", name="account")
        self.cart_icon: Locator = self._root.get_by_role("link", name="cart")
        self.cart_count: Locator = self._root.get_by_test_id("cart-count")
        self.search_input: Locator = self._root.get_by_role("searchbox")

    def search(self, query: str) -> None:
        self.search_input.fill(query)
        self.search_input.press("Enter")

    def open_user_menu(self) -> None:
        self.user_menu.click()

    def logout(self) -> None:
        self.open_user_menu()
        self._page.get_by_role("menuitem", name="Log out").click()

    def get_cart_count(self) -> int:
        text = self.cart_count.text_content() or "0"
        return int(text)
