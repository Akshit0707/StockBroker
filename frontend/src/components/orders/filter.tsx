'use client';
import { OrderSide, OrderStatus } from '@/src/types';
import React from 'react';

interface OrderFiltersProps {
  side: 'all' | OrderSide;
  status: 'all' | OrderStatus;
  onSideChange: (value: 'all' | OrderSide) => void;
  onStatusChange: (value: 'all' | OrderStatus) => void;
}

export function OrderFilters({
  side,
  status,
  onSideChange,
  onStatusChange,
}: OrderFiltersProps) {
  return (
    <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
      <select value={side} onChange={(e) => onSideChange(e.target.value as any)}>
        <option value="all">All Sides</option>
        <option value="buy">Buy</option>
        <option value="sell">Sell</option>
      </select>

      <select value={status} onChange={(e) => onStatusChange(e.target.value as any)}>
        <option value="all">All Statuses</option>
        <option value="pending">Pending</option>
        <option value="partially_filled">Partially Filled</option>
        <option value="completed">Completed</option>
        <option value="cancelled">Cancelled</option>
      </select>
    </div>
  );
}