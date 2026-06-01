from playwright.sync_api import Page, Locator


class BaseComponent:
    def __init__(self, page: Page, root: Locator):
        self._page = page
        self._root = root

    def is_visible(self) -> bool:
        return self._root.is_visible()

    def wait_for_visible(self) -> None:
        self._root.wait_for(state="visible")

    def wait_for_hidden(self) -> None:
        self._root.wait_for(state="hidden")
