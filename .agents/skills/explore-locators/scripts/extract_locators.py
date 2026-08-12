"""
Walk a live page with a headed Chromium browser and suggest a Playwright
locator for every interactive element, following Playwright's recommended
priority order: role -> label/placeholder -> text -> test-id -> css -> xpath.

Usage:
    python extract_locators.py <url> [output.md]

If output.md is given, the markdown table is also written to that file.
"""
import sys
from playwright.sync_api import sync_playwright, Page, ElementHandle

TEST_ID_ATTRS = ["data-testid", "data-test-id", "data-test", "data-cy", "data-qa"]
INTERACTIVE_SELECTOR = "a, button, input, select, textarea, [role], [onclick], [tabindex]"
IMPLICIT_ROLE = {
    "a": "link", "button": "button", "input": "textbox",
    "select": "combobox", "textarea": "textbox",
}

XPATH_FN = """
el => {
    function pathOf(node) {
        if (node.id) return `//*[@id="${node.id}"]`;
        if (node === document.body) return '/html/body';
        let ix = 0;
        for (const sib of node.parentNode.childNodes) {
            if (sib === node) return pathOf(node.parentNode) + '/' + node.tagName.toLowerCase() + `[${ix + 1}]`;
            if (sib.nodeType === 1 && sib.tagName === node.tagName) ix++;
        }
    }
    return pathOf(el);
}
"""


def build_candidates(page: Page, handle: ElementHandle):
    tag = handle.evaluate("e => e.tagName.toLowerCase()")
    role = handle.get_attribute("role")
    aria_label = handle.get_attribute("aria-label")
    placeholder = handle.get_attribute("placeholder")
    text = (handle.inner_text() or "").strip()
    el_id = handle.get_attribute("id")
    name_attr = handle.get_attribute("name")

    candidates = []
    accessible_name = aria_label or (text if 0 < len(text) < 60 else "")
    resolved_role = role or IMPLICIT_ROLE.get(tag)
    if resolved_role and accessible_name:
        candidates.append((
            "role",
            f'get_by_role("{resolved_role}", name="{accessible_name}")',
            page.get_by_role(resolved_role, name=accessible_name),
        ))

    if placeholder:
        candidates.append((
            "placeholder",
            f'get_by_placeholder("{placeholder}")',
            page.get_by_placeholder(placeholder),
        ))

    if text and tag in ("a", "button") and len(text) < 60:
        candidates.append((
            "text",
            f'get_by_text("{text}", exact=True)',
            page.get_by_text(text, exact=True),
        ))

    for attr in TEST_ID_ATTRS:
        val = handle.get_attribute(attr)
        if val:
            candidates.append((
                f"test-id ({attr})",
                f'locator(\'[{attr}="{val}"]\')',
                page.locator(f'[{attr}="{val}"]'),
            ))
            break

    if el_id:
        candidates.append(("css id", f'locator("#{el_id}")', page.locator(f"#{el_id}")))

    if name_attr:
        candidates.append((
            "css name",
            f'locator(\'{tag}[name="{name_attr}"]\')',
            page.locator(f'{tag}[name="{name_attr}"]'),
        ))

    return candidates, tag, text


def pick_locator(candidates):
    """Return the first candidate that resolves to exactly one element on the page."""
    for strategy, code, locator in candidates:
        try:
            if locator.count() == 1:
                return strategy, code
        except Exception:
            continue
    return None, None


def describe(tag, text, handle):
    label = text[:40] if text else (
        handle.get_attribute("aria-label")
        or handle.get_attribute("placeholder")
        or handle.get_attribute("name")
        or ""
    )
    return f"{tag}: {label}".rstrip(": ")


def extract(url: str):
    rows = []
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=False)
        page = browser.new_page()
        page.goto(url)
        page.wait_for_load_state("networkidle")

        for handle in page.query_selector_all(INTERACTIVE_SELECTOR):
            if not handle.is_visible():
                continue
            candidates, tag, text = build_candidates(page, handle)
            strategy, code = pick_locator(candidates)
            needs_xpath = strategy is None
            if needs_xpath:
                xpath = handle.evaluate(XPATH_FN)
                code = f"locator('xpath={xpath}')"
                strategy = "xpath (fallback)"
            rows.append((describe(tag, text, handle), f"page.{code}", strategy, "Yes" if needs_xpath else "No"))

        browser.close()
    return rows


def render_table(rows):
    lines = ["| Element | Locator | Strategy | Needs XPath? |", "|---|---|---|---|"]
    for element, locator, strategy, needs_xpath in rows:
        lines.append(f"| {element} | `{locator}` | {strategy} | {needs_xpath} |")
    return "\n".join(lines)


def main():
    if len(sys.argv) < 2:
        print("Usage: python extract_locators.py <url> [output.md]")
        sys.exit(1)

    url = sys.argv[1]
    out_path = sys.argv[2] if len(sys.argv) > 2 else None

    rows = extract(url)
    table = render_table(rows)
    print(table)

    xpath_count = sum(1 for r in rows if r[3] == "Yes")
    if xpath_count:
        print(f"\n{xpath_count} element(s) needed an XPath fallback — no stable role/label/test-id/css locator existed.")

    if out_path:
        with open(out_path, "w", encoding="utf-8") as fh:
            fh.write(table + "\n")
        print(f"\nSaved to {out_path}")


if __name__ == "__main__":
    main()
