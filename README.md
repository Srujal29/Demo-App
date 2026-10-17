# NEXCART — E-Commerce Demo Target for QA-NEXUS

**NEXCART** is a high-fidelity, responsive e-commerce web application engineered specifically as the target testing fixture for **QA-NEXUS** (an autonomous AI QA engineer that explores web applications, discovers bugs, reproduces failures, captures evidence, and generates regression test suites).

The application features a complete consumer electronics storefront with an accompanying **Node/Express REST API backend**, enabling both frontend browser-level (Playwright) and backend API-level (HTTP/REST) automated quality assurance testing.

---

## 1. Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS, React Router v6, Lucide Icons, Vite
- **Backend API**: Node.js, Express, TypeScript (`tsx`), CORS, JSON middleware
- **Architecture**:
  - Storefront UI: `http://localhost:3000`
  - REST API Server: `http://localhost:3001` (proxied automatically via `/api/*` in Vite)
  - Unified Runner: `npm run dev` concurrently launches both frontend and backend

---

## 2. Quick Start & Run Commands

### Prerequisites
- Node.js `v18+` or `v20+` (tested with v22.20.0)
- npm `v9+` or `v11+`

### Installation
```bash
npm install
```

### Run Frontend & Backend Concurrently (Recommended)
```bash
npm run dev
```
- Storefront UI will be available at: **http://localhost:3000**
- Backend API will be available at: **http://localhost:3001**
- Health Check: **http://localhost:3001/api/health**

### Run Individual Services (Optional)
- **Backend Only**: `npm run server` (runs Express on port 3001)
- **Frontend Only**: `npm run dev:client` (runs Vite on port 3000)
- **Production Build**: `npm run build` (type-checks and builds bundle to `/dist`)

---

## 3. Storefront Routes

| Route | Description |
|---|---|
| `/` | Storefront catalog with category filtering, search, and price sorting |
| `/products/:id` | Detailed product specifications, reviews, and add-to-cart controls |
| `/cart` | Shopping cart drawer/page with line subtotals, coupon input, and checkout link |
| `/checkout` | Customer information, delivery address, and demo payment method selector |
| `/order-success` | Order confirmation screen with reference ID and order summary |
| `*` | 404 Not Found page with return-to-catalog navigation |

---

## 4. Backend REST API Reference

The backend API server runs on port `3001` (and is also accessible through the frontend proxy at `http://localhost:3000/api/*`):

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Server health check and uptime status |
| `GET` | `/api/products` | Retrieve catalog with optional `?category=` and `?search=` filters |
| `GET` | `/api/products/:id` | Retrieve single product specifications |
| `POST` | `/api/cart/calculate` | Compute line subtotals and shipping (**reproduces BUG-01**) |
| `POST` | `/api/coupons/apply` | Validate promo code (**reproduces BUG-02** with `FAKE50`) |
| `POST` | `/api/orders` | Submit demo order (**reproduces BUG-03** & **BUG-04**) |
| `GET` | `/api/orders/:id` | Fetch placed order receipt |
| `POST` | `/api/demo/reset` | Restore backend memory state to initial catalog baseline |
| `GET` | `/api/debug/bugs` | Automated test fixture manifest describing all 4 planted bugs |

---

## 5. Stable Test Identifiers (`data-testid`)

The application provides stable, accessibility-friendly test selectors designed specifically for Playwright and QA-NEXUS automation:

| `data-testid` | Element Description |
|---|---|
| `product-card` | Container card for each product in the catalog grid |
| `add-to-cart` | Button to add product to shopping cart |
| `cart-quantity` | Displayed numeric quantity for an item in the cart |
| `increase-quantity` | `+` button to increment cart item quantity |
| `decrease-quantity` | `-` button to decrement cart item quantity |
| `item-line-total` | Line item total amount display in cart |
| `cart-subtotal` | Overall cart merchandise subtotal amount display |
| `coupon-input` | Text input for entering coupon promo code |
| `apply-coupon` | Button to trigger coupon validation |
| `coupon-message` | Feedback container showing success or error coupon message |
| `checkout-button` | Navigation button from cart to checkout page |
| `checkout-email` | Email input field on checkout form |
| `place-order` | Final button to submit demo order |
| `order-id` | Unique order confirmation reference code |
| `reset-demo` | Global control to restore clean initial test state |
| `category-filter` | Category filter container on storefront |
| `search-input` | Catalog search text input |
| `sort-select` | Catalog sort dropdown (`featured`, `price-asc`, `price-desc`, `rating`) |
| `clear-cart` | Button to empty entire cart |
| `remove-from-cart` | Button to delete specific item from cart |

---

## 6. Intentionally Planted Bugs (Test Fixtures)

These four bugs are **deterministic test fixtures** intentionally planted for QA-NEXUS discovery. They must remain reproducible across browser sessions and API calls.

### BUG-01: Cart Quantity and Total Mismatch
- **Location**: Frontend `src/context/StoreContext.tsx` (`calculateLineSubtotal`) & Backend `server/index.ts` (`/api/cart/calculate`)
- **Description**: When the quantity of a product is increased from 1 to 2, the displayed quantity badge updates to 2, but the product's subtotal is incorrectly calculated using the unit price only (1 × unit price instead of 2 × unit price).
- **Reproduction Steps**:
  1. Navigate to `/` and add `AeroPulse Wireless Headphones` (unit price ₹2,499) to cart.
  2. Open `/cart`. Note that quantity is 1 and line total is ₹2,499.
  3. Click the `+` button (`data-testid="increase-quantity"`).
  4. Quantity updates to 2.
- **Expected Behavior**: Line subtotal should become `2 × ₹2,499 = ₹4,998`.
- **Actual Behavior**: Line subtotal (`data-testid="item-line-total"`) and Cart Subtotal (`data-testid="cart-subtotal"`) remain ₹2,499.

---

### BUG-02: Invalid Coupon Accepted (`FAKE50`)
- **Location**: Frontend `src/context/StoreContext.tsx` (`applyCoupon`) & Backend `server/index.ts` (`/api/coupons/apply`)
- **Description**: The legitimate discount code is `SAVE10` (10% discount). However, entering the invalid coupon code `FAKE50` is erroneously accepted, displaying a success message and deducting a 50% discount from the order subtotal.
- **Reproduction Steps**:
  1. Add any product to the cart and navigate to `/cart`.
  2. In the coupon input (`data-testid="coupon-input"`), enter `FAKE50`.
  3. Click `Apply` (`data-testid="apply-coupon"`).
- **Expected Behavior**: Application should reject invalid promo codes with an error message (e.g., "Invalid coupon code").
- **Actual Behavior**: Application displays `Coupon "FAKE50" applied! 50% discount granted.` in `data-testid="coupon-message"`, and deducts 50% from the order total.

---

### BUG-03: Out-of-Stock Product Can Be Purchased
- **Location**: Catalog item `prod-hub-05` (HyperConnect 8-in-1 USB-C Hub), `src/components/ProductCard.tsx`, `src/pages/ProductDetailPage.tsx`, and `server/index.ts` (`/api/orders`)
- **Description**: The catalog item `HyperConnect 8-in-1 USB-C Hub` has its stock explicitly set to `0` and displays an `Out of Stock (0)` badge. Despite this, the application allows users to add the item to the cart, navigate to checkout, and complete the order.
- **Reproduction Steps**:
  1. Locate `HyperConnect 8-in-1 USB-C Hub` in the catalog (visible with "Out of Stock (0)" badge).
  2. Click `Add to Cart` (`data-testid="add-to-cart"`).
  3. Navigate to `/cart` and click `Proceed to Checkout` (`data-testid="checkout-button"`).
  4. Complete the checkout form and click `Place Demo Order` (`data-testid="place-order"`).
- **Expected Behavior**: "Add to Cart" should be disabled for 0-stock products, and the checkout/order API should reject orders containing out-of-stock items with HTTP 400/409.
- **Actual Behavior**: Item is added to cart, passes checkout, and reaches `/order-success` with a valid order ID.

---

### BUG-04: Checkout Accepts Invalid Email (`customer@`)
- **Location**: Frontend `src/pages/CheckoutPage.tsx` (`validate`) & Backend `server/index.ts` (`/api/orders`)
- **Description**: The email validation logic uses a flawed regular expression (`/^[^\s@]+@[^\s]*$/`) that accepts incomplete email addresses ending in `@` without any domain (such as `customer@`).
- **Reproduction Steps**:
  1. Add any item to the cart and proceed to `/checkout`.
  2. In the Email Address field (`data-testid="checkout-email"`), enter `customer@`.
  3. Fill the remaining required fields (Full Name, Phone, Address, City, PIN code).
  4. Click `Place Demo Order` (`data-testid="place-order"`).
- **Expected Behavior**: Form validation should reject `customer@` with an error message such as "Please enter a valid email address with a domain".
- **Actual Behavior**: Form validation succeeds, and the demo order is created and confirmed.

---

## 7. Demo Reset Control

A visible **Reset Demo** control is available in both the top navigation header and footer (`data-testid="reset-demo"`):
- Clears active cart items
- Resets applied coupons and discounts
- Clears saved orders from localStorage
- Calls `POST /api/demo/reset` on the backend
- Restores initial catalog state without fixing the intentional test bugs
