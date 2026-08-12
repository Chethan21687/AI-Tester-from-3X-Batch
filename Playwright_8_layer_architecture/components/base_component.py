"""Layer 5 — Components: base class for all reusable UI components."""
from playwright.sync_api import Page, Locator


class BaseComponent:
    def __init__(self, page: Page):
        self._page = page

    def _locator(self, selector: str) -> Locator:
        return self._page.locator(selector)

    def is_visible(self, selector: str) -> bool:
        return self._locator(selector).is_visible()

    def wait_for_visible(self, selector: str, timeout: int | None = None) -> Locator:
        loc = self._locator(selector)
        loc.wait_for(state="visible", timeout=timeout)
        return loc
