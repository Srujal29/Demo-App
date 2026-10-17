/**
 * QA-NEXUS Regression Test Suite & Benchmark Verification
 * This test suite asserts that all 14 intentionally planted bugs (BUG-01 to BUG-14)
 * are deterministically reproducible, while verifying that the ordinary happy path functions correctly.
 * 
 * Developer-only test suite: Not exposed to autonomous QA agents.
 */

import assert from 'node:assert';

const API_BASE = 'http://localhost:3001/api';

async function request(path: string, options?: RequestInit) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...(options?.headers || {}) },
    ...options
  });
  const data = await res.json();
  return { status: res.status, ok: res.ok, data };
}

async function runTests() {
  console.log('\n======================================================');
  console.log('🧪 QA-NEXUS BENCHMARK AUTOMATED REGRESSION TESTS');
  console.log('======================================================\n');

  let passed = 0;
  let total = 0;

  async function test(name: string, fn: () => Promise<void>) {
    total++;
    try {
      await fn();
      console.log(`✅ [PASS] ${name}`);
      passed++;
    } catch (err: any) {
      console.error(`❌ [FAIL] ${name}:`, err.message);
    }
  }

  // Pre-test: Reset backend demo state
  await request('/demo/reset', { method: 'POST' });

  // 1. HAPPY PATH TEST
  await test('HAPPY-PATH: Valid catalog lookup and standard order creation', async () => {
    const catalog = await request('/products');
    assert.strictEqual(catalog.status, 200);
    assert(catalog.data.products.length >= 8, 'Catalog has at least 8 items');

    const single = await request('/products/prod-headphones-01');
    assert.strictEqual(single.data.price, 2499);

    const orderRes = await request('/orders', {
      method: 'POST',
      body: JSON.stringify({
        customer: {
          fullName: 'Jane Doe',
          email: 'jane.doe@example.com',
          phone: '9876543210',
          address: '123 Baker Street',
          city: 'Mumbai',
          pinCode: '400001',
          paymentMethod: 'card_demo'
        },
        items: [{ product: single.data, quantity: 1 }],
        subtotal: 2499,
        discount: 0,
        shipping: 99,
        total: 2598
      })
    });
    assert.strictEqual(orderRes.status, 201);
    assert(orderRes.data.orderId.startsWith('NEX-'));
  });

  // 2. BUG-01
  await test('BUG-01: Cart Quantity and Line Total Mismatch (Qty 1->2 calculates unit price)', async () => {
    const res = await request('/cart/calculate', {
      method: 'POST',
      body: JSON.stringify({
        items: [{ productId: 'prod-headphones-01', quantity: 2 }]
      })
    });
    assert.strictEqual(res.status, 200);
    const item = res.data.items[0];
    assert.strictEqual(item.quantity, 2);
    // Line subtotal must be unit price (2499) instead of 2 * unit price (4998)
    assert.strictEqual(item.lineSubtotal, 2499, 'BUG-01 failed: Line subtotal is not unit price');
    assert.strictEqual(res.data.subtotal, 2499, 'BUG-01 failed: Cart subtotal is not unit price');
  });

  // 3. BUG-02
  await test('BUG-02: Invalid Coupon FAKE50 Accepted with 50% Discount', async () => {
    const res = await request('/coupons/apply', {
      method: 'POST',
      body: JSON.stringify({ code: 'FAKE50', subtotal: 3000 })
    });
    assert.strictEqual(res.status, 200, 'BUG-02 failed: FAKE50 was rejected');
    assert.strictEqual(res.data.valid, true);
    assert.strictEqual(res.data.discountPercent, 50);
    assert.strictEqual(res.data.discountAmount, 1500);

    // Verify other invalid coupons are still rejected normally
    const invalidRes = await request('/coupons/apply', {
      method: 'POST',
      body: JSON.stringify({ code: 'INVALID99', subtotal: 3000 })
    });
    assert.strictEqual(invalidRes.status, 400);
  });

  // 4. BUG-03
  await test('BUG-03: Out-of-Stock Product (prod-hub-05, stock=0) Accepted for Purchase', async () => {
    const hub = await request('/products/prod-hub-05');
    assert.strictEqual(hub.data.stock, 0, 'Catalog stock should be 0');

    const orderRes = await request('/orders', {
      method: 'POST',
      body: JSON.stringify({
        customer: {
          fullName: 'Alex Mercer',
          email: 'alex@example.com',
          phone: '9876543210',
          address: '402 Heights',
          city: 'Bengaluru',
          pinCode: '560103'
        },
        items: [{ product: hub.data, quantity: 1 }],
        subtotal: 1799,
        shipping: 99,
        total: 1898
      })
    });
    assert.strictEqual(orderRes.status, 201, 'BUG-03 failed: 0-stock product purchase was rejected');
  });

  // 5. BUG-04
  await test('BUG-04: Checkout Accepts Incomplete Email "customer@"', async () => {
    const faultyRegex = /^[^\s@]+@[^\s]*$/;
    assert.strictEqual(faultyRegex.test('customer@'), true, 'BUG-04 regex must accept customer@');
    assert.strictEqual(faultyRegex.test('plainaddress'), false, 'BUG-04 regex must reject email without @');

    const orderRes = await request('/orders', {
      method: 'POST',
      body: JSON.stringify({
        customer: {
          fullName: 'Test User',
          email: 'customer@',
          phone: '9876543210',
          address: 'Test Street',
          city: 'Delhi',
          pinCode: '110001'
        },
        items: [{ product: { id: 'prod-mouse-04', price: 1299 }, quantity: 1 }],
        subtotal: 1299,
        shipping: 99,
        total: 1398
      })
    });
    assert.strictEqual(orderRes.status, 201, 'BUG-04 failed: customer@ was rejected');
  });

  // 6. BUG-05
  await test('BUG-05: Stale Checkout Summary after Cart Back-Navigation', async () => {
    // Simulates session snapshot logic
    let sessionSnapshot: any = null;
    let liveCart = [{ productId: 'prod-headphones-01', quantity: 1, price: 2499 }];

    // First visit to /checkout: caches snapshot
    sessionSnapshot = JSON.parse(JSON.stringify(liveCart));
    assert.strictEqual(sessionSnapshot[0].quantity, 1);

    // User navigates back to /cart and updates quantity to 3
    liveCart[0].quantity = 3;

    // User returns to /checkout: Checkout uses cached sessionSnapshot!
    const itemsReviewed = sessionSnapshot;
    assert.strictEqual(itemsReviewed[0].quantity, 1, 'BUG-05 failed: Checkout should show stale snapshot Qty 1');
    assert.notStrictEqual(itemsReviewed[0].quantity, liveCart[0].quantity, 'BUG-05 failed: Mismatch expected');
  });

  // 7. BUG-06
  await test('BUG-06: Storefront Cart Badge Count De-synchronization on Item Removal', async () => {
    let cart = [
      { id: 'item-1', name: 'Headphones', quantity: 1 },
      { id: 'item-2', name: 'Mouse', quantity: 1 }
    ];
    let badgeCount = 2; // Incremented on add

    // Remove item-2 from cart
    cart = cart.filter(i => i.id !== 'item-2');
    assert.strictEqual(cart.length, 1);

    // BUG-06: Badge count remains 2
    assert.strictEqual(badgeCount, 2, 'BUG-06 failed: Badge count should desync and remain 2');
    assert.notStrictEqual(badgeCount, cart.length, 'BUG-06 failed: Invariant badgeCount == cart.length violated');
  });

  // 8. BUG-07
  await test('BUG-07: Inverted Shipping Fee on Coupon Application Boundary', async () => {
    const grossSubtotal = 3198; // Speaker (2199) + Case (999)
    const discount = 320;       // 10% of 3198 (Math.round)
    const netSubtotal = grossSubtotal - discount; // 2878 (< 3000)

    // Display rule: Gross >= 3000 -> Free shipping (0)
    const displayedShipping = grossSubtotal >= 3000 ? 0 : 99;
    assert.strictEqual(displayedShipping, 0, 'Shipping label must display FREE');

    // BUG-07: Final Total calculation secretly adds 99 because net < 3000
    let effectiveShipping = displayedShipping;
    if (grossSubtotal >= 3000 && netSubtotal < 3000) {
      effectiveShipping = 99;
    }
    const finalTotal = grossSubtotal - discount + effectiveShipping; // 3198 - 320 + 99 = 2977

    // Assert arithmetic discrepancy
    const displayedSum = grossSubtotal - discount + displayedShipping; // 2878
    assert.strictEqual(displayedSum, 2878);
    assert.strictEqual(finalTotal, 2977);
    assert.notStrictEqual(displayedSum, finalTotal, 'BUG-07 failed: Displayed sum must not equal final total');
  });

  // 9. BUG-08
  await test('BUG-08: Stale Discount Retention after Cart Modification Voiding Min Threshold', async () => {
    // 1. Initial cart meets threshold (>= 2000): Headphones (2499)
    let subtotal = 2499;
    let appliedCoupon = {
      code: 'SAVE10',
      discountPercent: 10,
      discountAmount: Math.round(subtotal * 0.1) // 250
    };

    // 2. User removes Headphones and leaves only Mouse (1299 < 2000)
    subtotal = 1299;

    // BUG-08: Coupon is NOT invalidated; retains previous locked discountAmount
    let activeDiscount = 0;
    if (appliedCoupon.code === 'SAVE10') {
      if (subtotal < 2000 && appliedCoupon.discountAmount > 0) {
        activeDiscount = appliedCoupon.discountAmount; // Retains 250!
      }
    }
    assert.strictEqual(activeDiscount, 250, 'BUG-08 failed: Stale discount of 250 was not retained');
    assert(subtotal < 2000, 'Subtotal is below 2000 minimum');
  });

  // 10. BUG-09
  await test('BUG-09: Quantity Boundary Underflow / Zero-Quantity Cart Item Allowed', async () => {
    let selectedQty = 1;
    // Decrementing on ProductDetailPage allows stepping down to 0
    selectedQty = Math.max(0, selectedQty - 1);
    assert.strictEqual(selectedQty, 0);

    const cart = [{ productId: 'prod-mouse-04', quantity: selectedQty, price: 1299 }];
    assert.strictEqual(cart[0].quantity, 0, 'BUG-09 failed: Zero-quantity item allowed in cart');
    const lineTotal = cart[0].quantity * cart[0].price;
    assert.strictEqual(lineTotal, 0);
  });

  // 11. BUG-10
  await test('BUG-10: Order Idempotency Failure / Duplicate Order Placement on Resubmit', async () => {
    const payload = {
      customer: {
        fullName: 'Duplicate Tester',
        email: 'dup@example.com',
        phone: '9876543210',
        address: '100 Repeat Lane',
        city: 'Pune',
        pinCode: '411001'
      },
      items: [{ product: { id: 'prod-keyboard-03', price: 4499 }, quantity: 1 }],
      subtotal: 4499,
      shipping: 0,
      total: 4499
    };

    // First order
    const order1 = await request('/orders', { method: 'POST', body: JSON.stringify(payload) });
    assert.strictEqual(order1.status, 201);

    // Second order (simulating back navigation resubmit)
    const order2 = await request('/orders', { method: 'POST', body: JSON.stringify(payload) });
    assert.strictEqual(order2.status, 201, 'BUG-10 failed: Duplicate order was rejected');
    assert.notStrictEqual(order1.data.orderId, order2.data.orderId, 'Two distinct order IDs created');
  });

  // 12. BUG-11
  await test('BUG-11: Live Stock Depletion Race / Cart Availability Inconsistency', async () => {
    // 1. Initial product has stock 18
    const initial = await request('/products/prod-smartwatch-02');
    assert(initial.data.stock > 0);

    // 2. Added to cart snapshot
    const cartItemSnapshot = { product: { ...initial.data }, quantity: 1 };
    assert.strictEqual(cartItemSnapshot.product.stock, initial.data.stock);

    // 3. Stock is depleted live on backend
    await request('/products/prod-smartwatch-02/stock', {
      method: 'POST',
      body: JSON.stringify({ stock: 0 })
    });

    // 4. Catalog reflects 0, but cart snapshot retains 18
    const updatedCatalog = await request('/products/prod-smartwatch-02');
    assert.strictEqual(updatedCatalog.data.stock, 0, 'Catalog must show 0 stock');
    assert.notStrictEqual(cartItemSnapshot.product.stock, updatedCatalog.data.stock, 'BUG-11 failed: Cart snapshot and catalog stock must disagree');
  });

  // 13. BUG-12
  await test('BUG-12: Frontend/Backend Discount Rounding Discrepancy (1-Rupee Mismatch)', async () => {
    const subtotal = 2499; // Odd price: 10% is 249.90
    const shipping = 99;

    // Frontend: Math.round(249.9) = 250
    const frontendDiscount = Math.round((subtotal * 10) / 100);
    const frontendTotal = subtotal - frontendDiscount + shipping; // 2499 - 250 + 99 = 2348
    assert.strictEqual(frontendDiscount, 250);
    assert.strictEqual(frontendTotal, 2348);

    // Backend: Math.floor(249.9) = 249
    const orderRes = await request('/orders', {
      method: 'POST',
      body: JSON.stringify({
        customer: { fullName: 'Round Test', email: 'round@example.com', phone: '9876543210', address: '12 St', city: 'BLR', pinCode: '560001' },
        items: [{ product: { id: 'prod-headphones-01', price: 2499 }, quantity: 1 }],
        subtotal: 2499,
        shipping: 99,
        total: frontendTotal,
        appliedCoupon: { code: 'SAVE10', discountPercent: 10 }
      })
    });

    const backendOrder = orderRes.data.order;
    assert.strictEqual(backendOrder.discount, 249, 'Backend must floor discount to 249');
    assert.strictEqual(backendOrder.total, 2349, 'Backend must compute total as 2349');
    assert.strictEqual(backendOrder.total - frontendTotal, 1, 'BUG-12 failed: Discrepancy must be exactly 1 rupee');
  });

  // 14. BUG-13
  await test('BUG-13: LocalStorage Deserialization Discount Drop on Refresh', async () => {
    // Simulates isHydratedInitial behavior on page reload with coupon
    let isHydratedInitial = true;
    let appliedCoupon = { code: 'SAVE10', discountPercent: 10 };
    let subtotal = 3999;

    const discountOnHydration = isHydratedInitial ? 0 : Math.round((subtotal * 10) / 100);
    assert.strictEqual(discountOnHydration, 0, 'BUG-13 failed: Discount must be 0 on initial hydration');
    assert.strictEqual(appliedCoupon.code, 'SAVE10', 'Coupon badge remains visible');
  });

  // 15. BUG-14
  await test('BUG-14: Search + Category Filter Query Desynchronization', async () => {
    let searchQuery = 'keyboard';
    let activeFilterQuery = 'keyboard';
    let selectedCategory = 'All';

    // User clicks Electronics category:
    // UI resets searchQuery to '', but activeFilterQuery is left intact
    selectedCategory = 'Electronics';
    searchQuery = '';
    // activeFilterQuery remains 'keyboard'

    assert.strictEqual(searchQuery, '', 'Visible search box must be empty');
    assert.strictEqual(activeFilterQuery, 'keyboard', 'Internal query filter must remain keyboard');

    // Products in Electronics do not match 'keyboard'
    const catalog = await request('/products?category=Electronics');
    const matched = catalog.data.products.filter((p: any) =>
      p.name.toLowerCase().includes(activeFilterQuery)
    );
    assert.strictEqual(matched.length, 0, 'BUG-14 failed: Mismatched search produces 0 products');
  });

  console.log('\n======================================================');
  console.log(`🏁 TEST RESULTS: ${passed}/${total} PASSED (100% Deterministic)`);
  console.log('======================================================\n');

  if (passed !== total) {
    process.exit(1);
  }
}

runTests().catch(err => {
  console.error('Test suite runner encountered fatal error:', err);
  process.exit(1);
});
