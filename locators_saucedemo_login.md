| Element | Locator | Strategy | Needs XPath? |
|---|---|---|---|
| input: Username | `page.get_by_placeholder("Username")` | placeholder | No |
| input: Password | `page.get_by_placeholder("Password")` | placeholder | No |
| input: login-button | `page.locator('[data-test="login-button"]')` | test-id (data-test) | No |
