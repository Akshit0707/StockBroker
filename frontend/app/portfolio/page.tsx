'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { portfolioApi } from '@/src/services/api';
import { PortfolioData } from '@/src/types/portfolio';
import { PortfolioSummary } from '@/src/components/portfolio/PortfolioSummary';
import { HoldingsTable } from '@/src/components/portfolio/HoldingsTable';

const normalizePortfolio = (raw: any): PortfolioData => {
  const holdingsRaw = raw?.holdings ?? raw?.data?.holdings ?? [];
  return {
    cashBalance: Number(raw?.cashBalance ?? raw?.cash_balance ?? raw?.balance ?? 0),
    totalValue: Number(raw?.totalValue ?? raw?.total_value ?? 0),
    totalInvested: Number(raw?.totalInvested ?? raw?.total_invested ?? 0),
    totalPL: Number(raw?.totalPL ?? raw?.total_pl ?? 0),
    totalPLPercent: Number(raw?.totalPLPercent ?? raw?.total_pl_percent ?? 0),
    holdings: Array.isArray(holdingsRaw)
      ? holdingsRaw.map((h: any) => ({
          stockId: h.stockId ?? h.stock_id ?? '',
          symbol: h.symbol ?? '',
          name: h.name ?? '',
          quantity: Number(h.quantity ?? 0),
          averageBuyPrice: Number(h.averageBuyPrice ?? h.average_buy_price ?? 0),
          currentPrice: Number(h.currentPrice ?? h.current_price ?? 0),
          totalValue: Number(h.value ?? h.totalValue ?? h.total_value ?? 0),
          gainLoss: Number(h.pl ?? h.gainLoss ?? h.gain_loss ?? 0),
          gainLossPercent: Number(h.plPercent ?? h.gainLossPercent ?? h.gain_loss_percent ?? 0),
        }))
      : [],
  };
};

export default function PortfolioPage() {
  const router = useRouter();
  const [portfolio, setPortfolio] = useState<PortfolioData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      const portfolioRes = await portfolioApi.getPortfolio();
      const portfolioRaw = portfolioRes.data?.data ?? portfolioRes.data;
      setPortfolio(normalizePortfolio(portfolioRaw));
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load portfolio');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.replace('/auth/login');
      return;
    }

    loadData();

    const onFocus = () => loadData();
    window.addEventListener('focus', onFocus);

    const interval = window.setInterval(loadData, 10000);

    return () => {
      window.removeEventListener('focus', onFocus);
      window.clearInterval(interval);
    };
  }, [router, loadData]);

  if (loading) return <div style={{ padding: 24 }}>Loading portfolio...</div>;

  if (error) {
    return <div style={{ padding: 24, color: 'var(--color-loss)' }}>{error}</div>;
  }

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto' }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 28, fontWeight: 900, margin: 0 }}>Portfolio</h1>
        <p style={{ color: 'var(--text-secondary)', marginTop: 8 }}>
          Holdings and performance summary.
        </p>
      </div>

      <PortfolioSummary portfolio={portfolio} />
      <HoldingsTable holdings={portfolio?.holdings || []} />
    </div>
  );
}