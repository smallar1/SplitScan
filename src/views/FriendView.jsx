import React, { useState } from 'react';
import { User, CheckCircle2, Users } from 'lucide-react';
import { calculateMemberShare } from '../utils/calculator';
import LiveCalculator from '../components/LiveCalculator';

export default function FriendView() {
  const [userName, setUserName] = useState('');
  const [isNameSet, setIsNameSet] = useState(false);
  
  // Sample receipt data for visual boilerplate
  const [receipt, setReceipt] = useState({
    id: 'demo-session',
    tax: 3.84,
    tip: 8.00,
    numPeople: 4,
    items: [
      { id: '1', name: 'Truffle Fries', price: 9.50, claimers: ['Bob'] },
      { id: '2', name: 'Classic Cheeseburger', price: 16.00, claimers: [] },
      { id: '3', name: 'Spicy Chicken Sandwich', price: 14.50, claimers: ['Alice'] },
      { id: '4', name: 'Craft IPA Beer', price: 8.00, claimers: [] },
    ]
  });

  const [claimedItems, setClaimedItems] = useState([]);

  const toggleClaim = (itemId) => {
    if (claimedItems.includes(itemId)) {
      setClaimedItems(claimedItems.filter(id => id !== itemId));
    } else {
      setClaimedItems([...claimedItems, itemId]);
    }
  };

  // Perform calculation using our core math module
  const totals = calculateMemberShare({
    memberName: userName,
    items: receipt.items,
    claimedItemIds: claimedItems,
    claims: receipt.items.reduce((acc, item) => {
      // Create a map of itemId -> list of claimers
      acc[item.id] = item.claimers;
      return acc;
    }, {}),
    tax: receipt.tax,
    tip: receipt.tip,
    numPeople: receipt.numPeople
  });

  if (!isNameSet) {
    return (
      <div className="w-full max-w-md mx-auto px-4 py-16 space-y-6">
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 space-y-6 text-center">
          <div className="mx-auto w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600">
            <User className="w-6 h-6" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-bold text-slate-800">Who is splitting?</h2>
            <p className="text-sm text-slate-500">Enter your name so we can attribute items to you.</p>
          </div>
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              if (userName.trim()) setIsNameSet(true);
            }}
            className="space-y-4"
          >
            <input
              type="text"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              placeholder="Your Name (e.g. Samuel)"
              required
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:border-indigo-500 rounded-2xl outline-none transition-all text-center font-medium"
            />
            <button
              type="submit"
              className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold transition-all shadow-md shadow-indigo-150 cursor-pointer"
            >
              Join Split
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto px-4 pt-6 pb-36 space-y-6">
      {/* Welcome & Info */}
      <div className="flex items-center justify-between bg-white px-5 py-4 rounded-2xl shadow-sm border border-slate-100">
        <div>
          <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Splitting as</p>
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            {userName}
          </h2>
        </div>
        <button 
          onClick={() => setIsNameSet(false)}
          className="text-xs text-indigo-600 font-bold hover:underline cursor-pointer"
        >
          Change Name
        </button>
      </div>

      {/* Items Checklist */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider px-1">Select your items</h3>
        <div className="space-y-2">
          {receipt.items.map((item) => {
            const isChecked = claimedItems.includes(item.id);
            // Construct simulated active claimers list
            const activeClaimers = [...item.claimers];
            if (isChecked && !activeClaimers.includes(userName)) {
              activeClaimers.push(userName);
            }

            return (
              <div 
                key={item.id}
                onClick={() => toggleClaim(item.id)}
                className={`bg-white rounded-2xl p-4 border transition-all duration-200 cursor-pointer select-none flex items-center justify-between ${
                  isChecked 
                    ? 'border-indigo-500 ring-2 ring-indigo-500/10' 
                    : 'border-slate-100 hover:border-slate-200'
                }`}
              >
                <div className="flex items-center space-x-3 flex-1 min-w-0">
                  <div className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all ${
                    isChecked ? 'bg-indigo-600 text-white' : 'border border-slate-300 text-transparent'
                  }`}>
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div className="space-y-0.5 flex-1 min-w-0">
                    <p className="font-semibold text-slate-800 text-sm truncate">{item.name}</p>
                    {activeClaimers.length > 0 && (
                      <div className="flex items-center gap-1 text-[11px] text-slate-400 font-medium truncate">
                        <Users className="w-3.5 h-3.5" />
                        <span>Claimed by: {activeClaimers.join(', ')}</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="text-right pl-3">
                  <p className="font-bold text-slate-800 text-sm">
                    ${item.price.toFixed(2)}
                  </p>
                  {activeClaimers.length > 1 && (
                    <p className="text-[10px] text-slate-400 font-medium">
                      ${(item.price / activeClaimers.length).toFixed(2)} each
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Real-time Calculator Floating Bottom Panel */}
      <LiveCalculator 
        subtotal={totals.subtotal}
        taxShare={totals.taxShare}
        tipShare={totals.tipShare}
        grandTotal={totals.grandTotal}
      />
    </div>
  );
}
