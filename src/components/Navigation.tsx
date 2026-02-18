'use client';

import { useState, useEffect } from 'react';

export type TabId = 'garden' | 'calendar' | 'stats' | 'weather' | 'journal' | 'settings';

interface NavItem {
  id: TabId;
  label: string;
  icon: React.ReactNode;
}

const navItems: NavItem[] = [
  { 
    id: 'garden', 
    label: 'Garden',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 22V8" />
        <path d="M5 12H2a10 10 0 0 0 20 0h-3" />
        <path d="M5 12a5 5 0 0 0 0 10h14a5 5 0 0 0 0-10" />
      </svg>
    )
  },
  { 
    id: 'calendar', 
    label: 'Calendar',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="4" width="18" height="18" rx="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
      </svg>
    )
  },
  { 
    id: 'stats', 
    label: 'Stats',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <line x1="18" y1="20" x2="18" y2="10" />
        <line x1="12" y1="20" x2="12" y2="4" />
        <line x1="6" y1="20" x2="6" y2="14" />
      </svg>
    )
  },
  { 
    id: 'weather', 
    label: 'Weather',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 2v2" />
        <path d="M12 20v2" />
        <path d="m4.93 4.93 1.41 1.41" />
        <path d="m17.66 17.66 1.41 1.41" />
        <path d="M2 12h2" />
        <path d="M20 12h2" />
        <path d="m6.34 17.66-1.41 1.41" />
        <path d="m19.07 4.93-1.41 1.41" />
        <circle cx="12" cy="12" r="4" />
      </svg>
    )
  },
  { 
    id: 'journal', 
    label: 'Journal',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
      </svg>
    )
  },
  { 
    id: 'settings', 
    label: 'Settings',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="3" />
        <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
      </svg>
    )
  },
];

interface BottomNavProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
}

export function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  const [isMobile, setIsMobile] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Check for dark mode
  useEffect(() => {
    const checkDarkMode = () => {
      setDarkMode(document.documentElement.classList.contains('dark'));
    };
    checkDarkMode();
    
    // Listen for class changes on the document
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, { 
      attributes: true, 
      attributeFilter: ['class'] 
    });
    
    return () => observer.disconnect();
  }, []);

  if (!isMobile) return null;

  return (
    <nav 
      className="fixed bottom-0 left-0 right-0 z-50"
      style={{ 
        background: darkMode ? 'rgba(31, 41, 55, 0.98)' : 'rgba(255, 255, 255, 0.98)',
        borderTop: darkMode ? '1px solid #374151' : '1px solid #e5e7eb',
        paddingBottom: "env(safe-area-inset-bottom)"
      }}
    >
      <div className="flex items-center justify-around py-2">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className="flex flex-col items-center justify-center p-2 transition-all duration-200"
              style={{ minWidth: '56px' }}
            >
              <div 
                className={`transition-all duration-200 ${isActive ? 'scale-105' : ''}`}
                style={{
                  padding: '8px',
                  borderRadius: '12px',
                  background: isActive ? 'rgba(34, 197, 94, 0.15)' : 'transparent',
                  color: isActive ? '#16a34a' : (darkMode ? '#9ca3af' : '#6b7280'),
                }}
              >
                {item.icon}
              </div>
              <span 
                className="text-[10px] font-medium mt-1"
                style={{ color: isActive ? '#16a34a' : (darkMode ? '#9ca3af' : '#6b7280') }}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

interface SideNavProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
  darkMode?: boolean;
}

export function SideNav({ activeTab, onTabChange, darkMode = false }: SideNavProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isMobile, setIsMobile] = useState(true);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        setIsExpanded(true);
      }
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  if (isMobile) return null;

  const bgGradient = darkMode 
    ? 'linear-gradient(180deg, #1f2937 0%, #111827 100%)'
    : 'linear-gradient(180deg, #f0fdf4 0%, #dcfce7 100%)';
  const borderColor = darkMode ? '#374151' : '#bbf7d0';
  const hoverBg = darkMode ? 'rgba(55, 65, 81, 0.5)' : 'rgba(34, 197, 94, 0.1)';
  const textColor = darkMode ? '#9ca3af' : '#6b7280';
  const activeColor = '#16a34a';

  return (
    <nav 
      className="fixed left-0 top-0 h-screen z-40 flex flex-col transition-all duration-300"
      style={{ 
        background: bgGradient,
        borderRight: `1px solid ${borderColor}`,
        width: isExpanded ? '200px' : '64px'
      }}
    >
      {/* Toggle */}
      <div 
        className="p-3 flex items-center gap-3 cursor-pointer transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
        style={{ 
          borderBottom: `1px solid ${borderColor}`,
          background: hoverBg
        }}
      >
        <div style={{ color: '#16a34a' }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 22V8" />
            <path d="M5 12H2a10 10 0 0 0 20 0h-3" />
            <path d="M5 12a5 5 0 0 0 0 10h14a5 5 0 0 0 0-10" />
          </svg>
        </div>
        {isExpanded && (
          <span className={`font-bold ${darkMode ? 'text-green-400' : 'text-green-800'}`}>GardenGrid</span>
        )}
      </div>

      {/* Nav Items */}
      <div className="flex-1 py-4">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className="w-full flex items-center gap-3 px-4 py-3 transition-all duration-200"
              style={{
                background: isActive ? 'rgba(34, 197, 94, 0.15)' : 'transparent',
                color: isActive ? activeColor : textColor,
                borderLeft: isActive ? `3px solid ${activeColor}` : '3px solid transparent',
              }}
            >
              <div className="flex-shrink-0">{item.icon}</div>
              {isExpanded && (
                <span className="font-medium">{item.label}</span>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}

export { navItems };
