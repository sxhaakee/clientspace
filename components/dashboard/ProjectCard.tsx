import React from 'react';
import Link from 'next/link';
import { Calendar, User, ArrowRight, Activity } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';

export interface ProjectData {
  id: string;
  title: string;
  client_name: string;
  client_email: string;
  status: 'brief' | 'in_progress' | 'review' | 'delivered';
  deadline: string | null;
  created_at: string;
}

export interface ProjectCardProps {
  project: ProjectData;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({ project }) => {
  const statusLabels = {
    brief: 'Brief',
    in_progress: 'Active',
    review: 'In Review',
    delivered: 'Delivered',
  };

  const statusVariants: Record<ProjectData['status'], 'gray' | 'lime' | 'amber' | 'green'> = {
    brief: 'gray',
    in_progress: 'lime',
    review: 'amber',
    delivered: 'green',
  };

  const statusColors = {
    brief: 'bg-zinc-400',
    in_progress: 'bg-[#C8F04B] shadow-[0_0_10px_#C8F04B]',
    review: 'bg-amber-500 animate-pulse',
    delivered: 'bg-emerald-500',
  };

  const formattedDeadline = project.deadline
    ? new Date(project.deadline).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : 'No deadline';

  return (
    <div className="tilt-card relative bg-brand-surface border border-brand-border p-6 flex flex-col justify-between hover:border-brand-accent transition-all duration-300 group select-none shadow-[0_4px_20px_-12px_rgba(0,0,0,0.5)] min-h-[190px]">
      
      {/* Dynamic top accent bar that expands on card hover */}
      <div className="absolute top-0 left-0 w-full h-[1px] bg-brand-accent scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300" />
      <div className="absolute top-0 right-0 w-[4px] h-[4px] bg-[#C8F04B] opacity-0 group-hover:opacity-100 transition-opacity" />

      {/* Upper Panel */}
      <div className="flex flex-col gap-3">
        {/* Header (Status & Date) */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {/* Status dot is a tiny sharp square to avoid rounded corners */}
            <span className={`w-1.5 h-1.5 ${statusColors[project.status]}`} />
            <Badge variant={statusVariants[project.status]} className="text-[9px] uppercase tracking-wider font-bold">
              {statusLabels[project.status]}
            </Badge>
          </div>
          <span className="text-[9px] text-brand-muted font-mono tracking-widest uppercase">
            {new Date(project.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
          </span>
        </div>

        {/* Title */}
        <h3 className="text-lg font-serif text-brand-text group-hover:text-brand-accent transition-colors mt-2 tracking-wide truncate pr-4">
          {project.title}
        </h3>

        {/* Client Name */}
        <div className="flex items-center gap-2 text-brand-muted text-[11px] font-sans mt-0.5">
          <User size={11} className="text-brand-muted opacity-60" />
          <span>Client: <strong className="text-brand-text font-medium">{project.client_name}</strong></span>
        </div>
      </div>

      {/* Footer Panel */}
      <div className="mt-6 pt-3.5 border-t border-brand-border/40 flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-[9px] text-brand-muted font-mono tracking-wider uppercase">
          <Calendar size={11} className="text-brand-muted opacity-60" />
          <span>Due: {formattedDeadline}</span>
        </div>

        <Link
          href={`/dashboard/projects/${project.id}`}
          className="inline-flex items-center gap-1 text-[10px] font-bold text-brand-text uppercase tracking-widest border-b border-brand-accent hover:border-brand-text transition-colors pb-0.5 group/link"
        >
          Open Workspace
          <ArrowRight size={10} className="group-hover/link:translate-x-0.5 transition-transform" />
        </Link>
      </div>
    </div>
  );
};
