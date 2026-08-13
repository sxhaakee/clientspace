import React from 'react';
import Link from 'next/link';
import { Plus, Briefcase, Archive, Activity } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { ProjectCard, ProjectData } from '@/components/dashboard/ProjectCard';
import { Button } from '@/components/ui/Button';

export const revalidate = 0; // Real-time list updates

export default async function ProjectsPage() {
  const supabase = createClient();

  // Fetch all projects
  const { data: projectsData } = await supabase
    .from('projects')
    .select('*')
    .order('created_at', { ascending: false });

  const projects: ProjectData[] = (projectsData || []).map((p) => ({
    id: p.id,
    title: p.title,
    client_name: p.client_name,
    client_email: p.client_email,
    status: p.status,
    deadline: p.deadline,
    created_at: p.created_at,
  }));

  const activeProjects = projects.filter((p) => p.status !== 'delivered');
  const archiveProjects = projects.filter((p) => p.status === 'delivered');

  return (
    <div className="flex flex-col gap-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-brand-border pb-6 select-none">
        <div className="flex flex-col gap-1">
          <div className="inline-flex items-center gap-1.5 text-[9px] font-mono tracking-widest text-brand-muted uppercase">
            <Activity size={10} className="text-brand-accent" />
            WORKSPACE DIRECTORY
          </div>
          <h1 className="text-3xl font-serif tracking-tight text-brand-text mt-1">
            Project Workspaces
          </h1>
          <p className="text-xs text-brand-muted font-sans">
            Manage your deliverables, feedback links, timelines, and budgets.
          </p>
        </div>

        <Link href="/dashboard/projects/new">
          <Button variant="secondary" className="py-2.5 px-5 flex items-center gap-2">
            <Plus size={13} strokeWidth={2.5} />
            Initialize project
          </Button>
        </Link>
      </div>

      {/* Active Workspaces Section */}
      <div className="flex flex-col gap-5">
        <div className="border-b border-brand-border pb-3 select-none">
          <span className="text-[9px] uppercase font-bold tracking-widest text-brand-muted font-mono flex items-center gap-1.5">
            <Briefcase size={12} />
            Active Delivery Portals ({activeProjects.length})
          </span>
        </div>

        {activeProjects.length === 0 ? (
          <div className="bg-brand-surface border border-brand-border border-dashed p-10 flex flex-col items-center text-center gap-4 py-12">
            <span className="text-3xl font-mono text-brand-muted/40">{"[ ]"}</span>
            <div className="flex flex-col gap-0.5">
              <h3 className="text-sm font-serif text-brand-text">No active delivery portals</h3>
              <p className="text-[10px] text-brand-muted font-sans max-w-[240px]">
                Create a new project workspace to start sharing deliverables.
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeProjects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        )}
      </div>

      {/* Delivered/Archived Workspaces Section */}
      <div className="flex flex-col gap-5 mt-4">
        <div className="border-b border-brand-border pb-3 select-none">
          <span className="text-[9px] uppercase font-bold tracking-widest text-brand-muted font-mono flex items-center gap-1.5">
            <Archive size={12} />
            Completed / Delivered Spaces ({archiveProjects.length})
          </span>
        </div>

        {archiveProjects.length === 0 ? (
          <div className="text-brand-muted text-xs font-sans italic p-4 border border-brand-border/40 bg-brand-surface/50">
            No projects completed yet. Deliver your first project to archive it here.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {archiveProjects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
