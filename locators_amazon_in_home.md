| Element | Locator | Strategy | Needs XPath? |
|---|---|---|---|
| nav: Skip to
Main content
Keyboard shortcuts
 | `page.get_by_role("navigation", name="Shortcuts menu")` | role | No |
| a: Main content | `page.get_by_role("link", name="main content")` | role | No |
| a: Search
alt
+
/ | `page.get_by_role("link", name="Search, alt, forward slash")` | role | No |
| a: Cart
shift
+
alt
+
C | `page.get_by_role("link", name="Cart, shift, alt, c")` | role | No |
| a: Home
shift
+
alt
+
H | `page.get_by_role("link", name="Home, shift, alt, h")` | role | No |
| a: Orders
shift
+
alt
+
O | `page.get_by_role("link", name="Your orders, shift, alt, o")` | role | No |
| button: Show/Hide shortcuts
shift
+
alt
+
Z | `page.get_by_role("button", name="Show/hide shortcuts, shift, alt, z")` | role | No |
| div: .in
Delivering to Bengaluru 562114
Updat | `page.get_by_role("navigation", name="Primary")` | role | No |
| a: .in | `page.get_by_role("link", name="Amazon.in")` | role | No |
| a: Delivering to Bengaluru 562114
Update lo | `page.get_by_role("button", name="Delivering to Bengaluru 562114
Update location")` | role | No |
| form: All
All Categories
Alexa Skills
Amazon D | `page.locator("#nav-search-bar-form")` | css id | No |
| select: All Categories
Alexa Skills
Amazon Devic | `page.locator("#searchDropdownBox")` | css id | No |
| input: Search Amazon.in | `page.get_by_role("searchbox", name="Search Amazon.in")` | role | No |
| input | `page.locator("#nav-search-submit-button")` | css id | No |
| a: EN | `page.get_by_role("link", name="Choose a language for shopping in Amazon India. The current selection is English (EN).
")` | role | No |
| span: India | `page.locator('xpath=//*[@id="icp-nav-flyout"]/a[1]/span[1]/span[2]/span[1]')` | xpath (fallback) | Yes |
| button: Expand to Change Language or Country | `page.locator('xpath=//*[@id="icp-nav-flyout"]/button[1]')` | xpath (fallback) | Yes |
| a: Hello, sign in
Account & Lists | `page.get_by_role("link", name="Hello, sign in
Account & Lists")` | role | No |
| button: Expand Account and Lists | `page.get_by_role("button", name="Expand Account and Lists")` | role | No |
| a: Returns
& Orders | `page.get_by_role("link", name="Returns
& Orders")` | role | No |
| a: 0
Cart | `page.get_by_role("link", name="0 items in cart")` | role | No |
| a: All | `page.get_by_role("button", name="Open All Categories Menu")` | role | No |
| a: Fresh | `page.get_by_text("Fresh", exact=True)` | text | No |
| button: Fresh Details | `page.get_by_role("button", name="Fresh Details")` | role | No |
| a: MX Player | `page.get_by_role("link", name="MX Player")` | role | No |
| a: Sell | `page.get_by_text("Sell", exact=True)` | text | No |
| a: Bestsellers | `page.get_by_role("link", name="Bestsellers")` | role | No |
| a: Today's Deals | `page.get_by_role("link", name="Today's Deals")` | role | No |
| a: Mobiles | `page.get_by_role("link", name="Mobiles")` | role | No |
| a: Prime | `page.get_by_text("Prime", exact=True)` | text | No |
| button: Prime Details | `page.get_by_role("button", name="Prime Details")` | role | No |
| a: New Releases | `page.get_by_role("link", name="New Releases")` | role | No |
| a: Customer Service | `page.get_by_role("link", name="Customer Service")` | role | No |
| a: Electronics | `page.locator('xpath=//*[@id="nav-xshop"]/ul[1]/li[10]/div[1]/a[1]')` | xpath (fallback) | Yes |
| a: Amazon Pay | `page.get_by_text("Amazon Pay", exact=True)` | text | No |
| a: Fashion | `page.get_by_text("Fashion", exact=True)` | text | No |
| a: Home & Kitchen | `page.locator('xpath=//*[@id="nav-xshop"]/ul[1]/li[13]/div[1]/a[1]')` | xpath (fallback) | Yes |
| a: Computers | `page.get_by_role("link", name="Computers")` | role | No |
| a: Toys & Games | `page.get_by_role("link", name="Toys & Games")` | role | No |
| a: Car & Motorbike | `page.get_by_role("link", name="Car & Motorbike")` | role | No |
| a: Gift Cards | `page.get_by_role("link", name="Gift Cards")` | role | No |
| a: Beauty & Personal Care | `page.get_by_role("link", name="Beauty & Personal Care")` | role | No |
| a: Home Improvement | `page.get_by_role("link", name="Home Improvement")` | role | No |
| a: Health, Household & Personal Care | `page.get_by_role("link", name="Health, Household & Personal Care")` | role | No |
| a: Books | `page.locator('xpath=//*[@id="nav-xshop"]/ul[1]/li[21]/div[1]/a[1]')` | xpath (fallback) | Yes |
| a: Custom Products | `page.get_by_role("link", name="Custom Products")` | role | No |
| a: Grocery & Gourmet Foods | `page.get_by_role("link", name="Grocery & Gourmet Foods")` | role | No |
| a: Video Games | `page.get_by_role("link", name="Video Games")` | role | No |
| a: Sports, Fitness & Outdoors | `page.get_by_role("link", name="Sports, Fitness & Outdoors")` | role | No |
| a: Baby | `page.locator('xpath=//*[@id="nav-xshop"]/ul[1]/li[26]/div[1]/a[1]')` | xpath (fallback) | Yes |
| a: Pet Supplies | `page.get_by_role("link", name="Pet Supplies")` | role | No |
| a: AmazonBasics | `page.get_by_role("link", name="AmazonBasics")` | role | No |
| a: Audible | `page.locator('xpath=//*[@id="nav-xshop"]/ul[1]/li[29]/div[1]/a[1]')` | xpath (fallback) | Yes |
| a: Kindle eBooks | `page.get_by_role("link", name="Kindle eBooks")` | role | No |
| a: Subscribe & Save | `page.get_by_role("link", name="Subscribe & Save")` | role | No |
| a: Flights | `page.get_by_role("link", name="Flights")` | role | No |
| a | `page.locator("#skippedLink")` | css id | No |
| div: Previous slide
Next slide
Appliances for | `page.locator("#pageContent")` | css id | No |
| div: Previous slide
Next slide | `page.locator("#gw-desktop-herotator")` | css id | No |
| div: Previous slide
Next slide | `page.get_by_role("group", name="Featured content")` | role | No |
| a: Previous slide | `page.get_by_role("button", name="Previous slide")` | role | No |
| div | `page.locator("#anonCarousel1")` | css id | No |
| a | `page.locator('xpath=//*[@id="CardInstanceyOG3KahYQY3OtOXpJV80rA"]/a[1]')` | xpath (fallback) | Yes |
| a: Next slide | `page.get_by_role("button", name="Next slide")` | role | No |
| a: Air conditioners | `page.get_by_role("link", name="ACs")` | role | No |
| a: Refrigerators | `page.get_by_role("link", name="Refrigerators")` | role | No |
| a: Microwaves | `page.get_by_role("link", name="Microwaves")` | role | No |
| a: Washing machines | `page.get_by_role("link", name="Washing machines")` | role | No |
| a: See more
See more | `page.get_by_role("link", name="Appliances for your home | Up to 55% off - See more")` | role | No |
| a: Cushion covers, bedsheets & more | `page.get_by_role("link", name="Cushion covers, bedsheets & more")` | role | No |
| a: Figurines, vases & more | `page.get_by_role("link", name="Figurines, vases & more")` | role | No |
| a: Home storage | `page.get_by_role("link", name="Home storage")` | role | No |
| a: Lighting solutions | `page.get_by_role("link", name="Lighting solutions")` | role | No |
| a: Explore all
Explore all | `page.get_by_role("link", name="Revamp your home in style - Explore all")` | role | No |
| a: Cleaning supplies | `page.get_by_text("Cleaning supplies", exact=True)` | text | No |
| a: Bathroom accessories | `page.get_by_role("link", name="Bath accessories")` | role | No |
| a: Home tools | `page.get_by_role("link", name="Home tools")` | role | No |
| a: Wallpapers | `page.get_by_role("link", name="Wallpapers")` | role | No |
| a: Explore all
Explore all | `page.get_by_role("link", name="Starting ₹49 | Deals on home essentials - Explore all")` | role | No |
| a: Up to 50% off | Baby diapers & wipes | `page.get_by_role("link", name="Up to 50% off | Baby diapers & wipes")` | role | No |
| a: Up to 50% off | Ride ons | `page.get_by_role("link", name="Up to 50% off | Ride ons")` | role | No |
| a: Starting ₹649 | RC cars | `page.get_by_role("link", name="Starting ₹649 | RC cars")` | role | No |
| a: Up to 50% off | Baby safety essentials | `page.get_by_role("link", name="Up to 50% off | Baby safety essentials")` | role | No |
| a: See all offers
See all offers | `page.get_by_role("link", name="Up to 50% off | Baby care & toys | Amazon Brands - See all offers")` | role | No |
| a: See all offers | `page.locator('xpath=//*[@id="5cf51c12-68e6-4ac9-90ae-f1af7b978f49"]/div[1]/span[1]/a[1]')` | xpath (fallback) | Yes |
| ul | `page.locator('xpath=//*[@id="5cf51c12-68e6-4ac9-90ae-f1af7b978f49"]/div[2]/div[1]/ul[1]')` | xpath (fallback) | Yes |
| li | `page.locator('xpath=//*[@id="5cf51c12-68e6-4ac9-90ae-f1af7b978f49"]/div[2]/div[1]/ul[1]/li[1]')` | xpath (fallback) | Yes |
| a | `page.locator('xpath=//*[@id="5cf51c12-68e6-4ac9-90ae-f1af7b978f49"]/div[2]/div[1]/ul[1]/li[1]/span[1]/a[1]')` | xpath (fallback) | Yes |
| li | `page.locator('xpath=//*[@id="5cf51c12-68e6-4ac9-90ae-f1af7b978f49"]/div[2]/div[1]/ul[1]/li[2]')` | xpath (fallback) | Yes |
| a | `page.locator('xpath=//*[@id="5cf51c12-68e6-4ac9-90ae-f1af7b978f49"]/div[2]/div[1]/ul[1]/li[2]/span[1]/a[1]')` | xpath (fallback) | Yes |
| li | `page.locator('xpath=//*[@id="5cf51c12-68e6-4ac9-90ae-f1af7b978f49"]/div[2]/div[1]/ul[1]/li[3]')` | xpath (fallback) | Yes |
| a | `page.locator('xpath=//*[@id="5cf51c12-68e6-4ac9-90ae-f1af7b978f49"]/div[2]/div[1]/ul[1]/li[3]/span[1]/a[1]')` | xpath (fallback) | Yes |
| li | `page.locator('xpath=//*[@id="5cf51c12-68e6-4ac9-90ae-f1af7b978f49"]/div[2]/div[1]/ul[1]/li[4]')` | xpath (fallback) | Yes |
| a | `page.locator('xpath=//*[@id="5cf51c12-68e6-4ac9-90ae-f1af7b978f49"]/div[2]/div[1]/ul[1]/li[4]/span[1]/a[1]')` | xpath (fallback) | Yes |
| li | `page.locator('xpath=//*[@id="5cf51c12-68e6-4ac9-90ae-f1af7b978f49"]/div[2]/div[1]/ul[1]/li[5]')` | xpath (fallback) | Yes |
| a | `page.locator('xpath=//*[@id="5cf51c12-68e6-4ac9-90ae-f1af7b978f49"]/div[2]/div[1]/ul[1]/li[5]/span[1]/a[1]')` | xpath (fallback) | Yes |
| li | `page.locator('xpath=//*[@id="5cf51c12-68e6-4ac9-90ae-f1af7b978f49"]/div[2]/div[1]/ul[1]/li[6]')` | xpath (fallback) | Yes |
| a | `page.locator('xpath=//*[@id="5cf51c12-68e6-4ac9-90ae-f1af7b978f49"]/div[2]/div[1]/ul[1]/li[6]/span[1]/a[1]')` | xpath (fallback) | Yes |
| li | `page.locator('xpath=//*[@id="5cf51c12-68e6-4ac9-90ae-f1af7b978f49"]/div[2]/div[1]/ul[1]/li[7]')` | xpath (fallback) | Yes |
| a | `page.locator('xpath=//*[@id="5cf51c12-68e6-4ac9-90ae-f1af7b978f49"]/div[2]/div[1]/ul[1]/li[7]/span[1]/a[1]')` | xpath (fallback) | Yes |
| li | `page.locator('xpath=//*[@id="5cf51c12-68e6-4ac9-90ae-f1af7b978f49"]/div[2]/div[1]/ul[1]/li[8]')` | xpath (fallback) | Yes |
| a | `page.locator('xpath=//*[@id="5cf51c12-68e6-4ac9-90ae-f1af7b978f49"]/div[2]/div[1]/ul[1]/li[8]/span[1]/a[1]')` | xpath (fallback) | Yes |
| li | `page.locator('xpath=//*[@id="5cf51c12-68e6-4ac9-90ae-f1af7b978f49"]/div[2]/div[1]/ul[1]/li[9]')` | xpath (fallback) | Yes |
| a | `page.locator('xpath=//*[@id="5cf51c12-68e6-4ac9-90ae-f1af7b978f49"]/div[2]/div[1]/ul[1]/li[9]/span[1]/a[1]')` | xpath (fallback) | Yes |
| li | `page.locator('xpath=//*[@id="5cf51c12-68e6-4ac9-90ae-f1af7b978f49"]/div[2]/div[1]/ul[1]/li[10]')` | xpath (fallback) | Yes |
| a | `page.locator('xpath=//*[@id="5cf51c12-68e6-4ac9-90ae-f1af7b978f49"]/div[2]/div[1]/ul[1]/li[10]/span[1]/a[1]')` | xpath (fallback) | Yes |
| li | `page.locator('xpath=//*[@id="5cf51c12-68e6-4ac9-90ae-f1af7b978f49"]/div[2]/div[1]/ul[1]/li[11]')` | xpath (fallback) | Yes |
| a | `page.locator('xpath=//*[@id="5cf51c12-68e6-4ac9-90ae-f1af7b978f49"]/div[2]/div[1]/ul[1]/li[11]/span[1]/a[1]')` | xpath (fallback) | Yes |
| li | `page.locator('xpath=//*[@id="5cf51c12-68e6-4ac9-90ae-f1af7b978f49"]/div[2]/div[1]/ul[1]/li[12]')` | xpath (fallback) | Yes |
| a | `page.locator('xpath=//*[@id="5cf51c12-68e6-4ac9-90ae-f1af7b978f49"]/div[2]/div[1]/ul[1]/li[12]/span[1]/a[1]')` | xpath (fallback) | Yes |
| li | `page.locator('xpath=//*[@id="5cf51c12-68e6-4ac9-90ae-f1af7b978f49"]/div[2]/div[1]/ul[1]/li[13]')` | xpath (fallback) | Yes |
| a | `page.locator('xpath=//*[@id="5cf51c12-68e6-4ac9-90ae-f1af7b978f49"]/div[2]/div[1]/ul[1]/li[13]/span[1]/a[1]')` | xpath (fallback) | Yes |
| li | `page.locator('xpath=//*[@id="5cf51c12-68e6-4ac9-90ae-f1af7b978f49"]/div[2]/div[1]/ul[1]/li[14]')` | xpath (fallback) | Yes |
| a | `page.locator('xpath=//*[@id="5cf51c12-68e6-4ac9-90ae-f1af7b978f49"]/div[2]/div[1]/ul[1]/li[14]/span[1]/a[1]')` | xpath (fallback) | Yes |
| li | `page.locator('xpath=//*[@id="5cf51c12-68e6-4ac9-90ae-f1af7b978f49"]/div[2]/div[1]/ul[1]/li[15]')` | xpath (fallback) | Yes |
| a | `page.locator('xpath=//*[@id="5cf51c12-68e6-4ac9-90ae-f1af7b978f49"]/div[2]/div[1]/ul[1]/li[15]/span[1]/a[1]')` | xpath (fallback) | Yes |
| li | `page.locator('xpath=//*[@id="5cf51c12-68e6-4ac9-90ae-f1af7b978f49"]/div[2]/div[1]/ul[1]/li[16]')` | xpath (fallback) | Yes |
| a | `page.locator('xpath=//*[@id="5cf51c12-68e6-4ac9-90ae-f1af7b978f49"]/div[2]/div[1]/ul[1]/li[16]/span[1]/a[1]')` | xpath (fallback) | Yes |
| li | `page.locator('xpath=//*[@id="5cf51c12-68e6-4ac9-90ae-f1af7b978f49"]/div[2]/div[1]/ul[1]/li[17]')` | xpath (fallback) | Yes |
| a | `page.locator('xpath=//*[@id="5cf51c12-68e6-4ac9-90ae-f1af7b978f49"]/div[2]/div[1]/ul[1]/li[17]/span[1]/a[1]')` | xpath (fallback) | Yes |
| li | `page.locator('xpath=//*[@id="5cf51c12-68e6-4ac9-90ae-f1af7b978f49"]/div[2]/div[1]/ul[1]/li[18]')` | xpath (fallback) | Yes |
| a | `page.locator('xpath=//*[@id="5cf51c12-68e6-4ac9-90ae-f1af7b978f49"]/div[2]/div[1]/ul[1]/li[18]/span[1]/a[1]')` | xpath (fallback) | Yes |
| li | `page.locator('xpath=//*[@id="5cf51c12-68e6-4ac9-90ae-f1af7b978f49"]/div[2]/div[1]/ul[1]/li[19]')` | xpath (fallback) | Yes |
| a | `page.locator('xpath=//*[@id="5cf51c12-68e6-4ac9-90ae-f1af7b978f49"]/div[2]/div[1]/ul[1]/li[19]/span[1]/a[1]')` | xpath (fallback) | Yes |
| li | `page.locator('xpath=//*[@id="5cf51c12-68e6-4ac9-90ae-f1af7b978f49"]/div[2]/div[1]/ul[1]/li[20]')` | xpath (fallback) | Yes |
| a | `page.locator('xpath=//*[@id="5cf51c12-68e6-4ac9-90ae-f1af7b978f49"]/div[2]/div[1]/ul[1]/li[20]/span[1]/a[1]')` | xpath (fallback) | Yes |
| a: Carousel previous slide | `page.locator('xpath=//*[@id="5cf51c12-68e6-4ac9-90ae-f1af7b978f49"]/div[2]/a[1]')` | xpath (fallback) | Yes |
| a: Carousel next slide | `page.locator('xpath=//*[@id="5cf51c12-68e6-4ac9-90ae-f1af7b978f49"]/div[2]/a[2]')` | xpath (fallback) | Yes |
| a: See all | `page.locator('xpath=//*[@id="96423972-c385-4dc1-989f-496eed2eca37"]/div[1]/span[1]/a[1]')` | xpath (fallback) | Yes |
| ul | `page.locator('xpath=//*[@id="96423972-c385-4dc1-989f-496eed2eca37"]/div[2]/div[1]/ul[1]')` | xpath (fallback) | Yes |
| li | `page.locator('xpath=//*[@id="96423972-c385-4dc1-989f-496eed2eca37"]/div[2]/div[1]/ul[1]/li[1]')` | xpath (fallback) | Yes |
| a | `page.locator('xpath=//*[@id="96423972-c385-4dc1-989f-496eed2eca37"]/div[2]/div[1]/ul[1]/li[1]/span[1]/a[1]')` | xpath (fallback) | Yes |
| li | `page.locator('xpath=//*[@id="96423972-c385-4dc1-989f-496eed2eca37"]/div[2]/div[1]/ul[1]/li[2]')` | xpath (fallback) | Yes |
| a | `page.locator('xpath=//*[@id="96423972-c385-4dc1-989f-496eed2eca37"]/div[2]/div[1]/ul[1]/li[2]/span[1]/a[1]')` | xpath (fallback) | Yes |
| li | `page.locator('xpath=//*[@id="96423972-c385-4dc1-989f-496eed2eca37"]/div[2]/div[1]/ul[1]/li[3]')` | xpath (fallback) | Yes |
| a | `page.locator('xpath=//*[@id="96423972-c385-4dc1-989f-496eed2eca37"]/div[2]/div[1]/ul[1]/li[3]/span[1]/a[1]')` | xpath (fallback) | Yes |
| li | `page.locator('xpath=//*[@id="96423972-c385-4dc1-989f-496eed2eca37"]/div[2]/div[1]/ul[1]/li[4]')` | xpath (fallback) | Yes |
| a | `page.locator('xpath=//*[@id="96423972-c385-4dc1-989f-496eed2eca37"]/div[2]/div[1]/ul[1]/li[4]/span[1]/a[1]')` | xpath (fallback) | Yes |
| li | `page.locator('xpath=//*[@id="96423972-c385-4dc1-989f-496eed2eca37"]/div[2]/div[1]/ul[1]/li[5]')` | xpath (fallback) | Yes |
| a | `page.locator('xpath=//*[@id="96423972-c385-4dc1-989f-496eed2eca37"]/div[2]/div[1]/ul[1]/li[5]/span[1]/a[1]')` | xpath (fallback) | Yes |
| li | `page.locator('xpath=//*[@id="96423972-c385-4dc1-989f-496eed2eca37"]/div[2]/div[1]/ul[1]/li[6]')` | xpath (fallback) | Yes |
| a | `page.locator('xpath=//*[@id="96423972-c385-4dc1-989f-496eed2eca37"]/div[2]/div[1]/ul[1]/li[6]/span[1]/a[1]')` | xpath (fallback) | Yes |
| li | `page.locator('xpath=//*[@id="96423972-c385-4dc1-989f-496eed2eca37"]/div[2]/div[1]/ul[1]/li[7]')` | xpath (fallback) | Yes |
| a | `page.locator('xpath=//*[@id="96423972-c385-4dc1-989f-496eed2eca37"]/div[2]/div[1]/ul[1]/li[7]/span[1]/a[1]')` | xpath (fallback) | Yes |
| li | `page.locator('xpath=//*[@id="96423972-c385-4dc1-989f-496eed2eca37"]/div[2]/div[1]/ul[1]/li[8]')` | xpath (fallback) | Yes |
| a | `page.locator('xpath=//*[@id="96423972-c385-4dc1-989f-496eed2eca37"]/div[2]/div[1]/ul[1]/li[8]/span[1]/a[1]')` | xpath (fallback) | Yes |
| li | `page.locator('xpath=//*[@id="96423972-c385-4dc1-989f-496eed2eca37"]/div[2]/div[1]/ul[1]/li[9]')` | xpath (fallback) | Yes |
| a | `page.locator('xpath=//*[@id="96423972-c385-4dc1-989f-496eed2eca37"]/div[2]/div[1]/ul[1]/li[9]/span[1]/a[1]')` | xpath (fallback) | Yes |
| li | `page.locator('xpath=//*[@id="96423972-c385-4dc1-989f-496eed2eca37"]/div[2]/div[1]/ul[1]/li[10]')` | xpath (fallback) | Yes |
| a | `page.locator('xpath=//*[@id="96423972-c385-4dc1-989f-496eed2eca37"]/div[2]/div[1]/ul[1]/li[10]/span[1]/a[1]')` | xpath (fallback) | Yes |
| li | `page.locator('xpath=//*[@id="96423972-c385-4dc1-989f-496eed2eca37"]/div[2]/div[1]/ul[1]/li[11]')` | xpath (fallback) | Yes |
| a | `page.locator('xpath=//*[@id="96423972-c385-4dc1-989f-496eed2eca37"]/div[2]/div[1]/ul[1]/li[11]/span[1]/a[1]')` | xpath (fallback) | Yes |
| li | `page.locator('xpath=//*[@id="96423972-c385-4dc1-989f-496eed2eca37"]/div[2]/div[1]/ul[1]/li[12]')` | xpath (fallback) | Yes |
| a | `page.locator('xpath=//*[@id="96423972-c385-4dc1-989f-496eed2eca37"]/div[2]/div[1]/ul[1]/li[12]/span[1]/a[1]')` | xpath (fallback) | Yes |
| li | `page.locator('xpath=//*[@id="96423972-c385-4dc1-989f-496eed2eca37"]/div[2]/div[1]/ul[1]/li[13]')` | xpath (fallback) | Yes |
| a | `page.locator('xpath=//*[@id="96423972-c385-4dc1-989f-496eed2eca37"]/div[2]/div[1]/ul[1]/li[13]/span[1]/a[1]')` | xpath (fallback) | Yes |
| a | `page.locator('xpath=//*[@id="CardInstanceMRtN7zkrnZXmpWN7WbmosQ"]/div[2]/div[1]/div[1]/a[1]')` | xpath (fallback) | Yes |
| a | `page.locator('xpath=//*[@id="CardInstanceMRtN7zkrnZXmpWN7WbmosQ"]/div[2]/div[1]/div[2]/a[1]')` | xpath (fallback) | Yes |
| a | `page.locator('xpath=//*[@id="CardInstanceMRtN7zkrnZXmpWN7WbmosQ"]/div[2]/div[1]/div[3]/a[1]')` | xpath (fallback) | Yes |
| a | `page.locator('xpath=//*[@id="CardInstanceMRtN7zkrnZXmpWN7WbmosQ"]/div[2]/div[1]/div[4]/a[1]')` | xpath (fallback) | Yes |
| a | `page.locator('xpath=//*[@id="CardInstanceuOwFlri5wt-T4E5h9OXC1g"]/div[2]/div[1]/div[1]/a[1]')` | xpath (fallback) | Yes |
| a | `page.locator('xpath=//*[@id="CardInstanceuOwFlri5wt-T4E5h9OXC1g"]/div[2]/div[1]/div[2]/a[1]')` | xpath (fallback) | Yes |
| a | `page.locator('xpath=//*[@id="CardInstanceuOwFlri5wt-T4E5h9OXC1g"]/div[2]/div[1]/div[3]/a[1]')` | xpath (fallback) | Yes |
| a | `page.locator('xpath=//*[@id="CardInstanceuOwFlri5wt-T4E5h9OXC1g"]/div[2]/div[1]/div[4]/a[1]')` | xpath (fallback) | Yes |
| a: See all offers
See all offers | `page.locator('xpath=//*[@id="CardInstancerugz4c59XjilpqkMGHX4fw"]/a[1]')` | xpath (fallback) | Yes |
| a | `page.locator('xpath=//*[@id="CardInstance9vnfpg_tbov98kKx4q8uqA"]/div[2]/div[1]/div[1]/a[1]')` | xpath (fallback) | Yes |
| a | `page.locator('xpath=//*[@id="CardInstance9vnfpg_tbov98kKx4q8uqA"]/div[2]/div[1]/div[2]/a[1]')` | xpath (fallback) | Yes |
| a | `page.locator('xpath=//*[@id="CardInstance9vnfpg_tbov98kKx4q8uqA"]/div[2]/div[1]/div[3]/a[1]')` | xpath (fallback) | Yes |
| a | `page.locator('xpath=//*[@id="CardInstance9vnfpg_tbov98kKx4q8uqA"]/div[2]/div[1]/div[4]/a[1]')` | xpath (fallback) | Yes |
| a: See all offers | `page.locator('xpath=//*[@id="b4ac8018-36ee-4c8d-9e10-10fd96a4a222"]/div[1]/span[1]/a[1]')` | xpath (fallback) | Yes |
| ul | `page.locator('xpath=//*[@id="b4ac8018-36ee-4c8d-9e10-10fd96a4a222"]/div[2]/div[1]/ul[1]')` | xpath (fallback) | Yes |
| li | `page.locator('xpath=//*[@id="b4ac8018-36ee-4c8d-9e10-10fd96a4a222"]/div[2]/div[1]/ul[1]/li[1]')` | xpath (fallback) | Yes |
| a | `page.locator('xpath=//*[@id="b4ac8018-36ee-4c8d-9e10-10fd96a4a222"]/div[2]/div[1]/ul[1]/li[1]/span[1]/a[1]')` | xpath (fallback) | Yes |
| li | `page.locator('xpath=//*[@id="b4ac8018-36ee-4c8d-9e10-10fd96a4a222"]/div[2]/div[1]/ul[1]/li[2]')` | xpath (fallback) | Yes |
| a | `page.locator('xpath=//*[@id="b4ac8018-36ee-4c8d-9e10-10fd96a4a222"]/div[2]/div[1]/ul[1]/li[2]/span[1]/a[1]')` | xpath (fallback) | Yes |
| li | `page.locator('xpath=//*[@id="b4ac8018-36ee-4c8d-9e10-10fd96a4a222"]/div[2]/div[1]/ul[1]/li[3]')` | xpath (fallback) | Yes |
| a | `page.locator('xpath=//*[@id="b4ac8018-36ee-4c8d-9e10-10fd96a4a222"]/div[2]/div[1]/ul[1]/li[3]/span[1]/a[1]')` | xpath (fallback) | Yes |
| li | `page.locator('xpath=//*[@id="b4ac8018-36ee-4c8d-9e10-10fd96a4a222"]/div[2]/div[1]/ul[1]/li[4]')` | xpath (fallback) | Yes |
| a | `page.locator('xpath=//*[@id="b4ac8018-36ee-4c8d-9e10-10fd96a4a222"]/div[2]/div[1]/ul[1]/li[4]/span[1]/a[1]')` | xpath (fallback) | Yes |
| li | `page.locator('xpath=//*[@id="b4ac8018-36ee-4c8d-9e10-10fd96a4a222"]/div[2]/div[1]/ul[1]/li[5]')` | xpath (fallback) | Yes |
| a | `page.locator('xpath=//*[@id="b4ac8018-36ee-4c8d-9e10-10fd96a4a222"]/div[2]/div[1]/ul[1]/li[5]/span[1]/a[1]')` | xpath (fallback) | Yes |
| li | `page.locator('xpath=//*[@id="b4ac8018-36ee-4c8d-9e10-10fd96a4a222"]/div[2]/div[1]/ul[1]/li[6]')` | xpath (fallback) | Yes |
| a | `page.locator('xpath=//*[@id="b4ac8018-36ee-4c8d-9e10-10fd96a4a222"]/div[2]/div[1]/ul[1]/li[6]/span[1]/a[1]')` | xpath (fallback) | Yes |
| li | `page.locator('xpath=//*[@id="b4ac8018-36ee-4c8d-9e10-10fd96a4a222"]/div[2]/div[1]/ul[1]/li[7]')` | xpath (fallback) | Yes |
| a | `page.locator('xpath=//*[@id="b4ac8018-36ee-4c8d-9e10-10fd96a4a222"]/div[2]/div[1]/ul[1]/li[7]/span[1]/a[1]')` | xpath (fallback) | Yes |
| li | `page.locator('xpath=//*[@id="b4ac8018-36ee-4c8d-9e10-10fd96a4a222"]/div[2]/div[1]/ul[1]/li[8]')` | xpath (fallback) | Yes |
| a | `page.locator('xpath=//*[@id="b4ac8018-36ee-4c8d-9e10-10fd96a4a222"]/div[2]/div[1]/ul[1]/li[8]/span[1]/a[1]')` | xpath (fallback) | Yes |
| li | `page.locator('xpath=//*[@id="b4ac8018-36ee-4c8d-9e10-10fd96a4a222"]/div[2]/div[1]/ul[1]/li[9]')` | xpath (fallback) | Yes |
| a | `page.locator('xpath=//*[@id="b4ac8018-36ee-4c8d-9e10-10fd96a4a222"]/div[2]/div[1]/ul[1]/li[9]/span[1]/a[1]')` | xpath (fallback) | Yes |
| li | `page.locator('xpath=//*[@id="b4ac8018-36ee-4c8d-9e10-10fd96a4a222"]/div[2]/div[1]/ul[1]/li[10]')` | xpath (fallback) | Yes |
| a | `page.locator('xpath=//*[@id="b4ac8018-36ee-4c8d-9e10-10fd96a4a222"]/div[2]/div[1]/ul[1]/li[10]/span[1]/a[1]')` | xpath (fallback) | Yes |
| li | `page.locator('xpath=//*[@id="b4ac8018-36ee-4c8d-9e10-10fd96a4a222"]/div[2]/div[1]/ul[1]/li[11]')` | xpath (fallback) | Yes |
| a | `page.locator('xpath=//*[@id="b4ac8018-36ee-4c8d-9e10-10fd96a4a222"]/div[2]/div[1]/ul[1]/li[11]/span[1]/a[1]')` | xpath (fallback) | Yes |
| li | `page.locator('xpath=//*[@id="b4ac8018-36ee-4c8d-9e10-10fd96a4a222"]/div[2]/div[1]/ul[1]/li[12]')` | xpath (fallback) | Yes |
| a | `page.locator('xpath=//*[@id="b4ac8018-36ee-4c8d-9e10-10fd96a4a222"]/div[2]/div[1]/ul[1]/li[12]/span[1]/a[1]')` | xpath (fallback) | Yes |
| li | `page.locator('xpath=//*[@id="b4ac8018-36ee-4c8d-9e10-10fd96a4a222"]/div[2]/div[1]/ul[1]/li[13]')` | xpath (fallback) | Yes |
| a | `page.locator('xpath=//*[@id="b4ac8018-36ee-4c8d-9e10-10fd96a4a222"]/div[2]/div[1]/ul[1]/li[13]/span[1]/a[1]')` | xpath (fallback) | Yes |
| li | `page.locator('xpath=//*[@id="b4ac8018-36ee-4c8d-9e10-10fd96a4a222"]/div[2]/div[1]/ul[1]/li[14]')` | xpath (fallback) | Yes |
| a | `page.locator('xpath=//*[@id="b4ac8018-36ee-4c8d-9e10-10fd96a4a222"]/div[2]/div[1]/ul[1]/li[14]/span[1]/a[1]')` | xpath (fallback) | Yes |
| li | `page.locator('xpath=//*[@id="b4ac8018-36ee-4c8d-9e10-10fd96a4a222"]/div[2]/div[1]/ul[1]/li[15]')` | xpath (fallback) | Yes |
| a | `page.locator('xpath=//*[@id="b4ac8018-36ee-4c8d-9e10-10fd96a4a222"]/div[2]/div[1]/ul[1]/li[15]/span[1]/a[1]')` | xpath (fallback) | Yes |
| li | `page.locator('xpath=//*[@id="b4ac8018-36ee-4c8d-9e10-10fd96a4a222"]/div[2]/div[1]/ul[1]/li[16]')` | xpath (fallback) | Yes |
| a | `page.locator('xpath=//*[@id="b4ac8018-36ee-4c8d-9e10-10fd96a4a222"]/div[2]/div[1]/ul[1]/li[16]/span[1]/a[1]')` | xpath (fallback) | Yes |
| li | `page.locator('xpath=//*[@id="b4ac8018-36ee-4c8d-9e10-10fd96a4a222"]/div[2]/div[1]/ul[1]/li[17]')` | xpath (fallback) | Yes |
| a | `page.locator('xpath=//*[@id="b4ac8018-36ee-4c8d-9e10-10fd96a4a222"]/div[2]/div[1]/ul[1]/li[17]/span[1]/a[1]')` | xpath (fallback) | Yes |
| li | `page.locator('xpath=//*[@id="b4ac8018-36ee-4c8d-9e10-10fd96a4a222"]/div[2]/div[1]/ul[1]/li[18]')` | xpath (fallback) | Yes |
| a | `page.locator('xpath=//*[@id="b4ac8018-36ee-4c8d-9e10-10fd96a4a222"]/div[2]/div[1]/ul[1]/li[18]/span[1]/a[1]')` | xpath (fallback) | Yes |
| li | `page.locator('xpath=//*[@id="b4ac8018-36ee-4c8d-9e10-10fd96a4a222"]/div[2]/div[1]/ul[1]/li[19]')` | xpath (fallback) | Yes |
| a | `page.locator('xpath=//*[@id="b4ac8018-36ee-4c8d-9e10-10fd96a4a222"]/div[2]/div[1]/ul[1]/li[19]/span[1]/a[1]')` | xpath (fallback) | Yes |
| a: See more | `page.locator('xpath=//*[@id="c6a5e6e3-ebea-4827-bbf7-237f870fc855"]/div[1]/span[1]/a[1]')` | xpath (fallback) | Yes |
| ul | `page.locator('xpath=//*[@id="c6a5e6e3-ebea-4827-bbf7-237f870fc855"]/div[2]/div[1]/ul[1]')` | xpath (fallback) | Yes |
| li | `page.locator('xpath=//*[@id="c6a5e6e3-ebea-4827-bbf7-237f870fc855"]/div[2]/div[1]/ul[1]/li[1]')` | xpath (fallback) | Yes |
| a | `page.locator('xpath=//*[@id="c6a5e6e3-ebea-4827-bbf7-237f870fc855"]/div[2]/div[1]/ul[1]/li[1]/span[1]/a[1]')` | xpath (fallback) | Yes |
| li | `page.locator('xpath=//*[@id="c6a5e6e3-ebea-4827-bbf7-237f870fc855"]/div[2]/div[1]/ul[1]/li[2]')` | xpath (fallback) | Yes |
| a | `page.locator('xpath=//*[@id="c6a5e6e3-ebea-4827-bbf7-237f870fc855"]/div[2]/div[1]/ul[1]/li[2]/span[1]/a[1]')` | xpath (fallback) | Yes |
| li | `page.locator('xpath=//*[@id="c6a5e6e3-ebea-4827-bbf7-237f870fc855"]/div[2]/div[1]/ul[1]/li[3]')` | xpath (fallback) | Yes |
| a | `page.locator('xpath=//*[@id="c6a5e6e3-ebea-4827-bbf7-237f870fc855"]/div[2]/div[1]/ul[1]/li[3]/span[1]/a[1]')` | xpath (fallback) | Yes |
| li | `page.locator('xpath=//*[@id="c6a5e6e3-ebea-4827-bbf7-237f870fc855"]/div[2]/div[1]/ul[1]/li[4]')` | xpath (fallback) | Yes |
| a | `page.locator('xpath=//*[@id="c6a5e6e3-ebea-4827-bbf7-237f870fc855"]/div[2]/div[1]/ul[1]/li[4]/span[1]/a[1]')` | xpath (fallback) | Yes |
| li | `page.locator('xpath=//*[@id="c6a5e6e3-ebea-4827-bbf7-237f870fc855"]/div[2]/div[1]/ul[1]/li[5]')` | xpath (fallback) | Yes |
| a | `page.locator('xpath=//*[@id="c6a5e6e3-ebea-4827-bbf7-237f870fc855"]/div[2]/div[1]/ul[1]/li[5]/span[1]/a[1]')` | xpath (fallback) | Yes |
| li | `page.locator('xpath=//*[@id="c6a5e6e3-ebea-4827-bbf7-237f870fc855"]/div[2]/div[1]/ul[1]/li[6]')` | xpath (fallback) | Yes |
| a | `page.locator('xpath=//*[@id="c6a5e6e3-ebea-4827-bbf7-237f870fc855"]/div[2]/div[1]/ul[1]/li[6]/span[1]/a[1]')` | xpath (fallback) | Yes |
| li | `page.locator('xpath=//*[@id="c6a5e6e3-ebea-4827-bbf7-237f870fc855"]/div[2]/div[1]/ul[1]/li[7]')` | xpath (fallback) | Yes |
| a | `page.locator('xpath=//*[@id="c6a5e6e3-ebea-4827-bbf7-237f870fc855"]/div[2]/div[1]/ul[1]/li[7]/span[1]/a[1]')` | xpath (fallback) | Yes |
| li | `page.locator('xpath=//*[@id="c6a5e6e3-ebea-4827-bbf7-237f870fc855"]/div[2]/div[1]/ul[1]/li[8]')` | xpath (fallback) | Yes |
| a | `page.locator('xpath=//*[@id="c6a5e6e3-ebea-4827-bbf7-237f870fc855"]/div[2]/div[1]/ul[1]/li[8]/span[1]/a[1]')` | xpath (fallback) | Yes |
| li | `page.locator('xpath=//*[@id="c6a5e6e3-ebea-4827-bbf7-237f870fc855"]/div[2]/div[1]/ul[1]/li[9]')` | xpath (fallback) | Yes |
| a | `page.locator('xpath=//*[@id="c6a5e6e3-ebea-4827-bbf7-237f870fc855"]/div[2]/div[1]/ul[1]/li[9]/span[1]/a[1]')` | xpath (fallback) | Yes |
| li | `page.locator('xpath=//*[@id="c6a5e6e3-ebea-4827-bbf7-237f870fc855"]/div[2]/div[1]/ul[1]/li[10]')` | xpath (fallback) | Yes |
| a | `page.locator('xpath=//*[@id="c6a5e6e3-ebea-4827-bbf7-237f870fc855"]/div[2]/div[1]/ul[1]/li[10]/span[1]/a[1]')` | xpath (fallback) | Yes |
| li | `page.locator('xpath=//*[@id="c6a5e6e3-ebea-4827-bbf7-237f870fc855"]/div[2]/div[1]/ul[1]/li[11]')` | xpath (fallback) | Yes |
| a | `page.locator('xpath=//*[@id="c6a5e6e3-ebea-4827-bbf7-237f870fc855"]/div[2]/div[1]/ul[1]/li[11]/span[1]/a[1]')` | xpath (fallback) | Yes |
| li | `page.locator('xpath=//*[@id="c6a5e6e3-ebea-4827-bbf7-237f870fc855"]/div[2]/div[1]/ul[1]/li[12]')` | xpath (fallback) | Yes |
| a | `page.locator('xpath=//*[@id="c6a5e6e3-ebea-4827-bbf7-237f870fc855"]/div[2]/div[1]/ul[1]/li[12]/span[1]/a[1]')` | xpath (fallback) | Yes |
| li | `page.locator('xpath=//*[@id="c6a5e6e3-ebea-4827-bbf7-237f870fc855"]/div[2]/div[1]/ul[1]/li[13]')` | xpath (fallback) | Yes |
| a | `page.locator('xpath=//*[@id="c6a5e6e3-ebea-4827-bbf7-237f870fc855"]/div[2]/div[1]/ul[1]/li[13]/span[1]/a[1]')` | xpath (fallback) | Yes |
| li | `page.locator('xpath=//*[@id="c6a5e6e3-ebea-4827-bbf7-237f870fc855"]/div[2]/div[1]/ul[1]/li[14]')` | xpath (fallback) | Yes |
| a | `page.locator('xpath=//*[@id="c6a5e6e3-ebea-4827-bbf7-237f870fc855"]/div[2]/div[1]/ul[1]/li[14]/span[1]/a[1]')` | xpath (fallback) | Yes |
| li | `page.locator('xpath=//*[@id="c6a5e6e3-ebea-4827-bbf7-237f870fc855"]/div[2]/div[1]/ul[1]/li[15]')` | xpath (fallback) | Yes |
| a | `page.locator('xpath=//*[@id="c6a5e6e3-ebea-4827-bbf7-237f870fc855"]/div[2]/div[1]/ul[1]/li[15]/span[1]/a[1]')` | xpath (fallback) | Yes |
| li | `page.locator('xpath=//*[@id="c6a5e6e3-ebea-4827-bbf7-237f870fc855"]/div[2]/div[1]/ul[1]/li[16]')` | xpath (fallback) | Yes |
| a | `page.locator('xpath=//*[@id="c6a5e6e3-ebea-4827-bbf7-237f870fc855"]/div[2]/div[1]/ul[1]/li[16]/span[1]/a[1]')` | xpath (fallback) | Yes |
| li | `page.locator('xpath=//*[@id="c6a5e6e3-ebea-4827-bbf7-237f870fc855"]/div[2]/div[1]/ul[1]/li[17]')` | xpath (fallback) | Yes |
| a | `page.locator('xpath=//*[@id="c6a5e6e3-ebea-4827-bbf7-237f870fc855"]/div[2]/div[1]/ul[1]/li[17]/span[1]/a[1]')` | xpath (fallback) | Yes |
| li | `page.locator('xpath=//*[@id="c6a5e6e3-ebea-4827-bbf7-237f870fc855"]/div[2]/div[1]/ul[1]/li[18]')` | xpath (fallback) | Yes |
| a | `page.locator('xpath=//*[@id="c6a5e6e3-ebea-4827-bbf7-237f870fc855"]/div[2]/div[1]/ul[1]/li[18]/span[1]/a[1]')` | xpath (fallback) | Yes |
| li | `page.locator('xpath=//*[@id="c6a5e6e3-ebea-4827-bbf7-237f870fc855"]/div[2]/div[1]/ul[1]/li[19]')` | xpath (fallback) | Yes |
| a | `page.locator('xpath=//*[@id="c6a5e6e3-ebea-4827-bbf7-237f870fc855"]/div[2]/div[1]/ul[1]/li[19]/span[1]/a[1]')` | xpath (fallback) | Yes |
| li | `page.locator('xpath=//*[@id="c6a5e6e3-ebea-4827-bbf7-237f870fc855"]/div[2]/div[1]/ul[1]/li[20]')` | xpath (fallback) | Yes |
| a | `page.locator('xpath=//*[@id="c6a5e6e3-ebea-4827-bbf7-237f870fc855"]/div[2]/div[1]/ul[1]/li[20]/span[1]/a[1]')` | xpath (fallback) | Yes |
| li | `page.locator('xpath=//*[@id="c6a5e6e3-ebea-4827-bbf7-237f870fc855"]/div[2]/div[1]/ul[1]/li[21]')` | xpath (fallback) | Yes |
| a | `page.locator('xpath=//*[@id="c6a5e6e3-ebea-4827-bbf7-237f870fc855"]/div[2]/div[1]/ul[1]/li[21]/span[1]/a[1]')` | xpath (fallback) | Yes |
| li | `page.locator('xpath=//*[@id="c6a5e6e3-ebea-4827-bbf7-237f870fc855"]/div[2]/div[1]/ul[1]/li[22]')` | xpath (fallback) | Yes |
| a | `page.locator('xpath=//*[@id="c6a5e6e3-ebea-4827-bbf7-237f870fc855"]/div[2]/div[1]/ul[1]/li[22]/span[1]/a[1]')` | xpath (fallback) | Yes |
| li | `page.locator('xpath=//*[@id="c6a5e6e3-ebea-4827-bbf7-237f870fc855"]/div[2]/div[1]/ul[1]/li[23]')` | xpath (fallback) | Yes |
| a | `page.locator('xpath=//*[@id="c6a5e6e3-ebea-4827-bbf7-237f870fc855"]/div[2]/div[1]/ul[1]/li[23]/span[1]/a[1]')` | xpath (fallback) | Yes |
| li | `page.locator('xpath=//*[@id="c6a5e6e3-ebea-4827-bbf7-237f870fc855"]/div[2]/div[1]/ul[1]/li[24]')` | xpath (fallback) | Yes |
| a | `page.locator('xpath=//*[@id="c6a5e6e3-ebea-4827-bbf7-237f870fc855"]/div[2]/div[1]/ul[1]/li[24]/span[1]/a[1]')` | xpath (fallback) | Yes |
| li | `page.locator('xpath=//*[@id="c6a5e6e3-ebea-4827-bbf7-237f870fc855"]/div[2]/div[1]/ul[1]/li[25]')` | xpath (fallback) | Yes |
| a | `page.locator('xpath=//*[@id="c6a5e6e3-ebea-4827-bbf7-237f870fc855"]/div[2]/div[1]/ul[1]/li[25]/span[1]/a[1]')` | xpath (fallback) | Yes |
| li | `page.locator('xpath=//*[@id="c6a5e6e3-ebea-4827-bbf7-237f870fc855"]/div[2]/div[1]/ul[1]/li[26]')` | xpath (fallback) | Yes |
| a | `page.locator('xpath=//*[@id="c6a5e6e3-ebea-4827-bbf7-237f870fc855"]/div[2]/div[1]/ul[1]/li[26]/span[1]/a[1]')` | xpath (fallback) | Yes |
| li | `page.locator('xpath=//*[@id="c6a5e6e3-ebea-4827-bbf7-237f870fc855"]/div[2]/div[1]/ul[1]/li[27]')` | xpath (fallback) | Yes |
| a | `page.locator('xpath=//*[@id="c6a5e6e3-ebea-4827-bbf7-237f870fc855"]/div[2]/div[1]/ul[1]/li[27]/span[1]/a[1]')` | xpath (fallback) | Yes |
| li | `page.locator('xpath=//*[@id="c6a5e6e3-ebea-4827-bbf7-237f870fc855"]/div[2]/div[1]/ul[1]/li[28]')` | xpath (fallback) | Yes |
| a | `page.locator('xpath=//*[@id="c6a5e6e3-ebea-4827-bbf7-237f870fc855"]/div[2]/div[1]/ul[1]/li[28]/span[1]/a[1]')` | xpath (fallback) | Yes |
| li | `page.locator('xpath=//*[@id="c6a5e6e3-ebea-4827-bbf7-237f870fc855"]/div[2]/div[1]/ul[1]/li[29]')` | xpath (fallback) | Yes |
| a | `page.locator('xpath=//*[@id="c6a5e6e3-ebea-4827-bbf7-237f870fc855"]/div[2]/div[1]/ul[1]/li[29]/span[1]/a[1]')` | xpath (fallback) | Yes |
| a | `page.locator('xpath=//*[@id="CardInstanceiBoRYTIZJkiZdqBme9eDLw"]/div[2]/div[1]/div[1]/a[1]')` | xpath (fallback) | Yes |
| a | `page.locator('xpath=//*[@id="CardInstanceiBoRYTIZJkiZdqBme9eDLw"]/div[2]/div[1]/div[2]/a[1]')` | xpath (fallback) | Yes |
| a | `page.locator('xpath=//*[@id="CardInstanceiBoRYTIZJkiZdqBme9eDLw"]/div[2]/div[1]/div[3]/a[1]')` | xpath (fallback) | Yes |
| a | `page.locator('xpath=//*[@id="CardInstanceiBoRYTIZJkiZdqBme9eDLw"]/div[2]/div[1]/div[4]/a[1]')` | xpath (fallback) | Yes |
| a: Explore more
Explore more | `page.get_by_role("link", name="Customers’ Most-Loved Fashion for you - Explore more")` | role | No |
| a: Visit the store
Visit the store | `page.locator('xpath=//*[@id="CardInstance39DSVcDQ-3STBwzxKrnuBA"]/a[1]')` | xpath (fallback) | Yes |
| a | `page.locator('xpath=//*[@id="CardInstanceKVMRWlhCz-PVcREJdV9FbQ"]/div[2]/div[1]/div[1]/a[1]')` | xpath (fallback) | Yes |
| a | `page.locator('xpath=//*[@id="CardInstanceKVMRWlhCz-PVcREJdV9FbQ"]/div[2]/div[1]/div[2]/a[1]')` | xpath (fallback) | Yes |
| a | `page.locator('xpath=//*[@id="CardInstanceKVMRWlhCz-PVcREJdV9FbQ"]/div[2]/div[1]/div[3]/a[1]')` | xpath (fallback) | Yes |
| a | `page.locator('xpath=//*[@id="CardInstanceKVMRWlhCz-PVcREJdV9FbQ"]/div[2]/div[1]/div[4]/a[1]')` | xpath (fallback) | Yes |
| a | `page.locator('xpath=//*[@id="CardInstanceRobmciZLUojVnADNNlzNrA"]/div[2]/div[1]/div[1]/a[1]')` | xpath (fallback) | Yes |
| a | `page.locator('xpath=//*[@id="CardInstanceRobmciZLUojVnADNNlzNrA"]/div[2]/div[1]/div[2]/a[1]')` | xpath (fallback) | Yes |
| a | `page.locator('xpath=//*[@id="CardInstanceRobmciZLUojVnADNNlzNrA"]/div[2]/div[1]/div[3]/a[1]')` | xpath (fallback) | Yes |
| a | `page.locator('xpath=//*[@id="CardInstanceRobmciZLUojVnADNNlzNrA"]/div[2]/div[1]/div[4]/a[1]')` | xpath (fallback) | Yes |
| a: See more | `page.locator('xpath=//*[@id="c10ace81-458f-487e-b1f6-b4b561db028e"]/div[1]/span[1]/a[1]')` | xpath (fallback) | Yes |
| ul | `page.locator('xpath=//*[@id="c10ace81-458f-487e-b1f6-b4b561db028e"]/div[2]/div[1]/ul[1]')` | xpath (fallback) | Yes |
| li | `page.locator('xpath=//*[@id="c10ace81-458f-487e-b1f6-b4b561db028e"]/div[2]/div[1]/ul[1]/li[1]')` | xpath (fallback) | Yes |
| a | `page.locator('xpath=//*[@id="c10ace81-458f-487e-b1f6-b4b561db028e"]/div[2]/div[1]/ul[1]/li[1]/span[1]/a[1]')` | xpath (fallback) | Yes |
| li | `page.locator('xpath=//*[@id="c10ace81-458f-487e-b1f6-b4b561db028e"]/div[2]/div[1]/ul[1]/li[2]')` | xpath (fallback) | Yes |
| a | `page.locator('xpath=//*[@id="c10ace81-458f-487e-b1f6-b4b561db028e"]/div[2]/div[1]/ul[1]/li[2]/span[1]/a[1]')` | xpath (fallback) | Yes |
| li | `page.locator('xpath=//*[@id="c10ace81-458f-487e-b1f6-b4b561db028e"]/div[2]/div[1]/ul[1]/li[3]')` | xpath (fallback) | Yes |
| a | `page.locator('xpath=//*[@id="c10ace81-458f-487e-b1f6-b4b561db028e"]/div[2]/div[1]/ul[1]/li[3]/span[1]/a[1]')` | xpath (fallback) | Yes |
| li | `page.locator('xpath=//*[@id="c10ace81-458f-487e-b1f6-b4b561db028e"]/div[2]/div[1]/ul[1]/li[4]')` | xpath (fallback) | Yes |
| a | `page.locator('xpath=//*[@id="c10ace81-458f-487e-b1f6-b4b561db028e"]/div[2]/div[1]/ul[1]/li[4]/span[1]/a[1]')` | xpath (fallback) | Yes |
| li | `page.locator('xpath=//*[@id="c10ace81-458f-487e-b1f6-b4b561db028e"]/div[2]/div[1]/ul[1]/li[5]')` | xpath (fallback) | Yes |
| a | `page.locator('xpath=//*[@id="c10ace81-458f-487e-b1f6-b4b561db028e"]/div[2]/div[1]/ul[1]/li[5]/span[1]/a[1]')` | xpath (fallback) | Yes |
| li | `page.locator('xpath=//*[@id="c10ace81-458f-487e-b1f6-b4b561db028e"]/div[2]/div[1]/ul[1]/li[6]')` | xpath (fallback) | Yes |
| a | `page.locator('xpath=//*[@id="c10ace81-458f-487e-b1f6-b4b561db028e"]/div[2]/div[1]/ul[1]/li[6]/span[1]/a[1]')` | xpath (fallback) | Yes |
| li | `page.locator('xpath=//*[@id="c10ace81-458f-487e-b1f6-b4b561db028e"]/div[2]/div[1]/ul[1]/li[7]')` | xpath (fallback) | Yes |
| a | `page.locator('xpath=//*[@id="c10ace81-458f-487e-b1f6-b4b561db028e"]/div[2]/div[1]/ul[1]/li[7]/span[1]/a[1]')` | xpath (fallback) | Yes |
| li | `page.locator('xpath=//*[@id="c10ace81-458f-487e-b1f6-b4b561db028e"]/div[2]/div[1]/ul[1]/li[8]')` | xpath (fallback) | Yes |
| a | `page.locator('xpath=//*[@id="c10ace81-458f-487e-b1f6-b4b561db028e"]/div[2]/div[1]/ul[1]/li[8]/span[1]/a[1]')` | xpath (fallback) | Yes |
| li | `page.locator('xpath=//*[@id="c10ace81-458f-487e-b1f6-b4b561db028e"]/div[2]/div[1]/ul[1]/li[9]')` | xpath (fallback) | Yes |
| a | `page.locator('xpath=//*[@id="c10ace81-458f-487e-b1f6-b4b561db028e"]/div[2]/div[1]/ul[1]/li[9]/span[1]/a[1]')` | xpath (fallback) | Yes |
| li | `page.locator('xpath=//*[@id="c10ace81-458f-487e-b1f6-b4b561db028e"]/div[2]/div[1]/ul[1]/li[10]')` | xpath (fallback) | Yes |
| a | `page.locator('xpath=//*[@id="c10ace81-458f-487e-b1f6-b4b561db028e"]/div[2]/div[1]/ul[1]/li[10]/span[1]/a[1]')` | xpath (fallback) | Yes |
| li | `page.locator('xpath=//*[@id="c10ace81-458f-487e-b1f6-b4b561db028e"]/div[2]/div[1]/ul[1]/li[11]')` | xpath (fallback) | Yes |
| a | `page.locator('xpath=//*[@id="c10ace81-458f-487e-b1f6-b4b561db028e"]/div[2]/div[1]/ul[1]/li[11]/span[1]/a[1]')` | xpath (fallback) | Yes |
| li | `page.locator('xpath=//*[@id="c10ace81-458f-487e-b1f6-b4b561db028e"]/div[2]/div[1]/ul[1]/li[12]')` | xpath (fallback) | Yes |
| a | `page.locator('xpath=//*[@id="c10ace81-458f-487e-b1f6-b4b561db028e"]/div[2]/div[1]/ul[1]/li[12]/span[1]/a[1]')` | xpath (fallback) | Yes |
| li | `page.locator('xpath=//*[@id="c10ace81-458f-487e-b1f6-b4b561db028e"]/div[2]/div[1]/ul[1]/li[13]')` | xpath (fallback) | Yes |
| a | `page.locator('xpath=//*[@id="c10ace81-458f-487e-b1f6-b4b561db028e"]/div[2]/div[1]/ul[1]/li[13]/span[1]/a[1]')` | xpath (fallback) | Yes |
| li | `page.locator('xpath=//*[@id="c10ace81-458f-487e-b1f6-b4b561db028e"]/div[2]/div[1]/ul[1]/li[14]')` | xpath (fallback) | Yes |
| a | `page.locator('xpath=//*[@id="c10ace81-458f-487e-b1f6-b4b561db028e"]/div[2]/div[1]/ul[1]/li[14]/span[1]/a[1]')` | xpath (fallback) | Yes |
| li | `page.locator('xpath=//*[@id="c10ace81-458f-487e-b1f6-b4b561db028e"]/div[2]/div[1]/ul[1]/li[15]')` | xpath (fallback) | Yes |
| a | `page.locator('xpath=//*[@id="c10ace81-458f-487e-b1f6-b4b561db028e"]/div[2]/div[1]/ul[1]/li[15]/span[1]/a[1]')` | xpath (fallback) | Yes |
| li | `page.locator('xpath=//*[@id="c10ace81-458f-487e-b1f6-b4b561db028e"]/div[2]/div[1]/ul[1]/li[16]')` | xpath (fallback) | Yes |
| a | `page.locator('xpath=//*[@id="c10ace81-458f-487e-b1f6-b4b561db028e"]/div[2]/div[1]/ul[1]/li[16]/span[1]/a[1]')` | xpath (fallback) | Yes |
| li | `page.locator('xpath=//*[@id="c10ace81-458f-487e-b1f6-b4b561db028e"]/div[2]/div[1]/ul[1]/li[17]')` | xpath (fallback) | Yes |
| a | `page.locator('xpath=//*[@id="c10ace81-458f-487e-b1f6-b4b561db028e"]/div[2]/div[1]/ul[1]/li[17]/span[1]/a[1]')` | xpath (fallback) | Yes |
| li | `page.locator('xpath=//*[@id="c10ace81-458f-487e-b1f6-b4b561db028e"]/div[2]/div[1]/ul[1]/li[18]')` | xpath (fallback) | Yes |
| a | `page.locator('xpath=//*[@id="c10ace81-458f-487e-b1f6-b4b561db028e"]/div[2]/div[1]/ul[1]/li[18]/span[1]/a[1]')` | xpath (fallback) | Yes |
| li | `page.locator('xpath=//*[@id="c10ace81-458f-487e-b1f6-b4b561db028e"]/div[2]/div[1]/ul[1]/li[19]')` | xpath (fallback) | Yes |
| a | `page.locator('xpath=//*[@id="c10ace81-458f-487e-b1f6-b4b561db028e"]/div[2]/div[1]/ul[1]/li[19]/span[1]/a[1]')` | xpath (fallback) | Yes |
| li | `page.locator('xpath=//*[@id="c10ace81-458f-487e-b1f6-b4b561db028e"]/div[2]/div[1]/ul[1]/li[20]')` | xpath (fallback) | Yes |
| a | `page.locator('xpath=//*[@id="c10ace81-458f-487e-b1f6-b4b561db028e"]/div[2]/div[1]/ul[1]/li[20]/span[1]/a[1]')` | xpath (fallback) | Yes |
| li | `page.locator('xpath=//*[@id="c10ace81-458f-487e-b1f6-b4b561db028e"]/div[2]/div[1]/ul[1]/li[21]')` | xpath (fallback) | Yes |
| a | `page.locator('xpath=//*[@id="c10ace81-458f-487e-b1f6-b4b561db028e"]/div[2]/div[1]/ul[1]/li[21]/span[1]/a[1]')` | xpath (fallback) | Yes |
| li | `page.locator('xpath=//*[@id="c10ace81-458f-487e-b1f6-b4b561db028e"]/div[2]/div[1]/ul[1]/li[22]')` | xpath (fallback) | Yes |
| a | `page.locator('xpath=//*[@id="c10ace81-458f-487e-b1f6-b4b561db028e"]/div[2]/div[1]/ul[1]/li[22]/span[1]/a[1]')` | xpath (fallback) | Yes |
| li | `page.locator('xpath=//*[@id="c10ace81-458f-487e-b1f6-b4b561db028e"]/div[2]/div[1]/ul[1]/li[23]')` | xpath (fallback) | Yes |
| a | `page.locator('xpath=//*[@id="c10ace81-458f-487e-b1f6-b4b561db028e"]/div[2]/div[1]/ul[1]/li[23]/span[1]/a[1]')` | xpath (fallback) | Yes |
| li | `page.locator('xpath=//*[@id="c10ace81-458f-487e-b1f6-b4b561db028e"]/div[2]/div[1]/ul[1]/li[24]')` | xpath (fallback) | Yes |
| a | `page.locator('xpath=//*[@id="c10ace81-458f-487e-b1f6-b4b561db028e"]/div[2]/div[1]/ul[1]/li[24]/span[1]/a[1]')` | xpath (fallback) | Yes |
| li | `page.locator('xpath=//*[@id="c10ace81-458f-487e-b1f6-b4b561db028e"]/div[2]/div[1]/ul[1]/li[25]')` | xpath (fallback) | Yes |
| a | `page.locator('xpath=//*[@id="c10ace81-458f-487e-b1f6-b4b561db028e"]/div[2]/div[1]/ul[1]/li[25]/span[1]/a[1]')` | xpath (fallback) | Yes |
| li | `page.locator('xpath=//*[@id="c10ace81-458f-487e-b1f6-b4b561db028e"]/div[2]/div[1]/ul[1]/li[26]')` | xpath (fallback) | Yes |
| a | `page.locator('xpath=//*[@id="c10ace81-458f-487e-b1f6-b4b561db028e"]/div[2]/div[1]/ul[1]/li[26]/span[1]/a[1]')` | xpath (fallback) | Yes |
| li | `page.locator('xpath=//*[@id="c10ace81-458f-487e-b1f6-b4b561db028e"]/div[2]/div[1]/ul[1]/li[27]')` | xpath (fallback) | Yes |
| a | `page.locator('xpath=//*[@id="c10ace81-458f-487e-b1f6-b4b561db028e"]/div[2]/div[1]/ul[1]/li[27]/span[1]/a[1]')` | xpath (fallback) | Yes |
| li | `page.locator('xpath=//*[@id="c10ace81-458f-487e-b1f6-b4b561db028e"]/div[2]/div[1]/ul[1]/li[28]')` | xpath (fallback) | Yes |
| a | `page.locator('xpath=//*[@id="c10ace81-458f-487e-b1f6-b4b561db028e"]/div[2]/div[1]/ul[1]/li[28]/span[1]/a[1]')` | xpath (fallback) | Yes |
| li | `page.locator('xpath=//*[@id="c10ace81-458f-487e-b1f6-b4b561db028e"]/div[2]/div[1]/ul[1]/li[29]')` | xpath (fallback) | Yes |
| a | `page.locator('xpath=//*[@id="c10ace81-458f-487e-b1f6-b4b561db028e"]/div[2]/div[1]/ul[1]/li[29]/span[1]/a[1]')` | xpath (fallback) | Yes |
| li | `page.locator('xpath=//*[@id="c10ace81-458f-487e-b1f6-b4b561db028e"]/div[2]/div[1]/ul[1]/li[30]')` | xpath (fallback) | Yes |
| a | `page.locator('xpath=//*[@id="c10ace81-458f-487e-b1f6-b4b561db028e"]/div[2]/div[1]/ul[1]/li[30]/span[1]/a[1]')` | xpath (fallback) | Yes |
| div: Amazon LIVE - Watch, Chat & Shop LIVESee | `page.locator('xpath=//*[@id="live-flagship-root"]/div[1]')` | xpath (fallback) | Yes |
| a: See more from Amazon Live | `page.get_by_role("link", name="See more from Amazon Live")` | role | No |
| div: Live video “Mobile Mania Top Smartphones for All Budgets” from Tech Swami | `page.get_by_role("region", name="Live video “Mobile Mania Top Smartphones for All Budgets” from Tech Swami")` | role | No |
| div | `page.locator('xpath=//*[@id="vjs_video_3"]/div[2]')` | xpath (fallback) | Yes |
| div | `page.locator('xpath=//*[@id="vjs_video_3"]/div[2]/div[1]')` | xpath (fallback) | Yes |
| div | `page.locator('xpath=//*[@id="vjs_video_3"]/div[2]/div[2]')` | xpath (fallback) | Yes |
| div: LIVE
1.4K
Mobile Mania: Top Smartphones | `page.locator('[data-testid="DesktopFlexWatchNowOverlayTemplate"]')` | test-id (data-testid) | No |
| svg | `page.locator('[data-testid="LiveViewersImage"]')` | test-id (data-testid) | No |
| div: Watch now | `page.locator('[data-testid="OverlayClick"]')` | test-id (data-testid) | No |
| button: Watch now | `page.get_by_role("button", name="Tap Watch now to see broadcast in immersive view")` | role | No |
| div | `page.locator('xpath=//*[@id="live-flagship-root"]/div[1]/div[2]/div[1]/div[1]/div[2]/div[5]/div[1]')` | xpath (fallback) | Yes |
| button: Unmute | `page.get_by_role("button", name="Unmute")` | role | No |
| button: Play | `page.locator('xpath=//*[@id="live-flagship-root"]/div[1]/div[2]/div[1]/div[1]/div[2]/div[5]/button[1]')` | xpath (fallback) | Yes |
| div | `page.locator('xpath=//*[@id="live-flagship-root"]/div[1]/div[2]/div[1]/div[1]/div[2]/div[6]')` | xpath (fallback) | Yes |
| a: Earns commissions | `page.get_by_role("button", name="Earns commissions")` | role | No |
| div: Samsung Galaxy S26 Ultra 5G (Cobalt Viol | `page.locator('xpath=//*[@id="live-flagship-root"]/div[1]/div[2]/div[2]/div[1]/div[1]')` | xpath (fallback) | Yes |
| div | `page.locator('xpath=//*[@id="live-flagship-root"]/div[1]/div[2]/div[2]/div[1]/div[1]/div[1]')` | xpath (fallback) | Yes |
| div: Samsung Galaxy S26 Ultra 5G (Cobalt Viol | `page.locator('xpath=//*[@id="live-flagship-root"]/div[1]/div[2]/div[2]/div[1]/div[1]/div[2]')` | xpath (fallback) | Yes |
| div: Samsung Galaxy S26 Ultra 5G (Cobalt Viol | `page.locator('xpath=//*[@id="live-flagship-root"]/div[1]/div[2]/div[2]/div[1]/div[1]/div[2]/div[1]')` | xpath (fallback) | Yes |
| div | `page.locator('xpath=//*[@id="live-flagship-root"]/div[1]/div[2]/div[2]/div[1]/div[1]/div[2]/div[1]/div[1]/div[1]')` | xpath (fallback) | Yes |
| div: Samsung Galaxy S26 Ultra 5G (Cobalt Viol | `page.locator('xpath=//*[@id="live-flagship-root"]/div[1]/div[2]/div[2]/div[1]/div[1]/div[2]/div[1]/div[3]/div[1]/div[1]')` | xpath (fallback) | Yes |
| div: iQOO 15R (Dark Knight, 8GB RAM, 256GB St | `page.locator('xpath=//*[@id="live-flagship-root"]/div[1]/div[2]/div[2]/div[1]/div[1]/div[3]')` | xpath (fallback) | Yes |
| div: iQOO 15R (Dark Knight, 8GB RAM, 256GB St | `page.locator('xpath=//*[@id="live-flagship-root"]/div[1]/div[2]/div[2]/div[1]/div[1]/div[3]/div[1]')` | xpath (fallback) | Yes |
| div | `page.locator('xpath=//*[@id="live-flagship-root"]/div[1]/div[2]/div[2]/div[1]/div[1]/div[3]/div[1]/div[1]/div[1]')` | xpath (fallback) | Yes |
| div: iQOO 15R (Dark Knight, 8GB RAM, 256GB St | `page.locator('xpath=//*[@id="live-flagship-root"]/div[1]/div[2]/div[2]/div[1]/div[1]/div[3]/div[1]/div[3]/div[1]/div[1]')` | xpath (fallback) | Yes |
| div: Apple iPhone 17 Pro 512 GB: 15.93 cm (6. | `page.locator('xpath=//*[@id="live-flagship-root"]/div[1]/div[2]/div[2]/div[1]/div[1]/div[4]')` | xpath (fallback) | Yes |
| div: Apple iPhone 17 Pro 512 GB: 15.93 cm (6. | `page.locator('xpath=//*[@id="live-flagship-root"]/div[1]/div[2]/div[2]/div[1]/div[1]/div[4]/div[1]')` | xpath (fallback) | Yes |
| div | `page.locator('xpath=//*[@id="live-flagship-root"]/div[1]/div[2]/div[2]/div[1]/div[1]/div[4]/div[1]/div[1]/div[1]')` | xpath (fallback) | Yes |
| div: Apple iPhone 17 Pro 512 GB: 15.93 cm (6. | `page.locator('xpath=//*[@id="live-flagship-root"]/div[1]/div[2]/div[2]/div[1]/div[1]/div[4]/div[1]/div[3]/div[1]/div[1]')` | xpath (fallback) | Yes |
| div: Samsung Galaxy M56 5G Mobile (Light Gree | `page.locator('xpath=//*[@id="live-flagship-root"]/div[1]/div[2]/div[2]/div[1]/div[1]/div[5]')` | xpath (fallback) | Yes |
| div: Samsung Galaxy M56 5G Mobile (Light Gree | `page.locator('xpath=//*[@id="live-flagship-root"]/div[1]/div[2]/div[2]/div[1]/div[1]/div[5]/div[1]')` | xpath (fallback) | Yes |
| div | `page.locator('xpath=//*[@id="live-flagship-root"]/div[1]/div[2]/div[2]/div[1]/div[1]/div[5]/div[1]/div[1]/div[1]')` | xpath (fallback) | Yes |
| div: Samsung Galaxy M56 5G Mobile (Light Gree | `page.locator('xpath=//*[@id="live-flagship-root"]/div[1]/div[2]/div[2]/div[1]/div[1]/div[5]/div[1]/div[3]/div[1]/div[1]')` | xpath (fallback) | Yes |
| div: Samsung Galaxy M17 5G Mobile (Sapphire B | `page.locator('xpath=//*[@id="live-flagship-root"]/div[1]/div[2]/div[2]/div[1]/div[1]/div[6]')` | xpath (fallback) | Yes |
| div: Samsung Galaxy M17 5G Mobile (Sapphire B | `page.locator('xpath=//*[@id="live-flagship-root"]/div[1]/div[2]/div[2]/div[1]/div[1]/div[6]/div[1]')` | xpath (fallback) | Yes |
| div | `page.locator('xpath=//*[@id="live-flagship-root"]/div[1]/div[2]/div[2]/div[1]/div[1]/div[6]/div[1]/div[1]/div[1]')` | xpath (fallback) | Yes |
| div: Samsung Galaxy M17 5G Mobile (Sapphire B | `page.locator('xpath=//*[@id="live-flagship-root"]/div[1]/div[2]/div[2]/div[1]/div[1]/div[6]/div[1]/div[3]/div[1]/div[1]')` | xpath (fallback) | Yes |
| div: OnePlus 15R | 12GB+256GB | Mint Breeze | | `page.locator('xpath=//*[@id="live-flagship-root"]/div[1]/div[2]/div[2]/div[1]/div[1]/div[7]')` | xpath (fallback) | Yes |
| div: OnePlus 15R | 12GB+256GB | Mint Breeze | | `page.locator('xpath=//*[@id="live-flagship-root"]/div[1]/div[2]/div[2]/div[1]/div[1]/div[7]/div[1]')` | xpath (fallback) | Yes |
| div | `page.locator('xpath=//*[@id="live-flagship-root"]/div[1]/div[2]/div[2]/div[1]/div[1]/div[7]/div[1]/div[1]/div[1]')` | xpath (fallback) | Yes |
| div: OnePlus 15R | 12GB+256GB | Mint Breeze | | `page.locator('xpath=//*[@id="live-flagship-root"]/div[1]/div[2]/div[2]/div[1]/div[1]/div[7]/div[1]/div[3]/div[1]/div[1]')` | xpath (fallback) | Yes |
| div: realme NARZO 90x 5G (Nitro Blue,6GB+128G | `page.locator('xpath=//*[@id="live-flagship-root"]/div[1]/div[2]/div[2]/div[1]/div[1]/div[8]')` | xpath (fallback) | Yes |
| div: realme NARZO 90x 5G (Nitro Blue,6GB+128G | `page.locator('xpath=//*[@id="live-flagship-root"]/div[1]/div[2]/div[2]/div[1]/div[1]/div[8]/div[1]')` | xpath (fallback) | Yes |
| div | `page.locator('xpath=//*[@id="live-flagship-root"]/div[1]/div[2]/div[2]/div[1]/div[1]/div[8]/div[1]/div[1]/div[1]')` | xpath (fallback) | Yes |
| div: realme NARZO 90x 5G (Nitro Blue,6GB+128G | `page.locator('xpath=//*[@id="live-flagship-root"]/div[1]/div[2]/div[2]/div[1]/div[1]/div[8]/div[1]/div[3]/div[1]/div[1]')` | xpath (fallback) | Yes |
| div: Samsung Galaxy M07 Mobile (Black, 4GB RA | `page.locator('xpath=//*[@id="live-flagship-root"]/div[1]/div[2]/div[2]/div[1]/div[1]/div[9]')` | xpath (fallback) | Yes |
| div: Samsung Galaxy M07 Mobile (Black, 4GB RA | `page.locator('xpath=//*[@id="live-flagship-root"]/div[1]/div[2]/div[2]/div[1]/div[1]/div[9]/div[1]')` | xpath (fallback) | Yes |
| div | `page.locator('xpath=//*[@id="live-flagship-root"]/div[1]/div[2]/div[2]/div[1]/div[1]/div[9]/div[1]/div[1]/div[1]')` | xpath (fallback) | Yes |
| div: Samsung Galaxy M07 Mobile (Black, 4GB RA | `page.locator('xpath=//*[@id="live-flagship-root"]/div[1]/div[2]/div[2]/div[1]/div[1]/div[9]/div[1]/div[3]/div[1]/div[1]')` | xpath (fallback) | Yes |
| div: POCO M7 Pro 5G, Lavender Frost (6GB, 128 | `page.locator('xpath=//*[@id="live-flagship-root"]/div[1]/div[2]/div[2]/div[1]/div[1]/div[10]')` | xpath (fallback) | Yes |
| div: POCO M7 Pro 5G, Lavender Frost (6GB, 128 | `page.locator('xpath=//*[@id="live-flagship-root"]/div[1]/div[2]/div[2]/div[1]/div[1]/div[10]/div[1]')` | xpath (fallback) | Yes |
| div | `page.locator('xpath=//*[@id="live-flagship-root"]/div[1]/div[2]/div[2]/div[1]/div[1]/div[10]/div[1]/div[1]/div[1]')` | xpath (fallback) | Yes |
| div: POCO M7 Pro 5G, Lavender Frost (6GB, 128 | `page.get_by_role("button", name="POCO M7 Pro 5G, Lavender Frost (6GB, 128GB)")` | role | No |
| div: iQOO Neo 10R 5G (Raging Blue, 8GB RAM, 1 | `page.locator('xpath=//*[@id="live-flagship-root"]/div[1]/div[2]/div[2]/div[1]/div[1]/div[11]')` | xpath (fallback) | Yes |
| div: iQOO Neo 10R 5G (Raging Blue, 8GB RAM, 1 | `page.locator('xpath=//*[@id="live-flagship-root"]/div[1]/div[2]/div[2]/div[1]/div[1]/div[11]/div[1]')` | xpath (fallback) | Yes |
| div | `page.locator('xpath=//*[@id="live-flagship-root"]/div[1]/div[2]/div[2]/div[1]/div[1]/div[11]/div[1]/div[1]/div[1]')` | xpath (fallback) | Yes |
| div: iQOO Neo 10R 5G (Raging Blue, 8GB RAM, 1 | `page.locator('xpath=//*[@id="live-flagship-root"]/div[1]/div[2]/div[2]/div[1]/div[1]/div[11]/div[1]/div[3]/div[1]/div[1]')` | xpath (fallback) | Yes |
| div: iQOO Z10 Lite 5G (Cyber Green, 4GB RAM, | `page.locator('xpath=//*[@id="live-flagship-root"]/div[1]/div[2]/div[2]/div[1]/div[1]/div[12]')` | xpath (fallback) | Yes |
| div: iQOO Z10 Lite 5G (Cyber Green, 4GB RAM, | `page.locator('xpath=//*[@id="live-flagship-root"]/div[1]/div[2]/div[2]/div[1]/div[1]/div[12]/div[1]')` | xpath (fallback) | Yes |
| div | `page.locator('xpath=//*[@id="live-flagship-root"]/div[1]/div[2]/div[2]/div[1]/div[1]/div[12]/div[1]/div[1]/div[1]')` | xpath (fallback) | Yes |
| div: iQOO Z10 Lite 5G (Cyber Green, 4GB RAM, | `page.locator('xpath=//*[@id="live-flagship-root"]/div[1]/div[2]/div[2]/div[1]/div[1]/div[12]/div[1]/div[3]/div[1]/div[1]')` | xpath (fallback) | Yes |
| div: realme narzo 90 5G (Flowing Silver,6GB+1 | `page.locator('xpath=//*[@id="live-flagship-root"]/div[1]/div[2]/div[2]/div[1]/div[1]/div[13]')` | xpath (fallback) | Yes |
| div: realme narzo 90 5G (Flowing Silver,6GB+1 | `page.locator('xpath=//*[@id="live-flagship-root"]/div[1]/div[2]/div[2]/div[1]/div[1]/div[13]/div[1]')` | xpath (fallback) | Yes |
| div | `page.locator('xpath=//*[@id="live-flagship-root"]/div[1]/div[2]/div[2]/div[1]/div[1]/div[13]/div[1]/div[1]/div[1]')` | xpath (fallback) | Yes |
| div: realme narzo 90 5G (Flowing Silver,6GB+1 | `page.locator('xpath=//*[@id="live-flagship-root"]/div[1]/div[2]/div[2]/div[1]/div[1]/div[13]/div[1]/div[3]/div[1]/div[1]')` | xpath (fallback) | Yes |
| div: iQOO Z10R 5G (Aquamarine, 8GB RAM, 256GB | `page.locator('xpath=//*[@id="live-flagship-root"]/div[1]/div[2]/div[2]/div[1]/div[1]/div[14]')` | xpath (fallback) | Yes |
| div: iQOO Z10R 5G (Aquamarine, 8GB RAM, 256GB | `page.locator('xpath=//*[@id="live-flagship-root"]/div[1]/div[2]/div[2]/div[1]/div[1]/div[14]/div[1]')` | xpath (fallback) | Yes |
| div | `page.locator('xpath=//*[@id="live-flagship-root"]/div[1]/div[2]/div[2]/div[1]/div[1]/div[14]/div[1]/div[1]/div[1]')` | xpath (fallback) | Yes |
| div: iQOO Z10R 5G (Aquamarine, 8GB RAM, 256GB | `page.locator('xpath=//*[@id="live-flagship-root"]/div[1]/div[2]/div[2]/div[1]/div[1]/div[14]/div[1]/div[3]/div[1]/div[1]')` | xpath (fallback) | Yes |
| div: OnePlus 15 | 12GB+256GB | Infinite Black | `page.locator('xpath=//*[@id="live-flagship-root"]/div[1]/div[2]/div[2]/div[1]/div[1]/div[15]')` | xpath (fallback) | Yes |
| div: OnePlus 15 | 12GB+256GB | Infinite Black | `page.locator('xpath=//*[@id="live-flagship-root"]/div[1]/div[2]/div[2]/div[1]/div[1]/div[15]/div[1]')` | xpath (fallback) | Yes |
| div | `page.locator('xpath=//*[@id="live-flagship-root"]/div[1]/div[2]/div[2]/div[1]/div[1]/div[15]/div[1]/div[1]/div[1]')` | xpath (fallback) | Yes |
| div: OnePlus 15 | 12GB+256GB | Infinite Black | `page.locator('xpath=//*[@id="live-flagship-root"]/div[1]/div[2]/div[2]/div[1]/div[1]/div[15]/div[1]/div[3]/div[1]/div[1]')` | xpath (fallback) | Yes |
| div: iQOO Z10 5G (Glacier Silver, 8GB RAM, 12 | `page.locator('xpath=//*[@id="live-flagship-root"]/div[1]/div[2]/div[2]/div[1]/div[1]/div[16]')` | xpath (fallback) | Yes |
| div: iQOO Z10 5G (Glacier Silver, 8GB RAM, 12 | `page.locator('xpath=//*[@id="live-flagship-root"]/div[1]/div[2]/div[2]/div[1]/div[1]/div[16]/div[1]')` | xpath (fallback) | Yes |
| div | `page.locator('xpath=//*[@id="live-flagship-root"]/div[1]/div[2]/div[2]/div[1]/div[1]/div[16]/div[1]/div[1]/div[1]')` | xpath (fallback) | Yes |
| div: iQOO Z10 5G (Glacier Silver, 8GB RAM, 12 | `page.locator('xpath=//*[@id="live-flagship-root"]/div[1]/div[2]/div[2]/div[1]/div[1]/div[16]/div[1]/div[3]/div[1]/div[1]')` | xpath (fallback) | Yes |
| div: Redmi 15 5G Midnight Black 6GB + 128GB | | `page.locator('xpath=//*[@id="live-flagship-root"]/div[1]/div[2]/div[2]/div[1]/div[1]/div[17]')` | xpath (fallback) | Yes |
| div: Redmi 15 5G Midnight Black 6GB + 128GB | | `page.locator('xpath=//*[@id="live-flagship-root"]/div[1]/div[2]/div[2]/div[1]/div[1]/div[17]/div[1]')` | xpath (fallback) | Yes |
| div | `page.locator('xpath=//*[@id="live-flagship-root"]/div[1]/div[2]/div[2]/div[1]/div[1]/div[17]/div[1]/div[1]/div[1]')` | xpath (fallback) | Yes |
| div: Redmi 15 5G Midnight Black 6GB + 128GB | | `page.locator('xpath=//*[@id="live-flagship-root"]/div[1]/div[2]/div[2]/div[1]/div[1]/div[17]/div[1]/div[3]/div[1]/div[1]')` | xpath (fallback) | Yes |
| div: iQOO 15 (Legend, 12GB RAM, 256GB Storage | `page.locator('xpath=//*[@id="live-flagship-root"]/div[1]/div[2]/div[2]/div[1]/div[1]/div[18]')` | xpath (fallback) | Yes |
| div: iQOO 15 (Legend, 12GB RAM, 256GB Storage | `page.locator('xpath=//*[@id="live-flagship-root"]/div[1]/div[2]/div[2]/div[1]/div[1]/div[18]/div[1]')` | xpath (fallback) | Yes |
| div | `page.locator('xpath=//*[@id="live-flagship-root"]/div[1]/div[2]/div[2]/div[1]/div[1]/div[18]/div[1]/div[1]/div[1]')` | xpath (fallback) | Yes |
| div: iQOO 15 (Legend, 12GB RAM, 256GB Storage | `page.locator('xpath=//*[@id="live-flagship-root"]/div[1]/div[2]/div[2]/div[1]/div[1]/div[18]/div[1]/div[3]/div[1]/div[1]')` | xpath (fallback) | Yes |
| div: OnePlus 13s | Snapdragon® 8 Elite | Smar | `page.locator('xpath=//*[@id="live-flagship-root"]/div[1]/div[2]/div[2]/div[1]/div[1]/div[19]')` | xpath (fallback) | Yes |
| div: OnePlus 13s | Snapdragon® 8 Elite | Smar | `page.locator('xpath=//*[@id="live-flagship-root"]/div[1]/div[2]/div[2]/div[1]/div[1]/div[19]/div[1]')` | xpath (fallback) | Yes |
| div | `page.locator('xpath=//*[@id="live-flagship-root"]/div[1]/div[2]/div[2]/div[1]/div[1]/div[19]/div[1]/div[1]/div[1]')` | xpath (fallback) | Yes |
| div: OnePlus 13s | Snapdragon® 8 Elite | Smar | `page.locator('xpath=//*[@id="live-flagship-root"]/div[1]/div[2]/div[2]/div[1]/div[1]/div[19]/div[1]/div[3]/div[1]/div[1]')` | xpath (fallback) | Yes |
| div: realme NARZO 80 Lite 4G (Beach Gold, 4GB | `page.locator('xpath=//*[@id="live-flagship-root"]/div[1]/div[2]/div[2]/div[1]/div[1]/div[20]')` | xpath (fallback) | Yes |
| div: realme NARZO 80 Lite 4G (Beach Gold, 4GB | `page.locator('xpath=//*[@id="live-flagship-root"]/div[1]/div[2]/div[2]/div[1]/div[1]/div[20]/div[1]')` | xpath (fallback) | Yes |
| div | `page.locator('xpath=//*[@id="live-flagship-root"]/div[1]/div[2]/div[2]/div[1]/div[1]/div[20]/div[1]/div[1]/div[1]')` | xpath (fallback) | Yes |
| div: realme NARZO 80 Lite 4G (Beach Gold, 4GB | `page.locator('xpath=//*[@id="live-flagship-root"]/div[1]/div[2]/div[2]/div[1]/div[1]/div[20]/div[1]/div[3]/div[1]/div[1]')` | xpath (fallback) | Yes |
| div: REDMI Note 15 Pro+ 5G (Coffee Mocha, 8GB | `page.locator('xpath=//*[@id="live-flagship-root"]/div[1]/div[2]/div[2]/div[1]/div[1]/div[21]')` | xpath (fallback) | Yes |
| div: REDMI Note 15 Pro+ 5G (Coffee Mocha, 8GB | `page.locator('xpath=//*[@id="live-flagship-root"]/div[1]/div[2]/div[2]/div[1]/div[1]/div[21]/div[1]')` | xpath (fallback) | Yes |
| div | `page.locator('xpath=//*[@id="live-flagship-root"]/div[1]/div[2]/div[2]/div[1]/div[1]/div[21]/div[1]/div[1]/div[1]')` | xpath (fallback) | Yes |
| div: REDMI Note 15 Pro+ 5G (Coffee Mocha, 8GB | `page.locator('xpath=//*[@id="live-flagship-root"]/div[1]/div[2]/div[2]/div[1]/div[1]/div[21]/div[1]/div[3]/div[1]/div[1]')` | xpath (fallback) | Yes |
| div: Redmi Note 14 Pro 5G Prime Edition (Ivy | `page.locator('xpath=//*[@id="live-flagship-root"]/div[1]/div[2]/div[2]/div[1]/div[1]/div[22]')` | xpath (fallback) | Yes |
| div: Redmi Note 14 Pro 5G Prime Edition (Ivy | `page.locator('xpath=//*[@id="live-flagship-root"]/div[1]/div[2]/div[2]/div[1]/div[1]/div[22]/div[1]')` | xpath (fallback) | Yes |
| div | `page.locator('xpath=//*[@id="live-flagship-root"]/div[1]/div[2]/div[2]/div[1]/div[1]/div[22]/div[1]/div[1]/div[1]')` | xpath (fallback) | Yes |
| div: Redmi Note 14 Pro 5G Prime Edition (Ivy | `page.locator('xpath=//*[@id="live-flagship-root"]/div[1]/div[2]/div[2]/div[1]/div[1]/div[22]/div[1]/div[3]/div[1]/div[1]')` | xpath (fallback) | Yes |
| div: Redmi Note 14 Pro+ 5G Prime Edition (Tit | `page.locator('xpath=//*[@id="live-flagship-root"]/div[1]/div[2]/div[2]/div[1]/div[1]/div[23]')` | xpath (fallback) | Yes |
| div: Redmi Note 14 Pro+ 5G Prime Edition (Tit | `page.locator('xpath=//*[@id="live-flagship-root"]/div[1]/div[2]/div[2]/div[1]/div[1]/div[23]/div[1]')` | xpath (fallback) | Yes |
| div | `page.locator('xpath=//*[@id="live-flagship-root"]/div[1]/div[2]/div[2]/div[1]/div[1]/div[23]/div[1]/div[1]/div[1]')` | xpath (fallback) | Yes |
| div: Redmi Note 14 Pro+ 5G Prime Edition (Tit | `page.locator('xpath=//*[@id="live-flagship-root"]/div[1]/div[2]/div[2]/div[1]/div[1]/div[23]/div[1]/div[3]/div[1]/div[1]')` | xpath (fallback) | Yes |
| div: Motorola razr 60 Ultra (Pantone Rio Red, | `page.locator('xpath=//*[@id="live-flagship-root"]/div[1]/div[2]/div[2]/div[1]/div[1]/div[24]')` | xpath (fallback) | Yes |
| div: Motorola razr 60 Ultra (Pantone Rio Red, | `page.locator('xpath=//*[@id="live-flagship-root"]/div[1]/div[2]/div[2]/div[1]/div[1]/div[24]/div[1]')` | xpath (fallback) | Yes |
| div | `page.locator('xpath=//*[@id="live-flagship-root"]/div[1]/div[2]/div[2]/div[1]/div[1]/div[24]/div[1]/div[1]/div[1]')` | xpath (fallback) | Yes |
| div: Motorola razr 60 Ultra (Pantone Rio Red, | `page.locator('xpath=//*[@id="live-flagship-root"]/div[1]/div[2]/div[2]/div[1]/div[1]/div[24]/div[1]/div[3]/div[1]/div[1]')` | xpath (fallback) | Yes |
| div: Samsung Galaxy S24 Snapdragon 5G (Onyx B | `page.locator('xpath=//*[@id="live-flagship-root"]/div[1]/div[2]/div[2]/div[1]/div[1]/div[25]')` | xpath (fallback) | Yes |
| div: Samsung Galaxy S24 Snapdragon 5G (Onyx B | `page.locator('xpath=//*[@id="live-flagship-root"]/div[1]/div[2]/div[2]/div[1]/div[1]/div[25]/div[1]')` | xpath (fallback) | Yes |
| div | `page.locator('xpath=//*[@id="live-flagship-root"]/div[1]/div[2]/div[2]/div[1]/div[1]/div[25]/div[1]/div[1]/div[1]')` | xpath (fallback) | Yes |
| div: Samsung Galaxy S24 Snapdragon 5G (Onyx B | `page.locator('xpath=//*[@id="live-flagship-root"]/div[1]/div[2]/div[2]/div[1]/div[1]/div[25]/div[1]/div[3]/div[1]/div[1]')` | xpath (fallback) | Yes |
| div: vivo X300 Pro 5G (Elite Black, 16GB RAM, | `page.locator('xpath=//*[@id="live-flagship-root"]/div[1]/div[2]/div[2]/div[1]/div[1]/div[26]')` | xpath (fallback) | Yes |
| div: vivo X300 Pro 5G (Elite Black, 16GB RAM, | `page.locator('xpath=//*[@id="live-flagship-root"]/div[1]/div[2]/div[2]/div[1]/div[1]/div[26]/div[1]')` | xpath (fallback) | Yes |
| div | `page.locator('xpath=//*[@id="live-flagship-root"]/div[1]/div[2]/div[2]/div[1]/div[1]/div[26]/div[1]/div[1]/div[1]')` | xpath (fallback) | Yes |
| div: vivo X300 Pro 5G (Elite Black, 16GB RAM, | `page.locator('xpath=//*[@id="live-flagship-root"]/div[1]/div[2]/div[2]/div[1]/div[1]/div[26]/div[1]/div[3]/div[1]/div[1]')` | xpath (fallback) | Yes |
| div: Oppo Reno15Pro 5G (Sunset Gold 12GB RAM, | `page.locator('xpath=//*[@id="live-flagship-root"]/div[1]/div[2]/div[2]/div[1]/div[1]/div[27]')` | xpath (fallback) | Yes |
| div: Oppo Reno15Pro 5G (Sunset Gold 12GB RAM, | `page.locator('xpath=//*[@id="live-flagship-root"]/div[1]/div[2]/div[2]/div[1]/div[1]/div[27]/div[1]')` | xpath (fallback) | Yes |
| div | `page.locator('xpath=//*[@id="live-flagship-root"]/div[1]/div[2]/div[2]/div[1]/div[1]/div[27]/div[1]/div[1]/div[1]')` | xpath (fallback) | Yes |
| div: Oppo Reno15Pro 5G (Sunset Gold 12GB RAM, | `page.locator('xpath=//*[@id="live-flagship-root"]/div[1]/div[2]/div[2]/div[1]/div[1]/div[27]/div[1]/div[3]/div[1]/div[1]')` | xpath (fallback) | Yes |
| div: Apple iPhone 17e 512 GB: 15.40 cm (6.1″) | `page.locator('xpath=//*[@id="live-flagship-root"]/div[1]/div[2]/div[2]/div[1]/div[1]/div[28]')` | xpath (fallback) | Yes |
| div: Apple iPhone 17e 512 GB: 15.40 cm (6.1″) | `page.locator('xpath=//*[@id="live-flagship-root"]/div[1]/div[2]/div[2]/div[1]/div[1]/div[28]/div[1]')` | xpath (fallback) | Yes |
| div | `page.locator('xpath=//*[@id="live-flagship-root"]/div[1]/div[2]/div[2]/div[1]/div[1]/div[28]/div[1]/div[1]/div[1]')` | xpath (fallback) | Yes |
| div: Apple iPhone 17e 512 GB: 15.40 cm (6.1″) | `page.locator('xpath=//*[@id="live-flagship-root"]/div[1]/div[2]/div[2]/div[1]/div[1]/div[28]/div[1]/div[3]/div[1]/div[1]')` | xpath (fallback) | Yes |
| div: realme NARZO 90x 5G (Aqua Blue,4GB+128GB | `page.locator('xpath=//*[@id="live-flagship-root"]/div[1]/div[2]/div[2]/div[1]/div[1]/div[29]')` | xpath (fallback) | Yes |
| div: realme NARZO 90x 5G (Aqua Blue,4GB+128GB | `page.locator('xpath=//*[@id="live-flagship-root"]/div[1]/div[2]/div[2]/div[1]/div[1]/div[29]/div[1]')` | xpath (fallback) | Yes |
| div | `page.locator('xpath=//*[@id="live-flagship-root"]/div[1]/div[2]/div[2]/div[1]/div[1]/div[29]/div[1]/div[1]/div[1]')` | xpath (fallback) | Yes |
| div: realme NARZO 90x 5G (Aqua Blue,4GB+128GB | `page.locator('xpath=//*[@id="live-flagship-root"]/div[1]/div[2]/div[2]/div[1]/div[1]/div[29]/div[1]/div[3]/div[1]/div[1]')` | xpath (fallback) | Yes |
| div: Apple iPhone 17 256 GB: 15.93 cm (6.3″) | `page.locator('xpath=//*[@id="live-flagship-root"]/div[1]/div[2]/div[2]/div[1]/div[1]/div[30]')` | xpath (fallback) | Yes |
| div: Apple iPhone 17 256 GB: 15.93 cm (6.3″) | `page.locator('xpath=//*[@id="live-flagship-root"]/div[1]/div[2]/div[2]/div[1]/div[1]/div[30]/div[1]')` | xpath (fallback) | Yes |
| div | `page.locator('xpath=//*[@id="live-flagship-root"]/div[1]/div[2]/div[2]/div[1]/div[1]/div[30]/div[1]/div[1]/div[1]')` | xpath (fallback) | Yes |
| div: Apple iPhone 17 256 GB: 15.93 cm (6.3″) | `page.locator('xpath=//*[@id="live-flagship-root"]/div[1]/div[2]/div[2]/div[1]/div[1]/div[30]/div[1]/div[3]/div[1]/div[1]')` | xpath (fallback) | Yes |
| div: Samsung Galaxy M17e 5G Mobile (Blitz Blu | `page.locator('xpath=//*[@id="live-flagship-root"]/div[1]/div[2]/div[2]/div[1]/div[1]/div[31]')` | xpath (fallback) | Yes |
| div: Samsung Galaxy M17e 5G Mobile (Blitz Blu | `page.locator('xpath=//*[@id="live-flagship-root"]/div[1]/div[2]/div[2]/div[1]/div[1]/div[31]/div[1]')` | xpath (fallback) | Yes |
| div | `page.locator('xpath=//*[@id="live-flagship-root"]/div[1]/div[2]/div[2]/div[1]/div[1]/div[31]/div[1]/div[1]/div[1]')` | xpath (fallback) | Yes |
| div: Samsung Galaxy M17e 5G Mobile (Blitz Blu | `page.locator('xpath=//*[@id="live-flagship-root"]/div[1]/div[2]/div[2]/div[1]/div[1]/div[31]/div[1]/div[3]/div[1]/div[1]')` | xpath (fallback) | Yes |
| div: Apple iPhone 15 (128 GB) - Black
400+ bo | `page.locator('xpath=//*[@id="live-flagship-root"]/div[1]/div[2]/div[2]/div[1]/div[1]/div[32]')` | xpath (fallback) | Yes |
| div: Apple iPhone 15 (128 GB) - Black
400+ bo | `page.locator('xpath=//*[@id="live-flagship-root"]/div[1]/div[2]/div[2]/div[1]/div[1]/div[32]/div[1]')` | xpath (fallback) | Yes |
| div | `page.locator('xpath=//*[@id="live-flagship-root"]/div[1]/div[2]/div[2]/div[1]/div[1]/div[32]/div[1]/div[1]/div[1]')` | xpath (fallback) | Yes |
| div: Apple iPhone 15 (128 GB) - Black | `page.get_by_role("button", name="Apple iPhone 15 (128 GB) - Black")` | role | No |
| div: iPhone 16 128 GB: 5G Mobile Phone with C | `page.locator('xpath=//*[@id="live-flagship-root"]/div[1]/div[2]/div[2]/div[1]/div[1]/div[33]')` | xpath (fallback) | Yes |
| div: iPhone 16 128 GB: 5G Mobile Phone with C | `page.locator('xpath=//*[@id="live-flagship-root"]/div[1]/div[2]/div[2]/div[1]/div[1]/div[33]/div[1]')` | xpath (fallback) | Yes |
| div | `page.locator('xpath=//*[@id="live-flagship-root"]/div[1]/div[2]/div[2]/div[1]/div[1]/div[33]/div[1]/div[1]/div[1]')` | xpath (fallback) | Yes |
| div: iPhone 16 128 GB: 5G Mobile Phone with C | `page.locator('xpath=//*[@id="live-flagship-root"]/div[1]/div[2]/div[2]/div[1]/div[1]/div[33]/div[1]/div[3]/div[1]/div[1]')` | xpath (fallback) | Yes |
| div: realme narzo 100 Lite 5G (Frost Silver,4 | `page.locator('xpath=//*[@id="live-flagship-root"]/div[1]/div[2]/div[2]/div[1]/div[1]/div[34]')` | xpath (fallback) | Yes |
| div: realme narzo 100 Lite 5G (Frost Silver,4 | `page.locator('xpath=//*[@id="live-flagship-root"]/div[1]/div[2]/div[2]/div[1]/div[1]/div[34]/div[1]')` | xpath (fallback) | Yes |
| div | `page.locator('xpath=//*[@id="live-flagship-root"]/div[1]/div[2]/div[2]/div[1]/div[1]/div[34]/div[1]/div[1]/div[1]')` | xpath (fallback) | Yes |
| div: realme narzo 100 Lite 5G (Frost Silver,4 | `page.locator('xpath=//*[@id="live-flagship-root"]/div[1]/div[2]/div[2]/div[1]/div[1]/div[34]/div[1]/div[3]/div[1]/div[1]')` | xpath (fallback) | Yes |
| div: REDMI A7 Pro 5G (Mist Blue, 4GB RAM, 64G | `page.locator('xpath=//*[@id="live-flagship-root"]/div[1]/div[2]/div[2]/div[1]/div[1]/div[35]')` | xpath (fallback) | Yes |
| div: REDMI A7 Pro 5G (Mist Blue, 4GB RAM, 64G | `page.locator('xpath=//*[@id="live-flagship-root"]/div[1]/div[2]/div[2]/div[1]/div[1]/div[35]/div[1]')` | xpath (fallback) | Yes |
| div | `page.locator('xpath=//*[@id="live-flagship-root"]/div[1]/div[2]/div[2]/div[1]/div[1]/div[35]/div[1]/div[1]/div[1]')` | xpath (fallback) | Yes |
| div: REDMI A7 Pro 5G (Mist Blue, 4GB RAM, 64G | `page.locator('xpath=//*[@id="live-flagship-root"]/div[1]/div[2]/div[2]/div[1]/div[1]/div[35]/div[1]/div[3]/div[1]/div[1]')` | xpath (fallback) | Yes |
| div: Samsung Galaxy S25 Ultra 5G AI Smartphon | `page.locator('xpath=//*[@id="live-flagship-root"]/div[1]/div[2]/div[2]/div[1]/div[1]/div[36]')` | xpath (fallback) | Yes |
| div: Samsung Galaxy S25 Ultra 5G AI Smartphon | `page.locator('xpath=//*[@id="live-flagship-root"]/div[1]/div[2]/div[2]/div[1]/div[1]/div[36]/div[1]')` | xpath (fallback) | Yes |
| div | `page.locator('xpath=//*[@id="live-flagship-root"]/div[1]/div[2]/div[2]/div[1]/div[1]/div[36]/div[1]/div[1]/div[1]')` | xpath (fallback) | Yes |
| div: Samsung Galaxy S25 Ultra 5G AI Smartphon | `page.locator('xpath=//*[@id="live-flagship-root"]/div[1]/div[2]/div[2]/div[1]/div[1]/div[36]/div[1]/div[3]/div[1]/div[1]')` | xpath (fallback) | Yes |
| div: Featured now
Apple iPhone Air 256 GB: Th | `page.locator('xpath=//*[@id="live-flagship-root"]/div[1]/div[2]/div[2]/div[1]/div[1]/div[37]')` | xpath (fallback) | Yes |
| div: Featured now
Apple iPhone Air 256 GB: Th | `page.locator('xpath=//*[@id="live-flagship-root"]/div[1]/div[2]/div[2]/div[1]/div[1]/div[37]/div[1]')` | xpath (fallback) | Yes |
| div | `page.locator('xpath=//*[@id="live-flagship-root"]/div[1]/div[2]/div[2]/div[1]/div[1]/div[37]/div[1]/div[1]/div[1]')` | xpath (fallback) | Yes |
| span: Featured now | `page.get_by_role("heading", name="The product Apple iPhone Air 256 GB: Thinnest iPhone Ever, 16.63 cm (6.5″) Display with Promotion up to 120Hz, Powerful A19 Pro Chip, Center Stage Front Camera, All-Day Battery Life; Space Black is currently highlighted")` | role | No |
| div: Apple iPhone Air 256 GB: Thinnest iPhone | `page.locator('xpath=//*[@id="live-flagship-root"]/div[1]/div[2]/div[2]/div[1]/div[1]/div[37]/div[1]/div[3]/div[1]/div[1]')` | xpath (fallback) | Yes |
| div: Samsung Galaxy A57 5G (Awesome Icyblue, | `page.locator('xpath=//*[@id="live-flagship-root"]/div[1]/div[2]/div[2]/div[1]/div[1]/div[38]')` | xpath (fallback) | Yes |
| div: Samsung Galaxy A57 5G (Awesome Icyblue, | `page.locator('xpath=//*[@id="live-flagship-root"]/div[1]/div[2]/div[2]/div[1]/div[1]/div[38]/div[1]')` | xpath (fallback) | Yes |
| div | `page.locator('xpath=//*[@id="live-flagship-root"]/div[1]/div[2]/div[2]/div[1]/div[1]/div[38]/div[1]/div[1]/div[1]')` | xpath (fallback) | Yes |
| div: Samsung Galaxy A57 5G (Awesome Icyblue, | `page.locator('xpath=//*[@id="live-flagship-root"]/div[1]/div[2]/div[2]/div[1]/div[1]/div[38]/div[1]/div[3]/div[1]/div[1]')` | xpath (fallback) | Yes |
| div: Samsung Galaxy A37 5G (Awesome Lavender, | `page.locator('xpath=//*[@id="live-flagship-root"]/div[1]/div[2]/div[2]/div[1]/div[1]/div[39]')` | xpath (fallback) | Yes |
| div: Samsung Galaxy A37 5G (Awesome Lavender, | `page.locator('xpath=//*[@id="live-flagship-root"]/div[1]/div[2]/div[2]/div[1]/div[1]/div[39]/div[1]')` | xpath (fallback) | Yes |
| div | `page.locator('xpath=//*[@id="live-flagship-root"]/div[1]/div[2]/div[2]/div[1]/div[1]/div[39]/div[1]/div[1]/div[1]')` | xpath (fallback) | Yes |
| div: Samsung Galaxy A37 5G (Awesome Lavender, | `page.locator('xpath=//*[@id="live-flagship-root"]/div[1]/div[2]/div[2]/div[1]/div[1]/div[39]/div[1]/div[3]/div[1]/div[1]')` | xpath (fallback) | Yes |
| div: Samsung Galaxy A17 5G (Gray, 8GB RAM, 12 | `page.locator('xpath=//*[@id="live-flagship-root"]/div[1]/div[2]/div[2]/div[1]/div[1]/div[40]')` | xpath (fallback) | Yes |
| div: Samsung Galaxy A17 5G (Gray, 8GB RAM, 12 | `page.locator('xpath=//*[@id="live-flagship-root"]/div[1]/div[2]/div[2]/div[1]/div[1]/div[40]/div[1]')` | xpath (fallback) | Yes |
| div | `page.locator('xpath=//*[@id="live-flagship-root"]/div[1]/div[2]/div[2]/div[1]/div[1]/div[40]/div[1]/div[1]/div[1]')` | xpath (fallback) | Yes |
| div: Samsung Galaxy A17 5G (Gray, 8GB RAM, 12 | `page.locator('xpath=//*[@id="live-flagship-root"]/div[1]/div[2]/div[2]/div[1]/div[1]/div[40]/div[1]/div[3]/div[1]/div[1]')` | xpath (fallback) | Yes |
| div: Watch more livestreams
See more | `page.locator('xpath=//*[@id="live-flagship-root"]/div[1]/div[2]/div[2]/div[1]/div[1]/div[41]')` | xpath (fallback) | Yes |
| div: Watch more livestreams
See more | `page.locator('xpath=//*[@id="live-flagship-root"]/div[1]/div[2]/div[2]/div[1]/div[1]/div[41]/div[1]')` | xpath (fallback) | Yes |
| div: Title:Watch more livestreams LinkText:See more | `page.get_by_role("button", name="Title:Watch more livestreams LinkText:See more")` | role | No |
| div: Watch more livestreams | `page.locator('xpath=//*[@id="28fee623-eb90-41f4-a938-a2d4792aeb36-customTile-formattedTitle"]')` | xpath (fallback) | Yes |
| div: See more | `page.locator('xpath=//*[@id="live-flagship-root"]/div[1]/div[2]/div[2]/div[1]/div[1]/div[41]/div[1]/div[2]/div[2]')` | xpath (fallback) | Yes |
| div | `page.locator('xpath=//*[@id="live-flagship-root"]/div[1]/div[2]/div[2]/div[1]/div[1]/div[42]')` | xpath (fallback) | Yes |
| a | `page.locator('xpath=//*[@id="live-flagship-root"]/div[1]/div[2]/div[2]/div[1]/a[1]')` | xpath (fallback) | Yes |
| a | `page.locator('xpath=//*[@id="live-flagship-root"]/div[1]/div[2]/div[2]/div[1]/a[2]')` | xpath (fallback) | Yes |
| a | `page.locator('xpath=//*[@id="CardInstance7ubV7YhMnFqKWmZ_95q9_A"]/div[2]/div[1]/div[1]/a[1]')` | xpath (fallback) | Yes |
| a | `page.locator('xpath=//*[@id="CardInstance7ubV7YhMnFqKWmZ_95q9_A"]/div[2]/div[1]/div[2]/a[1]')` | xpath (fallback) | Yes |
| a | `page.locator('xpath=//*[@id="CardInstance7ubV7YhMnFqKWmZ_95q9_A"]/div[2]/div[1]/div[3]/a[1]')` | xpath (fallback) | Yes |
| a | `page.locator('xpath=//*[@id="CardInstance7ubV7YhMnFqKWmZ_95q9_A"]/div[2]/div[1]/div[4]/a[1]')` | xpath (fallback) | Yes |
| a | `page.locator('xpath=//*[@id="CardInstancezHtp-JvTFnzhinAUoIXVgg"]/div[2]/div[1]/div[1]/a[1]')` | xpath (fallback) | Yes |
| a | `page.locator('xpath=//*[@id="CardInstancezHtp-JvTFnzhinAUoIXVgg"]/div[2]/div[1]/div[2]/a[1]')` | xpath (fallback) | Yes |
| a | `page.locator('xpath=//*[@id="CardInstancezHtp-JvTFnzhinAUoIXVgg"]/div[2]/div[1]/div[3]/a[1]')` | xpath (fallback) | Yes |
| a | `page.locator('xpath=//*[@id="CardInstancezHtp-JvTFnzhinAUoIXVgg"]/div[2]/div[1]/div[4]/a[1]')` | xpath (fallback) | Yes |
| a | `page.locator('xpath=//*[@id="CardInstanceq4fRXHZ3I6fhRsb-GcEMsQ"]/div[2]/div[1]/div[1]/a[1]')` | xpath (fallback) | Yes |
| a | `page.locator('xpath=//*[@id="CardInstanceq4fRXHZ3I6fhRsb-GcEMsQ"]/div[2]/div[1]/div[2]/a[1]')` | xpath (fallback) | Yes |
| a | `page.locator('xpath=//*[@id="CardInstanceq4fRXHZ3I6fhRsb-GcEMsQ"]/div[2]/div[1]/div[3]/a[1]')` | xpath (fallback) | Yes |
| a | `page.locator('xpath=//*[@id="CardInstanceq4fRXHZ3I6fhRsb-GcEMsQ"]/div[2]/div[1]/div[4]/a[1]')` | xpath (fallback) | Yes |
| a | `page.locator('xpath=//*[@id="CardInstance8TiT1Rf-jmgu8qBwTyDaHQ"]/div[2]/div[1]/div[1]/a[1]')` | xpath (fallback) | Yes |
| a | `page.locator('xpath=//*[@id="CardInstance8TiT1Rf-jmgu8qBwTyDaHQ"]/div[2]/div[1]/div[2]/a[1]')` | xpath (fallback) | Yes |
| a | `page.locator('xpath=//*[@id="CardInstance8TiT1Rf-jmgu8qBwTyDaHQ"]/div[2]/div[1]/div[3]/a[1]')` | xpath (fallback) | Yes |
| a | `page.locator('xpath=//*[@id="CardInstance8TiT1Rf-jmgu8qBwTyDaHQ"]/div[2]/div[1]/div[4]/a[1]')` | xpath (fallback) | Yes |
| a: See all | `page.locator('xpath=//*[@id="113e453a-e5e2-4011-a61c-4c18315c97fe"]/div[1]/span[1]/a[1]')` | xpath (fallback) | Yes |
| ul | `page.locator('xpath=//*[@id="113e453a-e5e2-4011-a61c-4c18315c97fe"]/div[2]/div[1]/ul[1]')` | xpath (fallback) | Yes |
| li | `page.locator('xpath=//*[@id="113e453a-e5e2-4011-a61c-4c18315c97fe"]/div[2]/div[1]/ul[1]/li[1]')` | xpath (fallback) | Yes |
| a | `page.locator('xpath=//*[@id="113e453a-e5e2-4011-a61c-4c18315c97fe"]/div[2]/div[1]/ul[1]/li[1]/span[1]/a[1]')` | xpath (fallback) | Yes |
| li | `page.locator('xpath=//*[@id="113e453a-e5e2-4011-a61c-4c18315c97fe"]/div[2]/div[1]/ul[1]/li[2]')` | xpath (fallback) | Yes |
| a | `page.locator('xpath=//*[@id="113e453a-e5e2-4011-a61c-4c18315c97fe"]/div[2]/div[1]/ul[1]/li[2]/span[1]/a[1]')` | xpath (fallback) | Yes |
| li | `page.locator('xpath=//*[@id="113e453a-e5e2-4011-a61c-4c18315c97fe"]/div[2]/div[1]/ul[1]/li[3]')` | xpath (fallback) | Yes |
| a | `page.locator('xpath=//*[@id="113e453a-e5e2-4011-a61c-4c18315c97fe"]/div[2]/div[1]/ul[1]/li[3]/span[1]/a[1]')` | xpath (fallback) | Yes |
| li | `page.locator('xpath=//*[@id="113e453a-e5e2-4011-a61c-4c18315c97fe"]/div[2]/div[1]/ul[1]/li[4]')` | xpath (fallback) | Yes |
| a | `page.locator('xpath=//*[@id="113e453a-e5e2-4011-a61c-4c18315c97fe"]/div[2]/div[1]/ul[1]/li[4]/span[1]/a[1]')` | xpath (fallback) | Yes |
| li | `page.locator('xpath=//*[@id="113e453a-e5e2-4011-a61c-4c18315c97fe"]/div[2]/div[1]/ul[1]/li[5]')` | xpath (fallback) | Yes |
| a | `page.locator('xpath=//*[@id="113e453a-e5e2-4011-a61c-4c18315c97fe"]/div[2]/div[1]/ul[1]/li[5]/span[1]/a[1]')` | xpath (fallback) | Yes |
| li | `page.locator('xpath=//*[@id="113e453a-e5e2-4011-a61c-4c18315c97fe"]/div[2]/div[1]/ul[1]/li[6]')` | xpath (fallback) | Yes |
| a | `page.locator('xpath=//*[@id="113e453a-e5e2-4011-a61c-4c18315c97fe"]/div[2]/div[1]/ul[1]/li[6]/span[1]/a[1]')` | xpath (fallback) | Yes |
| li | `page.locator('xpath=//*[@id="113e453a-e5e2-4011-a61c-4c18315c97fe"]/div[2]/div[1]/ul[1]/li[7]')` | xpath (fallback) | Yes |
| a | `page.locator('xpath=//*[@id="113e453a-e5e2-4011-a61c-4c18315c97fe"]/div[2]/div[1]/ul[1]/li[7]/span[1]/a[1]')` | xpath (fallback) | Yes |
| li | `page.locator('xpath=//*[@id="113e453a-e5e2-4011-a61c-4c18315c97fe"]/div[2]/div[1]/ul[1]/li[8]')` | xpath (fallback) | Yes |
| a | `page.locator('xpath=//*[@id="113e453a-e5e2-4011-a61c-4c18315c97fe"]/div[2]/div[1]/ul[1]/li[8]/span[1]/a[1]')` | xpath (fallback) | Yes |
| li | `page.locator('xpath=//*[@id="113e453a-e5e2-4011-a61c-4c18315c97fe"]/div[2]/div[1]/ul[1]/li[9]')` | xpath (fallback) | Yes |
| a | `page.locator('xpath=//*[@id="113e453a-e5e2-4011-a61c-4c18315c97fe"]/div[2]/div[1]/ul[1]/li[9]/span[1]/a[1]')` | xpath (fallback) | Yes |
| li | `page.locator('xpath=//*[@id="113e453a-e5e2-4011-a61c-4c18315c97fe"]/div[2]/div[1]/ul[1]/li[10]')` | xpath (fallback) | Yes |
| a | `page.locator('xpath=//*[@id="113e453a-e5e2-4011-a61c-4c18315c97fe"]/div[2]/div[1]/ul[1]/li[10]/span[1]/a[1]')` | xpath (fallback) | Yes |
| li | `page.locator('xpath=//*[@id="113e453a-e5e2-4011-a61c-4c18315c97fe"]/div[2]/div[1]/ul[1]/li[11]')` | xpath (fallback) | Yes |
| a | `page.locator('xpath=//*[@id="113e453a-e5e2-4011-a61c-4c18315c97fe"]/div[2]/div[1]/ul[1]/li[11]/span[1]/a[1]')` | xpath (fallback) | Yes |
| li | `page.locator('xpath=//*[@id="113e453a-e5e2-4011-a61c-4c18315c97fe"]/div[2]/div[1]/ul[1]/li[12]')` | xpath (fallback) | Yes |
| a | `page.locator('xpath=//*[@id="113e453a-e5e2-4011-a61c-4c18315c97fe"]/div[2]/div[1]/ul[1]/li[12]/span[1]/a[1]')` | xpath (fallback) | Yes |
| button: Back to top | `page.get_by_role("button", name="Back to top")` | role | No |
| div: Get to Know Us
About Amazon
Careers
Pres | `page.locator('xpath=//*[@id="navFooter"]/div[1]')` | xpath (fallback) | Yes |
| div: Get to Know Us | `page.get_by_role("heading", name="Get to Know Us")` | role | No |
| a: About Amazon | `page.get_by_role("link", name="About Amazon")` | role | No |
| a: Careers | `page.get_by_role("link", name="Careers")` | role | No |
| a: Press Releases | `page.get_by_role("link", name="Press Releases")` | role | No |
| a: Amazon Science | `page.get_by_role("link", name="Amazon Science")` | role | No |
| div: Connect with Us | `page.get_by_role("heading", name="Connect with Us")` | role | No |
| a: Facebook | `page.get_by_role("link", name="Facebook")` | role | No |
| a: Twitter | `page.get_by_role("link", name="Twitter")` | role | No |
| a: Instagram | `page.get_by_role("link", name="Instagram")` | role | No |
| div: Make Money with Us | `page.get_by_role("heading", name="Make Money with Us")` | role | No |
| a: Sell on Amazon | `page.get_by_role("link", name="Sell on Amazon")` | role | No |
| a: Sell under Amazon Accelerator | `page.get_by_role("link", name="Sell under Amazon Accelerator")` | role | No |
| a: Protect and Build Your Brand | `page.get_by_role("link", name="Protect and Build Your Brand")` | role | No |
| a: Amazon Global Selling | `page.get_by_role("link", name="Amazon Global Selling")` | role | No |
| a: Supply to Amazon | `page.get_by_role("link", name="Supply to Amazon")` | role | No |
| a: Become an Affiliate | `page.get_by_role("link", name="Become an Affiliate")` | role | No |
| a: Fulfilment by Amazon | `page.get_by_role("link", name="Fulfilment by Amazon")` | role | No |
| a: Advertise Your Products | `page.get_by_role("link", name="Advertise Your Products")` | role | No |
| a: Amazon Pay on Merchants | `page.get_by_role("link", name="Amazon Pay on Merchants")` | role | No |
| div: Let Us Help You | `page.get_by_role("heading", name="Let Us Help You")` | role | No |
| a: Your Account | `page.get_by_role("link", name="Your Account")` | role | No |
| a: Returns Centre | `page.get_by_role("link", name="Returns Centre")` | role | No |
| a: Recalls and Product Safety Alerts | `page.get_by_role("link", name="Recalls and Product Safety Alerts")` | role | No |
| a: 100% Purchase Protection | `page.get_by_role("link", name="100% Purchase Protection")` | role | No |
| a: Amazon App Download | `page.get_by_role("link", name="Amazon App Download")` | role | No |
| a: Help | `page.get_by_role("link", name="Help")` | role | No |
| a: Amazon India Home | `page.get_by_role("link", name="Amazon India Home")` | role | No |
| a: English | `page.get_by_role("link", name="Choose a language for shopping. Current selection is English. ")` | role | No |
| button: Expand to Change Language or Country | `page.locator('xpath=//*[@id="icp-touch-link-language"]/button[1]')` | xpath (fallback) | Yes |
| a: India | `page.get_by_role("button", name="Choose a country/region for shopping. The current selection is India.")` | role | No |
| a: AbeBooks
Books, art
& collectibles | `page.get_by_role("link", name="AbeBooks
Books, art
& collectibles")` | role | No |
| a: Amazon Web Services
Scalable Cloud
Compu | `page.get_by_role("link", name="Amazon Web Services
Scalable Cloud
Computing Services")` | role | No |
| a: Audible
Download
Audio Books | `page.get_by_role("link", name="Audible
Download
Audio Books")` | role | No |
| a: IMDb
Movies, TV
& Celebrities | `page.get_by_role("link", name="IMDb
Movies, TV
& Celebrities")` | role | No |
| a: Shopbop
Designer
Fashion Brands | `page.get_by_role("link", name="Shopbop
Designer
Fashion Brands")` | role | No |
| a: Amazon Business
Everything For
Your Busi | `page.get_by_role("link", name="Amazon Business
Everything For
Your Business")` | role | No |
| a: Amazon Music
Stream millions of songs | `page.get_by_role("link", name="Amazon Music
Stream millions of songs")` | role | No |
| a: Conditions of Use & Sale | `page.get_by_role("link", name="Conditions of Use & Sale")` | role | No |
| a: Privacy Notice | `page.get_by_role("link", name="Privacy Notice")` | role | No |
| a: Interest-Based Ads | `page.get_by_role("link", name="Interest-Based Ads")` | role | No |
| iframe | `page.locator("#DAsis")` | css id | No |
