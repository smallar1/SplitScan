import React, { useState } from 'react';
import { Camera, Users, Receipt, ArrowRight, Sparkles } from 'lucide-react';
import ReceiptReview from '../components/ReceiptReview';

export default function HostView() {
  const [participantCount, setParticipantCount] = useState(2);
  const [isProcessing, setIsProcessing] = useState(false);
  const [ocrResult, setOcrResult] = useState(null);

  const handleDemoMock = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setOcrResult({
        items: [
          { id: '1', name: 'Truffle Fries', price: 9.50 },
          { id: '2', name: 'Classic Cheeseburger', price: 16.00 },
          { id: '3', name: 'Spicy Chicken Sandwich', price: 14.50 },
          { id: '4', name: 'Craft IPA Beer', price: 8.00 },
        ],
        tax: 3.84,
        tip: 8.00
      });
      setIsProcessing(false);
    }, 1500);
  };

  const handleUpdateItem = (index, field, value) => {
    const updatedItems = [...ocrResult.items];
    updatedItems[index] = {
      ...updatedItems[index],
      [field]: value
    };
    setOcrResult({
      ...ocrResult,
      items: updatedItems
    });
  };

  const handleDeleteItem = (index) => {
    const updatedItems = ocrResult.items.filter((_, i) => i !== index);
    setOcrResult({
      ...ocrResult,
      items: updatedItems
    });
  };

  const handleAddItem = () => {
    const newItem = {
      id: `item-${Date.now()}`,
      name: 'New Item',
      price: 0.00
    };
    setOcrResult({
      ...ocrResult,
      items: [...ocrResult.items, newItem]
    });
  };

  const handleUpdateTax = (tax) => {
    setOcrResult({ ...ocrResult, tax });
  };

  const handleUpdateTip = (tip) => {
    setOcrResult({ ...ocrResult, tip });
  };

  const calculateTotal = () => {
    if (!ocrResult) return 0;
    const foodSubtotal = ocrResult.items.reduce((sum, item) => sum + item.price, 0);
    return foodSubtotal + ocrResult.tax + ocrResult.tip;
  };

  return (
    <div className="w-full max-w-md mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center p-3 bg-indigo-50 rounded-2xl text-indigo-600 animate-pulse">
          <Receipt className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">ScanSplit</h1>
        <p className="text-sm text-slate-500">Scan your receipt, invite friends, and split instantly.</p>
      </div>

      {/* Main Actions */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 space-y-6">
        {/* Upload Box */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-700 block">Step 1: Upload Receipt</label>
          <div className="border-2 border-dashed border-slate-200 hover:border-indigo-400 rounded-2xl p-8 transition-all duration-300 text-center cursor-pointer group bg-slate-50/50 hover:bg-indigo-50/10">
            <div className="flex flex-col items-center space-y-3">
              <div className="p-4 bg-white rounded-2xl shadow-sm text-slate-400 group-hover:text-indigo-500 transition-colors">
                <Camera className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-slate-800">Take a photo or upload image</p>
                <p className="text-xs text-slate-400">Supports JPG, PNG (Max 5MB)</p>
              </div>
            </div>
          </div>
        </div>

        {/* Demo Shortcut */}
        <button 
          onClick={handleDemoMock}
          disabled={isProcessing}
          className="w-full py-3 px-4 bg-indigo-50 text-indigo-600 hover:bg-indigo-100/80 rounded-2xl text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer"
        >
          <Sparkles className="w-4 h-4" />
          {isProcessing ? 'Simulating OCR...' : 'Try Demo with Mock Receipt'}
        </button>

        {/* Split Count */}
        <div className="space-y-3 pt-2 border-t border-slate-100">
          <label htmlFor="num-people" className="text-sm font-semibold text-slate-700 flex items-center gap-2">
            <Users className="w-4 h-4 text-slate-400" />
            Step 2: Number of People Splitters
          </label>
          <div className="flex items-center justify-between bg-slate-50 p-2 rounded-2xl border border-slate-100">
            <button 
              type="button"
              onClick={() => setParticipantCount(Math.max(1, participantCount - 1))}
              className="w-10 h-10 flex items-center justify-center bg-white hover:bg-slate-100 rounded-xl font-bold shadow-sm transition-all cursor-pointer"
            >
              -
            </button>
            <span className="text-lg font-bold text-slate-800">{participantCount}</span>
            <button 
              type="button"
              onClick={() => setParticipantCount(participantCount + 1)}
              className="w-10 h-10 flex items-center justify-center bg-white hover:bg-slate-100 rounded-xl font-bold shadow-sm transition-all cursor-pointer"
            >
              +
            </button>
          </div>
        </div>
      </div>

      {/* Review Section */}
      {ocrResult && (
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-50">
            <Sparkles className="w-5 h-5 text-emerald-500" />
            <h3 className="text-md font-bold text-slate-800">Verify Receipt Items</h3>
          </div>
          
          <ReceiptReview 
            items={ocrResult.items}
            tax={ocrResult.tax}
            tip={ocrResult.tip}
            onUpdateItem={handleUpdateItem}
            onDeleteItem={handleDeleteItem}
            onAddItem={handleAddItem}
            onUpdateTax={handleUpdateTax}
            onUpdateTip={handleUpdateTip}
          />

          <div className="pt-2 border-t border-slate-100 flex justify-between items-center text-sm font-bold text-slate-800">
            <span>Grand Total</span>
            <span className="text-lg text-indigo-600">${calculateTotal().toFixed(2)}</span>
          </div>

          <button className="w-full py-4 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold transition-all shadow-md shadow-indigo-200 flex items-center justify-center gap-2 group cursor-pointer">
            Create Session & Share
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      )}
    </div>
  );
}

