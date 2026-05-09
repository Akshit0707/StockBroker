'use client';

import React from 'react';
import { Stock } from '../../types/stocks';
import { formatCurrency, formatPercent } from '@/src/utils';

interface TopMoversProps {
  topGainers: Stock[];
  topLosers: Stock[];
}

export const TopMovers: React.FC<TopMoversProps> = ({ topGainers, topLosers }) => {
  const StockRow: React.FC<{ stock: Stock; isGainer: boolean }> = ({ stock, isGainer }) => (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: 12,
        padding: '10px 0',
        borderBottom: '1px solid var(--border-subtle)',
      }}
    >
      <div style={{ minWidth: 0 }}>
        <div style={{ fontWeight: 600, fontSize: 14, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {stock.symbol || 'N/A'}
        </div>
        <div
          style={{
            fontSize: 12,
            color: 'var(--text-secondary)',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {stock.name || 'Unknown'}
        </div>
      </div>

      <div style={{ textAlign: 'right', flexShrink: 0 }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 14 }}>
          {formatCurrency(stock.currentPrice ?? 0)}
        </div>
        <div
          style={{
            fontSize: 12,
            color: isGainer ? '#10b981' : '#ef4444',
            fontFamily: 'var(--font-mono)',
          }}
        >
          {formatPercent(stock.changePercent || 0)}
        </div>
      </div>
    </div>
  );

  const cardStyle: React.CSSProperties = {
    background: 'var(--bg-secondary)',
    border: '1px solid var(--border-color)',
    borderRadius: 12,
    padding: 20,
    height: 420,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  };

  const listStyle: React.CSSProperties = {
    flex: 1,
    overflowY: 'auto',
    paddingRight: 6,
    marginTop: 16,
  };

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: 24,
        marginBottom: 32,
      }}
    >
      <div style={cardStyle}>
        <h2
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 16,
            fontWeight: 700,
            color: 'var(--color-gain)',
            margin: 0,
          }}
        >
          🚀 Top Gainers
        </h2>

        <div style={listStyle}>
          {topGainers?.length ? (
            topGainers.map((stock) => <StockRow key={stock.id} stock={stock} isGainer />)
          ) : (
            <div style={{ color: 'var(--color-gain)', fontSize: 14 }}>No data available</div>
          )}
        </div>
      </div>

      <div style={cardStyle}>
        <h2
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 16,
            fontWeight: 700,
            color: 'var(--color-loss)',
            margin: 0,
          }}
        >
          📉 Top Losers
        </h2>

        <div style={listStyle}>
          {topLosers?.length ? (
            topLosers.map((stock) => <StockRow key={stock.id} stock={stock} isGainer={false} />)
          ) : (
            <div style={{ color: 'var(--text-secondary)', fontSize: 14 }}>No data available</div>
          )}
        </div>
      </div>
    </div>
  );
};