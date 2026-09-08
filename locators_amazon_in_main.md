| Element | Locator | Strategy | Needs XPath? |
|---|---|---|---|
| a: Search, alt, forward slash | `page.get_by_role("link", name="Search, alt, forward slash")` | role | No |
| a: Cart, shift, alt, c | `page.get_by_role("link", name="Cart, shift, alt, c")` | role | No |
| a: Home, shift, alt, h | `page.get_by_role("link", name="Home, shift, alt, h")` | role | No |
| a: Your orders, shift, alt, o | `page.get_by_role("link", name="Your orders, shift, alt, o")` | role | No |
| input: Search Amazon.in | `page.get_by_role("searchbox", name="Search Amazon.in")` | role | No |
| a: Hello, sign in
Account & Lists | `page.get_by_role("link", name="Hello, sign in
Account & Lists")` | role | No |
| button: Expand Account and Lists | `page.get_by_role("button", name="Expand Account and Lists")` | role | No |
| a: Returns
& Orders | `page.get_by_role("link", name="Returns
& Orders")` | role | No |
| a: 0 items in cart | `page.get_by_role("link", name="0 items in cart")` | role | No |
| a: Today's Deals | `page.get_by_role("link", name="Today's Deals")` | role | No |
| a: Home & Kitchen | `page.locator('xpath=//*[@id="nav-xshop"]/ul[1]/li[13]/div[1]/a[1]')` | xpath (fallback) | Yes |
| a: Home Improvement | `page.get_by_role("link", name="Home Improvement")` | role | No |
| a: Appliances for your home | Up to 55% off - See mor | `page.get_by_role("link", name="Appliances for your home | Up to 55% off - See more")` | role | No |
| a: Home storage | `page.get_by_role("link", name="Home storage")` | role | No |
| a: Revamp your home in style - Explore all | `page.get_by_role("link", name="Revamp your home in style - Explore all")` | role | No |
| a: Home tools | `page.get_by_role("link", name="Home tools")` | role | No |
| a: Starting ₹49 | Deals on home essentials - Explore  | `page.get_by_role("link", name="Starting ₹49 | Deals on home essentials - Explore all")` | role | No |
| a: Your Account | `page.get_by_role("link", name="Your Account")` | role | No |
| a: Returns Centre | `page.get_by_role("link", name="Returns Centre")` | role | No |
| a: Amazon India Home | `page.get_by_role("link", name="Amazon India Home")` | role | No |
