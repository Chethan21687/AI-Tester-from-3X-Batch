from playwright.sync_api import Page, Locator, expect
from layers.5_components.base_component import BaseComponent


class ModalComponent(BaseComponent):
    def __init__(self, page: Page):
        super().__init__(page, page.get_by_role("dialog"))
        self.title: Locator = self._root.get_by_role("heading")
        self.close_button: Locator = self._root.get_by_role("button", name="Close")
        self.confirm_button: Locator = self._root.get_by_role("button", name="Confirm")
        self.cancel_button: Locator = self._root.get_by_role("button", name="Cancel")

    def get_title(self) -> str:
        return self.title.text_content() or ""

    def confirm(self) -> None:
        self.confirm_button.click()
        self.wait_for_hidden()

    def cancel(self) -> None:
        self.cancel_button.click()
        self.wait_for_hidden()

    def close(self) -> None:
        self.close_button.click()
        self.wait_for_hidden()

    def close_with_escape(self) -> None:
        self._page.keyboard.press("Escape")
        self.wait_for_hidden()
