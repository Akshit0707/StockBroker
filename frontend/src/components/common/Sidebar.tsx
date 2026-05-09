'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import useAuthStore from '@/src/store/authStore';
import { portfolioApi } from '@/src/services/api';
import { formatCurrency } from '@/src/utils';

const Icon = ({ d, size = 18 }: { d: string; size?: number }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    width={size}
    height={size}
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d={d} />
  </svg>
);

const navItems = [
  {
    path: '/dashboard',
    name: 'Dashboard',
    icon: (
      <Icon
        d="M5 4h4a1 1 0 0 1 1 1v6a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1m0 12h4a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-2a1 1 0 0 1 1-1m10-4h4a1 1 0 0 1 1 1v6a1 1 0 0 1-1 1h-4a1 1 0 0 1-1-1v-6a1 1 0 0 1 1-1m0-8h4a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1h-4a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1"
        size={16}
      />
    ),
  },
  {
    path: '/trading',
    name: 'Trading',
    icon: <Icon d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" size={16} />,
  },
  {
    path: '/orders',
    name: 'Orders',
    icon: (
      <Icon
        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
        size={16}
      />
    ),
  },
  {
    path: '/portfolio',
    name: 'Portfolio',
    icon: (
      <Icon
        d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"
        size={16}
      />
    ),
  },
  {
    path: '/trades',
    name: 'Trades',
    icon: <Icon d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" size={16} />,
  },
];

interface SidebarProps {
  isDarkMode: boolean;
  onThemeToggle: () => void;
}

const SIDEBAR_WIDTH = 260;

const Sidebar: React.FC<SidebarProps> = ({ isDarkMode, onThemeToggle }) => {
  const { user, logout } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  const [cashBalance, setCashBalance] = useState<number | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const loadBalance = async () => {
      try {
        const response = await portfolioApi.getPortfolio();
        const raw = response?.data?.data ?? response?.data;
        const balance = Number(raw?.cashBalance ?? raw?.cash_balance ?? 0);
        setCashBalance(balance);
      } catch {
        setCashBalance(null);
      }
    };
    if (user) loadBalance();
  }, [user]);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const handleLogout = () => {
    logout();
    router.push('/auth/login');
  };

  const SidebarContent = () => (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '20px 0' }}>
      <div style={{ padding: '0 20px 24px', borderBottom: '1px solid var(--border-color)' }}>
        <div
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 22,
            fontWeight: 800,
            color: 'var(--accent-primary)',
            letterSpacing: '-0.02em',
          }}
        >
          TraderSuite
        </div>
        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
          Paper Trading Simulator
        </div>
      </div>

      {user && (
        <div
          style={{
            margin: '16px',
            padding: '16px',
            background: 'var(--bg-tertiary)',
            borderRadius: 10,
            border: '1px solid var(--border-subtle)',
          }}
        >
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>
            AVAILABLE BALANCE
          </div>
          <div style={{ fontSize: 18, fontWeight: 600, color: 'var(--accent-primary)' }}>
            {formatCurrency(cashBalance ?? user.balance ?? 0)}
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>
            {user.firstName} {user.lastName}
          </div>
        </div>
      )}

      <nav style={{ flex: 1, padding: '8px 12px' }}>
        {navItems.map((item) => {
          const isActive = pathname === item.path;
          return (
            <Link
              key={item.path}
              href={item.path}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '10px 12px',
                borderRadius: 8,
                marginBottom: 2,
                textDecoration: 'none',
                fontSize: 14,
                fontWeight: isActive ? 600 : 400,
                color: isActive ? 'var(--accent-primary)' : 'var(--text-secondary)',
                background: isActive ? 'var(--accent-glow)' : 'transparent',
                transition: 'var(--transition)',
              }}
            >
              {item.icon}
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div
        style={{
          padding: '16px',
          borderTop: '1px solid var(--border-color)',
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
        }}
      >
        <button
          onClick={onThemeToggle}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '10px 12px',
            borderRadius: 8,
            border: 'none',
            background: 'transparent',
            color: 'var(--text-secondary)',
            cursor: 'pointer',
            fontSize: 14,
            fontFamily: 'var(--font-body)',
            width: '100%',
            textAlign: 'left',
          }}
        >
          {isDarkMode ? '☀️ Light Mode' : '🌙 Dark Mode'}
        </button>

        <button
          onClick={handleLogout}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '10px 12px',
            borderRadius: 8,
            border: '1px solid var(--border-color)',
            background: 'transparent',
            color: 'var(--color-loss)',
            cursor: 'pointer',
            fontSize: 14,
            fontFamily: 'var(--font-body)',
            width: '100%',
            textAlign: 'left',
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            width="16"
            height="16"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5m0 0l-5-5m5 5H9" />
          </svg>
          Logout
        </button>
      </div>
    </div>
  );

  return (
    <>
      <style>{`
        /* ── Desktop: sidebar always visible ── */
        .sidebar-desktop {
          position: fixed;
          top: 0;
          left: 0;
          width: ${SIDEBAR_WIDTH}px;
          height: 100vh;
          background: var(--bg-secondary);
          border-right: 1px solid var(--border-color);
          overflow-y: auto;
          overflow-x: hidden;
          z-index: 100;
          flex-shrink: 0;
        }

        /* Hamburger hidden on desktop */
        .sidebar-hamburger {
          display: none;
        }

        /* Mobile overlay hidden on desktop */
        .sidebar-mobile-overlay {
          display: none;
        }

        @media (max-width: 768px) {
          /* Hide desktop sidebar on mobile */
          .sidebar-desktop {
            display: none;
          }

          /* Show hamburger on mobile — fixed top-left, no overlap with content */
          .sidebar-hamburger {
            display: flex;
            align-items: center;
            justify-content: center;
            position: fixed;
            top: 14px;
            left: 14px;
            z-index: 200;
            padding: 8px;
            background: var(--bg-secondary);
            border: 1px solid var(--border-color);
            border-radius: 8px;
            cursor: pointer;
            box-shadow: 0 2px 8px rgba(0,0,0,0.12);
          }

          /* Mobile overlay drawer */
          .sidebar-mobile-overlay {
            display: flex;
            position: fixed;
            inset: 0;
            z-index: 999;
          }
        }
      `}</style>

      <aside className="sidebar-desktop">
        <SidebarContent />
      </aside>

      <button
        className="sidebar-hamburger"
        onClick={() => setMobileOpen(true)}
        aria-label="Open navigation menu"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          width="20"
          height="20"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <line x1="3" y1="6" x2="21" y2="6" />
          <line x1="3" y1="12" x2="21" y2="12" />
          <line x1="3" y1="18" x2="21" y2="18" />
        </svg>
      </button>

      {mobileOpen && (
        <div className="sidebar-mobile-overlay">
          <div
            onClick={() => setMobileOpen(false)}
            style={{ flex: 1, background: 'rgba(0,0,0,0.55)' }}
          />

          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: SIDEBAR_WIDTH,
              height: '100%',
              background: 'var(--bg-secondary)',
              borderRight: '1px solid var(--border-color)',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'flex-end',
                padding: '12px 12px 0',
              }}
            >
              <button
                onClick={() => setMobileOpen(false)}
                aria-label="Close navigation menu"
                style={{
                  border: 'none',
                  background: 'transparent',
                  cursor: 'pointer',
                  color: 'var(--text-primary)',
                  fontSize: 18,
                  lineHeight: 1,
                  padding: 4,
                }}
              >
                ✕
              </button>
            </div>

            <SidebarContent />
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;