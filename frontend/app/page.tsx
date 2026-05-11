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
    <div className="welcomePage">
      <div className="welcomeGridBg" aria-hidden="true" />
      <div className="welcomeOrbTop" aria-hidden="true" />
      <div className="welcomeOrbBottom" aria-hidden="true" />

      <nav className="welcomeNav">
        <div className="welcomeNavInner">
          <div className="welcomeBrand">
            <div className="welcomeBrandIcon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
                <polyline points="16 7 22 7 22 13" />
              </svg>
            </div>
            <span className="welcomeBrandName">TraderSuite</span>
          </div>

          <div className="welcomeNavLinks">
            <Link href="/auth/login" className="welcomeNavLinkOutline">
              Sign in
            </Link>
            <Link href="/auth/register" className="welcomeNavLinkFill">
              Get started
            </Link>
          </div>
        </div>
      </nav>

      <section className="welcomeHero">
        <div className="welcomeHeroBadge">
          <span className="welcomeHeroBadgeDot" />
          Paper trading simulator · No real money
        </div>

        <h1 className="welcomeHeroTitle">
          Trade smarter.<br />
          <span className="welcomeHeroAccent">Risk nothing.</span>
        </h1>

        <p className="welcomeHeroSub">
          Master the markets with ₹10 lakh in virtual funds. Real prices,
          real order flow — zero financial risk.
        </p>

        <div className="welcomeHeroCtas">
          <Link href="/auth/register" className="welcomeCtaPrimary">
            Start trading free
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
            </svg>
          </Link>
          <Link href="/auth/login" className="welcomeCtaSecondary">
            Sign in
          </Link>
        </div>

        <div className="welcomeStatsRow">
          {stats.map((st) => (
            <div key={st.label} className="welcomeStatItem">
              <div className="welcomeStatValue">{st.value}</div>
              <div className="welcomeStatLabel">{st.label}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="welcomeFeatures">
        <div className="welcomeSectionLabel">What you get</div>
        <h2 className="welcomeSectionTitle">Everything a trader needs</h2>

        <div className="welcomeFeatureGrid">
          {features.map((f) => (
            <div key={f.title} className="welcomeFeatureCard">
              <div className="welcomeFeatureIconWrap">{f.icon}</div>
              <div className="welcomeFeatureTitle">{f.title}</div>
              <div className="welcomeFeatureDesc">{f.desc}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="welcomeCtaSection">
        <div className="welcomeCtaBanner">
          <div className="welcomeCtaBannerGrid" aria-hidden="true" />
          <h2 className="welcomeCtaBannerTitle">Ready to start?</h2>
          <p className="welcomeCtaBannerSub">
            Create your free account and get ₹10,00,000 in paper money instantly.
          </p>
          <Link href="/auth/register" className="welcomeCtaBannerBtn">
            Create free account
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
            </svg>
          </Link>
        </div>
      </section>

      <footer className="welcomeFooter">
        <div className="welcomeFooterInner">
          <div className="welcomeBrand">
            <div className="welcomeBrandIcon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
                <polyline points="16 7 22 7 22 13" />
              </svg>
            </div>
            <span className="welcomeBrandName welcomeBrandNameSmall">TraderSuite</span>
          </div>
          <div className="welcomeFooterNote">
            Paper trading only · No real funds · For educational use
          </div>
        </div>
      </footer>
    </div>
  );
};

export default WelcomePage;