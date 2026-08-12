"""Layer 7 — Helpers: wait and polling utilities."""
import time
from typing import Callable

from playwright.sync_api import Page, Locator


def wait_for_condition(
    condition: Callable[[], bool],
    timeout_ms: int = 10_000,
    poll_interval_ms: int = 500,
    description: str = "condition",
):
    """Poll until callable returns True or timeout raises AssertionError."""
    deadline = time.monotonic() + timeout_ms / 1000
    while time.monotonic() < deadline:
        if condition():
            return
        time.sleep(poll_interval_ms / 1000)
    raise AssertionError(f"Timed out waiting for: {description} (timeout={timeout_ms}ms)")


def wait_for_text_change(locator: Locator, initial_text: str, timeout_ms: int = 15_000):
    """Wait until locator's inner text differs from initial_text."""
    def _changed():
        try:
            return locator.inner_text() != initial_text
        except Exception:
            return False

    wait_for_condition(_changed, timeout_ms=timeout_ms, description=f"text to change from '{initial_text}'")


def wait_for_url_contains(page: Page, fragment: str, timeout_ms: int = 10_000):
    """Wait until current URL contains the given fragment."""
    page.wait_for_url(f"**{fragment}**", timeout=timeout_ms)


def wait_for_spinner_gone(page: Page, timeout_ms: int = 15_000):
    """Wait until loading spinner disappears."""
    spinner = page.locator("[data-testid='loading'], .loading-spinner, .spinner")
    if spinner.is_visible():
        spinner.wait_for(state="hidden", timeout=timeout_ms)


def wait_for_network_idle(page: Page, timeout_ms: int = 10_000):
    """Wait for network to become idle (no pending requests)."""
    page.wait_for_load_state("networkidle", timeout=timeout_ms)
