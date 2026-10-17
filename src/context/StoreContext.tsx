import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Product, CartItem, AppliedCoupon, CheckoutFormData, Order, ToastMessage } from '../types';
import { INITIAL_PRODUCTS } from '../data/products';
import { generateOrderId } from '../utils/formatters';

interface StoreContextType {
  products: Product[];
  cart: CartItem[];
  cartCount: number;
  appliedCoupon: AppliedCoupon | null;
  couponStatus: { type: 'success' | 'error' | 'idle'; message: string };
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
  latestOrder: Order | null;
  toasts: ToastMessage[];
  addToCart: (product: Product, quantity?: number) => void;
  increaseQuantity: (productId: string) => void;
  decreaseQuantity: (productId: string) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  calculateLineSubtotal: (item: CartItem) => number;
  applyCoupon: (code: string) => { success: boolean; message: string };
  removeCoupon: () => void;
  createOrder: (customer: CheckoutFormData) => Order;
  resetDemo: () => void;
  updateProductStock: (productId: string, newStock: number) => void;
  addToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  removeToast: (id: string) => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'nexcart_cart_v1';
const COUPON_STORAGE_KEY = 'nexcart_coupon_v1';
const ORDER_STORAGE_KEY = 'nexcart_order_v1';
const BADGE_STORAGE_KEY = 'nexcart_badge_count_v1';

export const StoreProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);

  // Initialize cart from localStorage
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // BUG-06: Separate persistent badge count state that desynchronizes on item removal
  const [cartCount, setCartCount] = useState<number>(() => {
    try {
      const savedBadge = localStorage.getItem(BADGE_STORAGE_KEY);
      if (savedBadge !== null) return parseInt(savedBadge, 10);
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      const parsed: CartItem[] = saved ? JSON.parse(saved) : [];
      return parsed.reduce((sum, item) => sum + item.quantity, 0);
    } catch {
      return 0;
    }
  });

  // Initialize coupon from localStorage
  const [appliedCoupon, setAppliedCoupon] = useState<AppliedCoupon | null>(() => {
    try {
      const saved = localStorage.getItem(COUPON_STORAGE_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // BUG-13: Hydration flag: When restoring from localStorage, discount initializes to 0 until user modifies cart or coupon
  const [isHydratedInitial, setIsHydratedInitial] = useState<boolean>(() => {
    try {
      return localStorage.getItem(COUPON_STORAGE_KEY) !== null;
    } catch {
      return false;
    }
  });

  const [couponStatus, setCouponStatus] = useState<{ type: 'success' | 'error' | 'idle'; message: string }>(() => {
    try {
      const saved = localStorage.getItem(COUPON_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return { type: 'success', message: parsed.message || `Coupon "${parsed.code}" active.` };
      }
    } catch {}
    return { type: 'idle', message: '' };
  });

  // Latest completed order
  const [latestOrder, setLatestOrder] = useState<Order | null>(() => {
    try {
      const saved = localStorage.getItem(ORDER_STORAGE_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Sync cart to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    } catch (e) {
      console.error('Failed to save cart to localStorage', e);
    }
  }, [cart]);

  // Sync badge count to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(BADGE_STORAGE_KEY, cartCount.toString());
    } catch (e) {
      console.error('Failed to save badge count to localStorage', e);
    }
  }, [cartCount]);

  // Sync coupon to localStorage
  useEffect(() => {
    try {
      if (appliedCoupon) {
        localStorage.setItem(COUPON_STORAGE_KEY, JSON.stringify(appliedCoupon));
      } else {
        localStorage.removeItem(COUPON_STORAGE_KEY);
      }
    } catch (e) {
      console.error('Failed to save coupon to localStorage', e);
    }
  }, [appliedCoupon]);

  // Sync latest order to localStorage
  useEffect(() => {
    try {
      if (latestOrder) {
        localStorage.setItem(ORDER_STORAGE_KEY, JSON.stringify(latestOrder));
      }
    } catch (e) {
      console.error('Failed to save order to localStorage', e);
    }
  }, [latestOrder]);

  const addToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  /**
   * BUG-01: Cart Quantity and Total Mismatch
   * When quantity is increased from 1 to 2, update the displayed quantity
   * but incorrectly calculate that product's subtotal using the unit price only.
   */
  const calculateLineSubtotal = (item: CartItem): number => {
    if (item.quantity === 2) {
      // BUG-01: Returns unit price instead of 2 * unit price
      return item.product.price;
    }
    return item.product.price * item.quantity;
  };

  // Cart Subtotal is the sum of calculated line subtotals
  const subtotal = cart.reduce((sum, item) => sum + calculateLineSubtotal(item), 0);

  /**
   * Discount calculation:
   * - BUG-13: If freshly hydrated from localStorage with coupon, discount is 0 until user interaction.
   * - BUG-08: If SAVE10 was applied with subtotal >= 2000, but items were removed dropping subtotal below 2000,
   *   the coupon is not invalidated; it retains the previously locked discount amount!
   */
  const calculateDiscount = (): number => {
    if (!appliedCoupon) return 0;
    if (isHydratedInitial) {
      // BUG-13: Drop discount to 0 on initial page hydration with coupon
      return 0;
    }

    if (appliedCoupon.code === 'FAKE50') {
      // BUG-02
      return Math.round((subtotal * 50) / 100);
    }

    if (appliedCoupon.code === 'SAVE10') {
      // BUG-08: Stale discount retained when subtotal drops below minimum threshold of 2000
      if (subtotal < 2000 && appliedCoupon.discountAmount > 0) {
        return appliedCoupon.discountAmount;
      }
      return Math.round((subtotal * appliedCoupon.discountPercent) / 100);
    }

    return Math.round((subtotal * appliedCoupon.discountPercent) / 100);
  };

  const discount = calculateDiscount();

  /**
   * BUG-07: Inverted Shipping Fee on Coupon Application Boundary
   * Displayed shipping rule: Free for orders >= ₹3000, otherwise ₹99 (₹0 if cart is empty).
   * When gross subtotal >= 3000, displayed shipping is 0 (FREE).
   * But when a coupon reduces the net subtotal (subtotal - discount) below 3000:
   * The displayed shipping line says 0, but the total calculation secretly adds 99!
   * Meaning: subtotal - discount + displayedShipping != total!
   */
  const shipping = subtotal === 0 ? 0 : subtotal >= 3000 ? 0 : 99;

  let effectiveShippingForTotal = shipping;
  if (subtotal >= 3000 && appliedCoupon && (subtotal - discount) < 3000) {
    // BUG-07: Secretly add 99 shipping to grand total while shipping line displays FREE
    effectiveShippingForTotal = 99;
  }

  // Total amount
  const total = Math.max(0, subtotal - discount + effectiveShippingForTotal);

  /**
   * Add to Cart
   * - BUG-03: Allows adding stock = 0 items (e.g. HyperConnect USB-C Hub).
   * - BUG-09: Accepts item with quantity 0 when added from detail page.
   * - BUG-11: Stores snapshot of product stock at addition time.
   */
  const addToCart = (product: Product, quantity: number = 1) => {
    setIsHydratedInitial(false); // Clears BUG-13 on interaction
    setCart((prevCart) => {
      const existingIndex = prevCart.findIndex((item) => item.product.id === product.id);
      if (existingIndex > -1) {
        const updated = [...prevCart];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + quantity
        };
        return updated;
      }
      return [...prevCart, { product: { ...product }, quantity }];
    });

    // Increment badge count
    setCartCount((prev) => prev + quantity);
    addToast(`Added "${product.name}" to cart`, 'success');
  };

  const increaseQuantity = (productId: string) => {
    setIsHydratedInitial(false);
    setCart((prevCart) =>
      prevCart.map((item) => {
        if (item.product.id === productId) {
          return { ...item, quantity: item.quantity + 1 };
        }
        return item;
      })
    );
    setCartCount((prev) => prev + 1);
  };

  const decreaseQuantity = (productId: string) => {
    setIsHydratedInitial(false);
    setCart((prevCart) =>
      prevCart
        .map((item) => {
          if (item.product.id === productId) {
            return { ...item, quantity: item.quantity - 1 };
          }
          return item;
        })
        .filter((item) => item.quantity > 0)
    );
    setCartCount((prev) => Math.max(0, prev - 1));
  };

  /**
   * BUG-06: Storefront Cart Badge Count De-synchronization after Multi-Item Removal
   * Item is removed from the cart, but setCartCount is intentionally NOT decremented,
   * leaving the persistent header badge count higher than the actual items in the cart!
   */
  const removeFromCart = (productId: string) => {
    setIsHydratedInitial(false);
    setCart((prevCart) => prevCart.filter((item) => item.product.id !== productId));
    // BUG-06: Intentionally omitted: setCartCount(recalculated)
    addToast('Item removed from cart', 'info');
  };

  const clearCart = () => {
    setCart([]);
    setCartCount(0);
    setAppliedCoupon(null);
    setCouponStatus({ type: 'idle', message: '' });
    sessionStorage.removeItem('nexcart_checkout_snapshot');
  };

  /**
   * BUG-02: Invalid Coupon Accepted
   * Supports valid coupon SAVE10 (10% discount, minimum order ₹2,000).
   * When user enters invalid coupon FAKE50, incorrectly displays success and applies 50% discount!
   */
  const applyCoupon = (code: string) => {
    setIsHydratedInitial(false);
    const cleanCode = code.trim().toUpperCase();

    if (!cleanCode) {
      const err = { success: false, message: 'Please enter a coupon code.' };
      setCouponStatus({ type: 'error', message: err.message });
      return err;
    }

    if (cleanCode === 'FAKE50') {
      // BUG-02: Accept fake coupon and grant 50% discount
      const newCoupon: AppliedCoupon = {
        code: 'FAKE50',
        discountPercent: 50,
        discountAmount: Math.round((subtotal * 50) / 100),
        message: 'Coupon "FAKE50" applied! 50% discount granted.',
        isBugTriggered: true
      };
      setAppliedCoupon(newCoupon);
      setCouponStatus({ type: 'success', message: 'Coupon "FAKE50" applied! 50% discount granted.' });
      addToast('Coupon "FAKE50" applied! 50% discount granted.', 'success');
      return { success: true, message: newCoupon.message };
    }

    if (cleanCode === 'SAVE10') {
      // Check minimum order value of ₹2,000
      if (subtotal < 2000) {
        const errMsg = 'Coupon SAVE10 requires a minimum order value of ₹2,000.';
        setCouponStatus({ type: 'error', message: errMsg });
        addToast(errMsg, 'error');
        return { success: false, message: errMsg };
      }

      // Valid coupon
      const newCoupon: AppliedCoupon = {
        code: 'SAVE10',
        discountPercent: 10,
        discountAmount: Math.round((subtotal * 10) / 100),
        message: 'Coupon "SAVE10" applied! 10% discount granted.'
      };
      setAppliedCoupon(newCoupon);
      setCouponStatus({ type: 'success', message: 'Coupon "SAVE10" applied! 10% discount granted.' });
      addToast('Coupon "SAVE10" applied! 10% discount granted.', 'success');
      return { success: true, message: newCoupon.message };
    }

    // Truly invalid coupon
    const errMsg = 'Invalid coupon code. Try SAVE10 for 10% off.';
    setCouponStatus({ type: 'error', message: errMsg });
    addToast(errMsg, 'error');
    return { success: false, message: errMsg };
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponStatus({ type: 'idle', message: '' });
    addToast('Coupon removed', 'info');
  };

  /**
   * BUG-11: Live Stock Depletion
   * Updates product stock in catalog state and on backend,
   * but existing cart item snapshots do not update.
   */
  const updateProductStock = (productId: string, newStock: number) => {
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id === productId) {
          return { ...p, stock: newStock };
        }
        return p;
      })
    );
    // Notify backend
    fetch(`/api/products/${productId}/stock`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ stock: newStock })
    }).catch(() => {});
  };

  /**
   * Create Order
   * - BUG-03: Zero stock allowed.
   * - BUG-04: customer@ email allowed.
   * - BUG-10: Idempotency failure: back navigation can create duplicate order.
   * - BUG-12: Dispatches to backend where Math.floor creates 1-rupee rounding discrepancy.
   */
  const createOrder = (customer: CheckoutFormData): Order => {
    const orderItems = [...cart];
    const order: Order = {
      orderId: generateOrderId(),
      items: orderItems,
      subtotal,
      discount,
      shipping: effectiveShippingForTotal,
      total,
      appliedCoupon,
      customer,
      createdAt: new Date().toISOString()
    };

    setLatestOrder(order);

    // Call backend API (exposing BUG-12 rounding discrepancy on odd amounts)
    fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customer,
        items: orderItems,
        subtotal,
        discount,
        shipping: effectiveShippingForTotal,
        total,
        appliedCoupon
      })
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.order && data.order.orderId) {
          // If backend generated its own orderId or total, preserve it
        }
      })
      .catch(() => {});

    clearCart();
    return order;
  };

  /**
   * Reset Demo session control
   * Clears cart, coupon, order state, and restores fresh demo state without fixing bugs.
   */
  const resetDemo = () => {
    setProducts(INITIAL_PRODUCTS);
    setCart([]);
    setCartCount(0);
    setAppliedCoupon(null);
    setCouponStatus({ type: 'idle', message: '' });
    setLatestOrder(null);
    setIsHydratedInitial(false);
    localStorage.removeItem(CART_STORAGE_KEY);
    localStorage.removeItem(COUPON_STORAGE_KEY);
    localStorage.removeItem(ORDER_STORAGE_KEY);
    localStorage.removeItem(BADGE_STORAGE_KEY);
    sessionStorage.removeItem('nexcart_checkout_snapshot');
    // Also reset backend in-memory state
    fetch('/api/demo/reset', { method: 'POST' }).catch(() => {});
    addToast('Demo state reset to initial catalog baseline.', 'info');
  };

  return (
    <StoreContext.Provider
      value={{
        products,
        cart,
        cartCount,
        appliedCoupon,
        couponStatus,
        subtotal,
        discount,
        shipping,
        total,
        latestOrder,
        toasts,
        addToCart,
        increaseQuantity,
        decreaseQuantity,
        removeFromCart,
        clearCart,
        calculateLineSubtotal,
        applyCoupon,
        removeCoupon,
        createOrder,
        resetDemo,
        updateProductStock,
        addToast,
        removeToast
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};
