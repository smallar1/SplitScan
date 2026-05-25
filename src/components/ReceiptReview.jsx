import React from 'react';
import { Trash2, Plus, Edit2 } from 'lucide-react';

export default function ReceiptReview({ items = [], tax = 0, tip = 0, onUpdateItem, onDeleteItem, onAddItem, onUpdateTax, onUpdateTip }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Itemized Details</h4>
        <button 
          onClick={onAddItem}
          className="text-xs bg-indigo-50 text-indigo-600 hover:bg-indigo-100 px-3 py-1.5 rounded-lg font-bold flex items-center gap-1 cursor-pointer transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          Add Item
        </button>
      </div>

      <div className="border border-slate-100 rounded-2xl overflow-hidden bg-white">
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 font-semibold">
              <th className="py-3 px-4">Item Name</th>
              <th className="py-3 px-4 text-right w-24">Price ($)</th>
              <th className="py-3 px-4 text-center w-16"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {items.length === 0 ? (
              <tr>
                <td colSpan="3" className="py-6 text-center text-slate-400 text-xs">
                  No items added yet. Click "Add Item" to start.
                </td>
              </tr>
            ) : (
              items.map((item, index) => (
                <tr key={item.id || index} className="group hover:bg-slate-50/50 transition-colors">
                  <td className="py-3 px-4">
                    <input 
                      type="text" 
                      value={item.name}
                      onChange={(e) => onUpdateItem(index, 'name', e.target.value)}
                      className="w-full bg-transparent border-0 focus:ring-2 focus:ring-indigo-500/20 focus:bg-slate-50 rounded-lg px-2 py-1 -mx-2 outline-none font-medium text-slate-700"
                    />
                  </td>
                  <td className="py-3 px-4 text-right">
                    <input 
                      type="number" 
                      step="0.01"
                      value={item.price}
                      onChange={(e) => onUpdateItem(index, 'price', parseFloat(e.target.value) || 0)}
                      className="w-full bg-transparent border-0 focus:ring-2 focus:ring-indigo-500/20 focus:bg-slate-50 rounded-lg px-2 py-1 outline-none text-right font-semibold text-slate-800"
                    />
                  </td>
                  <td className="py-3 px-4 text-center">
                    <button 
                      onClick={() => onDeleteItem(index)}
                      className="text-slate-400 hover:text-red-500 p-1 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Tax and Tip Inputs */}
      <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
        <div className="space-y-1">
          <label htmlFor="tax-input" className="text-xs font-semibold text-slate-500">Tax ($)</label>
          <input 
            type="number" 
            id="tax-input"
            step="0.01"
            value={tax}
            onChange={(e) => onUpdateTax(parseFloat(e.target.value) || 0)}
            className="w-full bg-white border border-slate-200 focus:border-indigo-500 rounded-xl px-3 py-2 outline-none text-sm font-semibold text-slate-700"
          />
        </div>
        <div className="space-y-1">
          <label htmlFor="tip-input" className="text-xs font-semibold text-slate-500">Tip ($)</label>
          <input 
            type="number" 
            id="tip-input"
            step="0.01"
            value={tip}
            onChange={(e) => onUpdateTip(parseFloat(e.target.value) || 0)}
            className="w-full bg-white border border-slate-200 focus:border-indigo-500 rounded-xl px-3 py-2 outline-none text-sm font-semibold text-slate-700"
          />
        </div>
      </div>
    </div>
  );
}
