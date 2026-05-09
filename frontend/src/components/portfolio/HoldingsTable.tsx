'use client';

import React from 'react';
import { Holding } from '@/src/types/portfolio';
import { formatCurrency, formatPercent } from '@/src/utils';

interface HoldingsTableProps {
  holdings: Holding[];
}

export const HoldingsTable: React.FC<HoldingsTableProps> = ({ holdings }) => {
  return (
    <div
      style={{
        border: '1px solid var(--border-color)',
        borderRadius: 16,
        overflow: 'hidden',
        background: 'var(--bg-secondary)',
      }}
    >
      <div style={{ padding: 16, borderBottom: '1px solid var(--border-color)' }}>
        <h2 style={{ margin: 0, fontSize: 18 }}>Holdings</h2>
      </div>

      {holdings.length === 0 ? (
        <div style={{ padding: 24, color: 'var(--text-secondary)' }}>No holdings yet.</div>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead style={{ background: 'rgba(0,0,0,0.03)' }}>
            <tr style={{ textAlign: 'left' }}>
              <Th>Symbol</Th>
              <Th>Name</Th>
              <Th>Qty</Th>
              <Th>Avg Buy</Th>
              <Th>Current</Th>
              <Th>Value</Th>
              <Th>P/L</Th>
            </tr>
          </thead>
          <tbody>
            {holdings.map((holding, index) => {
              const getChangePercent = (buyPrice: number, currentPrice: number) => {
                if (!buyPrice) return 0;
                return ((currentPrice - buyPrice) / buyPrice) * 100;
              };

              const changePercent = getChangePercent(holding.averageBuyPrice, holding.currentPrice);
              const isGain = Number(holding.gainLoss) > 0;
              const isLoss = Number(holding.gainLoss) < 0;

              return (
                <tr
                  key={holding.stockId || `${holding.symbol || 'holding'}-${index}`}
                  style={{ borderTop: '1px solid var(--border-color)' }}
                >
                  <Td>{holding.symbol}</Td>
                  <Td>{holding.name}</Td>
                  <Td>{holding.quantity}</Td>
                  <Td>{formatCurrency(holding.averageBuyPrice)}</Td>
                  <Td>{formatCurrency(holding.currentPrice)}</Td>
                  <Td>{formatCurrency(holding.totalValue)}</Td>
                  <Td
                    style={{
                      color: isGain ? '#10b981' : isLoss ? '#ef4444' : 'var(--text-secondary)',
                      fontWeight: 700,
                    }}
                  >
                    {formatCurrency(holding.gainLoss)} ({changePercent.toFixed(2)}%)
                  </Td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
};

function Th({ children }: { children: React.ReactNode }) {
  return <th style={{ padding: 12, fontSize: 13 }}>{children}</th>;
}

function Td({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: React.CSSProperties;
}) {
  return <td style={{ padding: 12, ...style }}>{children}</td>;
}