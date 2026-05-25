import React, { useState, useEffect } from 'react';
import { User, CheckCircle2, Users, Loader2, AlertCircle } from 'lucide-react';
import { calculateMemberShare } from '../utils/calculator';
import LiveCalculator from '../components/LiveCalculator';

export default function FriendView({ sessionId }) {
  const [userName, setUserName] = useState('');
  const [isNameSet, setIsNameSet] = useState(false);
  const [receipt, setReceipt] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [claimedItems, setClaimedItems] = useState([]);

  // Fetch receipt details on mount
  useEffect(() => {
    if (!sessionId) {
      setError('Missing session ID');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    fetch(`/api/receipt/${sessionId}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setReceipt(data.session);
        } else {
          setError(data.error || 'Failed to fetch receipt');
        }
        setIsLoading(false);
      })
      .catch(err => {
        console.error('API Error:', err);
        setError('Could not connect to server.');
        setIsLoading(false);
      });
  }, [sessionId]);

  // Polling database claims update every 3 seconds for mock real-time syncing
  useEffect(() => {
    if (!sessionId || !isNameSet) return;

    const interval = setInterval(() => {
      fetch(`/api/receipt/${sessionId}`)
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setReceipt(prev => {
              // Avoid trigger render loops unless actual claims maps updated
              if (JSON.stringify(prev?.claims) !== JSON.stringify(data.session.claims)) {
                return data.session;
              }
              return prev;
            });
          }
        })
        .catch(err => console.error('Polling error:', err));
    }, 3000);

    return () => clearInterval(interval);
  }, [sessionId, isNameSet]);

  const handleJoin = (e) => {
    e.preventDefault();
    if (!userName.trim()) return;

    setIsNameSet(true);

    // Scan existing database claims to prefill user's claims array on reload/join
    if (receipt && receipt.claims) {
      const preclaimed = [];
      Object.keys(receipt.claims).forEach(itemId => {
        if (receipt.claims[itemId].includes(userName)) {
          preclaimed.push(itemId);
        }
      });
      setClaimedItems(preclaimed);
    }
  };

  const toggleClaim = (itemId) => {
    if (!receipt) return;

    const isChecked = claimedItems.includes(itemId);
    const updatedClaims = isChecked
      ? claimedItems.filter(id => id !== itemId)
      : [...claimedItems, itemId];

    // Optimistically update local claims array
    setClaimedItems(updatedClaims);

    // Sync claim state with Express API
    fetch(`/api/receipt/${sessionId}/claim`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        userName,
        claimedItemIds: updatedClaims
      })
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setReceipt(prev => ({
            ...prev,
            claims: data.claims
          }));
        }
      })
      .catch(err => {
        console.error('Failed to sync claim:', err);
      });
  };

  // Perform calculations using calculations utility
  const getTotals = () => {
    if (!receipt) return { subtotal: 0, taxShare: 0, tipShare: 0, grandTotal: 0 };
    return calculateMemberShare({
      memberName: userName,
      items: receipt.items,
      claimedItemIds: claimedItems,
      claims: receipt.claims || {},
      tax: receipt.tax,
      tip: receipt.tip,
      numPeople: receipt.numPeople
    });
  };

  const totals = getTotals();

  // Loading Screen
  if (isLoading) {
    return (
      <div className="w-full max-w-md mx-auto px-4 py-32 flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
        <p className="text-sm font-semibold text-slate-500">Retrieving bill details...</p>
      </div>
    );
  }

  // Error Screen
  if (error) {
    return (
      <div className="w-full max-w-md mx-auto px-4 py-24 text-center space-y-4">
        <div className="mx-auto w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center text-red-500">
          <AlertCircle className="w-6 h-6" />
        </div>
        <div className="space-y-1">
          <h2 className="text-lg font-bold text-slate-800">Split Session Not Found</h2>
          <p className="text-sm text-slate-500">{error}</p>
        </div>
        <a 
          href="/"
          className="inline-block py-3 px-6 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-bold text-sm transition-all"
        >
          Go to Home
        </a>
      </div>
    );
  }

  // Identity Login Modal Screen
  if (!isNameSet) {
    return (
      <div className="w-full max-w-md mx-auto px-4 py-16 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 space-y-6 text-center">
          <div className="mx-auto w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600">
            <User className="w-6 h-6" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-bold text-slate-800">Who is splitting?</h2>
            <p className="text-sm text-slate-500">Enter your name to join the split session and claim items.</p>
          </div>
          <form onSubmit={handleJoin} className="space-y-4">
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
    <div className="w-full max-w-md mx-auto px-4 pt-6 pb-36 space-y-6 animate-in fade-in duration-300">
      {/* Welcome & Split Info Header */}
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

      {/* Checklist items mapping */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider">Select your items</h3>
          <span className="text-xs text-slate-400 font-semibold">{receipt?.numPeople || 1} splitters total</span>
        </div>
        <div className="space-y-2">
          {receipt?.items.map((item) => {
            const activeClaimers = receipt.claims?.[item.id] || [];
            const isChecked = claimedItems.includes(item.id);

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
                  {activeClaimers.length > 0 && (
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

      {/* Sticky Real-time Calculator */}
      <LiveCalculator 
        subtotal={totals.subtotal}
        taxShare={totals.taxShare}
        tipShare={totals.tipShare}
        grandTotal={totals.grandTotal}
      />
    </div>
  );
}
