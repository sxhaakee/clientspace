import React from 'react';
import { Briefcase, CreditCard, DollarSign, ArrowUpRight } from 'lucide-react';

export interface StatsBarProps {
  activeProjectsCount: number;
  pendingInvoicesCount: number;
  totalEarned: number;
}

export const StatsBar: React.FC<StatsBarProps> = ({
  activeProjectsCount,
  pendingInvoicesCount,
  totalEarned,
}) => {
  const stats = [
    {
      title: 'Active Projects',
      value: activeProjectsCount.toString(),
      icon: Briefcase,
      meta: 'Across all workspaces',
      glow: 'group-hover:shadow-[0_0_20px_rgba(200,240,75,0.08)]',
    },
    {
      title: 'Pending Invoices',
      value: pendingInvoicesCount.toString(),
      icon: CreditCard,
      meta: 'Awaiting client action',
      glow: 'group-hover:shadow-[0_0_20px_rgba(200,240,75,0.08)]',
    },
    {
      title: 'Total Earned',
      value: `$${totalEarned.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      icon: DollarSign,
      meta: 'This calendar month',
      glow: 'group-hover:shadow-[0_0_20px_rgba(200,240,75,0.08)]',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-scale-in">
      {stats.map((stat, i) => {
        const Icon = stat.icon;
        return (
          <div
            key={i}
            className={`tilt-card bg-brand-surface border border-brand-border p-6 flex flex-col justify-between relative overflow-hidden group select-none transition-all duration-300 shadow-[0_4px_20px_-12px_rgba(0,0,0,0.5)] ${stat.glow}`}
          >
            {/* Top accent line */}
            <div className="absolute top-0 left-0 w-full h-[2px] bg-transparent group-hover:bg-[#C8F04B] transition-colors duration-300" />
            <div className="absolute top-0 right-0 w-10 h-[1px] bg-brand-border" />

            {/* Top Row */}
            <div className="flex items-center justify-between mb-5">
              <span className="text-[9px] uppercase font-bold tracking-widest text-brand-muted font-mono">
                {stat.title}
              </span>
              <div className="p-2 bg-brand-bg border border-brand-border group-hover:border-brand-accent group-hover:bg-[#C8F04B]/10 text-brand-muted group-hover:text-brand-accent transition-all duration-300">
                <Icon size={13} strokeWidth={2} />
              </div>
            </div>

            {/* Metrics */}
            <div className="flex flex-col gap-1">
              <span className="text-3xl font-mono font-bold text-brand-text tracking-tight">
                {stat.value}
              </span>
              <span className="text-[10px] text-brand-muted font-sans">
                {stat.meta}
              </span>
            </div>
            
            {/* Decorative arrow link indicator */}
            <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-60 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all">
              <ArrowUpRight size={10} className="text-brand-text" />
            </div>
          </div>
        );
      })}
    </div>
  );
};
