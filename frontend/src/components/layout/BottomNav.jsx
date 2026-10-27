import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  BookOpenCheck, 
  FileSpreadsheet, 
  Users, 
  Menu
} from 'lucide-react';

/**
 * Mobile-First Bottom Navigation Bar
 * 
 * Provides native mobile tab bar ergonomics on smartphones and small screens (< 768px).
 * Complies with iOS Human Interface Guidelines and Android Material Design touch targets,
 * respecting safe-area-inset-bottom for gesture bars and home indicators.
 * Automatically conceals when soft keyboard is active so inputs remain fully visible.
 */
export default function BottomNav({ activeTab, setActiveTab, onOpenMenu, isMenuOpen }) {
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);

  // Auto-hide bottom nav when on-screen keyboard is active
  useEffect(() => {
    const handleFocusIn = (e) => {
      const tag = e.target?.tagName?.toLowerCase();
      if (tag === 'input' || tag === 'textarea' || tag === 'select') {
        setIsKeyboardOpen(true);
      }
    };

    const handleFocusOut = () => {
      setIsKeyboardOpen(false);
    };

    window.addEventListener('focusin', handleFocusIn);
    window.addEventListener('focusout', handleFocusOut);

    // Visual viewport resize detection for Android keyboard
    const handleResize = () => {
      if (window.visualViewport) {
        const isViewportShrunk = window.visualViewport.height < window.innerHeight * 0.75;
        setIsKeyboardOpen(isViewportShrunk);
      }
    };

    window.visualViewport?.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('focusin', handleFocusIn);
      window.removeEventListener('focusout', handleFocusOut);
      window.visualViewport?.removeEventListener('resize', handleResize);
    };
  }, []);

  const tabs = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
    },
    {
      id: 'module-a',
      label: 'IA Marks',
      icon: BookOpenCheck,
    },
    {
      id: 'module-b',
      label: 'University',
      icon: FileSpreadsheet,
    },
    {
      id: 'students',
      label: 'Students',
      icon: Users,
    },
  ];

  if (isKeyboardOpen) {
    return null;
  }

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur-xl border-t border-slate-800/90 shadow-2xl transition-all"
      style={{
        paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 6px)',
        paddingLeft: 'max(env(safe-area-inset-left, 0px), 8px)',
        paddingRight: 'max(env(safe-area-inset-right, 0px), 8px)',
      }}
      aria-label="Mobile Bottom Navigation"
    >
      <div className="flex items-center justify-around px-2 pt-1.5 pb-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id && !isMenuOpen;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex flex-col items-center justify-center py-1.5 px-1 rounded-xl text-center transition-all cursor-pointer select-none active:scale-95 ${
                isActive
                  ? 'text-indigo-400 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              style={{ minHeight: '44px', minWidth: '44px' }}
              aria-current={isActive ? 'page' : undefined}
            >
              <div className="relative">
                <Icon className={`h-5 w-5 transition-transform ${isActive ? 'scale-110 text-indigo-400' : 'text-slate-400'}`} />
                {isActive && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-indigo-500 shadow-sm shadow-indigo-500"></span>
                )}
              </div>
              <span className={`text-[10px] mt-1 tracking-tight truncate max-w-[64px] ${isActive ? 'text-indigo-300' : 'text-slate-400'}`}>
                {tab.label}
              </span>
            </button>
          );
        })}

        {/* More / Menu Drawer Toggle */}
        <button
          onClick={onOpenMenu}
          className={`flex-1 flex flex-col items-center justify-center py-1.5 px-1 rounded-xl text-center transition-all cursor-pointer select-none active:scale-95 ${
            isMenuOpen
              ? 'text-cyan-400 font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
          style={{ minHeight: '44px', minWidth: '44px' }}
          aria-label="Open More Options & Drawer Navigation"
        >
          <div className="relative">
            <Menu className={`h-5 w-5 transition-transform ${isMenuOpen ? 'scale-110 text-cyan-400' : 'text-slate-400'}`} />
            {isMenuOpen && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-sm shadow-cyan-400"></span>
            )}
          </div>
          <span className={`text-[10px] mt-1 tracking-tight ${isMenuOpen ? 'text-cyan-300' : 'text-slate-400'}`}>
            More
          </span>
        </button>
      </div>
    </nav>
  );
}

