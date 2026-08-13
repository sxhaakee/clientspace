/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useState } from 'react';
import { CheckCircle2, Eye, Play, FileText, ArrowRight } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { Badge } from '@/components/ui/Badge';
import { toast } from 'react-hot-toast';

export interface KanbanBoardProps {
  projectId: string;
  initialStatus: 'brief' | 'in_progress' | 'review' | 'delivered';
  onStatusChange: (newStatus: 'brief' | 'in_progress' | 'review' | 'delivered') => void;
}

export const KanbanBoard: React.FC<KanbanBoardProps> = ({
  projectId,
  initialStatus,
  onStatusChange,
}) => {
  const [currentStatus, setCurrentStatus] = useState(initialStatus);
  const [updating, setUpdating] = useState(false);
  const supabase = createClient();

  const columns: {
    id: 'brief' | 'in_progress' | 'review' | 'delivered';
    title: string;
    description: string;
    icon: React.ComponentType<any>;
    color: 'gray' | 'lime' | 'amber' | 'green';
  }[] = [
    {
      id: 'brief',
      title: 'Briefing',
      description: 'Requirements gathering & initial alignment.',
      icon: FileText,
      color: 'gray',
    },
    {
      id: 'in_progress',
      title: 'In Progress',
      description: 'Active design and code sprint phase.',
      icon: Play,
      color: 'lime',
    },
    {
      id: 'review',
      title: 'In Review',
      description: 'Deliverables shared. Awaiting feedback.',
      icon: Eye,
      color: 'amber',
    },
    {
      id: 'delivered',
      title: 'Delivered',
      description: 'Approved, paid, and archived project.',
      icon: CheckCircle2,
      color: 'green',
    },
  ];

  const handleUpdateStatus = async (newStatus: typeof currentStatus) => {
    if (newStatus === currentStatus || updating) return;
    setUpdating(true);

    try {
      const { error } = await supabase
        .from('projects')
        .update({ status: newStatus })
        .eq('id', projectId);

      if (error) throw error;

      setCurrentStatus(newStatus);
      onStatusChange(newStatus);
      toast.success(`Project moved to ${newStatus.replace('_', ' ')}!`);
      
      // Log event
      await supabase.from('logs').insert({
        event: 'project_status_updated',
        project_id: projectId,
        meta: { status: newStatus },
      });

      // Dispatch status change notification email to client
      try {
        await fetch('/api/notifications', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'status_change',
            payload: { projectId, newStatus }
          })
        });
      } catch (notifyErr) {
        console.warn('Status change notification dispatch failed: ', notifyErr);
      }
    } catch (err: unknown) {
      console.error(err);
      toast.error(err instanceof Error ? err.message : 'Failed to update stage');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6 select-none">
      {columns.map((col) => {
        const Icon = col.icon;
        const isActive = currentStatus === col.id;

        return (
          <div
            key={col.id}
            onClick={() => handleUpdateStatus(col.id)}
            className={`border p-3 sm:p-5 flex flex-col justify-between h-36 sm:h-48 cursor-pointer transition-all duration-300 relative group ${
              isActive
                ? 'bg-brand-surface border-brand-accent/60 shadow-lg shadow-brand-accent/5'
                : 'bg-brand-surface/40 border-brand-border hover:border-brand-border/80 hover:bg-brand-surface/60'
            }`}
          >
            {/* Top Indicator */}
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono tracking-wider font-semibold text-brand-muted uppercase">
                Stage
              </span>
              {isActive && (
                <Badge variant={col.color}>Active</Badge>
              )}
            </div>

            {/* Label Block */}
            <div className="flex flex-col gap-1 mt-4 flex-1">
              <div className="flex items-center gap-2 text-brand-text">
                <Icon size={14} className={isActive ? 'text-brand-text' : 'text-brand-muted'} />
                <h4 className="text-sm font-semibold uppercase tracking-wider">{col.title}</h4>
              </div>
              <p className="text-[11px] text-brand-muted leading-relaxed mt-1 font-sans">
                {col.description}
              </p>
            </div>

            {/* Quick click instruction */}
            {!isActive && (
              <div className="text-[9px] uppercase tracking-wider text-lime-900 font-semibold font-mono flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity mt-4">
                Shift to this stage
                <ArrowRight size={10} />
              </div>
            )}

            {/* Top decorative bar */}
            <div
              className={`absolute top-0 left-0 w-full h-[2px] transition-transform duration-300 origin-left ${
                isActive ? 'bg-brand-accent scale-x-100' : 'bg-brand-border scale-x-0 group-hover:scale-x-50'
              }`}
            />
          </div>
        );
      })}
    </div>
  );
};
