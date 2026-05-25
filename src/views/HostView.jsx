import React, { useState, useRef } from 'react';
import { Camera, Users, Receipt, ArrowRight, Sparkles, Loader2 } from 'lucide-react';
import Tesseract from 'tesseract.js';
import ReceiptReview from '../components/ReceiptReview';
import { parseReceiptText } from '../utils/ocrParser';

export default function HostView() {
  const [participantCount, setParticipantCount] = useState(2);
  const [isProcessing, setIsProcessing] = useState(false);
  const [ocrProgress, setOcrProgress] = useState(0);
  const [ocrResult, setOcrResult] = useState(null);
  const [generatedSessionId, setGeneratedSessionId] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef(null);

  const handleDemoMock = () => {
    setIsProcessing(true);
    setOcrProgress(0);
    setGeneratedSessionId(null);
    setCopied(false);
    const interval = setInterval(() => {
      setOcrProgress(prev => {
        if (prev >= 90) {
          clearInterval(interval);
          return 90;
        }
        return prev + 30;
      });
    }, 300);

    setTimeout(() => {
      clearInterval(interval);
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
      setOcrProgress(100);
    }, 1500);
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    setOcrProgress(0);
    setGeneratedSessionId(null);
    setCopied(false);

    Tesseract.recognize(
      file,
      'eng',
      {
        logger: (m) => {
          if (m.status === 'recognizing text') {
            setOcrProgress(Math.round(m.progress * 100));
          }
        }
      }
    )
      .then(({ data: { text } }) => {
        const parsed = parseReceiptText(text);
        
        if (parsed.items.length === 0) {
          parsed.items.push({
            id: `item-${Date.now()}`,
            name: 'Scanned Item (Edit Me)',
            price: 0.00
          });
        }
        
        setOcrResult(parsed);
        setIsProcessing(false);
      })
      .catch((err) => {
        console.error('OCR Error:', err);
        alert('Failed to read receipt. Please enter details manually.');
        setOcrResult({
          items: [{ id: `item-${Date.now()}`, name: 'Item 1', price: 0.00 }],
          tax: 0.00,
          tip: 0.00
        });
        setIsProcessing(false);
      });
  };

  const triggerFileSelect = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
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

  const handleCreateSession = () => {
    if (!ocrResult || isGenerating) return;
    
    setIsGenerating(true);

    fetch('/api/receipt', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        items: ocrResult.items,
        tax: ocrResult.tax,
        tip: ocrResult.tip,
        numPeople: participantCount
      })
    })
      .then(res => res.json())
      .then(data => {
        setIsGenerating(false);
        if (data.success) {
          setGeneratedSessionId(data.sessionId);
        } else {
          alert('Failed to generate split session: ' + data.error);
        }
      })
      .catch(err => {
        setIsGenerating(false);
        console.error('API Error:', err);
        alert('Server connection error. Failed to save session.');
      });
  };

  const getShareUrl = () => {
    return `${window.location.origin}/split/${generatedSessionId}`;
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(getShareUrl())
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(err => {
        console.error('Clipboard copy error:', err);
      });
  };

  const handleReset = () => {
    setOcrResult(null);
    setGeneratedSessionId(null);
    setParticipantCount(2);
  };

  // Render sharing success state
  if (generatedSessionId) {
    const shareUrl = getShareUrl();

    return (
      <div className="w-full max-w-md mx-auto px-5 py-8 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
        <div className="bg-white rounded-3xl p-6 border border-[#eef2f5] text-center space-y-6">
          <div className="mx-auto w-16 h-16 bg-[#13c178]/10 rounded-2xl flex items-center justify-center text-2xl font-bold animate-bounce">
            🎉
          </div>
          <div className="space-y-1.5">
            <h2 className="text-2xl font-black text-[#032b4b]">Split Created!</h2>
            <p className="text-sm font-semibold text-slate-400">Your friends can now join and claim their items.</p>
          </div>

          {/* Share Box */}
          <div className="bg-[#f5f8fa] border border-[#eef2f5] rounded-2xl p-4 text-left space-y-3">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Share Link</label>
            <div className="flex items-center space-x-2 bg-white border border-[#eef2f5] rounded-xl px-3 py-2.5">
              <input 
                type="text" 
                readOnly 
                value={shareUrl}
                className="w-full bg-transparent border-none outline-none font-bold text-[#032b4b] text-xs truncate"
              />
            </div>
            <button 
              onClick={handleCopyLink}
              className={`w-full py-3.5 px-4 rounded-xl text-sm font-black transition-all cursor-pointer flex items-center justify-center ${
                copied 
                  ? 'bg-[#13c178] text-white shadow-md shadow-[#13c178]/10' 
                  : 'bg-[#0066fe] hover:bg-[#0052cc] text-white shadow-md shadow-[#0066fe]/15'
              }`}
            >
              {copied ? 'Copied to Clipboard!' : 'Copy Link'}
            </button>
          </div>

          {/* Quick actions */}
          <div className="pt-2 flex flex-col space-y-2.5">
            <a 
              href={shareUrl}
              className="w-full py-4 bg-[#032b4b] hover:bg-[#0b2c4d] text-white rounded-2xl font-extrabold text-sm transition-all shadow-md flex items-center justify-center gap-1.5"
            >
              Join Split as Participant
              <ArrowRight className="w-4 h-4" />
            </a>
            <button 
              onClick={handleReset}
              className="w-full py-3 bg-white border border-[#eef2f5] text-slate-500 hover:bg-slate-50 rounded-2xl font-bold text-sm transition-all cursor-pointer"
            >
              Scan Another Receipt
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto px-5 py-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-1.5">
        <h1 className="text-3xl font-black tracking-tight text-[#032b4b]">Scan & Split</h1>
        <p className="text-sm font-semibold text-slate-400">Snap a photo of the receipt, share the link, split the bill.</p>
      </div>

      {/* Main Actions */}
      <div className="bg-white rounded-3xl p-6 border border-[#eef2f5] space-y-6">
        {/* Upload Box */}
        <div className="space-y-2">
          <label className="text-xs font-black text-slate-400 uppercase tracking-wider block pl-1">Step 1: Upload Receipt</label>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            accept="image/*" 
            className="hidden" 
          />
          <div 
            onClick={triggerFileSelect}
            className={`border border-[#eef2f5] rounded-3xl p-8 transition-all duration-200 text-center cursor-pointer group bg-[#f5f8fa] hover:bg-[#eef2f5] ${
              isProcessing ? 'pointer-events-none opacity-80' : ''
            }`}
          >
            {isProcessing ? (
              <div className="flex flex-col items-center space-y-3 py-2">
                <Loader2 className="w-8 h-8 text-[#0066fe] animate-spin" />
                <div className="space-y-1">
                  <p className="text-sm font-black text-[#032b4b]">Analyzing Receipt...</p>
                  <p className="text-xs text-[#0066fe] font-black">{ocrProgress}% complete</p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center space-y-3">
                <div className="p-4 bg-white rounded-2xl shadow-sm text-slate-400 group-hover:text-[#0066fe] transition-colors">
                  <Camera className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-extrabold text-[#032b4b]">Take a photo or upload image</p>
                  <p className="text-xs text-slate-400 font-semibold">Supports JPG, PNG (Max 5MB)</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Demo Shortcut */}
        <button 
          onClick={handleDemoMock}
          disabled={isProcessing}
          className="w-full py-3.5 px-4 bg-[#0066fe]/5 text-[#0066fe] hover:bg-[#0066fe]/10 rounded-2xl text-sm font-black transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <Sparkles className="w-4 h-4 text-[#0066fe]" />
          {isProcessing ? 'Simulating OCR...' : 'Try Demo with Mock Receipt'}
        </button>

        {/* Split Count */}
        <div className="space-y-3 pt-2 border-t border-[#eef2f5]">
          <label htmlFor="num-people" className="text-xs font-black text-slate-400 uppercase tracking-wider flex items-center gap-1.5 pl-1">
            <Users className="w-4 h-4 text-slate-400" />
            Step 2: Number of People Splitters
          </label>
          <div className="flex items-center justify-between bg-[#f5f8fa] p-2 rounded-2xl border border-[#eef2f5]">
            <button 
              type="button"
              onClick={() => setParticipantCount(Math.max(1, participantCount - 1))}
              className="w-10 h-10 flex items-center justify-center bg-white hover:bg-slate-100 rounded-xl font-black text-[#032b4b] shadow-sm transition-all cursor-pointer"
            >
              -
            </button>
            <span className="text-md font-extrabold text-[#032b4b]">{participantCount}</span>
            <button 
              type="button"
              onClick={() => setParticipantCount(participantCount + 1)}
              className="w-10 h-10 flex items-center justify-center bg-white hover:bg-slate-100 rounded-xl font-black text-[#032b4b] shadow-sm transition-all cursor-pointer"
            >
              +
            </button>
          </div>
        </div>
      </div>

      {/* Review Section */}
      {ocrResult && (
        <div className="bg-white rounded-3xl p-6 border border-[#eef2f5] space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="flex items-center gap-2 pb-2 border-b border-[#eef2f5]">
            <Sparkles className="w-5 h-5 text-[#13c178]" />
            <h3 className="text-md font-black text-[#032b4b]">Verify Receipt Items</h3>
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

          <div className="pt-2 border-t border-[#eef2f5] flex justify-between items-center text-sm font-black text-[#032b4b]">
            <span>Grand Total</span>
            <span className="text-lg text-[#0066fe]">${calculateTotal().toFixed(2)}</span>
          </div>

          <button 
            onClick={handleCreateSession}
            disabled={isGenerating}
            className="w-full py-4 px-4 bg-[#0066fe] hover:bg-[#0052cc] text-white rounded-2xl font-extrabold transition-all shadow-lg shadow-[#0066fe]/20 flex items-center justify-center gap-2 group cursor-pointer disabled:opacity-50"
          >
            {isGenerating ? 'Generating Link...' : 'Create Session & Share'}
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      )}
    </div>
  );
}
