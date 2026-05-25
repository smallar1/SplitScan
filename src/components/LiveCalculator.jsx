import React from 'react';
import { DollarSign } from 'lucide-react';

export default function LiveCalculator({ subtotal = 0, taxShare = 0, tipShare = 0, grandTotal = 0 }) {
  return (
    <div className="fixed bottom-0 left-0 right-0 p-4 bg-slate-950/95 backdrop-blur-md border-t border-slate-850 text-white z-50 shadow-2xl">
      <div className="max-w-md mx-auto space-y-4">
        {/* Cost breakdown */}
        <div className="grid grid-cols-3 gap-2 text-center text-xs text-slate-400">
          <div className="bg-slate-900/60 py-2 px-1.5 rounded-xl border border-slate-800/40">
            <span className="block text-[10px] uppercase font-semibold tracking-wider text-slate-500 mb-0.5">My Food</span>
            <span className="font-bold text-slate-200">${subtotal.toFixed(2)}</span>
          </div>
          <div className="bg-slate-900/60 py-2 px-1.5 rounded-xl border border-slate-800/40">
            <span className="block text-[10px] uppercase font-semibold tracking-wider text-slate-500 mb-0.5">Prorated Tax</span>
            <span className="font-bold text-slate-200">${taxShare.toFixed(2)}</span>
          </div>
          <div className="bg-slate-900/60 py-2 px-1.5 rounded-xl border border-slate-800/40">
            <span className="block text-[10px] uppercase font-semibold tracking-wider text-slate-500 mb-0.5">Even Tip</span>
            <span className="font-bold text-slate-200">${tipShare.toFixed(2)}</span>
          </div>
        </div>

        {/* Grand Total */}
        <div className="flex items-center justify-between pt-2.5 border-t border-slate-850/80">
          <div className="space-y-0.5">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Your Grand Total</span>
            <p className="text-[10px] text-slate-500">Calculated in real-time</p>
          </div>
          <span className="text-3xl font-black text-indigo-400 flex items-center tracking-tight">
            <DollarSign className="w-7 h-7 stroke-[3] -mr-0.5 text-indigo-400" />
            {grandTotal.toFixed(2)}
          </span>
        </div>
      </div>
    </div>
  );
}
