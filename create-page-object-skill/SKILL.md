---
name: create-page-object
description: >
  Generates a Playwright Page Object Model file following the 8-layer architecture
  used in this project (layers/6_pages/). Trigger on: "Create a Page Object",
  "Create page object for", "create-page-object", "new page object", "add a page class",
  or any request to scaffold a new page in the Playwright test framework.
  Always use this skill when the user mentions creating, adding, or scaffolding a page
  object — even if they just say "make me a page for X".
---

## What this skill does

Scaffold a new `*_page.py` file in `layers/6_pages/` that follows the exact same
pattern as `login_page.py`, `dashboard_page.py`, and `checkout_page.py`.

## Step 1 — Read the architecture

Before doing anything else, read these files to understand current conventions:

- `layers/6_pages/base_page.py` — the base class all pages extend
- `layers/6_pages/login_page.py` — primary reference pattern
- `layers/6_pages/__init__.py` — to know what's already exported

This keeps the generated page consistent with what already exists.

## Step 2 — Ask the user for details

Ask these questions (all in one message, not one by one):

1. **Page name** — e.g. "Profile", "Settings", "Cart" (becomes `profile_page.py` / `ProfilePage`)
2. **URL path** — e.g. `/profile`, `/settings` (used in `goto()`)
3. **Locators** — list every element they want on the page. For each, ask:
   - What is it? (input, button, link, heading, table, etc.)
   - What locator strategy? (`get_by_label`, `get_by_role`, `get_by_test_id`, `get_by_placeholder`, `locator(css)`)
   - What is the selector value? (label text, role name, test-id, CSS selector)

**Example prompt to user:**
> "Give me the locators for this page. For each element, tell me: what it is,
> the Playwright locator type (get_by_label / get_by_role / get_by_test_id / locator),
> and the selector value."

Wait for the user's response before generating.

## Step 3 — Generate the page object

Follow this exact structure (modelled on `login_page.py`):

```python
from playwright.sync_api import Page, Locator, expect
from layers.6_pages.base_page import BasePage


class {ClassName}(BasePage):
    def __init__(self, page: Page):
        super().__init__(page)
        # — locators —
        self.{locator_name}: Locator = page.{locator_strategy}

    def goto(self) -> None:
        self.navigate("{url_path}")
        self.wait_for_load()

    # — action methods —
    def {action_method}(self, ...) -> None:
        ...

    # — assertion methods —
    def expect_{condition}(self, ...) -> None:
        expect(self.{locator}).to_be_visible()
```

### Naming conventions

| Thing | Convention | Example |
|---|---|---|
| File | `{snake_name}_page.py` | `profile_page.py` |
| Class | `{PascalName}Page` | `ProfilePage` |
| Locator attr | `{element_snake}_input/button/link/heading` | `save_button`, `email_input` |
| Action method | verb + noun | `fill_profile()`, `click_save()` |
| Assertion method | `expect_` prefix | `expect_saved()`, `expect_error()` |

### Locator translation guide

| User says | Playwright locator |
|---|---|
| label text | `page.get_by_label("Text")` |
| button name | `page.get_by_role("button", name="Text")` |
| link text | `page.get_by_role("link", name="Text")` |
| data-testid | `page.get_by_test_id("id")` |
| placeholder | `page.get_by_placeholder("Text")` |
| CSS selector | `page.locator(".css-selector")` |
| heading text | `page.get_by_role("heading", name="Text")` |
| alert/status | `page.get_by_role("alert")` |

### When to add dataclasses

Add a `@dataclass` (like `ShippingDetails` in `checkout_page.py`) when a method
takes 3+ related field arguments — group them into a typed dataclass defined at
the top of the file.

## Step 4 — Write the file

Write to `layers/6_pages/{snake_name}_page.py`.

Then tell the user:
- Full file path created
- Class name and available methods
- How to import it: `from layers.6_pages.{snake_name}_page import {ClassName}`

## Example

**User:** "Create page object for Profile page, path /profile, with: email label input,
full name label input, save button role, success alert role"

**Output** → `layers/6_pages/profile_page.py`:

```python
from playwright.sync_api import Page, Locator, expect
from layers.6_pages.base_page import BasePage


class ProfilePage(BasePage):
    def __init__(self, page: Page):
        super().__init__(page)
        self.email_input: Locator = page.get_by_label("Email")
        self.full_name_input: Locator = page.get_by_label("Full name")
        self.save_button: Locator = page.get_by_role("button", name="Save")
        self.success_alert: Locator = page.get_by_role("alert")

    def goto(self) -> None:
        self.navigate("/profile")
        self.wait_for_load()

    def fill_profile(self, email: str, full_name: str) -> None:
        self.email_input.fill(email)
        self.full_name_input.fill(full_name)

    def save(self) -> None:
        self.save_button.click()

    def expect_saved(self) -> None:
        expect(self.success_alert).to_be_visible()
        expect(self.success_alert).to_contain_text("saved")
```
