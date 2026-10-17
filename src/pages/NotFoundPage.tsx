import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ArrowLeft, Home } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 text-center">
      <div className="relative mb-6">
        <span className="text-8xl sm:text-9xl font-black text-slate-800/80 select-none">
          404
        </span>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-16 h-16 rounded-2xl bg-electric-500/20 border border-electric-500/40 flex items-center justify-center text-electric-400 shadow-glow-violet">
            <Sparkles className="w-8 h-8" />
          </div>
        </div>
      </div>

      <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mb-2">
        Page Not Found
      </h1>
      <p className="text-sm text-slate-400 max-w-md mb-8">
        The route you requested does not exist on the NEXCART storefront. Let's get you back to the catalog.
      </p>

      <div className="flex items-center gap-3">
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-electric-600 hover:bg-electric-500 text-white text-xs font-bold uppercase tracking-wider shadow-glow-violet transition-all"
        >
          <Home className="w-4 h-4" />
          <span>Return Home</span>
        </Link>
      </div>
    </div>
  );
};
