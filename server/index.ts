import express, { Request, Response } from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// In-memory catalog seed
interface BackendProduct {
  id: string;
  name: string;
  tagline: string;
  description: string;
  category: 'Electronics' | 'Accessories' | 'Lifestyle';
  price: number;
  originalPrice?: number;
  rating: number;
  reviewsCount: number;
  stock: number;
  image: string;
  badge?: string;
  features: string[];
  specs: Record<string, string>;
}

const INITIAL_CATALOG: BackendProduct[] = [
  {
    id: 'prod-headphones-01',
    name: 'AeroPulse Wireless Headphones',
    tagline: 'Active Noise Cancelling with 40h Battery Life',
    description: 'Immerse yourself in studio-grade audio fidelity with AeroPulse. Featuring 40mm beryllium drivers, hybrid active noise cancellation, low-latency Bluetooth 5.3, and ultra-plush memory foam earcups for all-day comfort.',
    category: 'Electronics',
    price: 2499,
    originalPrice: 3999,
    rating: 4.8,
    reviewsCount: 342,
    stock: 25,
    badge: 'Best Seller',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80',
    features: ['Hybrid Active Noise Cancellation', '40-hour playback', 'Bluetooth 5.3'],
    specs: { 'Driver Size': '40mm Dynamic', 'Battery Life': '40 Hours' }
  },
  {
    id: 'prod-smartwatch-02',
    name: 'NovaSync AMOLED Smart Watch',
    tagline: 'Precision Health Sensors & 1.95" Ultra Display',
    description: 'Stay ahead of your metrics with NovaSync. Boasting an always-on AMOLED curved display with 1000 nits peak brightness, continuous SpO2 and heart rate tracking, titanium bezel, and water resistance up to 50 meters.',
    category: 'Electronics',
    price: 3999,
    originalPrice: 5499,
    rating: 4.9,
    reviewsCount: 512,
    stock: 18,
    badge: 'Popular',
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80',
    features: ['1.95" AMOLED Display', 'Heart rate & SpO2', '5ATM Waterproof'],
    specs: { 'Display': '1.95 inch AMOLED', 'Battery Life': '12 Days' }
  },
  {
    id: 'prod-keyboard-03',
    name: 'Vortex RGB Mechanical Keyboard',
    tagline: 'Hot-Swappable Gateron Pro Switches & CNC Aluminum',
    description: 'Engineered for coders and gamers who demand tactile perfection. Includes pre-lubed mechanical switches, south-facing per-key RGB backlighting, gasket mount structure with sound-dampening foam, and full Mac/Windows switchability.',
    category: 'Accessories',
    price: 4499,
    originalPrice: 5999,
    rating: 4.7,
    reviewsCount: 189,
    stock: 12,
    badge: 'Editor\'s Choice',
    image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&auto=format&fit=crop&q=80',
    features: ['Hot-swappable PCB', 'Gasket Mount', 'Tri-mode wireless'],
    specs: { 'Layout': '75% Compact', 'Switch': 'Gateron Pro Yellow' }
  },
  {
    id: 'prod-mouse-04',
    name: 'SwiftGlide Wireless Gaming Mouse',
    tagline: 'Ultralight 58g Chassis & 26K DPI Optical Sensor',
    description: 'Experience effortless glide and pinpoint accuracy. SwiftGlide combines a symmetrical lightweight shell with zero smoothing or acceleration, optical micro-switches rated for 90M clicks, and up to 80 hours of high-performance gaming.',
    category: 'Accessories',
    price: 1299,
    originalPrice: 1999,
    rating: 4.6,
    reviewsCount: 220,
    stock: 35,
    badge: 'Top Value',
    image: 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=800&auto=format&fit=crop&q=80',
    features: ['58g Lightweight', '26,000 DPI PAW3395 Sensor', 'PTFE Skates'],
    specs: { 'Weight': '58g', 'DPI': '26,000' }
  },
  {
    id: 'prod-hub-05',
    name: 'HyperConnect 8-in-1 USB-C Hub',
    tagline: '4K@60Hz HDMI, 100W Power Delivery & Gigabit LAN',
    description: 'Transform a single USB-C port into a complete command center. Features dual USB 3.2 Gen 2 ports, SD/MicroSD UHS-I card readers, 4K@60Hz HDMI output, Gigabit Ethernet, and 100W PD pass-through in an aerospace aluminum body.',
    category: 'Accessories',
    price: 1799,
    originalPrice: 2499,
    rating: 4.5,
    reviewsCount: 164,
    stock: 0, // BUG-03: Stock is 0, yet order placement is allowed!
    badge: 'Out of Stock',
    image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800&auto=format&fit=crop&q=80',
    features: ['4K@60Hz HDMI', '100W PD 3.0 Pass-through', 'Gigabit Ethernet'],
    specs: { 'Ports': '8-in-1', 'Material': 'Aluminum' }
  },
  {
    id: 'prod-speaker-06',
    name: 'SoundWave 360 Portable Speaker',
    tagline: 'Spatial Audio, IPX7 Waterproofing & Party Sync',
    description: 'Fill any room or outdoor gathering with crisp 360-degree acoustics and punchy dual passive bass radiators.',
    category: 'Electronics',
    price: 2199,
    originalPrice: 2999,
    rating: 4.6,
    reviewsCount: 298,
    stock: 20,
    badge: 'Popular',
    image: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=800&auto=format&fit=crop&q=80',
    features: ['30W Peak Power', 'IPX7 Waterproof', '16h Battery'],
    specs: { 'Power': '30W Peak', 'Rating': 'IPX7' }
  },
  {
    id: 'prod-stand-07',
    name: 'ErgoLift Aluminum Laptop Stand',
    tagline: 'Adjustable Dual-Pivot Ergonomics & Heat Dissipation',
    description: 'Elevate your workspace posture and keep your laptop running cool.',
    category: 'Accessories',
    price: 1499,
    originalPrice: 1999,
    rating: 4.8,
    reviewsCount: 410,
    stock: 30,
    badge: 'Ergonomic',
    image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=800&auto=format&fit=crop&q=80',
    features: ['Dual-pivot stepless height', 'Aluminum alloy', 'Ventilated'],
    specs: { 'Material': '6063 Aluminum', 'Max Weight': '6kg' }
  },
  {
    id: 'prod-powerbank-08',
    name: 'VoltCore 20000mAh Power Bank',
    tagline: '65W Fast Charge Laptop & Smartphone Companion',
    description: 'High-density lithium polymer battery bank equipped with 65W Power Delivery to charge your laptop and phone simultaneously.',
    category: 'Lifestyle',
    price: 1899,
    originalPrice: 2799,
    rating: 4.7,
    reviewsCount: 375,
    stock: 22,
    badge: 'Fast Charge',
    image: 'https://images.unsplash.com/photo-1609592426867-eb95a452fc38?w=800&auto=format&fit=crop&q=80',
    features: ['65W USB-C PD output', '20000mAh capacity', 'Triple-port charging'],
    specs: { 'Capacity': '20,000 mAh', 'Max Output': '65W' }
  }
];

let products = [...INITIAL_CATALOG];
let orders: any[] = [];

// 1. Health check
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    service: 'NEXCART Backend API',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// 2. Products Catalog
app.get('/api/products', (req: Request, res: Response) => {
  const { category, search } = req.query;
  let result = [...products];

  if (category && category !== 'All') {
    result = result.filter(p => p.category === category);
  }

  if (search) {
    const q = String(search).toLowerCase();
    result = result.filter(p => 
      p.name.toLowerCase().includes(q) || 
      p.description.toLowerCase().includes(q)
    );
  }

  res.json({
    count: result.length,
    products: result
  });
});

app.get('/api/products/:id', (req: Request, res: Response) => {
  const product = products.find(p => p.id === req.params.id);
  if (!product) {
    return res.status(404).json({ error: 'Product not found' });
  }
  res.json(product);
});

// BUG-11: Stock Mutation Endpoint for automated QA testing
app.post('/api/products/:id/stock', (req: Request, res: Response) => {
  const product = products.find(p => p.id === req.params.id);
  if (!product) {
    return res.status(404).json({ error: 'Product not found' });
  }
  const { stock } = req.body;
  product.stock = typeof stock === 'number' ? stock : 0;
  res.json({ success: true, product });
});

// 3. Cart Calculation (Exposing BUG-01)
app.post('/api/cart/calculate', (req: Request, res: Response) => {
  const { items } = req.body;
  if (!Array.isArray(items)) {
    return res.status(400).json({ error: 'Items array is required' });
  }

  let subtotal = 0;
  const calculatedItems = items.map(item => {
    const product = products.find(p => p.id === item.productId);
    if (!product) return null;

    // BUG-01: When quantity is 2, calculate lineSubtotal as unit price only!
    let lineSubtotal = product.price * item.quantity;
    if (item.quantity === 2) {
      lineSubtotal = product.price; // BUG-01!
    }

    subtotal += lineSubtotal;
    return {
      product,
      quantity: item.quantity,
      lineSubtotal
    };
  }).filter(Boolean);

  const shipping = subtotal === 0 ? 0 : subtotal >= 3000 ? 0 : 99;
  const total = subtotal + shipping;

  res.json({
    items: calculatedItems,
    subtotal,
    shipping,
    total
  });
});

// 4. Coupons (Exposing BUG-02)
app.post('/api/coupons/apply', (req: Request, res: Response) => {
  const { code, subtotal = 0 } = req.body;
  const normalized = String(code || '').trim().toUpperCase();

  // BUG-02: Invalid coupon 'FAKE50' is accepted and returns 50% discount!
  if (normalized === 'FAKE50') {
    const discountPercent = 50;
    const discountAmount = Math.round((subtotal * discountPercent) / 100);
    return res.json({
      valid: true,
      code: 'FAKE50',
      discountPercent: 50,
      discountAmount,
      message: 'Coupon "FAKE50" applied! 50% discount granted.',
      isBugFixture: true
    });
  }

  if (normalized === 'SAVE10') {
    const discountPercent = 10;
    const discountAmount = Math.round((subtotal * discountPercent) / 100);
    return res.json({
      valid: true,
      code: 'SAVE10',
      discountPercent: 10,
      discountAmount,
      message: 'Coupon "SAVE10" applied! 10% discount granted.'
    });
  }

  return res.status(400).json({
    valid: false,
    message: 'Invalid coupon code. Try SAVE10 for 10% off.'
  });
});

// 5. Orders (Exposing BUG-03, BUG-04, BUG-10, BUG-12)
app.post('/api/orders', (req: Request, res: Response) => {
  const { customer, items, subtotal, discount, shipping, total, appliedCoupon } = req.body;

  if (!customer) {
    return res.status(400).json({ error: 'Customer details are required' });
  }

  // BUG-04: Faulty email validator accepts "customer@"
  const email = String(customer.email || '').trim();
  const faultyEmailRegex = /^[^\s@]+@[^\s]*$/;
  if (!faultyEmailRegex.test(email)) {
    return res.status(400).json({ error: 'Please enter a valid email address' });
  }

  if (!customer.fullName || customer.fullName.length < 2) {
    return res.status(400).json({ error: 'Full name is required' });
  }

  // BUG-03: Zero stock items are NOT rejected!
  // BUG-10: Duplicate submission allowed without idempotency check!

  // BUG-12: Backend discount rounding discrepancy:
  // Backend uses Math.floor() for discount while frontend uses Math.round()
  let calculatedDiscount = discount || 0;
  if (appliedCoupon && appliedCoupon.code === 'SAVE10') {
    calculatedDiscount = Math.floor((subtotal * appliedCoupon.discountPercent) / 100);
  }
  const calculatedTotal = subtotal - calculatedDiscount + (shipping || 0);

  const orderId = `NEX-${Date.now().toString().slice(-4)}${Math.floor(1000 + Math.random() * 9000)}`;
  const order = {
    orderId,
    customer,
    items,
    subtotal,
    discount: calculatedDiscount,
    shipping: shipping || 0,
    total: calculatedTotal,
    appliedCoupon: appliedCoupon || null,
    createdAt: new Date().toISOString(),
    status: 'confirmed'
  };

  orders.push(order);

  res.status(201).json({
    success: true,
    message: 'Demo order placed successfully',
    orderId,
    order
  });
});

app.get('/api/orders/:id', (req: Request, res: Response) => {
  const order = orders.find(o => o.orderId === req.params.id);
  if (!order) {
    return res.status(404).json({ error: 'Order not found' });
  }
  res.json(order);
});

// 6. Demo Reset Endpoint
app.post('/api/demo/reset', (req: Request, res: Response) => {
  products = [...INITIAL_CATALOG];
  orders = [];
  res.json({
    success: true,
    message: 'Backend demo state has been reset to baseline catalog and empty orders'
  });
});

// 7. Developer-Only Bug Benchmark Manifest
// Note: This endpoint is strictly for developer test suite assertion and verification.
app.get('/api/debug/bugs', (req: Request, res: Response) => {
  res.json({
    suite: 'QA-NEXUS Comprehensive Bug Benchmark',
    version: '2.0.0',
    count: 14,
    bugs: [
      {
        id: 'BUG-01',
        title: 'Cart Quantity and Total Mismatch',
        category: 'Quantity calculation',
        trigger: 'Increase item quantity from 1 to 2 in cart',
        failure: 'Line subtotal evaluates to unit price (1 * price) instead of 2 * price.'
      },
      {
        id: 'BUG-02',
        title: 'Invalid Coupon Accepted',
        category: 'Coupon validation',
        trigger: 'Apply coupon code FAKE50 in cart',
        failure: 'Accepted with 200 OK and applies 50% discount instead of returning 400 Bad Request.'
      },
      {
        id: 'BUG-03',
        title: 'Out-of-Stock Product Can Be Purchased',
        category: 'Inventory constraint',
        trigger: 'Add product prod-hub-05 (stock: 0) to cart and checkout',
        failure: 'Allowed in cart and accepted by checkout order endpoint.'
      },
      {
        id: 'BUG-04',
        title: 'Checkout Accepts Invalid Email',
        category: 'Input validation',
        trigger: 'Enter customer@ in checkout email field',
        failure: 'Accepted without domain validation, allowing order completion.'
      },
      {
        id: 'BUG-05',
        title: 'Stale Checkout Summary after Cart Back-Navigation',
        category: 'Cross-page state inconsistency',
        trigger: 'Visit /checkout, navigate back to /cart, modify quantities, return to /checkout',
        failure: 'Checkout Order Review displays stale quantities from previous snapshot.'
      },
      {
        id: 'BUG-06',
        title: 'Storefront Cart Badge Count De-synchronization on Removal',
        category: 'Cross-page state inconsistency',
        trigger: 'Add 2 products, remove 1 item from /cart, inspect navbar badge',
        failure: 'Navbar badge continues showing 2 instead of decrementing to 1.'
      },
      {
        id: 'BUG-07',
        title: 'Inverted Shipping Fee on Coupon Application Boundary',
        category: 'Coupon and pricing interaction',
        trigger: 'Cart subtotal ₹3,198 (qualifies for free shipping), apply SAVE10 (net ₹2,878)',
        failure: 'Shipping line displays FREE (₹0), but Grand Total secretly adds ₹99 shipping (arithmetic sum mismatch).'
      },
      {
        id: 'BUG-08',
        title: 'Stale Discount Retention after Cart Modification Voiding Min Threshold',
        category: 'Coupon and pricing interaction',
        trigger: 'Apply SAVE10 at >= ₹2,000 subtotal, then remove items so subtotal drops below ₹2,000',
        failure: 'Coupon is not invalidated; retains locked discount amount on an ineligible cart.'
      },
      {
        id: 'BUG-09',
        title: 'Quantity Boundary Underflow / Zero-Quantity Cart Item',
        category: 'Quantity and boundary conditions',
        trigger: 'On product detail page, decrement quantity from 1 to 0 and click Add to Cart',
        failure: 'Adds a line item with quantity 0 and line total ₹0 to cart.'
      },
      {
        id: 'BUG-10',
        title: 'Order Idempotency Failure / Back-Navigation Duplicate Order',
        category: 'Order lifecycle and duplicate actions',
        trigger: 'Place order to reach /order-success, hit browser Back button, click Place Order again',
        failure: 'Permits re-submitting empty/completed cart and creates a duplicate order.'
      },
      {
        id: 'BUG-11',
        title: 'Live Stock Depletion Race / Cart Availability Inconsistency',
        category: 'Inventory and cart lifecycle',
        trigger: 'Add available product to cart, update catalog stock to 0, compare detail vs cart',
        failure: 'Product detail page reports Out of Stock (0), but cart view reports initial stock as available.'
      },
      {
        id: 'BUG-12',
        title: 'Frontend/Backend Discount Rounding Discrepancy',
        category: 'Frontend/backend disagreement',
        trigger: 'Add ₹2,499 product with 10% coupon (discount ₹249.90)',
        failure: 'Frontend rounds discount to ₹250 (Total ₹2,348), backend floors to ₹249 (Total ₹2,349) — 1-rupee mismatch.'
      },
      {
        id: 'BUG-13',
        title: 'LocalStorage Deserialization Discount Drop on Refresh',
        category: 'Navigation and persistence',
        trigger: 'Apply coupon in cart, refresh the browser page on /cart',
        failure: 'Coupon badge restores as active, but discount amount initializes to ₹0 until user interaction.'
      },
      {
        id: 'BUG-14',
        title: 'Search + Category Filter Query Desynchronization',
        category: 'Search, filters, and catalog state',
        trigger: 'Search keyboard on storefront, click category Electronics',
        failure: 'Search input clears visibly, but active query filter persists, showing false 0 products.'
      }
    ]
  });
});

app.listen(PORT, () => {
  console.log(`[NEXCART Backend API] Server running on http://localhost:${PORT}`);
  console.log(`[NEXCART Backend API] Health check at http://localhost:${PORT}/api/health`);
});
