import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { formatINR } from '../utils/formatters';
import { CheckoutFormData, CartItem } from '../types';
import { 
  ShieldCheck, 
  CreditCard, 
  Truck, 
  Lock, 
  ArrowLeft, 
  AlertCircle, 
  Wallet,
} from 'lucide-react';

export const CheckoutPage: React.FC = () => {
  const { cart, subtotal, discount, shipping, total, latestOrder, createOrder, calculateLineSubtotal } = useStore();
  const navigate = useNavigate();

  // BUG-05: Stale Checkout Snapshot
  // When entering checkout, the item list is cached in sessionStorage.
  // If the user navigates back to /cart, modifies quantities, and returns to checkout,
  // the Order Review continues to display the stale snapshot unless cleared.
  const [checkoutSnapshot, setCheckoutSnapshot] = useState<CartItem[]>(() => {
    try {
      const saved = sessionStorage.getItem('nexcart_checkout_snapshot');
      if (saved) return JSON.parse(saved);
      if (cart.length > 0) {
        sessionStorage.setItem('nexcart_checkout_snapshot', JSON.stringify(cart));
        return cart;
      }
    } catch {}
    return cart;
  });

  // If new products are added (length changes), update snapshot; but if quantity changes, snapshot stays stale (BUG-05)!
  useEffect(() => {
    if (cart.length > 0 && (!checkoutSnapshot || checkoutSnapshot.length === 0)) {
      setCheckoutSnapshot(cart);
      sessionStorage.setItem('nexcart_checkout_snapshot', JSON.stringify(cart));
    }
  }, [cart]);

  // BUG-10: If cart is empty because an order was just placed, but user hits Back button to /checkout,
  // we permit re-submitting the previous items as a duplicate order!
  const hasItems = cart.length > 0 || (latestOrder && latestOrder.items && latestOrder.items.length > 0);
  const itemsToReview = (checkoutSnapshot && checkoutSnapshot.length > 0)
    ? checkoutSnapshot
    : (cart.length > 0 ? cart : (latestOrder ? latestOrder.items : []));

  const [formData, setFormData] = useState<CheckoutFormData>({
    fullName: 'Alex Mercer',
    email: 'customer@', // BUG-04 fixture
    phone: '9876543210',
    address: 'Flat 402, Quantum Heights, Outer Ring Road',
    city: 'Bengaluru',
    pinCode: '560103',
    paymentMethod: 'card_demo'
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // If no items in cart AND no previous order to duplicate
  if (!hasItems) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold text-white mb-2">Your Cart is Empty</h2>
        <p className="text-sm text-slate-400 mb-6">You need items in your cart to proceed with checkout.</p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-electric-600 hover:bg-electric-500 text-white font-semibold text-xs"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Catalog</span>
        </Link>
      </div>
    );
  }

  /**
   * Field validation logic
   * BUG-04: The checkout email validation incorrectly accepts "customer@" as a valid email address.
   */
  const validate = (): boolean => {
    const errs: Record<string, string> = {};

    if (!formData.fullName.trim() || formData.fullName.trim().length < 2) {
      errs.fullName = 'Full Name is required (minimum 2 characters)';
    }

    // BUG-04: Faulty email validator that accepts "customer@" without domain
    const emailTrimmed = formData.email.trim();
    if (!emailTrimmed) {
      errs.email = 'Email address is required';
    } else {
      const faultyEmailRegex = /^[^\s@]+@[^\s]*$/;
      if (!faultyEmailRegex.test(emailTrimmed)) {
        errs.email = 'Please enter a valid email address (must contain @)';
      }
    }

    if (!formData.phone.trim() || formData.phone.trim().replace(/\D/g, '').length < 10) {
      errs.phone = 'Please enter a valid 10-digit mobile number';
    }

    if (!formData.address.trim() || formData.address.trim().length < 5) {
      errs.address = 'Street Address is required (minimum 5 characters)';
    }

    if (!formData.city.trim() || formData.city.trim().length < 2) {
      errs.city = 'City name is required';
    }

    if (!formData.pinCode.trim() || formData.pinCode.trim().length < 4) {
      errs.pinCode = 'Valid PIN code is required (min 4 digits)';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      return;
    }

    setIsSubmitting(true);
    // Simulate brief order processing
    setTimeout(() => {
      createOrder(formData);
      setIsSubmitting(false);
      navigate('/order-success');
    }, 400);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="pb-6 border-b border-slate-800 mb-8">
        <Link
          to="/cart"
          className="inline-flex items-center gap-1.5 text-xs text-electric-400 hover:text-electric-300 font-semibold mb-3 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Shopping Cart</span>
        </Link>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Secure Demo Checkout
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Complete your demo order. No actual financial transaction will take place.
        </p>
      </div>

      <form onSubmit={handleSubmit} noValidate>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Left Column: Customer and Shipping Form */}
          <div className="lg:col-span-7 space-y-8">
            {/* 1. Contact & Customer Details */}
            <div className="bg-navy-900/60 border border-slate-800 rounded-3xl p-6 sm:p-7 space-y-5">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
                <span className="w-6 h-6 rounded-full bg-electric-500/20 text-electric-400 text-xs font-bold flex items-center justify-center">
                  1
                </span>
                <h2 className="text-base font-bold text-white">Contact & Delivery Information</h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Full Name */}
                <div className="sm:col-span-2">
                  <label htmlFor="checkout-name" className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Full Name <span className="text-rose-400">*</span>
                  </label>
                  <input
                    id="checkout-name"
                    type="text"
                    data-testid="checkout-name"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    placeholder="e.g. Alex Mercer"
                    className={`w-full bg-navy-950 border rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none transition-colors ${
                      errors.fullName ? 'border-rose-500 focus:border-rose-500' : 'border-slate-700/80 focus:border-electric-500'
                    }`}
                  />
                  {errors.fullName && (
                    <p className="mt-1 text-xs text-rose-400 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors.fullName}
                    </p>
                  )}
                </div>

                {/* Email Address (BUG-04 Target Field) */}
                <div className="sm:col-span-2">
                  <label htmlFor="checkout-email" className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Email Address <span className="text-rose-400">*</span>
                  </label>
                  <input
                    id="checkout-email"
                    type="text"
                    data-testid="checkout-email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="e.g. alex@example.com"
                    className={`w-full bg-navy-950 border rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none transition-colors ${
                      errors.email ? 'border-rose-500 focus:border-rose-500' : 'border-slate-700/80 focus:border-electric-500'
                    }`}
                  />
                  {errors.email && (
                    <p className="mt-1 text-xs text-rose-400 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors.email}
                    </p>
                  )}
                </div>

                {/* Phone Number */}
                <div className="sm:col-span-2">
                  <label htmlFor="checkout-phone" className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Mobile Phone Number <span className="text-rose-400">*</span>
                  </label>
                  <input
                    id="checkout-phone"
                    type="tel"
                    data-testid="checkout-phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="10-digit mobile number"
                    className={`w-full bg-navy-950 border rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none transition-colors ${
                      errors.phone ? 'border-rose-500 focus:border-rose-500' : 'border-slate-700/80 focus:border-electric-500'
                    }`}
                  />
                  {errors.phone && (
                    <p className="mt-1 text-xs text-rose-400 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors.phone}
                    </p>
                  )}
                </div>

                {/* Street Address */}
                <div className="sm:col-span-2">
                  <label htmlFor="checkout-address" className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Delivery Address <span className="text-rose-400">*</span>
                  </label>
                  <input
                    id="checkout-address"
                    type="text"
                    data-testid="checkout-address"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="House/Apartment, Street name, Area"
                    className={`w-full bg-navy-950 border rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none transition-colors ${
                      errors.address ? 'border-rose-500 focus:border-rose-500' : 'border-slate-700/80 focus:border-electric-500'
                    }`}
                  />
                  {errors.address && (
                    <p className="mt-1 text-xs text-rose-400 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors.address}
                    </p>
                  )}
                </div>

                {/* City */}
                <div>
                  <label htmlFor="checkout-city" className="block text-xs font-semibold text-slate-300 mb-1.5">
                    City <span className="text-rose-400">*</span>
                  </label>
                  <input
                    id="checkout-city"
                    type="text"
                    data-testid="checkout-city"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    placeholder="e.g. Bengaluru"
                    className={`w-full bg-navy-950 border rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none transition-colors ${
                      errors.city ? 'border-rose-500 focus:border-rose-500' : 'border-slate-700/80 focus:border-electric-500'
                    }`}
                  />
                  {errors.city && (
                    <p className="mt-1 text-xs text-rose-400 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors.city}
                    </p>
                  )}
                </div>

                {/* PIN Code */}
                <div>
                  <label htmlFor="checkout-pincode" className="block text-xs font-semibold text-slate-300 mb-1.5">
                    PIN Code <span className="text-rose-400">*</span>
                  </label>
                  <input
                    id="checkout-pincode"
                    type="text"
                    data-testid="checkout-pincode"
                    value={formData.pinCode}
                    onChange={(e) => setFormData({ ...formData, pinCode: e.target.value })}
                    placeholder="6-digit PIN code"
                    className={`w-full bg-navy-950 border rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none transition-colors ${
                      errors.pinCode ? 'border-rose-500 focus:border-rose-500' : 'border-slate-700/80 focus:border-electric-500'
                    }`}
                  />
                  {errors.pinCode && (
                    <p className="mt-1 text-xs text-rose-400 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors.pinCode}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* 2. Demo Payment Method Selection */}
            <div className="bg-navy-900/60 border border-slate-800 rounded-3xl p-6 sm:p-7 space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
                <span className="w-6 h-6 rounded-full bg-electric-500/20 text-electric-400 text-xs font-bold flex items-center justify-center">
                  2
                </span>
                <h2 className="text-base font-bold text-white">Payment Method (Demo Mode)</h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Demo Card */}
                <label
                  className={`flex flex-col p-4 rounded-2xl border cursor-pointer transition-all ${
                    formData.paymentMethod === 'card_demo'
                      ? 'bg-electric-500/10 border-electric-500 text-white'
                      : 'bg-navy-950 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="card_demo"
                    checked={formData.paymentMethod === 'card_demo'}
                    onChange={() => setFormData({ ...formData, paymentMethod: 'card_demo' })}
                    className="sr-only"
                  />
                  <CreditCard className="w-5 h-5 text-electric-400 mb-2" />
                  <span className="text-xs font-bold">Demo Card</span>
                  <span className="text-[10px] text-slate-400 mt-0.5">Instant simulated auth</span>
                </label>

                {/* Cash on Delivery */}
                <label
                  className={`flex flex-col p-4 rounded-2xl border cursor-pointer transition-all ${
                    formData.paymentMethod === 'cod'
                      ? 'bg-electric-500/10 border-electric-500 text-white'
                      : 'bg-navy-950 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="cod"
                    checked={formData.paymentMethod === 'cod'}
                    onChange={() => setFormData({ ...formData, paymentMethod: 'cod' })}
                    className="sr-only"
                  />
                  <Truck className="w-5 h-5 text-neon-cyan mb-2" />
                  <span className="text-xs font-bold">Cash on Delivery</span>
                  <span className="text-[10px] text-slate-400 mt-0.5">Pay upon delivery</span>
                </label>

                {/* Demo UPI */}
                <label
                  className={`flex flex-col p-4 rounded-2xl border cursor-pointer transition-all ${
                    formData.paymentMethod === 'upi_demo'
                      ? 'bg-electric-500/10 border-electric-500 text-white'
                      : 'bg-navy-950 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="upi_demo"
                    checked={formData.paymentMethod === 'upi_demo'}
                    onChange={() => setFormData({ ...formData, paymentMethod: 'upi_demo' })}
                    className="sr-only"
                  />
                  <Wallet className="w-5 h-5 text-amber-400 mb-2" />
                  <span className="text-xs font-bold">Demo UPI</span>
                  <span className="text-[10px] text-slate-400 mt-0.5">Simulated UPI transfer</span>
                </label>
              </div>

              {/* Sandbox Disclaimer */}
              <div className="p-3.5 rounded-xl bg-navy-950/80 border border-slate-800 text-xs text-slate-400 flex items-start gap-2.5">
                <Lock className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Demo Sandbox:</strong> No live payment gateway is invoked. No real credit card, CVV, or banking details will ever be collected or billed.
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: Order Review & Place Order Button */}
          <div className="lg:col-span-5">
            <div className="sticky top-24 bg-navy-900/80 border border-slate-800 rounded-3xl p-6 sm:p-7 shadow-xl space-y-6">
              <h3 className="text-base font-bold text-white tracking-tight pb-3 border-b border-slate-800">
                Order Review ({itemsToReview.reduce((c, i) => c + i.quantity, 0)} items)
              </h3>

              {/* Items List preview */}
              <div className="max-h-64 overflow-y-auto space-y-3 pr-1 divide-y divide-slate-800/60">
                {itemsToReview.map((item) => {
                  const lineSubtotal = calculateLineSubtotal(item);
                  const isOutOfStock = item.product.stock === 0;

                  return (
                    <div key={item.product.id} className="pt-3 first:pt-0 flex items-center justify-between text-xs">
                      <div className="flex-1 pr-3">
                        <div className="font-semibold text-slate-200 line-clamp-1">{item.product.name}</div>
                        <div className="text-slate-500">
                          Qty: <span className="text-slate-300 font-bold">{item.quantity}</span> × {formatINR(item.product.price)}
                          {isOutOfStock && (
                            <span className="text-rose-400 font-bold ml-1.5">(Stock: 0)</span>
                          )}
                        </div>
                      </div>
                      <div className="font-bold text-white text-right">
                        {formatINR(lineSubtotal)}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Price Calculations */}
              <div className="space-y-2.5 text-xs pt-4 border-t border-slate-800">
                <div className="flex justify-between text-slate-400">
                  <span>Cart Subtotal</span>
                  <span className="font-semibold text-slate-200">{formatINR(subtotal)}</span>
                </div>

                {discount > 0 && (
                  <div className="flex justify-between text-emerald-400">
                    <span>Discount</span>
                    <span className="font-bold">-{formatINR(discount)}</span>
                  </div>
                )}

                <div className="flex justify-between text-slate-400">
                  <span>Shipping</span>
                  <span className="font-semibold text-slate-200">
                    {shipping === 0 ? 'FREE' : formatINR(shipping)}
                  </span>
                </div>

                <div className="pt-3 border-t border-slate-800 flex justify-between items-baseline text-sm">
                  <span className="font-bold text-white">Order Total</span>
                  <span className="text-2xl font-black text-electric-400">
                    {formatINR(total)}
                  </span>
                </div>
              </div>

              {/* Place Order CTA Button */}
              <button
                type="submit"
                data-testid="place-order"
                disabled={isSubmitting}
                className="w-full py-4 px-6 rounded-xl bg-electric-600 hover:bg-electric-500 disabled:bg-slate-800 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-glow-violet transition-all active:scale-98"
              >
                {isSubmitting ? (
                  <span>Generating Demo Order...</span>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4 text-emerald-300" />
                    <span>Place Demo Order ({formatINR(total)})</span>
                  </>
                )}
              </button>

              <div className="text-[11px] text-slate-500 text-center flex items-center justify-center gap-1.5">
                <Lock className="w-3 h-3 text-slate-500" />
                <span>Simulated demo order confirmation</span>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};
