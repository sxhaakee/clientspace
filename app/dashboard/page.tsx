import React from 'react';
import Link from 'next/link';
import { Plus, Briefcase, ChevronRight, FileText, Sparkles, Activity } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { StatsBar } from '@/components/dashboard/StatsBar';
import { ProjectCard, ProjectData } from '@/components/dashboard/ProjectCard';
import { Button } from '@/components/ui/Button';

export const revalidate = 0; // Disable caching for real-time dashboard data

export default async function DashboardPage() {
  const supabase = createClient();
  
  // 1. Get current logged-in user
  const { data: { user } } = await supabase.auth.getUser();
  const userName = user?.user_metadata?.full_name ?? user?.email?.split('@')[0] ?? 'Freelancer';

  // 2. Fetch projects
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

  // 3. Fetch invoices for stats
  const { data: invoicesData } = await supabase
    .from('invoices')
    .select('amount, status, paid_at');

  const invoices = invoicesData || [];
  
  // Active projects count (status is not delivered)
  const activeProjectsCount = projects.filter((p) => p.status !== 'delivered').length;

  // Pending invoices count (status is sent)
  const pendingInvoicesCount = invoices.filter((i) => i.status === 'sent').length;

  // Calculate total earned this calendar month
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  
  const totalEarned = invoices
    .filter((i) => {
      if (i.status !== 'paid' || !i.paid_at) return false;
      const paidDate = new Date(i.paid_at);
      return paidDate.getMonth() === currentMonth && paidDate.getFullYear() === currentYear;
    })
    .reduce((sum, i) => sum + Number(i.amount), 0);

  return (
    <div className="flex flex-col gap-8 animate-fade-in">
      
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-brand-border pb-6 select-none">
        <div className="flex flex-col gap-1">
          <div className="inline-flex items-center gap-1.5 text-[9px] font-mono tracking-widest text-brand-muted uppercase">
            <Activity size={10} className="text-brand-accent animate-pulse" />
            FREELANCER CENTRAL CONTROL
          </div>
          <h1 className="text-3xl font-serif tracking-tight text-brand-text mt-1">
            Welcome back, {userName}
          </h1>
          <p className="text-xs text-brand-muted font-sans">
            Here is the live state of your work portals today.
          </p>
        </div>
        
        {/* Quick Action Button - Black BG -> Green text */}
        <Link href="/dashboard/projects/new">
          <Button variant="secondary" className="py-2.5 px-5 flex items-center gap-2">
            <Plus size={13} strokeWidth={2.5} />
            Initialize Space
          </Button>
        </Link>
      </div>

      {/* Analytics StatsBar */}
      <StatsBar
        activeProjectsCount={activeProjectsCount}
        pendingInvoicesCount={pendingInvoicesCount}
        totalEarned={totalEarned}
      />

      {/* Dashboard Grid split into Recent Projects & Quick Tools */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Recent Projects */}
        <div className="lg:col-span-2 flex flex-col gap-5">
          <div className="flex items-center justify-between border-b border-brand-border pb-3 select-none">
            <span className="text-[9px] uppercase font-bold tracking-widest text-brand-muted font-mono flex items-center gap-1.5">
              <Briefcase size={12} />
              Recent Active Spaces
            </span>
            {projects.length > 0 && (
              <Link
                href="/dashboard/projects"
                className="text-[9px] uppercase tracking-widest text-brand-text font-bold border-b border-brand-accent hover:border-brand-text flex items-center gap-0.5 transition-colors pb-0.5"
              >
                All Projects
                <ChevronRight size={10} />
              </Link>
            )}
          </div>

          {projects.length === 0 ? (
            /* Empty State */
            <div className="bg-brand-surface border border-brand-border border-dashed p-10 flex flex-col items-center text-center gap-4 py-16">
              <span className="text-4xl font-mono text-brand-muted/40">{"[ ]"}</span>
              <div className="flex flex-col gap-1 max-w-[280px]">
                <h3 className="text-sm font-serif text-brand-text tracking-wide">
                  No projects initialized
                </h3>
                <p className="text-[11px] text-brand-muted font-sans leading-relaxed">
                  Start by setting up your first workspace and client delivery portal.
                </p>
              </div>
              <Link href="/dashboard/projects/new" className="mt-2">
                <Button variant="outline" size="sm" className="font-bold tracking-widest uppercase text-[10px]">
                  Initialize project
                </Button>
              </Link>
            </div>
          ) : (
            /* Project Grid */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {projects.slice(0, 4).map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Quick Tools */}
        <div className="flex flex-col gap-5 select-none">
          <div className="border-b border-brand-border pb-3">
            <span className="text-[9px] uppercase font-bold tracking-widest text-brand-muted font-mono flex items-center gap-1.5">
              <FileText size={12} />
              Action panel
            </span>
          </div>

          <div className="flex flex-col border border-brand-border bg-brand-surface divide-y divide-brand-border shadow-[0_4px_20px_-12px_rgba(0,0,0,0.02)]">
            <Link
              href="/dashboard/projects/new"
              className="p-4 flex items-center justify-between text-brand-text hover:bg-brand-bg transition-colors group"
            >
              <div className="flex flex-col gap-0.5">
                <span className="text-xs font-semibold">New Client Workspace</span>
                <span className="text-[10px] text-brand-muted font-sans">
                  Define milestone goals, timelines, and agreements
                </span>
              </div>
              <ChevronRight size={14} className="text-brand-muted group-hover:text-brand-text group-hover:translate-x-0.5 transition-all" />
            </Link>

            <Link
              href="/dashboard/billing"
              className="p-4 flex items-center justify-between text-brand-text hover:bg-brand-bg transition-colors group"
            >
              <div className="flex flex-col gap-0.5">
                <span className="text-xs font-semibold">Subscription & Billing</span>
                <span className="text-[10px] text-brand-muted font-sans">
                  Manage your subscription package or variant limits
                </span>
              </div>
              <ChevronRight size={14} className="text-brand-muted group-hover:text-brand-text group-hover:translate-x-0.5 transition-all" />
            </Link>

            <div className="p-4 flex flex-col gap-2">
              <span className="text-[9px] uppercase font-bold tracking-widest text-brand-muted font-mono">
                System Status
              </span>
              <div className="flex items-center gap-2 mt-1">
                <span className="w-1.5 h-1.5 bg-[#C8F04B] rounded-full animate-ping" />
                <span className="text-[9px] font-mono text-brand-accent tracking-widest uppercase font-bold">
                  Connected to Supabase Node
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
