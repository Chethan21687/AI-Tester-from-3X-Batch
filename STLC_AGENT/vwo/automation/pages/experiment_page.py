"""Experiment authoring page object. Covers A/B, Split URL, Multivariate setup."""
from __future__ import annotations

from dataclasses import dataclass, field

from playwright.sync_api import Page, Locator, expect

from config import Settings
from .base_page import BasePage


@dataclass
class ExperimentSpec:
    """Test-data dataclass describing an experiment to create."""
    name: str
    kind: str  # "ab" | "split" | "mvt"
    url: str = ""
    variations: list[str] = field(default_factory=lambda: ["Control", "Variation B"])
    goal: str | None = None


class ExperimentPage(BasePage):
    def __init__(self, page: Page, settings: Settings) -> None:
        super().__init__(page, settings)
        self.name_input: Locator = page.get_by_label("Name", exact=False).or_(
            page.locator("[data-qa='experiment-name'], input[name='campaignName']")
        ).first
        self.url_input: Locator = page.get_by_label("URL", exact=False).or_(
            page.locator("[data-qa='experiment-url'], input[name='url']")
        ).first
        self.add_variation_button: Locator = page.get_by_role(
            "button", name="Add Variation"
        ).first
        self.variation_rows: Locator = page.locator("[data-qa='variation-row'], .variation-item")
        self.save_button: Locator = page.get_by_role("button", name="Save").first
        self.launch_button: Locator = page.get_by_role("button", name="Launch").or_(
            page.get_by_role("button", name="Start Campaign")
        ).first
        self.validation_error: Locator = page.locator(
            "[role='alert'], .validation-error, [data-qa='validation-error']"
        ).first

    def goto(self) -> "ExperimentPage":
        self.page.goto(f"{self.settings.base_url}/experiments/new", wait_until="domcontentloaded")
        return self

    # ---- actions --------------------------------------------------------
    def configure(self, spec: ExperimentSpec) -> None:
        self.name_input.fill(spec.name)
        if spec.url:
            self.url_input.fill(spec.url)
        # ensure desired number of variations exist
        while self.variation_rows.count() < len(spec.variations):
            self.add_variation_button.click()

    def remove_all_variations(self) -> None:
        remove = self.page.get_by_role("button", name="Remove")
        while remove.count() > 0:
            remove.first.click()

    def save(self) -> None:
        self.save_button.click()

    def attempt_launch(self) -> None:
        self.launch_button.click()

    # ---- assertions -----------------------------------------------------
    def variation_count(self) -> int:
        return self.variation_rows.count()

    def expect_validation_error(self) -> None:
        expect(self.validation_error).to_be_visible()

    def expect_saved(self) -> None:
        expect(self.page.get_by_text("saved", exact=False)).to_be_visible()
