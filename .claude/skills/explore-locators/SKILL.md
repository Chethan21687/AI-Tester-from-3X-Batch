---
name: explore-locators
description: Open a web page in a real (headed) browser via Playwright, walk every interactive element, and produce a table of suggested Playwright locators (Element | Locator | Strategy | Needs XPath?) saved to a markdown file for reuse. Use this whenever the user asks to find/list/extract locators or selectors for a page or site, wants a "locator map" for test automation, asks "what selectors should I use for X", mentions Playwright element strategies, or wants to know which elements on a page would require XPath. Trigger even if they don't say "skill" explicitly — phrases like "give me all the locators for saucedemo", "open this URL and list selectors", "what's the best Playwright locator for the login button" all qualify.
---

# Explore Locators

Generates a reusable table of Playwright locator suggestions for every interactive
element on a page, by actually opening the page in a headed browser and testing
candidate locators against the live DOM (not guessing from static HTML).

## Why this approach

Playwright has a documented locator priority — prefer locators that mirror how a
user/assistive-tech finds things, and treat CSS/XPath as a last resort because
they're brittle and break silently on markup changes:

1. `get_by_role` (with accessible name) — most resilient, mirrors accessibility tree
2. `get_by_label` / `get_by_placeholder` — great for form fields
3. `get_by_text` — fine for static content like links/buttons
4. test-id attributes (`data-testid`, `data-test`, `data-cy`, `data-qa`, ...) — stable, explicit test hooks
5. CSS (`#id`, `[name=...]`) — works but couples tests to implementation details
6. XPath — most brittle (breaks on DOM reshuffles); flag these so the user knows
   where the page lacks stable hooks and may want to add `data-testid` attributes

The bundled script tries each strategy **in this order** and only keeps a candidate
if it resolves to exactly one element on the live page — so the table reflects what
actually works, not a guess.

## Steps

1. **Confirm the target.** If the user gave a URL, use it. If they named a site/app
   without a URL (or the page requires login to reach the interesting screen), ask
   what to navigate to and whether there's a flow to follow first (e.g. log in, then
   capture the inventory page).

2. **Run the extractor.** From the repo root (or anywhere `playwright` is installed —
   this repo already has `playwright install chromium` done per `CLAUDE.md`):

   ```bash
   python .claude/skills/explore-locators/scripts/extract_locators.py <url> <output.md>
   ```

   Pick a sensible `<output.md>` path/name based on the page, e.g.
   `locators_saucedemo_login.md`, and place it wherever the user keeps such notes
   (ask if unclear — the project's `tests/` or repo root are reasonable defaults).

   This launches a **visible** Chromium window so the user can watch the page load
   and see what's being inspected — that's intentional, not a bug. Let them know
   the browser will pop up.

3. **Relay the results.** Print the markdown table back in the chat (the script
   already emits it), and tell the user where the file was saved.

4. **Call out XPath fallbacks explicitly.** The script tags any element that needed
   an XPath fallback with `Needs XPath? = Yes` and prints a summary count. For each
   one, tell the user plainly: this element has no stable role/label/test-id/CSS hook,
   so the generated XPath is positional and will break if the markup shifts. If they
   own the app's source, suggest adding a `data-testid` (or whatever convention the
   codebase already uses — check for one before suggesting a new one).

5. **Multi-page / multi-flow requests.** If the user wants locators across a flow
   (e.g. login page *then* the page after login), run the script once per page/URL
   and present each as its own table — don't try to cram a whole flow into one pass,
   since the script captures a single page snapshot.

## Notes

- The script only inspects **visible** interactive elements (links, buttons, inputs,
  selects, textareas, anything with `role`, `onclick`, or `tabindex`). If the user
  needs static text or container elements too, that's a manual follow-up — mention
  this scope so they're not surprised by what's missing.
- Locator uniqueness is checked live (`locator.count() == 1`), so suggestions are
  verified against the real page, not theoretical.
- If the script errors because `playwright` isn't installed in the active environment,
  run `pip install playwright && playwright install chromium` first.
