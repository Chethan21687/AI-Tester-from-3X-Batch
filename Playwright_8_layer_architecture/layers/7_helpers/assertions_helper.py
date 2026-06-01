from playwright.sync_api import Page, Locator, expect


class AssertionsHelper:
    @staticmethod
    def expect_toast(page: Page, message: str) -> None:
        toast = page.get_by_role("status")
        expect(toast).to_be_visible()
        expect(toast).to_contain_text(message)
        toast.wait_for(state="hidden", timeout=5_000)

    @staticmethod
    def expect_table_row(table: Locator, values: list[str]) -> None:
        for value in values:
            expect(table.get_by_role("cell", name=value)).to_be_visible()

    @staticmethod
    def expect_field_error(page: Page, field_label: str, error_message: str) -> None:
        field = page.get_by_label(field_label)
        described_by = field.get_attribute("aria-describedby")
        if described_by:
            expect(page.locator(f"#{described_by}")).to_have_text(error_message)
        else:
            expect(field).to_have_attribute("aria-invalid", "true")

    @staticmethod
    def expect_page_heading(page: Page, heading: str) -> None:
        expect(page.get_by_role("heading", level=1)).to_have_text(heading)

    @staticmethod
    def expect_breadcrumb(page: Page, *crumbs: str) -> None:
        nav = page.get_by_role("navigation", name="breadcrumb")
        for crumb in crumbs:
            expect(nav.get_by_text(crumb)).to_be_visible()

    @staticmethod
    def expect_loading_complete(page: Page) -> None:
        spinner = page.get_by_role("progressbar")
        if spinner.is_visible():
            spinner.wait_for(state="hidden", timeout=10_000)
