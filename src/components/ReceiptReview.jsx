import React from 'react';
import { Trash2, Plus } from 'lucide-react';

export default function ReceiptReview({ items = [], tax = 0, tip = 0, onUpdateItem, onDeleteItem, onAddItem, onUpdateTax, onUpdateTip }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between px-1">
        <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider">Itemized Details</h4>
        <button 
          onClick={onAddItem}
          className="text-xs bg-[#0066fe]/5 text-[#0066fe] hover:bg-[#0066fe]/10 px-3.5 py-2 rounded-xl font-extrabold flex items-center gap-1 cursor-pointer transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          Add Item
        </button>
      </div>

      {/* Flexible List Wrapper */}
      <div className="border border-[#eef2f5] rounded-3xl bg-white p-4 space-y-2">
        {/* Column Headers */}
        <div className="flex text-[10px] font-black text-slate-400 uppercase tracking-wider pb-2.5 border-b border-[#eef2f5] px-2">
          <div className="flex-grow">Item Name</div>
          <div className="w-24 text-right pr-6">Price ($)</div>
          <div className="w-10"></div>
        </div>

        {/* List Items */}
        <div className="divide-y divide-[#eef2f5]">
          {items.length === 0 ? (
            <div className="py-8 text-center text-slate-400 text-xs font-semibold">
              No items added yet. Click "Add Item" to start.
            </div>
          ) : (
            items.map((item, index) => (
              <div 
                key={item.id || index} 
                className="flex items-start gap-2 py-3 transition-colors px-2 -mx-2 rounded-2xl hover:bg-[#f5f8fa]/30"
              >
                {/* Item Name Textarea (Wraps long text automatically) */}
                <div className="flex-grow">
                  <textarea 
                    rows={2}
                    value={item.name}
                    onChange={(e) => onUpdateItem(index, 'name', e.target.value)}
                    className="w-full bg-transparent border border-transparent focus:border-[#0066fe] focus:bg-white rounded-xl px-3 py-1.5 outline-none font-semibold text-[#032b4b] resize-none text-sm leading-snug transition-all"
                    placeholder="Item name"
                  />
                </div>
                
                {/* Price Input (Spacious width + minimal horizontal padding to prevent clipping) */}
                <div className="w-24 shrink-0">
                  <input 
                    type="number" 
                    step="0.01"
                    value={item.price}
                    onChange={(e) => onUpdateItem(index, 'price', parseFloat(e.target.value) || 0)}
                    className="w-full bg-transparent border border-transparent focus:border-[#0066fe] focus:bg-white rounded-xl px-2 py-1.5 outline-none text-right font-extrabold text-[#032b4b] transition-all"
                    placeholder="0.00"
                  />
                </div>

                {/* Delete button */}
                <div className="w-10 shrink-0 flex justify-center pt-0.5">
                  <button 
                    onClick={() => onDeleteItem(index)}
                    className="text-slate-400 hover:text-red-500 p-2 rounded-xl hover:bg-red-50 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Tax and Tip Inputs */}
      <div className="grid grid-cols-2 gap-4 bg-[#f5f8fa] p-4 rounded-2xl border border-[#eef2f5]">
        <div className="space-y-1.5">
          <label htmlFor="tax-input" className="text-[10px] font-black uppercase tracking-wider text-slate-400 block pl-1">Tax ($)</label>
          <input 
            type="number" 
            id="tax-input"
            step="0.01"
            value={tax}
            onChange={(e) => onUpdateTax(parseFloat(e.target.value) || 0)}
            className="w-full bg-white border border-[#eef2f5] focus:border-[#0066fe] rounded-xl px-3 py-2 outline-none text-sm font-extrabold text-[#032b4b] transition-all"
          />
        </div>
        <div className="space-y-1.5">
          <label htmlFor="tip-input" className="text-[10px] font-black uppercase tracking-wider text-slate-400 block pl-1">Tip ($)</label>
          <input 
            type="number" 
            id="tip-input"
            step="0.01"
            value={tip}
            onChange={(e) => onUpdateTip(parseFloat(e.target.value) || 0)}
            className="w-full bg-white border border-[#eef2f5] focus:border-[#0066fe] rounded-xl px-3 py-2 outline-none text-sm font-extrabold text-[#032b4b] transition-all"
          />
        </div>
      </div>
    </div>
  );
}
