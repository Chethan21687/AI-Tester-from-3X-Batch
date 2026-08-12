"""Layer 7 — Helpers: custom assertion helpers for VWO-specific validations."""
import csv
import os
import re

from playwright.sync_api import Page, expect


class VWOAssertions:
    @staticmethod
    def assert_page_loads_within(page: Page, url: str, max_ms: float = 2000.0):
        """Assert page navigation completes within NFR threshold."""
        import time
        start = time.monotonic()
        page.goto(url)
        page.wait_for_load_state("domcontentloaded")
        elapsed = (time.monotonic() - start) * 1000
        assert elapsed <= max_ms, (
            f"Page '{url}' loaded in {elapsed:.0f}ms — exceeds {max_ms}ms NFR threshold"
        )

    @staticmethod
    def assert_https_redirect(page: Page, http_url: str):
        """Assert HTTP URL redirects to HTTPS."""
        page.goto(http_url)
        final_url = page.url
        assert final_url.startswith("https://"), (
            f"Expected HTTPS redirect from '{http_url}', got: '{final_url}'"
        )

    @staticmethod
    def assert_no_pii_in_url(page: Page):
        """Assert current URL contains no plain-text PII (email, SSN, phone)."""
        url = page.url
        email_pattern = r"[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}"
        ssn_pattern = r"\b\d{3}-\d{2}-\d{4}\b"
        phone_pattern = r"\b\d{3}[-.\s]?\d{3}[-.\s]?\d{4}\b"
        for pattern, name in [
            (email_pattern, "email"),
            (ssn_pattern, "SSN"),
            (phone_pattern, "phone"),
        ]:
            match = re.search(pattern, url)
            assert not match, f"PII ({name}) found in URL: {url}"

    @staticmethod
    def assert_csv_has_data(csv_path: str, min_rows: int = 1):
        """Assert downloaded CSV file has data rows."""
        assert os.path.exists(csv_path), f"CSV file not found: {csv_path}"
        with open(csv_path, newline="", encoding="utf-8") as f:
            rows = list(csv.reader(f))
        data_rows = [r for r in rows if any(cell.strip() for cell in r)]
        assert len(data_rows) >= min_rows + 1, (  # +1 for header
            f"CSV has {len(data_rows) - 1} data rows, expected >= {min_rows}"
        )

    @staticmethod
    def assert_probability_values_sum_to_100(probability_texts: list[str], tolerance: float = 5.0):
        """Assert Bayesian probabilities across variations sum to ~100%."""
        values = []
        for text in probability_texts:
            nums = re.findall(r"\d+(?:\.\d+)?", text)
            if nums:
                values.append(float(nums[0]))
        total = sum(values)
        assert abs(total - 100.0) <= tolerance, (
            f"Probability values sum to {total:.1f}%, expected ~100% (±{tolerance}%)"
        )

    @staticmethod
    def assert_conversion_rate(visits: int, conversions: int, displayed_rate: str):
        """Assert displayed conversion rate matches calculated rate."""
        if visits == 0:
            return
        expected = (conversions / visits) * 100
        nums = re.findall(r"\d+(?:\.\d+)?", displayed_rate)
        assert nums, f"No numeric value in rate: '{displayed_rate}'"
        actual = float(nums[0])
        assert abs(actual - expected) < 0.1, (
            f"Conversion rate mismatch: displayed {actual:.2f}% vs calculated {expected:.2f}%"
        )

    @staticmethod
    def assert_status_badge(page: Page, expected_status: str):
        """Assert test/campaign status badge text."""
        badge = page.locator(
            "[data-testid='test-status'], .test-status-badge, "
            ".campaign-status-badge, .status-indicator"
        )
        expect(badge).to_contain_text(expected_status, ignore_case=True)
