# NEXCART QA-NEXUS BENCHMARK SPECIFICATION
**Confidential Developer Reference • Not Exposed to Autonomous Testing Agents**

This benchmark defines the 14 intentionally planted, deterministic defects in the NEXCART e-commerce testbed. The suite is engineered to evaluate the full spectrum of an autonomous QA agent's capabilities: multi-step state tracking, boundary exploration, cross-page comparison, invariant inference, workflow reasoning, and API/UI consistency.

---

## Benchmark Summary Matrix

| ID | Title | Category | Difficulty | Primary Reasoning Capability |
|---|---|---|---|---|
| **BUG-01** | Cart Quantity and Total Mismatch | Quantity calculation | Easy | Boundary exploration & math invariant |
| **BUG-02** | Invalid Coupon Code `FAKE50` Accepted | Coupon validation | Easy | Input boundary & API response check |
| **BUG-03** | Out-of-Stock Product Can Be Purchased | Inventory constraint | Easy | State constraint verification |
| **BUG-04** | Checkout Accepts Incomplete Email (`customer@`) | Input validation | Easy | Regex & form validation exploration |
| **BUG-05** | Stale Checkout Summary after Cart Back-Navigation | Cross-page state inconsistency | Medium | Cross-page state tracking |
| **BUG-06** | Storefront Cart Badge De-synchronization on Removal | Cross-page state inconsistency | Medium | Cross-page invariant check |
| **BUG-07** | Inverted Shipping Fee on Coupon Application Boundary | Coupon & pricing interaction | Hard | Invariant inference (sum of parts != total) |
| **BUG-08** | Stale Discount Retention Below Minimum Threshold | Coupon & pricing interaction | Medium | Workflow reasoning & state invalidation |
| **BUG-09** | Quantity Boundary Underflow to Zero | Quantity & boundary conditions | Medium | Boundary exploration & input state transitions |
| **BUG-10** | Order Idempotency Failure on Browser Back-Navigation | Order lifecycle & duplicates | Medium | Workflow reasoning & lifecycle idempotency |
| **BUG-11** | Live Stock Depletion Race vs Cart Availability | Inventory & cart lifecycle | Hard | Cross-page comparison & inventory synchronization |
| **BUG-12** | Frontend/Backend Discount Rounding Discrepancy | Frontend/backend disagreement | Hard | Frontend/backend API consistency check |
| **BUG-13** | LocalStorage Deserialization Discount Drop on Refresh | Navigation & persistence | Hard | State persistence & hydration verification |
| **BUG-14** | Search & Category Filter Query Desynchronization | Search, filters & catalog state | Medium | Multi-filter interaction & UI-state coherence |

---

## Detailed Bug Profiles

### BUG-01: Cart Quantity and Line Total Mismatch
- **Difficulty**: Easy
- **Category**: Quantity calculation
- **Reasoning Needed**: Boundary exploration & math invariant
- **Preconditions**: Storefront loaded; cart contains 0 or 1 item.
- **Reproduction Sequence**:
  1. Add `AeroPulse Wireless Headphones` (unit price ₹2,499) to cart.
  2. Navigate to `/cart`. Observe quantity = 1, line subtotal = ₹2,499, and cart subtotal = ₹2,499.
  3. Click `+` (`data-testid="increase-quantity"`).
  4. Displayed quantity updates to `2`.
- **Expected Behavior**: Line total and cart subtotal should calculate as `2 × ₹2,499 = ₹4,998`.
- **Actual Behavior**: Line subtotal (`data-testid="item-line-total"`) and Cart Subtotal (`data-testid="cart-subtotal"`) remain ₹2,499 (unit price only).
- **Pages & APIs Involved**: `/cart`, `POST /api/cart/calculate`.
- **Observable Evidence**: Mismatch between formula `Quantity (2) * Unit Price (2499)` and the displayed line total text (`₹2,499`).

---

### BUG-02: Invalid Coupon Code `FAKE50` Accepted
- **Difficulty**: Easy
- **Category**: Coupon validation
- **Reasoning Needed**: Input boundary & API response check
- **Preconditions**: Cart has merchandise items.
- **Reproduction Sequence**:
  1. Navigate to `/cart`.
  2. In the coupon input (`data-testid="coupon-input"`), enter `FAKE50`.
  3. Click `Apply` (`data-testid="apply-coupon"`).
- **Expected Behavior**: Application rejects `FAKE50` with an error message and HTTP 400 Bad Request.
- **Actual Behavior**: Application accepts `FAKE50` with HTTP 200 OK, shows `Coupon "FAKE50" applied! 50% discount granted.`, and deducts 50% from the order.
- **Pages & APIs Involved**: `/cart`, `POST /api/coupons/apply`.
- **Observable Evidence**: Success banner in `data-testid="coupon-message"` and 50% deduction applied for an unauthorized code.

---

### BUG-03: Out-of-Stock Product Can Be Purchased
- **Difficulty**: Easy
- **Category**: Inventory constraint
- **Reasoning Needed**: State constraint verification
- **Preconditions**: Catalog item `prod-hub-05` (HyperConnect 8-in-1 USB-C Hub) has `stock: 0`.
- **Reproduction Sequence**:
  1. Open storefront `/` or product details `/products/prod-hub-05`.
  2. Observe "Out of Stock (0)" badge.
  3. Click `Add to Cart` (`data-testid="add-to-cart"`).
  4. Proceed to `/checkout`, fill details, and click `Place Demo Order` (`data-testid="place-order"`).
- **Expected Behavior**: "Add to Cart" button is disabled or checkout blocks purchase with an inventory out-of-stock warning (HTTP 409).
- **Actual Behavior**: The item is added to cart and checkout completes successfully with order confirmation.
- **Pages & APIs Involved**: `/`, `/products/:id`, `/cart`, `/checkout`, `POST /api/orders`.
- **Observable Evidence**: Order success page shows item with stock 0 confirmed and order reference issued.

---

### BUG-04: Checkout Accepts Incomplete Email (`customer@`)
- **Difficulty**: Easy
- **Category**: Input validation
- **Reasoning Needed**: Regex & form validation exploration
- **Preconditions**: Cart contains at least one item.
- **Reproduction Sequence**:
  1. Proceed to `/checkout`.
  2. In the email field (`data-testid="checkout-email"`), enter `customer@`.
  3. Fill other valid contact fields (Name, Phone, Address, City, PIN).
  4. Click `Place Demo Order` (`data-testid="place-order"`).
- **Expected Behavior**: Form validation rejects `customer@` because it lacks a domain and top-level domain.
- **Actual Behavior**: Validation passes and order is placed successfully. (Entering an email without `@` like `plainname` is rejected).
- **Pages & APIs Involved**: `/checkout`, `POST /api/orders`.
- **Observable Evidence**: Order success navigation occurs without validation errors despite malformed email format.

---

### BUG-05: Stale Checkout Summary after Cart Back-Navigation
- **Difficulty**: Medium
- **Category**: Cross-page state inconsistency
- **Reasoning Needed**: Cross-page state tracking
- **Preconditions**: Cart has 1 unit of `AeroPulse Wireless Headphones`.
- **Reproduction Sequence**:
  1. Navigate from `/cart` to `/checkout`.
  2. Observe Order Review shows `Qty: 1` and line total `₹2,499`.
  3. Click `Back to Shopping Cart` to return to `/cart`.
  4. Increment item quantity to `3`. (Cart total is now `3 × ₹2,499 = ₹7,497`).
  5. Click `Proceed to Checkout` to return to `/checkout`.
- **Expected Behavior**: Checkout Order Review should show updated `Qty: 3` and item total `₹7,497`.
- **Actual Behavior**: Checkout Order Review displays stale cached snapshot: `Qty: 1` and `₹2,499`.
- **Pages & APIs Involved**: `/checkout` (reading `sessionStorage` checkout snapshot) vs `/cart`.
- **Observable Evidence**: Discrepancy between `/cart` quantity (3) and `/checkout` review quantity (1).

---

### BUG-06: Storefront Cart Badge De-synchronization on Removal
- **Difficulty**: Medium
- **Category**: Cross-page state inconsistency
- **Reasoning Needed**: Cross-page invariant check
- **Preconditions**: Cart is initially empty (Badge count = 0).
- **Reproduction Sequence**:
  1. Add `AeroPulse Wireless Headphones` to cart.
  2. Add `SwiftGlide Wireless Gaming Mouse` to cart.
  3. Observe navbar cart badge displays `2` (`data-testid="nav-cart-count"`).
  4. Open `/cart`. The cart table displays 2 items.
  5. Click `data-testid="remove-from-cart"` on the Mouse item.
  6. The Mouse item is removed; only 1 item remains in the cart table.
  7. Check the persistent navbar cart badge (`data-testid="nav-cart-count"`).
- **Expected Behavior**: Navbar badge should decrement to `1`.
- **Actual Behavior**: Navbar badge remains at `2`.
- **Pages & APIs Involved**: Header navbar component across all routes vs `/cart` table.
- **Observable Evidence**: Invariant violation: `badgeCount == itemsInCart.length` evaluates to `2 == 1` (False).

---

### BUG-07: Inverted Shipping Fee on Coupon Application Boundary
- **Difficulty**: Hard
- **Category**: Coupon & pricing interaction
- **Reasoning Needed**: Invariant inference (sum of parts != total)
- **Preconditions**: Business rule: Orders of ₹3,000+ get Free Shipping; otherwise ₹99.
- **Reproduction Sequence**:
  1. Add `SoundWave 360 Portable Speaker` (₹2,199) and `TitanMesh MagSafe Case` (₹999) to cart.
  2. Gross Merchandise Subtotal = `₹2,199 + ₹999 = ₹3,198` (>= ₹3,000).
  3. Apply valid coupon `SAVE10`. 10% discount is `₹320`.
  4. Net discounted merchandise subtotal is `₹3,198 - ₹320 = ₹2,878` (< ₹3,000).
  5. Inspect the Order Summary lines.
- **Expected Behavior**: Either shipping displays ₹99 (if calculated post-discount) and total = `2878 + 99 = 2977`, OR shipping displays FREE (₹0) and total = `2878 + 0 = 2878`. The summary lines must sum to the total.
- **Actual Behavior**:
  - Subtotal line displays: `₹3,198`
  - Coupon line displays: `-₹320`
  - Shipping line displays: `₹0` (`FREE`)
  - Final Total (`data-testid="order-total"`) displays: `₹2,977` (secretly includes ₹99)!
- **Pages & APIs Involved**: `/cart`, `/checkout`.
- **Observable Evidence**: Arithmetic invariant `subtotal - discount + displayedShipping == finalTotal` fails: `3198 - 320 + 0 = 2878 != 2977`.

---

### BUG-08: Stale Discount Retention Below Minimum Threshold
- **Difficulty**: Medium
- **Category**: Coupon & pricing interaction
- **Reasoning Needed**: Workflow reasoning & state invalidation
- **Preconditions**: Coupon `SAVE10` requires a minimum order value of ₹2,000.
- **Reproduction Sequence**:
  1. Add `AeroPulse Wireless Headphones` (₹2,499) to cart.
  2. Apply coupon `SAVE10`. It succeeds (₹2,499 >= ₹2,000) with discount = `₹250`.
  3. Add `SwiftGlide Wireless Gaming Mouse` (₹1,299). Cart subtotal = ₹3,798.
  4. Remove `AeroPulse Wireless Headphones` from cart.
  5. Remaining cart subtotal is `₹1,299` (< ₹2,000 minimum threshold).
- **Expected Behavior**: Coupon is invalidated with an alert ("Cart subtotal is below minimum order value of ₹2,000 for SAVE10"), and discount becomes ₹0.
- **Actual Behavior**: Coupon remains active, and discount remains locked at the stale value `-₹250` on an ineligible ₹1,299 cart.
- **Pages & APIs Involved**: `/cart`.
- **Observable Evidence**: Coupon `SAVE10` remains active on an order with subtotal below ₹2,000.

---

### BUG-09: Quantity Boundary Underflow to Zero
- **Difficulty**: Medium
- **Category**: Quantity & boundary conditions
- **Reasoning Needed**: Boundary exploration & input state transitions
- **Preconditions**: Product detail page opened for any item.
- **Reproduction Sequence**:
  1. Open `/products/prod-mouse-04`.
  2. Quantity selector displays initial value `1`.
  3. Click `-` button.
  4. Selector decrements to `0`.
  5. Click `Add to Cart`.
  6. Navigate to `/cart`.
- **Expected Behavior**: Quantity selector should not decrement below `1`, or Add to Cart with 0 should be rejected.
- **Actual Behavior**: Item is added to cart with `quantity: 0`, rendered with `data-testid="cart-quantity"` as `0`, line total `₹0`, and allowed into checkout.
- **Pages & APIs Involved**: `/products/:id`, `/cart`.
- **Observable Evidence**: Cart line item renders with `quantity: 0` and allows proceeding to checkout.

---

### BUG-10: Order Idempotency Failure on Browser Back-Navigation
- **Difficulty**: Medium
- **Category**: Order lifecycle & duplicate actions
- **Reasoning Needed**: Workflow reasoning & lifecycle idempotency
- **Preconditions**: An order has just been placed and confirmed.
- **Reproduction Sequence**:
  1. Complete checkout to land on `/order-success` (e.g. Order ID `NEX-1001`).
  2. Click browser Back button (`history.back()`) to return to `/checkout`.
  3. The checkout form fields remain populated.
  4. Click `Place Demo Order` (`data-testid="place-order"`) again.
- **Expected Behavior**: App prevents re-submission (e.g., redirects to empty cart or shows "Order already processed").
- **Actual Behavior**: A second, duplicate order is placed and confirmed with a new Order ID (e.g. `NEX-2002`).
- **Pages & APIs Involved**: `/checkout`, `/order-success`, `POST /api/orders`.
- **Observable Evidence**: Duplicate order record created with identical customer and merchandise items.

---

### BUG-11: Live Stock Depletion Race vs Cart Availability
- **Difficulty**: Hard
- **Category**: Inventory & cart lifecycle
- **Reasoning Needed**: Cross-page comparison & inventory synchronization
- **Preconditions**: Product `prod-smartwatch-02` (NovaSync Smart Watch) initially has stock = 18.
- **Reproduction Sequence**:
  1. Add `prod-smartwatch-02` to cart while in stock.
  2. A stock depletion event occurs on the catalog (via `POST /api/products/prod-smartwatch-02/stock` with `{ stock: 0 }`).
  3. Open product detail `/products/prod-smartwatch-02`: displays "Out of Stock (0 remaining)".
  4. Open shopping cart `/cart`: cart item snapshot displays "In Stock (18 units available)".
- **Expected Behavior**: The cart should synchronize with current catalog/backend stock and indicate out-of-stock or require item removal.
- **Actual Behavior**: Detail page and Cart page display contradictory stock availability states.
- **Pages & APIs Involved**: `/products/:id`, `/cart`, `POST /api/products/:id/stock`.
- **Observable Evidence**: Cross-page stock state discrepancy for the same product ID.

---

### BUG-12: Frontend/Backend Discount Rounding Discrepancy
- **Difficulty**: Hard
- **Category**: Frontend/backend disagreement
- **Reasoning Needed**: Frontend/backend API consistency check
- **Preconditions**: Product with odd price: `prod-headphones-01` (₹2,499) with 10% coupon (`SAVE10`).
- **Reproduction Sequence**:
  1. Add `prod-headphones-01` (₹2,499) to cart.
  2. Apply coupon `SAVE10`.
  3. `10% of ₹2,499 = ₹249.90`.
  4. Frontend UI: rounds discount with `Math.round(249.9) = 250`.
     - Subtotal: ₹2,499, Discount: ₹250, Shipping: ₹99.
     - Frontend UI Total = `₹2,348`.
  5. Submit order to backend (`POST /api/orders`):
     - Backend computes discount with `Math.floor(249.9) = 249`.
     - Backend records Total = `2499 - 249 + 99 = 2349`.
- **Expected Behavior**: Frontend checkout total and backend recorded order total must be identical.
- **Actual Behavior**: Frontend UI displays `Total: ₹2,348`, but backend order response and receipt record `total: 2349` (1-rupee difference).
- **Pages & APIs Involved**: `/checkout`, `POST /api/orders`.
- **Observable Evidence**: Discrepancy between UI checkout total and API response payload total.

---

### BUG-13: LocalStorage Deserialization Discount Drop on Refresh
- **Difficulty**: Hard
- **Category**: Navigation & persistence
- **Reasoning Needed**: State persistence & hydration verification
- **Preconditions**: Cart has merchandise items and active coupon `SAVE10`.
- **Reproduction Sequence**:
  1. Add `NovaSync AMOLED Smart Watch` (₹3,999) to cart.
  2. Apply coupon `SAVE10`. Discount displays `-₹400` and total is `₹3,599`.
  3. Refresh the page in the browser (`F5` or `window.location.reload()`) while on `/cart`.
- **Expected Behavior**: After reload, coupon badge is active AND discount is restored to `-₹400` with total `₹3,599`.
- **Actual Behavior**: The coupon badge is restored in the UI, but the discount value rehydrates as `₹0` until the user interacts with a quantity stepper or re-applies the coupon. The total jumps to `₹3,999`.
- **Pages & APIs Involved**: `/cart` (localStorage hydration lifecycle).
- **Observable Evidence**: Coupon is visually active, but discount line is missing or ₹0, and total equals undiscounted subtotal.

---

### BUG-14: Search & Category Filter Query Desynchronization
- **Difficulty**: Medium
- **Category**: Search, filters & catalog state
- **Reasoning Needed**: Multi-filter interaction & UI-state coherence
- **Preconditions**: Storefront loaded with all products visible.
- **Reproduction Sequence**:
  1. On `/`, type `"keyboard"` into the search input (`data-testid="search-input"`).
  2. The catalog filters to show 1 item ("Vortex RGB Mechanical Keyboard").
  3. Click category tab `"Electronics"` (`data-testid="category-filter"`).
  4. The search input field clears visually (appears empty).
- **Expected Behavior**: Clicking "Electronics" should display all electronics items (since the search input is visually empty).
- **Actual Behavior**: Internal filter state retains `"keyboard"` while filtering category `"Electronics"`, producing 0 matches ("No products found") despite the search box visually appearing blank.
- **Pages & APIs Involved**: Storefront catalog filtering (`/`).
- **Observable Evidence**: UI displays empty search input + "Electronics" category pill active, but 0 products found.

---

## Benchmark Execution & Regression Test Instructions

To verify all 14 bugs programmatically without manual browser steps:

```bash
npm run test:bugs
```

All 15 test assertions (1 Happy Path + 14 Bugs) must pass with `15/15 PASSED (100% Deterministic)`.
