'use client';

import React from 'react';
import { formatCurrency } from '@/src/utils';
import { OrderItem } from '@/src/types';
import { OrderStatusBadge } from './statusBadge';


interface OrdersTableProps {
  orders: OrderItem[];
  onCancel?: (orderId: string) => void;
  cancellingOrderId?: string | null;
}

export function OrdersTable({ orders, onCancel, cancellingOrderId }: OrdersTableProps) {
  if (!orders.length) {
    return <div style={{ padding: 16, color: 'var(--text-secondary)' }}>No orders found.</div>;
  }

  return (
    <div style={{ border: '1px solid var(--border-color)', borderRadius: 12, overflow: 'hidden' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <Th>Stock</Th>
            <Th>Side</Th>
            <Th>Qty</Th>
            <Th>Filled</Th>
            <Th>Price</Th>
            <Th>Status</Th>
            <Th>Time</Th>
            <Th>Action</Th>
          </tr>
        </thead>
        <tbody>
          {orders.map((o, i) => (
            <tr key={o.id || `${o.stockSymbol}-${o.createdAt}-${i}`} style={{ borderTop: '1px solid var(--border-color)' }}>
              <Td>{o.stockSymbol}</Td>
              <Td style={{ color: o.orderType === 'buy' ? 'var(--color-gain)' : 'var(--color-loss)', fontWeight: 700 }}>
                {o.orderType.toUpperCase()}
              </Td>
              <Td>{o.quantity}</Td>
              <Td>{o.filledQuantity}</Td>
              <Td>{formatCurrency(o.price)}</Td>
              <Td><OrderStatusBadge status={o.status} /></Td>
              <Td>{new Date(o.createdAt).toLocaleString()}</Td>
              <Td>
                {onCancel && (o.status === 'pending' || o.status === 'partially_filled') ? (
                  <button
                    onClick={() => onCancel(o.id)}
                    disabled={cancellingOrderId === o.id}
                  >
                    {cancellingOrderId === o.id ? 'Cancelling...' : 'Cancel'}
                  </button>
                ) : (
                  '-'
                )}
              </Td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th style={{ textAlign: 'left', padding: 12, fontSize: 12, color: 'var(--text-secondary)' }}>
      {children}
    </th>
  );
}

function Td({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <td style={{ padding: 12, fontSize: 14, ...style }}>
      {children}
    </td>
  );
}