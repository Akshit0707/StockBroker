'use client';

import type { OrderStatus } from '@/src/types';

const statusColor: Partial<Record<OrderStatus, string>> = {
  pending: '#f59e0b',
  partially_filled: '#3b82f6',
  completed: '#10b981',
  cancelled: '#ef4444',
};

export function OrderStatusBadge({ status }: { status: OrderStatus | string }) {
  const normalized = String(status).toLowerCase() as OrderStatus;
  const color = statusColor[normalized] ?? '#6b7280';

  return (
    <span
      style={{
        display: 'inline-block',
        padding: '4px 10px',
        borderRadius: 999,
        fontSize: 12,
        fontWeight: 700,
        color: '#fff',
        background: color,
        textTransform: 'capitalize',
      }}
    >
      {String(status).replace('_', ' ')}
    </span>
  );
}