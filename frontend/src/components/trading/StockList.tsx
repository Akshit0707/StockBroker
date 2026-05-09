'use client';

import React from 'react';
import { formatCurrency, formatPercent } from '@/src/utils';
import { getCurrentPrice, getPercentChange, normalizeStock } from '@/src/utils/stockMetrics';

type StockLike = ReturnType<typeof normalizeStock> & {
  id?: string;
  stockId?: string;
};

interface StockListProps {
  stocks: StockLike[];
  selectedStockId: string | null;
  onSelectStock: (stock: StockLike) => void;
}

export function StockList({ stocks, selectedStockId, onSelectStock }: StockListProps) {
  if (!stocks.length) {
    return (
      <div style={{ padding: 20, border: '1px solid var(--border-color)', borderRadius: 12 }}>
        No stocks found.
      </div>
    );
  }

  return (
    <div style={{ display: 'grid', gap: 12 }}>
      {stocks.map((stock, index) => {
        const key = stock.id ?? stock.stockId ?? stock.symbol ?? String(index);
        const currentPrice = getCurrentPrice(stock);
        const changePercent = getPercentChange(stock);
        const isSelected = selectedStockId === key;

        return (
          <button
            key={key}
            type="button"
            onClick={() => onSelectStock(stock)}
            style={{
              textAlign: 'left',
              padding: 16,
              borderRadius: 14,
              border: `1px solid ${isSelected ? '#4f46e5' : 'var(--border-color)'}`,
              background: isSelected ? 'rgba(79, 70, 229, 0.08)' : 'var(--bg-secondary)',
              cursor: 'pointer',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
              <div>
                <div style={{ fontWeight: 800 }}>{stock.symbol ?? 'N/A'}</div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{stock.name ?? ''}</div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <div style={{ fontWeight: 800 }}>{formatCurrency(currentPrice)}</div>
                <div style={{ color: changePercent >= 0 ? '#10b981' : '#ef4444' }}>
                  {formatPercent(changePercent)}
                </div>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}