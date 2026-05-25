import React from 'react';
import { DollarSign } from 'lucide-react';

export default function LiveCalculator({ subtotal = 0, taxShare = 0, tipShare = 0, grandTotal = 0 }) {
  return (
    <div className="fixed bottom-6 max-w-sm left-4 right-4 mx-auto p-4 z-50 floating-pill-bar animate-in slide-in-from-bottom-6 duration-300">
      <div className="space-y-3">
        {/* Cost breakdown chips */}
        <div className="grid grid-cols-3 gap-1.5 text-center text-[10px]">
          <div className="bg-[#f5f8fa] py-2 px-1 rounded-xl">
            <span className="block font-bold uppercase tracking-wider text-slate-400 mb-0.5">My Food</span>
            <span className="font-extrabold text-[#032b4b]">${subtotal.toFixed(2)}</span>
          </div>
          <div className="bg-[#f5f8fa] py-2 px-1 rounded-xl">
            <span className="block font-bold uppercase tracking-wider text-slate-400 mb-0.5">Tax (Prorated)</span>
            <span className="font-extrabold text-[#032b4b]">${taxShare.toFixed(2)}</span>
          </div>
          <div className="bg-[#f5f8fa] py-2 px-1 rounded-xl">
            <span className="block font-bold uppercase tracking-wider text-slate-400 mb-0.5">Tip (Split)</span>
            <span className="font-extrabold text-[#032b4b]">${tipShare.toFixed(2)}</span>
          </div>
        </div>

        {/* Grand Total panel */}
        <div className="flex items-center justify-between pt-2 border-t border-[#eef2f5]">
          <div className="space-y-0.5 pl-1">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Your Share</span>
            <p className="text-[9px] text-slate-400 font-semibold">Calculated live</p>
          </div>
          <div className="flex items-center bg-[#13c178]/10 text-[#13c178] px-4 py-2 rounded-2xl font-black text-xl tracking-tight">
            <DollarSign className="w-4 h-4 stroke-[3] mr-0.5 text-[#13c178]" />
            <span>{grandTotal.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
