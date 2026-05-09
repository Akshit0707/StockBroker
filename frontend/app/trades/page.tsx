'use client';
import React, { useEffect, useMemo, useState } from 'react';
import { TradesList } from '@/src/components/trades/tradeList';
import { tradeApi } from '@/src/services/api';

export default function TradesPage() {
  const [trades, setTrades] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const userId = JSON.parse(localStorage.getItem('user') || '{}')?.id;
        const res = userId
          ? await tradeApi.getUserTrades(userId)
          : await tradeApi.getTrades();
        const data = res?.data?.data ?? res?.data ?? [];
        setTrades(Array.isArray(data) ? data.filter(Boolean) : []);
      } catch (err) {
        console.error(err);
        setTrades([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const summary = useMemo(() => ({
    total: trades.length,
    buy: trades.filter((t) => String(t.orderType ?? t.side ?? '').toLowerCase() === 'buy').length,
    sell: trades.filter((t) => String(t.orderType ?? t.side ?? '').toLowerCase() === 'sell').length,
  }), [trades]);
  
  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: 'var(--page-padding)' }}>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ margin: 0, fontSize: 30, fontWeight: 800 }}>Trades</h1>
        <p style={{ marginTop: 8, color: 'var(--text-secondary)' }}>Recent executed orders</p>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
          gap: 16,
          marginBottom: 24,
        }}
      >
        <div style={cardStyle}><div style={labelStyle}>Total Trades</div><div style={valueStyle}>{summary.total}</div></div>
        <div style={cardStyle}><div style={labelStyle}>Buy Orders</div><div style={valueStyle}>{summary.buy}</div></div>
        <div style={cardStyle}><div style={labelStyle}>Sell Orders</div><div style={valueStyle}>{summary.sell}</div></div>
      </div>

      {loading ? <div style={loadingStyle}>Loading trades...</div> : <TradesList trades={trades} />}
    </div>
  );
}

const cardStyle: React.CSSProperties = {
  padding: 18,
  borderRadius: 16,
  border: '1px solid var(--border-color)',
  background: 'var(--bg-secondary)',
};

const labelStyle: React.CSSProperties = { fontSize: 13, color: 'var(--text-secondary)', marginBottom: 8 };
const valueStyle: React.CSSProperties = { fontSize: 26, fontWeight: 800 };
const loadingStyle: React.CSSProperties = {
  padding: 24,
  borderRadius: 16,
  border: '1px solid var(--border-color)',
  background: 'var(--bg-secondary)',
  textAlign: 'center',
  color: 'var(--text-secondary)',
};