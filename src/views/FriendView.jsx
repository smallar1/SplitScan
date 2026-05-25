import React, { useState, useEffect } from 'react';
import { User, Users, Loader2, AlertCircle, Check, HelpCircle } from 'lucide-react';
import { calculateMemberShare } from '../utils/calculator';
import LiveCalculator from '../components/LiveCalculator';
import { doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';

export default function FriendView({ sessionId }) {
  const [userName, setUserName] = useState('');
  const [isNameSet, setIsNameSet] = useState(false);
  const [receipt, setReceipt] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Real-time Firestore sync on mount
  useEffect(() => {
    if (!sessionId) {
      setError('Missing session ID');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    const docRef = doc(db, 'sessions', sessionId);
    const unsubscribe = onSnapshot(
      docRef,
      (docSnap) => {
        setIsLoading(false);
        if (docSnap.exists()) {
          setReceipt(docSnap.data());
        } else {
          setError('Session not found');
        }
      },
      (err) => {
        console.error('Firestore Error:', err);
        setError('Could not connect to database.');
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [sessionId]);

  const handleJoin = (e) => {
    e.preventDefault();
    if (!userName.trim()) return;
    setIsNameSet(true);
  };

  // Derive claimed items from receipt.claims mapped to current user
  const claimedItems = receipt && receipt.claims
    ? Object.keys(receipt.claims).filter(itemId => receipt.claims[itemId]?.includes(userName))
    : [];

  const toggleClaim = async (itemId) => {
    if (!receipt) return;

    const isChecked = claimedItems.includes(itemId);

    try {
      const docRef = doc(db, 'sessions', sessionId);
      const currentClaims = { ...(receipt.claims || {}) };
      const claimers = currentClaims[itemId] || [];
      
      let updatedClaimers;
      if (isChecked) {
        updatedClaimers = claimers.filter(name => name !== userName);
      } else {
        if (!claimers.includes(userName)) {
          updatedClaimers = [...claimers, userName];
        } else {
          updatedClaimers = claimers;
        }
      }
      
      currentClaims[itemId] = updatedClaimers;

      await updateDoc(docRef, {
        claims: currentClaims
      });
    } catch (err) {
      console.error('Failed to sync claim to Firestore:', err);
    }
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

  // Find unclaimed items for the warning banner
  const getUnclaimedSummary = () => {
    if (!receipt) return [];
    return receipt.items.filter(item => {
      const claimers = receipt.claims?.[item.id] || [];
      return claimers.length === 0;
    });
  };

  const unclaimedItems = getUnclaimedSummary();
  const unclaimedTotal = unclaimedItems.reduce((sum, i) => sum + i.price, 0);

  // Loading Screen
  if (isLoading) {
    return (
      <div className="w-full max-w-md mx-auto px-4 py-32 flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-10 h-10 text-[#0066fe] animate-spin" />
        <p className="text-sm font-semibold text-slate-400">Retrieving bill details...</p>
      </div>
    );
  }

  // Error Screen
  if (error) {
    return (
      <div className="w-full max-w-md mx-auto px-5 py-24 text-center space-y-4">
        <div className="mx-auto w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center text-red-500">
          <AlertCircle className="w-6 h-6" />
        </div>
        <div className="space-y-1.5">
          <h2 className="text-lg font-black text-[#032b4b]">Split Session Not Found</h2>
          <p className="text-sm font-semibold text-slate-400">{error}</p>
        </div>
        <a 
          href="/"
          className="inline-block py-3.5 px-6 bg-[#032b4b] hover:bg-[#0b2c4d] text-white rounded-2xl font-extrabold text-sm transition-all"
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
        <div className="bg-white rounded-3xl p-6 border border-[#eef2f5] space-y-6 text-center">
          <div className="mx-auto w-12 h-12 bg-[#0066fe]/5 rounded-2xl flex items-center justify-center text-[#0066fe]">
            <User className="w-6 h-6" />
          </div>
          <div className="space-y-1.5">
            <h2 className="text-xl font-black text-[#032b4b]">Who is splitting?</h2>
            <p className="text-sm font-semibold text-slate-400">Enter your name to join this split session.</p>
          </div>
          <form onSubmit={handleJoin} className="space-y-4">
            <input
              type="text"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              placeholder="Your Name (e.g. Samuel)"
              required
              className="w-full px-4 py-3 bg-[#f5f8fa] border border-[#eef2f5] focus:border-[#0066fe] focus:bg-white rounded-2xl outline-none transition-all text-center font-bold text-[#032b4b]"
            />
            <button
              type="submit"
              className="w-full py-4 bg-[#0066fe] hover:bg-[#0052cc] text-white rounded-2xl font-extrabold transition-all shadow-lg shadow-[#0066fe]/20 cursor-pointer"
            >
              Join Split
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto px-5 pt-6 pb-40 space-y-6 animate-in fade-in duration-300">
      {/* Welcome & Split Info Header */}
      <div className="flex items-center justify-between bg-white px-5 py-4 rounded-2xl border border-[#eef2f5]">
        <div>
          <p className="text-[10px] text-slate-400 font-black uppercase tracking-wider">Splitting as</p>
          <h2 className="text-lg font-black text-[#032b4b] flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#13c178]"></span>
            {userName}
          </h2>
        </div>
        <button 
          onClick={() => setIsNameSet(false)}
          className="text-xs text-[#0066fe] font-extrabold hover:underline cursor-pointer"
        >
          Change Name
        </button>
      </div>

      {/* Unclaimed Items Warning Banner */}
      {unclaimedItems.length > 0 && (
        <div className="bg-[#f5f8fa] border border-[#eef2f5] px-5 py-4 rounded-2xl flex items-start gap-3.5 animate-in fade-in duration-200">
          <HelpCircle className="w-5 h-5 text-slate-450 shrink-0 mt-0.5" />
          <div className="text-xs space-y-0.5 flex-1 min-w-0">
            <p className="font-extrabold text-[#032b4b]">Unclaimed items remaining (${unclaimedTotal.toFixed(2)})</p>
            <p className="text-slate-400 font-bold leading-relaxed break-words">
              {unclaimedItems.map(i => i.name).join(', ')}
            </p>
          </div>
        </div>
      )}

      {/* Checklist items mapping */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider">Select your items</h3>
          <span className="text-xs text-slate-400 font-extrabold">{receipt?.numPeople || 1} splitters total</span>
        </div>
        <div className="space-y-2.5">
          {receipt?.items.map((item) => {
            const activeClaimers = receipt.claims?.[item.id] || [];
            const isChecked = claimedItems.includes(item.id);

            return (
              <div 
                key={item.id}
                onClick={() => toggleClaim(item.id)}
                className={`blinkist-card rounded-3xl pl-5 py-4.5 pr-14 border-2 transition-all relative flex items-center justify-between select-none cursor-pointer ${
                  isChecked 
                    ? 'border-[#0066fe] bg-[#f5f8fa]' 
                    : 'border-transparent bg-[#f5f8fa]'
                }`}
              >
                {/* Left side: name and active claimers */}
                <div className="flex-grow min-w-0 pr-4 space-y-0.5">
                  <p className="font-extrabold text-[#032b4b] text-base leading-snug break-words">{item.name}</p>
                  
                  {activeClaimers.length > 0 && (
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-extrabold">
                      <Users className="w-3.5 h-3.5 text-slate-400" />
                      <span>{activeClaimers.join(', ')}</span>
                    </div>
                  )}
                </div>

                {/* Right side: price and split share details */}
                <div className="text-right shrink-0">
                  <p className="font-black text-[#032b4b] text-base">
                    ${item.price.toFixed(2)}
                  </p>
                  {activeClaimers.length > 0 && (
                    <p className="text-[10px] text-slate-400 font-bold">
                      ${(item.price / activeClaimers.length).toFixed(2)} each
                    </p>
                  )}
                </div>

                {/* Centered Check Circle indicator on far right */}
                <div className="absolute right-4.5 top-1/2 -translate-y-1/2 flex items-center justify-center">
                  <div className={`w-5.5 h-5.5 rounded-full flex items-center justify-center transition-all ${
                    isChecked 
                      ? 'bg-[#13c178] text-white border-transparent scale-100' 
                      : 'border-2 border-slate-350 text-transparent scale-90'
                  }`}>
                    <Check className="w-3.5 h-3.5 stroke-[3.5]" />
                  </div>
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
