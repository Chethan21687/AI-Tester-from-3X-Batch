"""Abstract Page Object base. Concrete pages compose locators + actions on top."""
from __future__ import annotations

from abc import ABC, abstractmethod

from playwright.sync_api import Page, expect

from config import Settings


class BasePage(ABC):
    """Shared page behavior. Subclasses must implement goto()."""

    def __init__(self, page: Page, settings: Settings) -> None:
        self.page = page
        self.settings = settings
        self.page.set_default_timeout(settings.default_timeout_ms)

    @abstractmethod
    def goto(self) -> "BasePage":
        """Navigate to this page's canonical URL and return self."""
        raise NotImplementedError

    # ---- shared helpers -------------------------------------------------
    def title(self) -> str:
        return self.page.title()

    def current_url(self) -> str:
        return self.page.url

    def expect_url_contains(self, fragment: str) -> None:
        expect(self.page).to_have_url(lambda u: fragment in u)

    def screenshot(self, path: str) -> None:
        self.page.screenshot(path=path, full_page=True)
