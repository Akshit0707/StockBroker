'use client';

import React from 'react';
import { formatCurrency } from '@/src/utils';

type TradeRow = any;

const getSide = (t: TradeRow) => {
  const raw =
    t.side ??
    t.trade_side ??
    t.type ??
    t.action ??
    t.order_side ??
    t.orderType ??
    t.order_type ??
    '';

  const side = String(raw).toLowerCase();
  if (side.includes('sell')) return 'SELL';
  if (side.includes('buy')) return 'BUY';
  if (Number(t.quantity ?? t.qty ?? 0) < 0) return 'SELL';
  return 'BUY';
};

export function TradesList({ trades }: { trades?: TradeRow[] | null }) {
  const rows = (Array.isArray(trades) ? trades : []).filter(Boolean);

  if (rows.length === 0) {
    return (
      <div
        style={{
          padding: 24,
          border: '1px solid var(--border-color)',
          borderRadius: 16,
          background: 'var(--bg-secondary)',
          color: 'var(--text-secondary)',
          textAlign: 'center',
        }}
      >
        No trades yet.
      </div>
    );
  }

  return (
    <div
      style={{
        border: '1px solid var(--border-color)',
        borderRadius: 16,
        overflow: 'hidden',
        background: 'var(--bg-secondary)',
        boxShadow: '0 8px 24px rgba(0,0,0,0.04)',
      }}
    >
      <div
        style={{
          padding: '14px 18px',
          borderBottom: '1px solid var(--border-color)',
          background: 'var(--bg-primary)',
          fontWeight: 700,
        }}
      >
        Recent Trades
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr
              style={{
                textAlign: 'left',
                color: 'var(--text-secondary)',
                fontSize: 13,
              }}
            >
              <th style={{ padding: '14px 18px' }}>Time</th>
              <th>Symbol</th>
              <th>Side</th>
              <th style={{ textAlign: 'right', paddingRight: 18 }}>Qty</th>
              <th style={{ textAlign: 'right', paddingRight: 18 }}>Price</th>
              <th style={{ textAlign: 'right', paddingRight: 18 }}>Total</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((t: TradeRow, idx: number) => {
              const side = getSide(t);
              const isSell = side === 'SELL';
              const time = t.executed_at ?? t.executedAt ?? t.created_at ?? t.createdAt;
              const symbol = t.symbol ?? t.stock_symbol ?? t.stock_name ?? '—';
              const qty = Math.abs(Number(t.quantity ?? t.qty ?? 0));
              const price = Number(t.price ?? 0);
              const total = Number(t.total ?? t.total_value ?? price * qty);

              return (
                <tr
                  key={t.id ?? `${symbol}-${idx}`}
                  style={{ borderTop: '1px solid var(--border-color)' }}
                >
                  <td style={{ padding: '14px 18px', fontSize: 13, color: 'var(--text-secondary)' }}>
                    {time ? new Date(time).toLocaleString() : '-'}
                  </td>
                  <td style={{ fontWeight: 700 }}>{symbol}</td>
                  <td>
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        padding: '4px 10px',
                        borderRadius: 999,
                        fontSize: 12,
                        fontWeight: 700,
                        color: isSell ? '#ef4444' : '#10b981',
                        background: isSell ? 'rgba(239,68,68,0.10)' : 'rgba(16,185,129,0.10)',
                      }}
                    >
                      {side}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right', paddingRight: 18 }}>{qty}</td>
                  <td style={{ textAlign: 'right', paddingRight: 18 }}>
                    {formatCurrency(price)}
                  </td>
                  <td style={{ textAlign: 'right', paddingRight: 18 }}>
                    {formatCurrency(total)}
                  </td>
                  <td style={{ color: 'var(--text-secondary)' }}>{String(t.status ?? 'filled')}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}