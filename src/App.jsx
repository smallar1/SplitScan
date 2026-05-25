import React, { useState, useEffect } from 'react';
import HostView from './views/HostView';
import FriendView from './views/FriendView';

export default function App() {
  const [route, setRoute] = useState({
    view: 'host',
    sessionId: null
  });

  useEffect(() => {
    const handleRouting = () => {
      const path = window.location.pathname;
      const match = path.match(/^\/split\/([^/]+)$/);
      if (match) {
        setRoute({ view: 'friend', sessionId: match[1] });
      } else {
        setRoute({ view: 'host', sessionId: null });
      }
    };

    handleRouting();
    
    // Listen for client-side navigation events (back/forward buttons)
    window.addEventListener('popstate', handleRouting);
    return () => window.removeEventListener('popstate', handleRouting);
  }, []);

  // Utility helper to navigate client-side without full-page reloads
  const navigateTo = (url) => {
    window.history.pushState({}, '', url);
    window.dispatchEvent(new Event('popstate'));
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col antialiased">
      {/* Top Banner Header */}
      <header className="bg-white border-b border-slate-100 py-3 sticky top-0 z-40">
        <div className="max-w-md mx-auto px-4 flex items-center justify-between">
          <button 
            onClick={() => navigateTo('/')} 
            className="text-lg font-black tracking-tight text-slate-800 focus:outline-none flex items-center gap-1 cursor-pointer"
          >
            <span className="text-indigo-600 font-extrabold font-serif">⚡</span>
            <span>ScanSplit</span>
          </button>
          <div className="flex items-center gap-2">
            <span className="text-xs px-2.5 py-1 bg-indigo-50 text-indigo-600 font-bold rounded-full">
              MVP Boilerplate
            </span>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-grow flex items-start justify-center pb-12">
        {route.view === 'friend' ? (
          <FriendView sessionId={route.sessionId} />
        ) : (
          <HostView />
        )}
      </main>
    </div>
  );
}
