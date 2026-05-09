'use client';
import React from 'react';

interface StatCardProps {
  title?: string;
  label?: string;
  value: string;
  subtitle?: string;
  icon?: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
}

export const StatCard: React.FC<StatCardProps> = ({ title, label, value, subtitle, icon }) => {
  const heading = title ?? label ?? '';
  const fontSize = value.length > 12 ? 18 : value.length > 9 ? 22 : 28;

  return (
    <div
      style={{
        background: 'var(--bg-secondary)',
        border: '1px solid var(--border-color)',
        borderRadius: 12,
        padding: 16,
        minWidth: 0,
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
        <div style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 700 }}>
          {heading}
        </div>
        {icon ? <div>{icon}</div> : null}
      </div>
      <div
        style={{
          marginTop: 8,
          fontSize,
          fontWeight: 900,
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}
      >
        {value}
      </div>
      {subtitle ? (
        <div style={{ marginTop: 6, fontSize: 13, color: 'var(--text-secondary)' }}>
          {subtitle}
        </div>
      ) : null}
    </div>
  );
};