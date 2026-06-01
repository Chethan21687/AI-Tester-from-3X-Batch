from abc import ABC, abstractmethod
from playwright.sync_api import Page
from layers.5_components.header_component import HeaderComponent
from layers.5_components.navigation_component import NavigationComponent


class BasePage(ABC):
    def __init__(self, page: Page):
        self._page = page
        self.header = HeaderComponent(page)
        self.navigation = NavigationComponent(page)

    @abstractmethod
    def goto(self) -> None:
        pass

    def navigate(self, path: str) -> None:
        self._page.goto(path)

    def wait_for_load(self) -> None:
        self._page.wait_for_load_state("networkidle")

    def get_title(self) -> str:
        return self._page.title()

    def take_screenshot(self, name: str) -> bytes:
        return self._page.screenshot(path=f"screenshots/{name}.png", full_page=True)

    def scroll_to_bottom(self) -> None:
        self._page.evaluate("window.scrollTo(0, document.body.scrollHeight)")
