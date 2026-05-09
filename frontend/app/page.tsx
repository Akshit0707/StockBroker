'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import useAuthStore from '@/src/store/authStore';

const features = [
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
        <polyline points="16 7 22 7 22 13" />
      </svg>
    ),
    title: 'Live market data',
    desc: 'Real-time price feeds across thousands of stocks and indices.',
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="3" width="20" height="14" rx="2" />
        <line x1="8" y1="21" x2="16" y2="21" />
        <line x1="12" y1="17" x2="12" y2="21" />
      </svg>
    ),
    title: 'Paper trading',
    desc: 'Practice with virtual funds — no real money, full market experience.',
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 20V10" /><path d="M18 20V4" /><path d="M6 20v-4" />
      </svg>
    ),
    title: 'Portfolio analytics',
    desc: 'Track P&L, holdings, and performance metrics at a glance.',
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    ),
    title: 'Order history',
    desc: 'Full audit trail of every trade — buy, sell, timestamps, prices.',
  },
];

const stats = [
  { value: '₹10L', label: 'Starting balance' },
  { value: '0%', label: 'Commission' },
  { value: 'Live', label: 'Market data' },
  { value: 'Free', label: 'Forever' },
];

const WelcomePage: React.FC = () => {
  const { user, isLoading, initialize } = useAuthStore();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    initialize();
    setMounted(true);
  }, [initialize]);

  useEffect(() => {
    if (!isLoading && user) router.push('/dashboard');
  }, [isLoading, user, router]);

  if (!mounted || isLoading) return null;

  return (
    <div style={s.page}>
      <style>{css}</style>

      {/* ── Background decoration ── */}
      <div style={s.gridBg} aria-hidden="true" />
      <div style={s.orbTop} aria-hidden="true" />
      <div style={s.orbBottom} aria-hidden="true" />

      {/* ── Nav ── */}
      <nav style={s.nav}>
        <div style={s.navInner}>
          <div style={s.brand}>
            <div style={s.brandIcon}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
                <polyline points="16 7 22 7 22 13" />
              </svg>
            </div>
            <span style={s.brandName}>TraderSuite</span>
          </div>
          <div style={s.navLinks}>
            <Link href="/auth/login" style={s.navLinkOutline} className="nav-btn-outline">
              Sign in
            </Link>
            <Link href="/auth/register" style={s.navLinkFill} className="nav-btn-fill">
              Get started
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section style={s.hero}>
        <div style={s.heroBadge} className="animate-in-1">
          <span style={s.heroBadgeDot} />
          Paper trading simulator · No real money
        </div>

        <h1 style={s.heroTitle} className="animate-in-2">
          Trade smarter.<br />
          <span style={s.heroAccent}>Risk nothing.</span>
        </h1>

        <p style={s.heroSub} className="animate-in-3">
          Master the markets with ₹10 lakh in virtual funds. Real prices,
          real order flow — zero financial risk.
        </p>

        <div style={s.heroCtas} className="animate-in-4">
          <Link href="/auth/register" style={s.ctaPrimary} className="cta-primary">
            Start trading free
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
            </svg>
          </Link>
          <Link href="/auth/login" style={s.ctaSecondary} className="cta-secondary">
            Sign in
          </Link>
        </div>

        {/* Stats strip */}
        <div style={s.statsRow} className="animate-in-4">
          {stats.map((st) => (
            <div key={st.label} style={s.statItem}>
              <div style={s.statValue}>{st.value}</div>
              <div style={s.statLabel}>{st.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ── */}
      <section style={s.features}>
        <div style={s.sectionLabel}>What you get</div>
        <h2 style={s.sectionTitle}>Everything a trader needs</h2>
        <div style={s.featureGrid}>
          {features.map((f) => (
            <div key={f.title} style={s.featureCard} className="feature-card">
              <div style={s.featureIconWrap}>{f.icon}</div>
              <div style={s.featureTitle}>{f.title}</div>
              <div style={s.featureDesc}>{f.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA banner ── */}
      <section style={s.cta}>
        <div style={s.ctaBanner}>
          <div style={s.ctaBannerGrid} aria-hidden="true" />
          <h2 style={s.ctaBannerTitle}>Ready to start?</h2>
          <p style={s.ctaBannerSub}>
            Create your free account and get ₹10,00,000 in paper money instantly.
          </p>
          <Link href="/auth/register" style={s.ctaBannerBtn} className="cta-primary">
            Create free account
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
            </svg>
          </Link>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer style={s.footer}>
        <div style={s.footerInner}>
          <div style={s.brand}>
            <div style={s.brandIcon}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
                <polyline points="16 7 22 7 22 13" />
              </svg>
            </div>
            <span style={{ ...s.brandName, fontSize: 15 }}>TraderSuite</span>
          </div>
          <div style={s.footerNote}>
            Paper trading only · No real funds · For educational use
          </div>
        </div>
      </footer>
    </div>
  );
};

const css = `
  @keyframes fade-up {
    from { opacity: 0; transform: translateY(20px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes orb-pulse {
    0%,100% { transform: scale(1); opacity: 0.4; }
    50%      { transform: scale(1.07); opacity: 0.55; }
  }
  .animate-in-1 { animation: fade-up 0.5s 0.05s cubic-bezier(.22,1,.36,1) both; }
  .animate-in-2 { animation: fade-up 0.55s 0.15s cubic-bezier(.22,1,.36,1) both; }
  .animate-in-3 { animation: fade-up 0.55s 0.25s cubic-bezier(.22,1,.36,1) both; }
  .animate-in-4 { animation: fade-up 0.55s 0.35s cubic-bezier(.22,1,.36,1) both; }
  .feature-card:hover {
    border-color: #6366f1 !important;
    box-shadow: 0 0 0 1px rgba(99,102,241,0.2), 0 8px 32px rgba(0,0,0,0.4) !important;
    transform: translateY(-2px);
  }
  .cta-primary:hover {
    background: #818cf8 !important;
    transform: translateY(-1px);
    box-shadow: 0 0 28px rgba(99,102,241,0.5) !important;
  }
  .cta-secondary:hover {
    background: rgba(99,102,241,0.08) !important;
    border-color: #6366f1 !important;
  }
  .nav-btn-outline:hover {
    background: rgba(255,255,255,0.06) !important;
  }
  .nav-btn-fill:hover {
    background: #818cf8 !important;
  }
`;

const s: Record<string, React.CSSProperties> = {
  page: {
    minHeight: '100vh',
    background: 'var(--bg-primary)',
    color: 'var(--text-primary)',
    fontFamily: 'var(--font-body)',
    position: 'relative',
    overflowX: 'hidden',
  },
  gridBg: {
    position: 'fixed',
    inset: 0,
    backgroundImage: `
      linear-gradient(rgba(99,102,241,0.035) 1px, transparent 1px),
      linear-gradient(90deg, rgba(99,102,241,0.035) 1px, transparent 1px)
    `,
    backgroundSize: '52px 52px',
    pointerEvents: 'none',
    zIndex: 0,
  },
  orbTop: {
    position: 'fixed',
    top: '-12%',
    right: '-6%',
    width: 560,
    height: 560,
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(99,102,241,0.18) 0%, transparent 68%)',
    animation: 'orb-pulse 7s ease-in-out infinite',
    pointerEvents: 'none',
    zIndex: 0,
  },
  orbBottom: {
    position: 'fixed',
    bottom: '-14%',
    left: '-6%',
    width: 480,
    height: 480,
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)',
    animation: 'orb-pulse 9s ease-in-out infinite reverse',
    pointerEvents: 'none',
    zIndex: 0,
  },

  /* Nav */
  nav: {
    position: 'sticky',
    top: 0,
    zIndex: 50,
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    background: 'rgba(10,14,26,0.8)',
    borderBottom: '1px solid var(--border-color)',
  },
  navInner: {
    maxWidth: 1100,
    margin: '0 auto',
    padding: '0 24px',
    height: 60,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  brand: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
  },
  brandIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    background: '#6366f1',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  brandName: {
    fontFamily: 'var(--font-display)',
    fontSize: 17,
    fontWeight: 800,
    color: 'var(--text-primary)',
    letterSpacing: '-0.02em',
    textDecoration: 'none',
  },
  navLinks: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
  },
  navLinkOutline: {
    padding: '8px 16px',
    borderRadius: 8,
    border: '1px solid var(--border-color)',
    color: 'var(--text-secondary)',
    fontSize: 14,
    fontWeight: 500,
    textDecoration: 'none',
    transition: 'background 0.18s',
  },
  navLinkFill: {
    padding: '8px 16px',
    borderRadius: 8,
    background: '#6366f1',
    color: '#fff',
    fontSize: 14,
    fontWeight: 600,
    textDecoration: 'none',
    transition: 'background 0.18s, transform 0.18s',
  },

  /* Hero */
  hero: {
    position: 'relative',
    zIndex: 1,
    maxWidth: 760,
    margin: '0 auto',
    padding: '96px 24px 80px',
    textAlign: 'center',
  },
  heroBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    padding: '6px 16px',
    borderRadius: 999,
    border: '1px solid rgba(99,102,241,0.35)',
    background: 'rgba(99,102,241,0.08)',
    color: '#818cf8',
    fontSize: 13,
    fontWeight: 500,
    marginBottom: 28,
  },
  heroBadgeDot: {
    width: 7,
    height: 7,
    borderRadius: '50%',
    background: '#10b981',
    flexShrink: 0,
  },
  heroTitle: {
    fontFamily: 'var(--font-display)',
    fontSize: 'clamp(40px, 7vw, 72px)',
    fontWeight: 800,
    lineHeight: 1.08,
    letterSpacing: '-0.04em',
    color: 'var(--text-primary)',
    margin: '0 0 24px',
  },
  heroAccent: {
    color: '#6366f1',
  },
  heroSub: {
    fontSize: 18,
    lineHeight: 1.65,
    color: 'var(--text-secondary)',
    maxWidth: 520,
    margin: '0 auto 36px',
  },
  heroCtas: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    flexWrap: 'wrap',
    marginBottom: 52,
  },
  ctaPrimary: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    padding: '14px 28px',
    background: '#6366f1',
    color: '#fff',
    borderRadius: 10,
    fontSize: 15,
    fontWeight: 600,
    textDecoration: 'none',
    transition: 'background 0.18s, transform 0.18s, box-shadow 0.18s',
    fontFamily: 'var(--font-body)',
  },
  ctaSecondary: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '14px 28px',
    background: 'transparent',
    border: '1px solid var(--border-color)',
    color: 'var(--text-secondary)',
    borderRadius: 10,
    fontSize: 15,
    fontWeight: 500,
    textDecoration: 'none',
    transition: 'background 0.18s, border-color 0.18s',
  },

  /* Stats */
  statsRow: {
    display: 'flex',
    justifyContent: 'center',
    gap: 0,
    borderTop: '1px solid var(--border-color)',
    borderRadius: 14,
    overflow: 'hidden',
    border: '1px solid var(--border-color)',
    background: 'var(--bg-secondary)',
  },
  statItem: {
    flex: 1,
    padding: '20px 16px',
    textAlign: 'center',
    borderRight: '1px solid var(--border-color)',
  },
  statValue: {
    fontFamily: 'var(--font-display)',
    fontSize: 22,
    fontWeight: 800,
    color: '#6366f1',
    letterSpacing: '-0.02em',
  },
  statLabel: {
    fontSize: 12,
    color: 'var(--text-muted)',
    marginTop: 4,
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
  },

  /* Features */
  features: {
    position: 'relative',
    zIndex: 1,
    maxWidth: 1100,
    margin: '0 auto',
    padding: '0 24px 100px',
    textAlign: 'center',
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: 600,
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    color: '#6366f1',
    marginBottom: 12,
  },
  sectionTitle: {
    fontFamily: 'var(--font-display)',
    fontSize: 'clamp(26px, 4vw, 38px)',
    fontWeight: 800,
    letterSpacing: '-0.03em',
    color: 'var(--text-primary)',
    marginBottom: 48,
  },
  featureGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))',
    gap: 16,
    textAlign: 'left',
  },
  featureCard: {
    background: 'var(--bg-secondary)',
    border: '1px solid var(--border-color)',
    borderRadius: 14,
    padding: '24px',
    transition: 'border-color 0.2s, box-shadow 0.2s, transform 0.2s',
  },
  featureIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 10,
    background: 'rgba(99,102,241,0.1)',
    border: '1px solid rgba(99,102,241,0.2)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#818cf8',
    marginBottom: 16,
  },
  featureTitle: {
    fontFamily: 'var(--font-display)',
    fontSize: 16,
    fontWeight: 700,
    color: 'var(--text-primary)',
    marginBottom: 8,
  },
  featureDesc: {
    fontSize: 14,
    lineHeight: 1.6,
    color: 'var(--text-secondary)',
  },

  /* CTA banner */
  cta: {
    position: 'relative',
    zIndex: 1,
    maxWidth: 1100,
    margin: '0 auto',
    padding: '0 24px 100px',
  },
  ctaBanner: {
    position: 'relative',
    background: 'var(--bg-secondary)',
    border: '1px solid rgba(99,102,241,0.3)',
    borderRadius: 20,
    padding: '64px 32px',
    textAlign: 'center',
    overflow: 'hidden',
  },
  ctaBannerGrid: {
    position: 'absolute',
    inset: 0,
    backgroundImage: `
      linear-gradient(rgba(99,102,241,0.06) 1px, transparent 1px),
      linear-gradient(90deg, rgba(99,102,241,0.06) 1px, transparent 1px)
    `,
    backgroundSize: '36px 36px',
    pointerEvents: 'none',
  },
  ctaBannerTitle: {
    position: 'relative',
    fontFamily: 'var(--font-display)',
    fontSize: 'clamp(28px, 4vw, 42px)',
    fontWeight: 800,
    letterSpacing: '-0.03em',
    color: 'var(--text-primary)',
    marginBottom: 16,
  },
  ctaBannerSub: {
    position: 'relative',
    fontSize: 16,
    color: 'var(--text-secondary)',
    marginBottom: 32,
    maxWidth: 440,
    margin: '0 auto 32px',
    lineHeight: 1.6,
  },
  ctaBannerBtn: {
    position: 'relative',
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    padding: '14px 32px',
    background: '#6366f1',
    color: '#fff',
    borderRadius: 10,
    fontSize: 15,
    fontWeight: 600,
    textDecoration: 'none',
    transition: 'background 0.18s, transform 0.18s, box-shadow 0.18s',
  },

  /* Footer */
  footer: {
    position: 'relative',
    zIndex: 1,
    borderTop: '1px solid var(--border-color)',
    padding: '24px 24px',
  },
  footerInner: {
    maxWidth: 1100,
    margin: '0 auto',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 12,
  },
  footerNote: {
    fontSize: 13,
    color: 'var(--text-muted)',
  },
};

export default WelcomePage;