import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { formatINR } from '../utils/formatters';
import { SafeImage } from '../components/SafeImage';
import { 
  Trash2, 
  Plus, 
  Minus, 
  ArrowRight, 
  ShoppingBag, 
  Tag, 
  ShieldCheck, 
  Truck, 
  X, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';

export const CartPage: React.FC = () => {
  const {
    cart,
    subtotal,
    discount,
    shipping,
    total,
    increaseQuantity,
    decreaseQuantity,
    removeFromCart,
    clearCart,
    calculateLineSubtotal,
    appliedCoupon,
    couponStatus,
    applyCoupon,
    removeCoupon
  } = useStore();

  const [couponInput, setCouponInput] = useState('');
  const navigate = useNavigate();

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    applyCoupon(couponInput);
  };

  if (cart.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <div className="w-20 h-20 rounded-2xl bg-navy-900 border border-slate-800 flex items-center justify-center text-slate-500 mx-auto mb-6">
          <ShoppingBag className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Your Shopping Cart is Empty</h2>
        <p className="text-sm text-slate-400 max-w-md mx-auto mb-8">
          Explore our next-gen electronics, mechanical keyboards, audio gear, and lifestyle essentials.
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-electric-600 hover:bg-electric-500 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-glow-violet"
        >
          <span>Explore Catalog</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-center justify-between pb-6 border-b border-slate-800 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Shopping Cart
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Review your selected tech items and apply promotional coupons.
          </p>
        </div>

        <button
          onClick={clearCart}
          data-testid="clear-cart"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-400 hover:text-rose-300 px-3 py-1.5 rounded-lg border border-rose-500/30 hover:bg-rose-500/10 transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Clear Cart</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left: Cart Items List */}
        <div className="lg:col-span-8 space-y-4">
          {cart.map((item) => {
            const lineSubtotal = calculateLineSubtotal(item);
            const isOutOfStock = item.product.stock === 0;

            return (
              <div
                key={item.product.id}
                data-testid="cart-item"
                data-product-id={item.product.id}
                className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 sm:p-5 rounded-2xl bg-navy-900/60 border border-slate-800 hover:border-slate-700 transition-colors"
              >
                {/* Product Thumbnail & Details */}
                <div className="flex items-center gap-4 flex-1">
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden bg-navy-950 shrink-0 border border-slate-800">
                    <SafeImage
                      src={item.product.image}
                      alt={item.product.name}
                      fallbackTitle={item.product.name}
                      category={item.product.category}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] uppercase font-bold tracking-wider text-electric-400 px-2 py-0.5 rounded-md bg-electric-500/10">
                        {item.product.category}
                      </span>
                      {isOutOfStock && (
                        <span className="text-[10px] font-bold text-rose-400 px-2 py-0.5 rounded-md bg-rose-500/10">
                          Stock: 0
                        </span>
                      )}
                    </div>
                    <Link
                      to={`/products/${item.product.id}`}
                      className="font-bold text-sm sm:text-base text-white hover:text-electric-300 transition-colors line-clamp-1"
                    >
                      {item.product.name}
                    </Link>
                    <div className="text-xs text-slate-400 mt-1">
                      Unit Price: <span className="text-slate-200 font-semibold">{formatINR(item.product.price)}</span>
                    </div>
                  </div>
                </div>

                {/* Quantity Controls & Line Price */}
                <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-800">
                  {/* Quantity Stepper */}
                  <div className="flex items-center gap-2 bg-navy-950 border border-slate-700/80 rounded-xl p-1">
                    <button
                      type="button"
                      onClick={() => decreaseQuantity(item.product.id)}
                      data-testid="decrease-quantity"
                      aria-label={`Decrease quantity of ${item.product.name}`}
                      className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center justify-center transition-colors"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    
                    {/* Displayed Quantity */}
                    <span
                      data-testid="cart-quantity"
                      className="min-w-[28px] text-center font-bold text-sm text-white"
                    >
                      {item.quantity}
                    </span>

                    <button
                      type="button"
                      onClick={() => increaseQuantity(item.product.id)}
                      data-testid="increase-quantity"
                      aria-label={`Increase quantity of ${item.product.name}`}
                      className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center justify-center transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* 
                    BUG-01: Line Subtotal
                    When quantity is 2, lineSubtotal incorrectly calculates as unit price only!
                  */}
                  <div className="text-right min-w-[90px]">
                    <div
                      data-testid="item-line-total"
                      className="text-base font-extrabold text-white tracking-tight"
                    >
                      {formatINR(lineSubtotal)}
                    </div>
                    {item.quantity > 1 && (
                      <div className="text-[10px] text-slate-500">
                        ({item.quantity} × {formatINR(item.product.price)})
                      </div>
                    )}
                  </div>

                  {/* Remove Button */}
                  <button
                    onClick={() => removeFromCart(item.product.id)}
                    data-testid="remove-from-cart"
                    aria-label={`Remove ${item.product.name} from cart`}
                    className="text-slate-500 hover:text-rose-400 p-2 rounded-lg hover:bg-rose-500/10 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}

          <div className="pt-4 flex items-center justify-between">
            <Link
              to="/"
              className="text-xs font-semibold text-electric-400 hover:text-electric-300 flex items-center gap-1.5 transition-colors"
            >
              <span>← Continue Shopping</span>
            </Link>
          </div>
        </div>

        {/* Right: Order Summary */}
        <div className="lg:col-span-4">
          <div className="sticky top-24 bg-navy-900/80 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
            <h2 className="text-lg font-bold text-white tracking-tight">Order Summary</h2>

            {/* Subtotal, Shipping, and Discount */}
            <div className="space-y-3 text-sm divide-y divide-slate-800/80">
              <div className="flex justify-between items-center pt-2">
                <span className="text-slate-400">Items Subtotal</span>
                <span
                  data-testid="cart-subtotal"
                  className="font-bold text-white"
                >
                  {formatINR(subtotal)}
                </span>
              </div>

              {appliedCoupon && (
                <div className="flex justify-between items-center pt-3 text-emerald-400">
                  <div className="flex items-center gap-1.5">
                    <Tag className="w-4 h-4" />
                    <span>Coupon ({appliedCoupon.code} -{appliedCoupon.discountPercent}%)</span>
                  </div>
                  <span className="font-bold">-{formatINR(discount)}</span>
                </div>
              )}

              <div className="flex justify-between items-center pt-3">
                <div className="flex items-center gap-1">
                  <span className="text-slate-400">Shipping</span>
                  {shipping === 0 && (
                    <span className="text-[10px] text-emerald-400 font-bold px-1.5 py-0.5 rounded bg-emerald-500/10">
                      FREE
                    </span>
                  )}
                </div>
                <span className="font-semibold text-slate-200">
                  {shipping === 0 ? '₹0' : formatINR(shipping)}
                </span>
              </div>

              {shipping > 0 && (
                <div className="pt-2 text-[11px] text-slate-400 flex items-center gap-1">
                  <Truck className="w-3.5 h-3.5 text-electric-400" />
                  <span>Add {formatINR(3000 - subtotal)} more for free express shipping</span>
                </div>
              )}

              <div className="flex justify-between items-baseline pt-4">
                <span className="text-base font-bold text-white">Final Total</span>
                <span
                  data-testid="order-total"
                  className="text-2xl font-black text-electric-400 tracking-tight"
                >
                  {formatINR(total)}
                </span>
              </div>
            </div>

            {/* Coupon Code Section */}
            <div className="pt-4 border-t border-slate-800">
              <label htmlFor="coupon-input" className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                Promotional Coupon
              </label>

              {appliedCoupon ? (
                <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
                  <div className="flex items-center gap-2">
                    <Tag className="w-4 h-4 text-emerald-400" />
                    <div>
                      <span className="text-xs font-bold text-emerald-300">{appliedCoupon.code}</span>
                      <p className="text-[11px] text-emerald-400">{appliedCoupon.discountPercent}% discount active</p>
                    </div>
                  </div>
                  <button
                    onClick={removeCoupon}
                    className="p-1 rounded-md text-emerald-400 hover:text-emerald-200 hover:bg-emerald-500/20"
                    aria-label="Remove applied coupon"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyCoupon} className="space-y-2">
                  <div className="flex gap-2">
                    <input
                      id="coupon-input"
                      type="text"
                      data-testid="coupon-input"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value)}
                      placeholder="Try SAVE10 or FAKE50"
                      className="flex-1 bg-navy-950 border border-slate-700/80 rounded-xl px-3 py-2 text-xs uppercase font-semibold text-white placeholder-slate-500 focus:outline-none focus:border-electric-500"
                    />
                    <button
                      type="submit"
                      data-testid="apply-coupon"
                      className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 hover:text-white text-xs font-bold transition-colors"
                    >
                      Apply
                    </button>
                  </div>
                </form>
              )}

              {/* Coupon Status Message */}
              {couponStatus.message && (
                <div
                  data-testid="coupon-message"
                  className={`mt-2.5 p-2.5 rounded-xl text-xs flex items-center gap-2 font-medium ${
                    couponStatus.type === 'success'
                      ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-300'
                      : 'bg-rose-500/10 border border-rose-500/30 text-rose-300'
                  }`}
                >
                  {couponStatus.type === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                  )}
                  <span>{couponStatus.message}</span>
                </div>
              )}
            </div>

            {/* Checkout CTA */}
            <button
              onClick={() => navigate('/checkout')}
              data-testid="checkout-button"
              className="w-full py-3.5 px-4 rounded-xl bg-electric-600 hover:bg-electric-500 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-glow-violet transition-all active:scale-98"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            {/* Trust Badges */}
            <div className="pt-2 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Safe & Secure Demo Checkout</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
