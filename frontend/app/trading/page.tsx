'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import useStockStore from '@/src/store/stockStore';
import { orderApi } from '@/src/services/api';
import { StockList } from '@/src/components/trading/StockList';
import { OrderTicket } from '@/src/components/trading/OrderTickets';
import { getCurrentPrice, normalizeStock } from '@/src/utils/stockMetrics';

type TradingStock = ReturnType<typeof normalizeStock> & {
  id?: string;
  stockId?: string;
};

export default function TradingPage() {
  const router = useRouter();
  const { stocks, isLoading, error, fetchStocks, subscribeToPriceUpdates } = useStockStore();

  const normalizedStocks = useMemo(
    () => (Array.isArray(stocks) ? stocks.map((stock) => normalizeStock(stock)) : []),
    [stocks],
  ) as TradingStock[];

  const [selectedStock, setSelectedStock] = useState<TradingStock | null>(null);
  const [side, setSide] = useState<'buy' | 'sell'>('buy');
  const [quantity, setQuantity] = useState(1);
  const [search, setSearch] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) router.replace('/auth/login');
  }, [router]);

  useEffect(() => {
    fetchStocks();
  }, [fetchStocks]);

  useEffect(() => {
    const unsubscribe = subscribeToPriceUpdates?.();
    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, [subscribeToPriceUpdates]);

  useEffect(() => {
    if (!selectedStock && normalizedStocks.length > 0) {
      setSelectedStock(normalizedStocks[0]);
    }
  }, [normalizedStocks, selectedStock]);

  const selectedStockKey =
    selectedStock?.id ?? selectedStock?.stockId ?? selectedStock?.symbol ?? null;

  const filteredStocks = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return normalizedStocks;

    return normalizedStocks.filter(
      (stock) =>
        String(stock.symbol ?? '').toLowerCase().includes(term) ||
        String(stock.name ?? '').toLowerCase().includes(term),
    );
  }, [normalizedStocks, search]);

  const placeOrder = async () => {
    if (!selectedStock) return;

    try {
      setSubmitting(true);
      setMessage(null);

      await orderApi.placeOrder({
        stockSymbol: String(selectedStock.symbol ?? ''),
        orderType: side,
        quantity: Number(quantity),
        price: Number(getCurrentPrice(selectedStock) ?? 0),
      });

      setMessage(`Order placed successfully for ${selectedStock.symbol}.`);
      router.push('/orders');
    } catch (err: any) {
      setMessage(err?.response?.data?.message || 'Failed to place order');
    } finally {
      setSubmitting(false);
    }
  };

  if (isLoading) {
    return <div style={{ padding: 24 }}>Loading stocks...</div>;
  }

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto' }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 28, fontWeight: 900, margin: 0 }}>Trading</h1>
        <p style={{ color: 'var(--text-secondary)', marginTop: 8 }}>
          Buy and sell stocks from the live market list.
        </p>
      </div>

      {message && (
        <div
          style={{
            marginBottom: 16,
            padding: 12,
            borderRadius: 10,
            border: '1px solid var(--border-color)',
            background: 'var(--bg-secondary)',
          }}
        >
          {message}
        </div>
      )}

      {error && (
        <div
          style={{
            marginBottom: 16,
            padding: 12,
            borderRadius: 10,
            background: '#ef4444',
            color: 'white',
          }}
        >
          {error}
        </div>
      )}

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1.5fr 1fr',
          gap: 24,
          alignItems: 'start',
        }}
      >
        <div>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search stocks..."
            style={{
              width: '100%',
              padding: '12px 14px',
              marginBottom: 16,
              borderRadius: 10,
              border: '1px solid var(--border-color)',
              background: 'var(--bg-primary)',
            }}
          />

          <StockList
            stocks={filteredStocks}
            selectedStockId={selectedStockKey}
            onSelectStock={(stock: TradingStock) => setSelectedStock(stock)}
          />
        </div>

        <div>
          {selectedStock ? (
            <OrderTicket
              stock={selectedStock}
              side={side}
              quantity={quantity}
              submitting={submitting}
              onSideChange={setSide}
              onQuantityChange={setQuantity}
              onSubmit={placeOrder}
            />
          ) : (
            <div
              style={{
                padding: 20,
                border: '1px solid var(--border-color)',
                borderRadius: 12,
                background: 'var(--bg-secondary)',
              }}
            >
              Select a stock to place an order.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}