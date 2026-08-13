import React from 'react';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'gray' | 'lime' | 'amber' | 'green' | 'red';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ children, variant = 'gray', className = '' }) => {
  const variants = {
    gray: 'bg-brand-bg text-brand-text border-brand-border',
    lime: 'bg-brand-accent/30 text-lime-900 border-brand-accent/60',
    amber: 'bg-warning/15 text-amber-800 border-warning/40',
    green: 'bg-success/15 text-emerald-800 border-success/40',
    red: 'bg-danger/15 text-red-700 border-danger/40',
  };

  return (
    <span
      className={`inline-flex items-center border px-2 py-0.5 text-[10px] uppercase font-mono tracking-wider font-semibold ${variants[variant]} ${className}`}
    >
      {children}
    </span>
  );
};
