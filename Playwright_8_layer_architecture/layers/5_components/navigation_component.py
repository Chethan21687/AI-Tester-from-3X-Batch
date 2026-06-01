from playwright.sync_api import Page, Locator
from layers.5_components.base_component import BaseComponent

NAV_SECTIONS = ("dashboard", "products", "orders", "settings")


class NavigationComponent(BaseComponent):
    def __init__(self, page: Page):
        super().__init__(page, page.get_by_role("navigation"))
        self.dashboard_link: Locator = self._root.get_by_role("link", name="Dashboard")
        self.products_link: Locator = self._root.get_by_role("link", name="Products")
        self.orders_link: Locator = self._root.get_by_role("link", name="Orders")
        self.settings_link: Locator = self._root.get_by_role("link", name="Settings")

    def _link(self, section: str) -> Locator:
        return getattr(self, f"{section}_link")

    def navigate_to(self, section: str) -> None:
        self._link(section).click()

    def is_active(self, section: str) -> bool:
        classes = self._link(section).get_attribute("class") or ""
        return "active" in classes
