"""Layer 6 — Pages: abstract base page; all page objects extend this."""
from abc import ABC, abstractmethod

from playwright.sync_api import Page

from components.header_component import HeaderComponent
from components.navigation_component import NavigationComponent


class BasePage(ABC):
    def __init__(self, page: Page):
        self._page = page
        self.header = HeaderComponent(page)
        self.nav = NavigationComponent(page)

    @abstractmethod
    def goto(self):
        """Navigate to this page's canonical URL."""

    def wait_for_load(self, timeout: int = 15_000):
        self._page.wait_for_load_state("domcontentloaded", timeout=timeout)

    def get_page_title(self) -> str:
        return self._page.title()

    def take_screenshot(self, path: str):
        self._page.screenshot(path=path, full_page=True)

    def get_url(self) -> str:
        return self._page.url
