'use client';

import React from 'react';
import { formatCurrency, formatPercent } from '@/src/utils';
import { getCurrentPrice, getPercentChange, getPriceChange, normalizeStock } from '@/src/utils/stockMetrics';

type StockLike = ReturnType<typeof normalizeStock> & {
  id?: string;
  stockId?: string;
};

interface OrderTicketProps {
  stock: StockLike | null;
  side: 'buy' | 'sell';
  quantity: number;
  submitting: boolean;
  onSideChange: (side: 'buy' | 'sell') => void;
  onQuantityChange: (quantity: number) => void;
  onSubmit: () => void;
}

export function OrderTicket({
  stock,
  side,
  quantity,
  submitting,
  onSideChange,
  onQuantityChange,
  onSubmit,
}: OrderTicketProps) {
  if (!stock) return null;

  const price = getCurrentPrice(stock);
  const change = getPriceChange(stock);
  const changePercent = getPercentChange(stock);

  const buyActive = side === 'buy';
  const sellActive = side === 'sell';

  return (
    <div
      style={{
        padding: 20,
        border: '1px solid var(--border-color)',
        borderRadius: 14,
        background: 'var(--bg-secondary)',
      }}
    >
      <h3 style={{ marginTop: 0, marginBottom: 4 }}>{stock.symbol ?? 'Stock'}</h3>
      <div style={{ color: 'var(--text-secondary)', marginBottom: 16 }}>
        {stock.name ?? ''}
      </div>

      <div style={{ display: 'grid', gap: 8, marginBottom: 16 }}>
        <div>Price: {formatCurrency(price)}</div>
        <div style={{ color: change >= 0 ? '#10b981' : '#ef4444' }}>
          Change: {formatCurrency(Math.abs(change))} ({formatPercent(changePercent)})
        </div>
      </div>

      <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
        <button
          type="button"
          onClick={() => onSideChange('buy')}
          style={{
            flex: 1,
            padding: '10px 12px',
            borderRadius: 10,
            border: '1px solid #10b981',
            background: buyActive ? '#10b981' : '#ffffff',
            color: buyActive ? '#ffffff' : '#10b981',
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          Buy
        </button>

        <button
          type="button"
          onClick={() => onSideChange('sell')}
          style={{
            flex: 1,
            padding: '10px 12px',
            borderRadius: 10,
            border: '1px solid #ef4444',
            background: sellActive ? '#ef4444' : '#ffffff',
            color: sellActive ? '#ffffff' : '#ef4444',
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          Sell
        </button>
      </div>

      <label style={{ display: 'block', marginBottom: 8 }}>Quantity</label>
      <input
        type="number"
        min={1}
        value={quantity}
        onChange={(e) => onQuantityChange(Math.max(1, Number(e.target.value) || 1))}
        style={{
          width: '100%',
          padding: '12px 14px',
          marginBottom: 16,
          borderRadius: 10,
          border: '1px solid var(--border-color)',
          background: 'var(--bg-primary)',
        }}
      />

      <div style={{ marginBottom: 16 }}>
        Estimated value: {formatCurrency(price * quantity)}
      </div>

      <button
        type="button"
        onClick={onSubmit}
        disabled={submitting}
        style={{
          width: '100%',
          padding: 12,
          borderRadius: 10,
          border: 'none',
          background: buyActive ? '#10b981' : '#ef4444',
          color: '#fff',
          fontWeight: 800,
          cursor: submitting ? 'not-allowed' : 'pointer',
          opacity: submitting ? 0.7 : 1,
        }}
      >
        {submitting ? 'Placing order...' : buyActive ? 'Buy Stock' : 'Sell Stock'}
      </button>
    </div>
  );
}