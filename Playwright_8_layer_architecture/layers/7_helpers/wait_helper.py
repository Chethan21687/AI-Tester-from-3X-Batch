from typing import Callable
from playwright.sync_api import Page


class WaitHelper:
    @staticmethod
    def for_network_idle(page: Page, timeout: int = 5_000) -> None:
        page.wait_for_load_state("networkidle", timeout=timeout)

    @staticmethod
    def for_api_response(page: Page, url_pattern: str, action: Callable) -> int:
        with page.expect_response(url_pattern) as response_info:
            action()
        return response_info.value.status

    @staticmethod
    def for_element_count(page: Page, selector: str, expected_count: int, timeout: int = 10_000) -> None:
        page.wait_for_function(
            f"document.querySelectorAll('{selector}').length === {expected_count}",
            timeout=timeout,
        )

    @staticmethod
    def for_local_storage_key(page: Page, key: str, timeout: int = 5_000) -> str:
        return page.wait_for_function(
            f"window.localStorage.getItem('{key}')",
            timeout=timeout,
        ).json_value()

    @staticmethod
    def for_url_change(page: Page, expected_url: str, timeout: int = 10_000) -> None:
        page.wait_for_url(expected_url, timeout=timeout)
