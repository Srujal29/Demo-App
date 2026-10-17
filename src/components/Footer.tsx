import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, RotateCcw, ShieldCheck, Zap, Terminal } from 'lucide-react';
import { useStore } from '../context/StoreContext';

export const Footer: React.FC = () => {
  const { resetDemo } = useStore();

  return (
    <footer className="bg-navy-950 border-t border-slate-800/80 text-slate-400 text-sm mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand Info */}
          <div className="md:col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-electric-600 to-indigo-600 p-0.5 shadow-glow-violet">
                <div className="w-full h-full bg-navy-950 rounded-[6px] flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-electric-400" />
                </div>
              </div>
              <span className="text-lg font-extrabold tracking-tight text-white">
                NEX<span className="text-electric-400">CART</span>
              </span>
            </Link>
            <p className="text-xs text-slate-400 max-w-md leading-relaxed">
              Target e-commerce demo application designed for autonomous QA agents, Playwright test suites, and bug discovery demonstrations. Features full checkout workflows, cart state persistence, and deterministic test scenarios.
            </p>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <Terminal className="w-3.5 h-3.5 text-electric-400" />
              <span>Target system for QA-NEXUS Autonomous QA Platform</span>
            </div>
          </div>

          {/* Quick Navigation */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-3">
              Store Navigation
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/" className="hover:text-electric-400 transition-colors">
                  Product Catalog
                </Link>
              </li>
              <li>
                <Link to="/cart" className="hover:text-electric-400 transition-colors">
                  Shopping Cart
                </Link>
              </li>
              <li>
                <Link to="/checkout" className="hover:text-electric-400 transition-colors">
                  Checkout Portal
                </Link>
              </li>
            </ul>
          </div>

          {/* Testing Controls */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-3">
              Test & Demo Tools
            </h4>
            <p className="text-xs text-slate-400 mb-3">
              Restore clean baseline data across cart, coupon, and demo sessions at any time.
            </p>
            <button
              onClick={resetDemo}
              data-testid="reset-demo"
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-900 border border-slate-700 hover:border-electric-500/50 hover:bg-slate-800 text-slate-200 hover:text-white transition-all shadow-sm"
            >
              <RotateCcw className="w-3.5 h-3.5 text-electric-400" />
              <span>Reset Demo Baseline</span>
            </button>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-slate-800/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>NEXCART Demo Environment • Safe Sandbox (No Real Transactions)</span>
          </div>
          <div>
            © {new Date().getFullYear()} NEXCART Inc. Built for QA-NEXUS.
          </div>
        </div>
      </div>
    </footer>
  );
};
