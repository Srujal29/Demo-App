import React from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { formatINR } from '../utils/formatters';
import { 
  CheckCircle2, 
  Package, 
  ArrowRight, 
  Printer, 
  ShieldCheck, 
  ShoppingBag, 
  MapPin, 
  CreditCard,
  Mail,
  Phone
} from 'lucide-react';

export const OrderSuccessPage: React.FC = () => {
  const { latestOrder } = useStore();

  if (!latestOrder) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <div className="w-16 h-16 rounded-2xl bg-navy-900 border border-slate-800 flex items-center justify-center text-slate-500 mx-auto mb-4">
          <Package className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">No Active Order Found</h2>
        <p className="text-sm text-slate-400 mb-6">
          You haven't placed an order in this demo session yet.
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-electric-600 hover:bg-electric-500 text-white font-semibold text-xs"
        >
          <span>Return to Storefront</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  const { orderId, items, subtotal, discount, shipping, total, appliedCoupon, customer, createdAt } = latestOrder;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Success Hero Card */}
      <div className="text-center pb-10">
        <div className="w-20 h-20 rounded-3xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mx-auto mb-5 shadow-lg shadow-emerald-950/40 animate-bounce-short">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-300 text-xs font-bold uppercase tracking-wider mb-3">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Demo Order Confirmed</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Thank you for your demo order!
        </h1>
        <p className="mt-2 text-sm text-slate-400 max-w-lg mx-auto">
          We have generated your simulated order confirmation for QA test validation.
        </p>

        {/* Order ID Pill */}
        <div className="mt-6 inline-flex flex-col sm:flex-row items-center gap-2 px-5 py-2.5 rounded-2xl bg-navy-900 border border-slate-800 shadow-md">
          <span className="text-xs text-slate-400">Order Reference:</span>
          <span
            data-testid="order-id"
            className="text-sm font-mono font-bold text-electric-400 tracking-wider"
          >
            {orderId}
          </span>
          <span className="text-slate-600 hidden sm:inline">•</span>
          <span className="text-xs text-slate-400">
            {new Date(createdAt).toLocaleDateString('en-IN', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </span>
        </div>
      </div>

      {/* Order Details & Summary Card */}
      <div className="bg-navy-900/70 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-8 shadow-xl">
        {/* Customer & Delivery Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pb-6 border-b border-slate-800">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-electric-400" />
              <span>Delivery Details</span>
            </h3>
            <div className="text-xs text-slate-300 space-y-1">
              <div className="font-bold text-white text-sm">{customer.fullName}</div>
              <div>{customer.address}</div>
              <div>{customer.city} — {customer.pinCode}</div>
              <div className="flex items-center gap-1.5 pt-1 text-slate-400">
                <Phone className="w-3.5 h-3.5" />
                <span>{customer.phone}</span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-neon-cyan" />
              <span>Payment & Notification</span>
            </h3>
            <div className="text-xs text-slate-300 space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-white">Method:</span>
                <span className="capitalize px-2 py-0.5 rounded bg-slate-800 text-electric-300">
                  {customer.paymentMethod.replace('_', ' ')}
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-300">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <span className="font-mono text-slate-200">{customer.email}</span>
              </div>
              <div className="text-[11px] text-emerald-400 pt-1 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                <span>Simulated Authorization Passed</span>
              </div>
            </div>
          </div>
        </div>

        {/* Purchased Items List */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
            <ShoppingBag className="w-4 h-4 text-electric-400" />
            <span>Items Ordered ({items.length})</span>
          </h3>
          <div className="divide-y divide-slate-800/80">
            {items.map((item, idx) => (
              <div key={idx} className="py-3 flex items-center justify-between text-xs">
                <div className="flex-1 pr-4">
                  <div className="font-semibold text-white text-sm">{item.product.name}</div>
                  <div className="text-slate-400">
                    Category: {item.product.category} • Qty: <strong className="text-slate-200">{item.quantity}</strong> × {formatINR(item.product.price)}
                  </div>
                </div>
                <div className="font-bold text-white text-sm text-right">
                  {formatINR(item.product.price * item.quantity)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Financial Breakdown */}
        <div className="pt-6 border-t border-slate-800 space-y-2.5 text-xs">
          <div className="flex justify-between text-slate-400">
            <span>Subtotal</span>
            <span className="text-slate-200 font-semibold">{formatINR(subtotal)}</span>
          </div>

          {appliedCoupon && (
            <div className="flex justify-between text-emerald-400">
              <span>Promotional Discount ({appliedCoupon.code} -{appliedCoupon.discountPercent}%)</span>
              <span className="font-bold">-{formatINR(discount)}</span>
            </div>
          )}

          <div className="flex justify-between text-slate-400">
            <span>Shipping</span>
            <span className="text-slate-200 font-semibold">
              {shipping === 0 ? 'FREE' : formatINR(shipping)}
            </span>
          </div>

          <div className="pt-4 border-t border-slate-800 flex justify-between items-baseline text-base">
            <span className="font-bold text-white">Paid Total</span>
            <span className="text-2xl font-black text-electric-400">
              {formatINR(total)}
            </span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <button
            onClick={() => window.print()}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors"
          >
            <Printer className="w-4 h-4 text-slate-400" />
            <span>Print Invoice</span>
          </button>

          <Link
            to="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-electric-600 hover:bg-electric-500 text-white text-xs font-bold uppercase tracking-wider shadow-glow-violet transition-all"
          >
            <span>Back to Storefront</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
};
