/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, react-hooks/exhaustive-deps */
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { 
  ArrowLeft, Copy, User, Mail, Calendar, ExternalLink, 
  ShieldCheck, FileCheck, FileCode, Bell, Sparkles, Trash2, 
  Loader2, Check, RefreshCw, Send, AlertCircle
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { MilestoneList, Milestone } from '@/components/project/MilestoneList';
import { FileUploader, FileData } from '@/components/project/FileUploader';
import { CommentThread, Comment } from '@/components/project/CommentThread';
import { InvoiceForm, Invoice } from '@/components/project/InvoiceForm';
import { AgreementEditor } from '@/components/project/AgreementEditor';
import { Timeline, TimelineEvent } from '@/components/project/Timeline';
import { Button } from '@/components/ui/Button';
import { toast } from 'react-hot-toast';

export const dynamic = 'force-dynamic';

export default function ProjectBoardPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;
  const supabase = createClient();

  const [project, setProject] = useState<any>(null);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [files, setFiles] = useState<FileData[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [contract, setContract] = useState<any>(null);
  const [logs, setLogs] = useState<TimelineEvent[]>([]);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // Tabs State
  const [activeTab, setActiveTab] = useState<'files' | 'milestones' | 'invoices' | 'conversation' | 'contract' | 'ai'>('files');

  // AI Tools States
  const [aiProposalType, setAiProposalType] = useState('');
  const [aiProposalBudget, setAiProposalBudget] = useState('');
  const [aiProposalScope, setAiProposalScope] = useState('');
  const [aiProposalResult, setAiProposalResult] = useState('');
  const [generatingProposal, setGeneratingProposal] = useState(false);

  const [aiInvoiceDone, setAiInvoiceDone] = useState('');
  const [aiInvoiceResult, setAiInvoiceResult] = useState<{ description: string; amount: number }[]>([]);
  const [generatingInvoice, setGeneratingInvoice] = useState(false);

  const [aiStatusResult, setAiStatusResult] = useState('');
  const [generatingStatus, setGeneratingStatus] = useState(false);

  const fetchProjectData = async () => {
    try {
      // 1. Fetch project details
      const { data: projectData, error: projErr } = await supabase
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .single();

      if (projErr) throw projErr;
      setProject(projectData);

      // 2. Fetch milestones
      const { data: milestonesData } = await supabase
        .from('milestones')
        .select('*')
        .eq('project_id', projectId)
        .order('due_date', { ascending: true });
      setMilestones(milestonesData || []);

      // 3. Fetch files
      const { data: filesData } = await supabase
        .from('files')
        .select('*')
        .eq('project_id', projectId)
        .order('uploaded_at', { ascending: false });
      setFiles(filesData || []);

      // 4. Fetch invoices
      const { data: invoicesData } = await supabase
        .from('invoices')
        .select('*')
        .eq('project_id', projectId)
        .order('due_date', { ascending: true });
      setInvoices(invoicesData || []);

      // 5. Fetch comments
      const { data: commentsData } = await supabase
        .from('comments')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: true });
      setComments(commentsData || []);

      // 6. Fetch contract
      const { data: contractData } = await supabase
        .from('contracts')
        .select('*')
        .eq('project_id', projectId)
        .maybeSingle();
      setContract(contractData);

      // 7. Fetch logs
      const { data: logsData } = await supabase
        .from('logs')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });
      setLogs(logsData || []);

      // 8. Fetch profile
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profileData } = await supabase
          .from('users')
          .select('*')
          .eq('id', user.id)
          .single();
        setProfile(profileData);
      }

    } catch (err: any) {
      console.error(err);
      toast.error('Failed to load project context.');
      router.push('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (projectId) {
      fetchProjectData();
      
      // Log portal view
      supabase.auth.getUser().then(({ data: { user } }) => {
        if (user) {
          supabase.from('logs').insert({
            event: 'project_viewed',
            project_id: projectId,
            user_id: user.id
          });
        }
      });
    }
  }, [projectId]);

  const handleCopyPortalLink = () => {
    if (!project) return;
    const portalUrl = `${window.location.origin}/portal/${project.portal_token}`;
    navigator.clipboard.writeText(portalUrl);
    toast.success('Secure portal magic link copied to clipboard!');
  };

  const handleUpdateStatus = async (newStatus: 'brief' | 'in_progress' | 'review' | 'delivered') => {
    try {
      const { error } = await supabase
        .from('projects')
        .update({ status: newStatus })
        .eq('id', projectId);

      if (error) throw error;

      setProject((prev: any) => ({ ...prev, status: newStatus }));
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

      fetchProjectData();
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Failed to update status');
    }
  };

  const handleDeleteProject = async () => {
    if (!window.confirm('Are you absolutely sure you want to delete this project? This will permanently remove all files, invoices, contracts, comments and timelines.')) {
      return;
    }
    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', projectId);
      
      if (error) throw error;
      toast.success('Project deleted successfully.');
      router.push('/dashboard/projects');
    } catch (err: any) {
      console.error(err);
      toast.error('Failed to delete project.');
    }
  };

  // AI Tool: Generate Proposal
  const handleGenerateProposal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiProposalType || !aiProposalScope || !aiProposalBudget) {
      toast.error('Please fill in all proposal generator inputs.');
      return;
    }
    setGeneratingProposal(true);
    setAiProposalResult('');
    try {
      const res = await fetch('/api/ai/proposal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          project_type: aiProposalType,
          client_name: project.client_name,
          budget: Number(aiProposalBudget),
          scope_description: aiProposalScope
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'AI proposal generation failed');
      setAiProposalResult(data.data);
      toast.success('AI Proposal Draft generated!');
    } catch (err: any) {
      toast.error(err.message || 'Generation failed');
    } finally {
      setGeneratingProposal(false);
    }
  };

  const handlePublishProposal = async () => {
    if (!aiProposalResult) return;
    try {
      const { error } = await supabase
        .from('contracts')
        .upsert({
          project_id: projectId,
          content: aiProposalResult,
          client_signed: false,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;
      toast.success('Proposal successfully published as project Contract draft!');
      fetchProjectData();
    } catch (err: any) {
      console.error(err);
      toast.error('Failed to publish proposal.');
    }
  };

  // AI Tool: Generate Invoices
  const handleGenerateInvoiceItems = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiInvoiceDone) {
      toast.error('Please describe what tasks were completed.');
      return;
    }
    setGeneratingInvoice(true);
    setAiInvoiceResult([]);
    try {
      const res = await fetch('/api/ai/invoice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ what_was_done: aiInvoiceDone })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'AI invoice breakdown generation failed');
      setAiInvoiceResult(data.data || []);
      toast.success('AI Milestone pricing generated!');
    } catch (err: any) {
      toast.error(err.message || 'Generation failed');
    } finally {
      setGeneratingInvoice(false);
    }
  };

  const handleImportMilestones = async () => {
    if (aiInvoiceResult.length === 0) return;
    try {
      for (const item of aiInvoiceResult) {
        await supabase
          .from('milestones')
          .insert({
            project_id: projectId,
            title: item.description,
            amount: Number(item.amount),
            status: 'pending'
          });
      }
      toast.success('Milestones imported successfully!');
      fetchProjectData();
      setAiInvoiceResult([]);
      setAiInvoiceDone('');
    } catch (err: any) {
      console.error(err);
      toast.error('Failed to import milestones.');
    }
  };

  // AI Tool: Generate Status Update
  const handleGenerateStatus = async () => {
    setGeneratingStatus(true);
    setAiStatusResult('');
    try {
      const res = await fetch('/api/ai/status-update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ project_id: projectId })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'AI status generation failed');
      setAiStatusResult(data.data);
      toast.success('Client Status Draft generated!');
    } catch (err: any) {
      toast.error(err.message || 'Generation failed');
    } finally {
      setGeneratingStatus(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[70vh] gap-4">
        <svg className="animate-spin h-8 w-8 text-[#C8F04B]" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        <span className="text-xs uppercase font-mono tracking-widest text-brand-muted">Loading workspace context...</span>
      </div>
    );
  }

  const formattedDeadline = project.deadline
    ? new Date(project.deadline).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : 'No deadline set';

  const isProUser = profile?.plan === 'pro' || profile?.plan === 'agency';

  return (
    <div className="flex flex-col gap-6 animate-fade-in font-sans">
      
      {/* Top Header Section */}
      <div className="flex items-center justify-between select-none">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-serif text-brand-text tracking-wide">
            Project
          </h1>
          <span className="text-xs font-semibold text-brand-muted uppercase tracking-wider">
            {profile?.full_name || 'Freelancer'}
          </span>
        </div>

        {/* Notification Bell */}
        <div className="relative cursor-pointer w-9 h-9 flex items-center justify-center bg-brand-surface border border-brand-border shadow-sm hover:border-brand-accent transition-colors">
          <Bell size={15} className="text-brand-text" />
          {/* Square notification dot */}
          <div className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-brand-accent" />
        </div>
      </div>

      {/* Back Button */}
      <div>
        <Link
          href="/dashboard/projects"
          className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-brand-muted hover:text-brand-text transition-colors"
        >
          <ArrowLeft size={13} />
          Back to all projects
        </Link>
      </div>

      {/* Project info card */}
      <div className="bg-brand-surface border border-brand-border shadow-sm p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex flex-col gap-2 min-w-0">
          <h2 className="text-2xl font-serif text-brand-text truncate">
            {project.title}
          </h2>
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-brand-muted font-sans font-medium">
            <span>{profile?.full_name || 'Freelancer'}</span>
            <span>•</span>
            <span className="truncate">{project.client_email}</span>
            <span>•</span>
            <span>Due {formattedDeadline}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Status Dropdown */}
          <select
            value={project.status}
            onChange={(e) => handleUpdateStatus(e.target.value as any)}
            className="h-10 px-3 border border-brand-border bg-brand-surface text-brand-text uppercase tracking-wider text-[10px] sm:text-xs font-bold hover:border-brand-accent focus:outline-none cursor-pointer transition-colors"
          >
            <option value="brief">Briefing</option>
            <option value="in_progress">In Progress</option>
            <option value="review">Review</option>
            <option value="delivered">Delivered</option>
          </select>

          {/* Copy portal link - Green BG -> Black text */}
          <button
            onClick={handleCopyPortalLink}
            className="h-10 px-4 flex items-center justify-center gap-2 bg-[#C8F04B] border border-[#C8F04B] hover:bg-black hover:text-[#C8F04B] hover:border-black uppercase tracking-wider text-[10px] sm:text-xs font-bold text-black transition-all duration-200"
          >
            <Copy size={13} />
            Copy Portal Link
          </button>

          {/* Open portal - Black BG -> Green text */}
          <Link href={`/portal/${project.portal_token}`} target="_blank" className="shrink-0">
            <button className="h-10 w-10 flex items-center justify-center border border-black bg-black text-[#C8F04B] hover:bg-[#C8F04B] hover:text-black hover:border-[#C8F04B] transition-colors">
              <ExternalLink size={13} />
            </button>
          </Link>

          {/* Delete Project */}
          <button
            onClick={handleDeleteProject}
            className="h-10 w-10 flex items-center justify-center border border-brand-border bg-brand-surface text-brand-text hover:border-red-600 hover:text-red-600 transition-colors shrink-0"
            title="Delete Project"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>

      {/* Tabs Selector Bar */}
      <div className="bg-brand-surface border border-brand-border p-2 flex gap-1.5 overflow-x-auto whitespace-nowrap scrollbar-none select-none shadow-sm">
        {(['files', 'milestones', 'invoices', 'conversation', 'contract', 'ai'] as const).map((tab) => {
          const isActive = activeTab === tab;
          const displayNames = {
            files: 'Files',
            milestones: 'Milestones',
            invoices: 'Invoices',
            conversation: 'Conversation',
            contract: 'Contract',
            ai: 'AI Tools'
          };
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-[10px] sm:text-xs uppercase tracking-wider font-bold transition-all ${
                isActive
                  ? 'border border-brand-accent text-brand-accent bg-brand-accent/5'
                  : 'text-brand-muted hover:text-brand-text border border-transparent'
              }`}
            >
              {tab === 'ai' ? (
                <span className="flex items-center gap-1">
                  <Sparkles size={11} className={isActive ? 'text-brand-accent' : 'text-brand-muted'} />
                  {displayNames[tab]}
                </span>
              ) : (
                displayNames[tab]
              )}
            </button>
          );
        })}
      </div>

      {/* Tab Body Contents */}
      <div className="flex flex-col gap-6">
        {activeTab === 'files' && (
          <div className="flex flex-col gap-2">
            <h3 className="text-xl font-serif text-brand-text px-1">
              Deliverables
            </h3>
            <FileUploader
              projectId={projectId}
              files={files}
              onRefresh={fetchProjectData}
            />
          </div>
        )}

        {activeTab === 'milestones' && (
          <div className="flex flex-col gap-2">
            <h3 className="text-xl font-serif text-brand-text px-1">
              Milestones
            </h3>
            <MilestoneList
              projectId={projectId}
              milestones={milestones}
              onRefresh={fetchProjectData}
            />
          </div>
        )}

        {activeTab === 'invoices' && (
          <div className="flex flex-col gap-2">
            <h3 className="text-xl font-serif text-brand-text px-1">
              Invoices
            </h3>
            <InvoiceForm
              projectId={projectId}
              invoices={invoices}
              onRefresh={fetchProjectData}
              freelancerName={profile?.full_name || 'Freelancer'}
              clientName={project.client_name || 'Client'}
            />
          </div>
        )}

        {activeTab === 'conversation' && (
          <div className="flex flex-col gap-2">
            <h3 className="text-xl font-serif text-brand-text px-1">
              Conversation
            </h3>
            <CommentThread
              projectId={projectId}
              comments={comments}
              sender="freelancer"
              onRefresh={fetchProjectData}
              freelancerName={profile?.full_name || 'Freelancer'}
              clientName={project.client_name || 'Client'}
            />
          </div>
        )}

        {activeTab === 'contract' && (
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between px-1">
              <h3 className="text-xl font-serif text-brand-text">
                Contract
              </h3>
              {contract?.client_signed && (
                <span className="flex items-center gap-1 text-[10px] text-success uppercase tracking-wider font-bold">
                  <ShieldCheck size={12} />
                  Signed by client
                </span>
              )}
            </div>
            <AgreementEditor
              projectId={projectId}
              contract={contract}
              onRefresh={fetchProjectData}
              freelancerName={profile?.full_name || 'Freelancer'}
              clientName={project.client_name || 'Client'}
            />
          </div>
        )}

        {activeTab === 'ai' && (
          <div className="flex flex-col gap-5">
            <div className="px-1 flex flex-col gap-0.5">
              <h3 className="text-xl font-serif text-brand-text flex items-center gap-1.5">
                <Sparkles size={16} className="text-[#C8F04B]" />
                AI Assistant Tools
              </h3>
              <span className="text-xs text-brand-muted font-sans font-medium">
                Streamline client agreements, pricing calculations, and progress updates using Mistral AI.
              </span>
            </div>

            {!isProUser ? (
              // Locked Pro State Upgrade Banner
              <div className="bg-brand-surface border border-brand-border p-8 flex flex-col items-center justify-center text-center gap-4 relative overflow-hidden select-none">
                <div className="absolute inset-0 bg-gradient-to-r from-brand-accent/5 via-transparent to-brand-accent/5 opacity-50" />
                <div className="w-12 h-12 bg-brand-accent/15 border border-[#C8F04B]/30 flex items-center justify-center text-brand-text z-10 animate-pulse">
                  <Sparkles size={20} className="text-brand-text" />
                </div>
                <div className="flex flex-col gap-1.5 max-w-md z-10">
                  <h4 className="text-lg font-serif text-brand-text font-bold">
                    Unlock Pro AI Tools
                  </h4>
                  <p className="text-xs text-brand-muted leading-relaxed font-sans font-light">
                    AI proposal drafting, milestone price estimators, and intelligent client emails are exclusive to the Pro & Agency tiers.
                  </p>
                </div>
                <Link href="/dashboard/billing" className="z-10 mt-2">
                  <button className="h-10 px-6 bg-black text-[#C8F04B] border border-black hover:bg-[#C8F04B] hover:text-black hover:border-[#C8F04B] text-xs font-bold uppercase tracking-wider transition-colors">
                    Upgrade Workspace Context
                  </button>
                </Link>
              </div>
            ) : (
              // Active AI Tools State
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* 1. Proposal Draft Tool */}
                <div className="bg-brand-surface border border-brand-border p-6 flex flex-col gap-4">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-brand-muted border-b border-brand-border pb-2.5 flex items-center gap-1.5">
                    <Sparkles size={11} />
                    Proposal & Agreement Draft Generator
                  </span>
                  
                  <form onSubmit={handleGenerateProposal} className="flex flex-col gap-3 font-sans">
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] uppercase font-bold text-brand-muted">Project Type</label>
                      <input
                        type="text"
                        placeholder="e.g. Next.js E-Commerce Store"
                        value={aiProposalType}
                        onChange={(e) => setAiProposalType(e.target.value)}
                        className="h-9 px-3 border border-brand-border bg-brand-bg text-brand-text text-xs focus:outline-none focus:border-brand-accent"
                      />
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] uppercase font-bold text-brand-muted">Estimated Budget ($)</label>
                      <input
                        type="number"
                        placeholder="e.g. 3500"
                        value={aiProposalBudget}
                        onChange={(e) => setAiProposalBudget(e.target.value)}
                        className="h-9 px-3 border border-brand-border bg-brand-bg text-brand-text text-xs focus:outline-none focus:border-brand-accent"
                      />
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] uppercase font-bold text-brand-muted">Scope of Work</label>
                      <textarea
                        rows={3}
                        placeholder="e.g. 5 pages dashboard, stripe integrations, supabase database setup, responsive layouts"
                        value={aiProposalScope}
                        onChange={(e) => setAiProposalScope(e.target.value)}
                        className="p-3 border border-brand-border bg-brand-bg text-brand-text text-xs focus:outline-none focus:border-brand-accent resize-none font-sans font-light"
                      />
                    </div>

                    {/* Black BG -> Green text */}
                    <button
                      type="submit"
                      disabled={generatingProposal}
                      className="h-9 w-full bg-black border border-black text-[#C8F04B] uppercase font-bold text-[10px] tracking-wider hover:bg-[#C8F04B] hover:text-black hover:border-[#C8F04B] disabled:opacity-40 flex items-center justify-center gap-2"
                    >
                      {generatingProposal ? (
                        <>
                          <Loader2 size={12} className="animate-spin text-[#C8F04B]" />
                          Generating...
                        </>
                      ) : 'Draft Proposal via AI'}
                    </button>
                  </form>

                  {aiProposalResult && (
                    <div className="mt-2 flex flex-col gap-2">
                      <label className="text-[10px] uppercase font-bold text-brand-muted">Generated Proposal (Markdown)</label>
                      <textarea
                        rows={8}
                        value={aiProposalResult}
                        onChange={(e) => setAiProposalResult(e.target.value)}
                        className="p-3 border border-brand-border bg-brand-bg text-brand-text font-mono text-[10px] focus:outline-none focus:border-brand-accent resize-y"
                      />
                      {/* Green BG -> Black text */}
                      <button
                        onClick={handlePublishProposal}
                        className="h-9 bg-[#C8F04B] border border-[#C8F04B] text-black font-bold uppercase text-[10px] tracking-wider hover:bg-black hover:text-[#C8F04B] hover:border-black flex items-center justify-center gap-1.5"
                      >
                        <Check size={12} />
                        Publish to Project Agreement
                      </button>
                    </div>
                  )}
                </div>

                {/* 2. Milestone Pricing breakdown */}
                <div className="bg-brand-surface border border-brand-border p-6 flex flex-col gap-4">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-brand-muted border-b border-brand-border pb-2.5 flex items-center gap-1.5">
                    <Sparkles size={11} />
                    AI Milestone Pricing Estimator
                  </span>

                  <form onSubmit={handleGenerateInvoiceItems} className="flex flex-col gap-3 font-sans">
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] uppercase font-bold text-brand-muted">Describe completed or planned tasks</label>
                      <textarea
                        rows={4}
                        placeholder="e.g. Design wireframes, setup backend database schema, implement client portal reviews and e-signature, final QA"
                        value={aiInvoiceDone}
                        onChange={(e) => setAiInvoiceDone(e.target.value)}
                        className="p-3 border border-brand-border bg-brand-bg text-brand-text text-xs focus:outline-none focus:border-brand-accent resize-none font-sans font-light"
                      />
                    </div>

                    {/* Black BG -> Green text */}
                    <button
                      type="submit"
                      disabled={generatingInvoice}
                      className="h-9 w-full bg-black border border-black text-[#C8F04B] uppercase font-bold text-[10px] tracking-wider hover:bg-[#C8F04B] hover:text-black hover:border-[#C8F04B] disabled:opacity-40 flex items-center justify-center gap-2"
                    >
                      {generatingInvoice ? (
                        <>
                          <Loader2 size={12} className="animate-spin text-[#C8F04B]" />
                          Calculating Pricing...
                        </>
                      ) : 'Estimate Milestones via AI'}
                    </button>
                  </form>

                  {aiInvoiceResult.length > 0 && (
                    <div className="mt-2 flex flex-col gap-3">
                      <label className="text-[10px] uppercase font-bold text-brand-muted border-b border-brand-border pb-1">AI Generated Milestones</label>
                      <div className="flex flex-col divide-y divide-brand-border/60">
                        {aiInvoiceResult.map((item, idx) => (
                          <div key={idx} className="py-2 flex items-center justify-between text-xs">
                            <span className="text-brand-text font-medium truncate max-w-[200px]">{item.description}</span>
                            <span className="font-bold text-brand-text font-mono">${item.amount}</span>
                          </div>
                        ))}
                      </div>
                      {/* Green BG -> Black text */}
                      <button
                        onClick={handleImportMilestones}
                        className="h-9 bg-[#C8F04B] border border-[#C8F04B] text-black font-bold uppercase text-[10px] tracking-wider hover:bg-black hover:text-[#C8F04B] hover:border-black flex items-center justify-center gap-1.5"
                      >
                        <Check size={12} />
                        Import as Payment Milestones
                      </button>
                    </div>
                  )}
                </div>

                {/* 3. Progress Writer Assistant */}
                <div className="bg-brand-surface border border-brand-border p-6 flex flex-col gap-4 lg:col-span-2">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-brand-muted border-b border-brand-border pb-2.5 flex items-center gap-1.5">
                    <Sparkles size={11} />
                    Client Progress Update Email Writer
                  </span>
                  
                  <div className="flex flex-col gap-3 font-sans">
                    <p className="text-xs text-brand-muted font-light leading-relaxed">
                      Generates a sophisticated, calm status email using recent file uploads, milestone logs, and portal link context for {project.client_name}.
                    </p>

                    {/* Black BG -> Green text */}
                    <button
                      onClick={handleGenerateStatus}
                      disabled={generatingStatus}
                      className="h-9 bg-black border border-black text-[#C8F04B] uppercase font-bold text-[10px] tracking-wider hover:bg-[#C8F04B] hover:text-black hover:border-[#C8F04B] disabled:opacity-40 flex items-center justify-center gap-2 self-start px-5"
                    >
                      {generatingStatus ? (
                        <>
                          <Loader2 size={12} className="animate-spin text-[#C8F04B]" />
                          Writing update...
                        </>
                      ) : 'Draft Status Update Email'}
                    </button>

                    {aiStatusResult && (
                      <div className="mt-2 flex flex-col gap-2">
                        <textarea
                          rows={10}
                          value={aiStatusResult}
                          onChange={(e) => setAiStatusResult(e.target.value)}
                          className="p-3 border border-brand-border bg-brand-bg text-brand-text font-mono text-[10px] focus:outline-none focus:border-brand-accent resize-y leading-relaxed"
                        />
                        {/* Green BG -> Black text */}
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(aiStatusResult);
                            toast.success('Status update copied!');
                          }}
                          className="h-9 bg-[#C8F04B] border border-[#C8F04B] text-black font-bold uppercase text-[10px] tracking-wider hover:bg-black hover:text-[#C8F04B] hover:border-black flex items-center justify-center gap-1.5 self-start px-5"
                        >
                          Copy Update Message
                        </button>
                      </div>
                    )}
                  </div>
                </div>

              </div>
            )}
          </div>
        )}
      </div>

      {/* Global Activity Timeline */}
      <div className="bg-brand-surface border border-brand-border p-6 sm:p-8 mt-4">
        <div className="border-b border-brand-border pb-3 mb-5">
          <h3 className="text-xl font-serif text-brand-text">
            Project Timeline
          </h3>
        </div>
        <Timeline
          events={logs}
          freelancerName={profile?.full_name || 'Freelancer'}
          clientName={project.client_name || 'Client'}
        />
      </div>

    </div>
  );
}
