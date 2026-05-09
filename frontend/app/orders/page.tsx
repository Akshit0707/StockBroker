'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { orderApi } from '@/src/services/api';
import { OrderItem, OrderSide, OrderStatus } from '@/src/types';
import { OrderFilters } from '@/src/components/orders/filter';
import { OrdersTable } from '@/src/components/orders/table';

export default function OrdersPage() {
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [side, setSide] = useState<'all' | OrderSide>('all');
  const [status, setStatus] = useState<'all' | OrderStatus>('all');
  const [cancellingOrderId, setCancellingOrderId] = useState<string | null>(null);

  const loadOrders = async (showLoader = false) => {
    try {
      if (showLoader) setLoading(true);
      const res = await orderApi.getOrders();
      const raw = res.data?.data ?? res.data ?? [];
      setOrders(Array.isArray(raw) ? raw : []);
      setError(null);
    } catch (e: any) {
      console.error('Load orders failed:', e?.response?.status, e?.response?.data);
      setError(e?.response?.data?.message || 'Failed to load orders');
    } finally {
      if (showLoader) setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders(true);
  }, []);

  const filtered = useMemo(() => {
    return orders.filter((o) => {
      const sideOk = side === 'all' ? true : o.orderType === side;
      const statusOk = status === 'all' ? true : o.status === status;
      return sideOk && statusOk;
    });
  }, [orders, side, status]);

  const handleCancel = async (orderId: string) => {
    const ok = window.confirm('Are you sure you want to cancel this order?');
    if (!ok) return;

    try {
      setCancellingOrderId(orderId);
      await orderApi.cancelOrder(orderId);

      // keep history: mark cancelled locally
      setOrders((prev) =>
        prev.map((o) =>
          o.id === orderId
            ? { ...o, status: 'cancelled', updatedAt: new Date().toISOString() }
            : o
        )
      );

      await loadOrders(false);
    } catch (e: any) {
      console.error('Cancel failed:', e?.response?.status, e?.response?.data);
      setError(e?.response?.data?.message || 'Failed to cancel order');
    } finally {
      setCancellingOrderId(null);
    }
  };

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto' }}>
      <h1 style={{ fontSize: 28, fontWeight: 900, marginBottom: 8 }}>Orders</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: 16 }}>
        Track and manage your orders.
      </p>

      <OrderFilters side={side} status={status} onSideChange={setSide} onStatusChange={setStatus} />

      {loading ? (
        <div>Loading orders...</div>
      ) : error ? (
        <div style={{ color: 'var(--color-loss)' }}>{error}</div>
      ) : (
        <OrdersTable
          orders={filtered}
          onCancel={handleCancel}
          cancellingOrderId={cancellingOrderId}
        />
      )}
    </div>
  );
}