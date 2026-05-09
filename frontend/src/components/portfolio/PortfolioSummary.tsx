'use client';

import React from 'react';

import { formatCurrency, formatPercent } from '@/src/utils';
import { PortfolioData } from '@/src/types';

interface PortfolioSummaryProps {
  portfolio: PortfolioData | null;
}

export const PortfolioSummary: React.FC<PortfolioSummaryProps> = ({ portfolio }) => {
  const cards = [
    {
      label: 'Cash Balance',
      value: formatCurrency(portfolio?.cashBalance || 0),
    },
    {
      label: 'Total Value',
      value: formatCurrency(portfolio?.totalValue || 0),
    },
    {
      label: 'Invested',
      value: formatCurrency(portfolio?.totalInvested || 0),
    },
    {
      label: 'P/L',
      value: formatCurrency(portfolio?.totalPL || 0),
      subvalue: formatPercent(portfolio?.totalPLPercent || 0),
      positive: (portfolio?.totalPL || 0) >= 0,
    },
  ];

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: 16,
        marginBottom: 24,
      }}
    >
      {cards.map((card) => (
        <div
          key={card.label}
          style={{
            padding: 16,
            borderRadius: 16,
            border: '1px solid var(--border-color)',
            background: 'var(--bg-secondary)',
          }}
        >
          <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{card.label}</div>
          <div
            style={{
              marginTop: 8,
              fontSize: 22,
              fontWeight: 900,
              color: card.positive === false ? 'var(--color-loss)' : 'inherit',
            }}
          >
            {card.value}
          </div>
          {card.subvalue && (
            <div style={{ marginTop: 4, fontSize: 12, color: 'var(--text-secondary)' }}>
              {card.subvalue}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};