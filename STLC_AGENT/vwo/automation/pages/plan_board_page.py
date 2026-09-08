"""Plan / Kanban board page object. Workflow management (FR9)."""
from __future__ import annotations

from playwright.sync_api import Page, Locator, expect

from config import Settings
from .base_page import BasePage


class PlanBoardPage(BasePage):
    def __init__(self, page: Page, settings: Settings) -> None:
        super().__init__(page, settings)
        self.add_card_button: Locator = page.get_by_role("button", name="Add Idea").or_(
            page.get_by_role("button", name="New Card")
        ).first
        self.card_title_input: Locator = page.get_by_label("Title", exact=False).or_(
            page.locator("[data-qa='card-title']")
        ).first
        self.save_card_button: Locator = page.get_by_role("button", name="Save").first
        self.cards: Locator = page.locator("[data-qa='kanban-card'], .kanban-card")

    def goto(self) -> "PlanBoardPage":
        self.page.goto(f"{self.settings.base_url}/plan", wait_until="domcontentloaded")
        return self

    def add_card(self, title: str) -> None:
        self.add_card_button.click()
        self.card_title_input.fill(title)
        self.save_card_button.click()

    def card_count(self) -> int:
        return self.cards.count()

    def expect_card_present(self, title: str) -> None:
        expect(self.page.get_by_text(title, exact=False)).to_be_visible()
