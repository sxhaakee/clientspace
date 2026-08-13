'use client';

import React from 'react';
import { Calendar, CheckCircle, FileText, Upload, Check, MessageSquare, Star, ShieldCheck, PenTool } from 'lucide-react';

export interface TimelineEvent {
  id: string;
  event: string;
  project_id: string;
  meta: any;
  created_at: string;
}

interface TimelineProps {
  events: TimelineEvent[];
  freelancerName: string;
  clientName: string;
}

export const Timeline: React.FC<TimelineProps> = ({ events, freelancerName, clientName }) => {
  const getEventIcon = (event: string) => {
    switch (event) {
      case 'project_created':
        return <Calendar size={12} className="text-brand-muted" />;
      case 'contract_updated':
        return <PenTool size={12} className="text-brand-accent" />;
      case 'contract_signed':
        return <ShieldCheck size={12} className="text-success" />;
      case 'file_uploaded':
        return <Upload size={12} className="text-brand-accent" />;
      case 'file_approved':
        return <CheckCircle size={12} className="text-success" />;
      case 'invoice_sent':
        return <FileText size={12} className="text-brand-muted" />;
      case 'invoice_paid':
        return <Check size={12} className="text-success" />;
      case 'comment_added':
        return <MessageSquare size={12} className="text-brand-muted" />;
      case 'rating_given':
        return <Star size={12} className="text-[#F59E0B]" fill="#F59E0B" />;
      default:
        return <Check size={12} className="text-brand-muted" />;
    }
  };

  const getEventText = (ev: TimelineEvent) => {
    if (ev.meta?.text) return ev.meta.text;

    // Fallbacks
    switch (ev.event) {
      case 'project_created':
        return `Workspace initiated for ${clientName}`;
      case 'contract_updated':
        return `${freelancerName} updated the service agreement draft`;
      case 'contract_signed':
        return `${clientName} e-signed the agreement`;
      case 'file_uploaded':
        return `${freelancerName} shared a new file deliverable: ${ev.meta?.filename || 'File'}`;
      case 'file_approved':
        return `${clientName} approved deliverable: ${ev.meta?.filename || 'File'}`;
      case 'invoice_sent':
        return `${freelancerName} issued invoice INV-${(ev.meta?.invoice_id || '').substring(0, 6).toUpperCase()} for $${ev.meta?.amount || '0'}`;
      case 'invoice_paid':
        return `${freelancerName} confirmed payment for invoice INV-${(ev.meta?.invoice_id || '').substring(0, 6).toUpperCase()}`;
      case 'comment_added':
        const senderName = ev.meta?.sender === 'freelancer' ? freelancerName : clientName;
        return `${senderName} left a message in feedback thread`;
      case 'rating_given':
        return `${clientName} reviewed the workspace and rated it ${ev.meta?.rating || 5} stars`;
      default:
        return `Action took place: ${ev.event}`;
    }
  };

  return (
    <div className="bg-brand-surface border border-brand-border p-6 flex flex-col gap-4 select-none">
      <div className="border-b border-brand-border pb-3 flex items-center gap-1.5">
        <Calendar size={12} className="text-brand-muted" />
        <span className="text-[10px] uppercase font-bold tracking-wider text-brand-muted font-mono">
          Project Timeline & Activity
        </span>
      </div>

      {events.length === 0 ? (
        <div className="text-center py-6 text-brand-muted text-[11px] font-sans">
          No activity logged yet.
        </div>
      ) : (
        <div className="flex flex-col relative pl-4 border-l border-brand-border/60 gap-5 py-1">
          {events.map((ev) => (
            <div key={ev.id} className="relative flex flex-col gap-0.5">
              {/* Event bullet icon */}
              <div className="absolute -left-[23px] top-0.5 p-1 bg-brand-surface border border-brand-border shadow-sm shrink-0 flex items-center justify-center">
                {getEventIcon(ev.event)}
              </div>

              <span className="text-xs text-brand-text font-sans leading-normal">
                {getEventText(ev)}
              </span>

              <span className="text-[9px] font-mono text-brand-muted uppercase">
                {new Date(ev.created_at).toLocaleString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  hour: 'numeric',
                  minute: '2-digit',
                  hour12: true,
                })}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
