"""
Focused locator extractor for amazon.in — only the elements a typical test flow
touches: search box/button, cart, sign-in/account, and top nav links.
Filters to <input>/<button>/<a> tags whose accessible name matches a keyword list,
instead of dumping every interactive node on the page.

Usage: python amazon_main_locators.py [output.md]
"""
import re
import sys
sys.stdout.reconfigure(encoding="utf-8")

from playwright.sync_api import sync_playwright, Page, ElementHandle

URL = "https://www.amazon.in"
TEST_ID_ATTRS = ["data-testid", "data-test-id", "data-test", "data-cy", "data-qa"]
KEYWORDS = [
    "search", "cart", "sign in", "account", "orders", "returns",
    "home", "deals", "today's deals", "buy again", "wish list", "lists",
]
KEEP_TAGS = ("input", "button", "a")
IMPLICIT_ROLE = {"a": "link", "button": "button", "input": "textbox"}


def matches_keyword(name: str) -> bool:
    n = name.lower()
    return any(kw in n for kw in KEYWORDS)


def build_locator(page: Page, handle: ElementHandle):
    tag = handle.evaluate("e => e.tagName.toLowerCase()")
    role = handle.get_attribute("role")
    aria_label = handle.get_attribute("aria-label") or ""
    placeholder = handle.get_attribute("placeholder") or ""
    try:
        text = (handle.inner_text() or "").strip()
    except Exception:
        text = ""
    el_id = handle.get_attribute("id")

    accessible_name = aria_label or (text if 0 < len(text) < 60 else placeholder)
    if not accessible_name or not matches_keyword(accessible_name):
        return None

    resolved_role = role or IMPLICIT_ROLE.get(tag)

    # Prefer explicit, implementation-pointed locators over role first — gives a
    # mix of locator types in the output instead of defaulting everything to
    # get_by_role. Role is still tried (and used) whenever it's the only thing
    # that uniquely resolves on the live page.
    candidates = []
    for attr in TEST_ID_ATTRS:
        val = handle.get_attribute(attr)
        if val:
            candidates.append((f"test-id ({attr})", f'locator(\'[{attr}="{val}"]\')',
                               page.locator(f'[{attr}="{val}"]')))
            break
    if el_id:
        candidates.append(("css id", f'locator("#{el_id}")', page.locator(f"#{el_id}")))
    if placeholder:
        candidates.append(("placeholder", f'get_by_placeholder("{placeholder}")',
                           page.get_by_placeholder(placeholder)))
    if resolved_role:
        candidates.append(("role", f'get_by_role("{resolved_role}", name="{accessible_name}")',
                           page.get_by_role(resolved_role, name=accessible_name)))
    if text and tag in ("a", "button") and 0 < len(text) < 60:
        candidates.append(("text", f'get_by_text("{text}", exact=True)',
                           page.get_by_text(text, exact=True)))

    for strategy, code, locator in candidates:
        try:
            if locator.count() == 1:
                return tag, accessible_name[:50], strategy, code, "No"
        except Exception:
            continue

    xpath = handle.evaluate("""el => {
        function p(n){ if(n.id) return `//*[@id="${n.id}"]`; if(n===document.body) return '/html/body';
        let i=0; for(const s of n.parentNode.childNodes){ if(s===n) return p(n.parentNode)+'/'+n.tagName.toLowerCase()+`[${i+1}]`; if(s.nodeType===1&&s.tagName===n.tagName) i++; } }
        return p(el); }""")
    return tag, accessible_name[:50], "xpath (fallback)", f"locator('xpath={xpath}')", "Yes"


def extract():
    rows = []
    seen = set()
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=False)
        page = browser.new_page()
        page.goto(URL)
        page.wait_for_load_state("load")
        page.wait_for_timeout(4000)

        selector = ", ".join(KEEP_TAGS)
        for handle in page.query_selector_all(selector):
            try:
                if not handle.is_visible():
                    continue
                result = build_locator(page, handle)
                if not result:
                    continue
                tag, name, strategy, code, needs_xpath = result
                key = (tag, name)
                if key in seen:
                    continue
                seen.add(key)
                rows.append((f"{tag}: {name}", f"page.{code}", strategy, needs_xpath))
            except Exception:
                continue
        browser.close()
    return rows


def render_table(rows):
    lines = ["| Element | Locator | Strategy | Needs XPath? |", "|---|---|---|---|"]
    for element, locator, strategy, needs_xpath in rows:
        lines.append(f"| {element} | `{locator}` | {strategy} | {needs_xpath} |")
    return "\n".join(lines)


def main():
    out_path = sys.argv[1] if len(sys.argv) > 1 else None
    rows = extract()
    table = render_table(rows)
    print(table)

    xpath_rows = [r for r in rows if r[3] == "Yes"]
    print(f"\n{len(xpath_rows)} of {len(rows)} need XPath fallback." if xpath_rows else "\nNo XPath fallbacks needed.")
    for element, locator, _, _ in xpath_rows:
        print(f"  - {element}: {locator}")

    if out_path:
        with open(out_path, "w", encoding="utf-8") as fh:
            fh.write(table + "\n")
        print(f"\nSaved to {out_path}")


if __name__ == "__main__":
    main()
