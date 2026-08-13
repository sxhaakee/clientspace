/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, react-hooks/exhaustive-deps */
'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { 
  FileText, MessageSquare, ShieldCheck, Download, Check, 
  Send, User, AlertCircle, FileCheck, CheckCircle, ExternalLink, Star,
  Receipt, X, ChevronUp, ChevronDown
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { Logo } from '@/components/ui/Logo';
import { Badge } from '@/components/ui/Badge';
import { toast } from 'react-hot-toast';
import { Timeline } from '@/components/project/Timeline';

export default function ClientPortalPage() {
  const params = useParams();
  const token = params.token as string;
  const supabase = createClient();

  const [activeTab, setActiveTab] = useState<'files' | 'feedback' | 'invoice' | 'contract'>('files');
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submittingComment, setSubmittingComment] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [signing, setSigning] = useState(false);
  const [signingChecked, setSigningChecked] = useState(false);
  const [approvingFile, setApprovingFile] = useState<string | null>(null);

  const [rating, setRating] = useState<number>(0);
  const [hoveredRating, setHoveredRating] = useState<number>(0);
  const [feedbackText, setFeedbackText] = useState<string>('');
  const [submittingFeedback, setSubmittingFeedback] = useState<boolean>(false);
  
  const [isContractExpanded, setIsContractExpanded] = useState<boolean>(false);
  const [receiptInvoice, setReceiptInvoice] = useState<any>(null);

  // ─── DATA FETCHING VIA SERVER API (bypasses RLS/RPC) ───
  const fetchPortalData = async () => {
    try {
      const res = await fetch(`/api/portal?token=${encodeURIComponent(token)}`);
      
      if (!res.ok) {
        throw new Error('This client portal link is invalid or has expired.');
      }

      const payload = await res.json();
      
      if (!payload || !payload.project) {
        throw new Error('This client portal link is invalid or has expired.');
      }
      
      setData(payload);
    } catch (err: unknown) {
      console.error(err);
      toast.error(err instanceof Error ? err.message : 'Error loading client portal.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchPortalData();
    }
  }, [token]);

  // ─── PORTAL MUTATIONS VIA SERVER API ───

  const handleApproveFile = async (fileId: string) => {
    setApprovingFile(fileId);
    try {
      const res = await fetch('/api/portal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'approve_file', token, file_id: fileId }),
      });

      if (!res.ok) throw new Error('Approval failed');

      toast.success('Asset approved! Freelancer has been notified.');
      
      // Dispatch file approval notification email
      try {
        const fileObj = data?.files?.find((f: any) => f.id === fileId);
        await fetch('/api/notifications', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'file_approved',
            payload: {
              projectId: data.project.id,
              fileName: fileObj?.name || 'Asset Deliverable',
              version: fileObj?.version || 1
            }
          })
        });
      } catch (notifyErr) {
        console.warn('File approval notification email failed: ', notifyErr);
      }

      fetchPortalData();
    } catch (err) {
      console.error(err);
      toast.error('Approval failed.');
    } finally {
      setApprovingFile(null);
    }
  };

  const handleDownloadFile = async (file: any) => {
    try {
      const { data: signedData, error } = await supabase.storage
        .from('deliverables')
        .createSignedUrl(file.url, 3600);

      if (error) throw error;

      if (signedData?.signedUrl) {
        window.open(signedData.signedUrl, '_blank');
      }
    } catch (err) {
      console.error(err);
      toast.error('Error downloading file.');
    }
  };

  const handleSendComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setSubmittingComment(true);

    try {
      const res = await fetch('/api/portal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'add_comment', token, body: newComment.trim() }),
      });

      if (!res.ok) throw new Error('Comment failed');

      setNewComment('');
      toast.success('Feedback shared.');
      fetchPortalData();
    } catch (err) {
      console.error(err);
      toast.error('Feedback dispatch failed.');
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleSignContract = async () => {
    if (!signingChecked) {
      toast.error('Please accept the contract terms checkbox first');
      return;
    }

    setSigning(true);

    try {
      // 1. Fetch Client Public IP
      let ipAddress = '127.0.0.1';
      try {
        const ipRes = await fetch('https://api.ipify.org?format=json');
        const ipData = await ipRes.json();
        ipAddress = ipData.ip;
      } catch (ipErr) {
        console.warn('IP fetch failed, falling back: ', ipErr);
      }

      // 2. Perform mutation via server API
      const res = await fetch('/api/portal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'sign_contract', token, ip_addr: ipAddress }),
      });

      if (!res.ok) throw new Error('Signing failed');

      // Dispatch contract execution notification email to freelancer
      try {
        await fetch('/api/notifications', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'contract_signed',
            payload: {
              projectId: data.project.id,
              ipAddress
            }
          })
        });
      } catch (notifyErr) {
        console.warn('Contract signed email notification failed: ', notifyErr);
      }

      toast.success('Contract legally e-signed!');
      fetchPortalData();
    } catch (err) {
      console.error(err);
      toast.error('E-signature failed.');
    } finally {
      setSigning(false);
    }
  };

  const handleSubmitFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating < 1 || rating > 5) {
      toast.error('Please select a star rating first.');
      return;
    }

    setSubmittingFeedback(true);
    try {
      const res = await fetch('/api/portal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'submit_feedback',
          token,
          rating,
          feedback: feedbackText.trim(),
        }),
      });

      if (!res.ok) throw new Error('Feedback submission failed');

      toast.success('Thank you! Your feedback has been sent.');
      fetchPortalData();
    } catch (err) {
      console.error(err);
      toast.error('Failed to submit review.');
    } finally {
      setSubmittingFeedback(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-bg text-brand-text flex flex-col items-center justify-center gap-4">
        <svg className="animate-spin h-8 w-8 text-[#C8F04B]" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        <span className="text-xs uppercase font-mono tracking-widest text-brand-muted">Verifying portal token...</span>
      </div>
    );
  }

  if (!data || !data.project) {
    return (
      <div className="min-h-screen bg-brand-bg text-brand-text flex flex-col items-center justify-center p-6 text-center select-none">
        <span className="text-5xl font-mono text-brand-muted/30 mb-4">[ ? ]</span>
        <h1 className="text-2xl font-serif text-brand-text tracking-wide mb-2">Portal Access Invalid</h1>
        <p className="text-sm text-brand-muted max-w-[340px] font-sans leading-relaxed">
          The magic link token supplied is either corrupted, expired, or has been revoked by the workspace owner.
        </p>
      </div>
    );
  }

  const { project, milestones, files: projectFiles, comments, invoices, contract, logs } = data;

  const statusLabels = {
    brief: 'Briefing Phase',
    in_progress: 'In Development',
    review: 'Under Review',
    delivered: 'Completed',
  };

  const statusColors = {
    brief: 'bg-zinc-900 text-zinc-300 border-zinc-800',
    in_progress: 'bg-brand-accent/10 text-brand-accent border-brand-accent/20',
    review: 'bg-amber-950/20 text-amber-500 border-amber-900/30',
    delivered: 'bg-emerald-950/20 text-emerald-500 border-emerald-900/30',
  };

  return (
    <div className="min-h-screen bg-brand-bg text-brand-text font-sans selection:bg-brand-accent selection:text-black">
      
      {/* Portal Header */}
      <header className="border-b border-brand-border bg-brand-surface px-4 sm:px-6 py-5 select-none">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <Logo size="md" />
            <span className="text-[10px] uppercase font-mono tracking-widest font-bold text-brand-muted bg-brand-bg px-2 py-0.5 border border-brand-border">
              Secure Guest Portal
            </span>
          </div>

          <div className="flex items-center gap-4 text-xs font-sans text-brand-muted">
            <span>Freelancer: {project.users?.full_name || 'Active Service Workspace'}</span>
          </div>
        </div>
      </header>

      {/* Hero Welcome banner */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-10 flex flex-col gap-6 sm:gap-8">
        
        {/* Project Header Info */}
        <div className="bg-brand-surface border border-brand-border p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-[0_4px_20px_-12px_rgba(0,0,0,0.5)]">
          <div className="flex flex-col gap-1.5 max-w-lg">
            <span className="text-[10px] uppercase font-bold tracking-wider text-brand-muted font-mono">
              Delivery Portal
            </span>
            <h1 className="text-2xl sm:text-3xl font-serif text-brand-text tracking-tight">
              {project.title}
            </h1>
            <p className="text-xs text-brand-muted leading-relaxed">
              {project.description || 'Welcome to your project alignment space. Here you can review files, give feedback, track invoices, and sign legal terms.'}
            </p>
          </div>

          <div className="flex flex-col md:items-end gap-2 shrink-0">
            <div className={`px-3 py-1 border text-xs font-mono uppercase font-bold text-center ${statusColors[project.status as keyof typeof statusColors]}`}>
              {statusLabels[project.status as keyof typeof statusLabels]}
            </div>
            
            {project.deadline && (
              <span className="text-[10px] font-mono text-brand-muted uppercase mt-1">
                Target Deadline: {new Date(project.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
            )}
          </div>
        </div>

        {/* Rating & Feedback Section */}
        {(!project.client_rating) ? (
          <div className="bg-brand-surface border border-brand-border p-5 sm:p-6 flex flex-col gap-4 shadow-[0_4px_20px_-12px_rgba(0,0,0,0.5)]">
            <div className="flex flex-col gap-1">
              <span className="text-[10px] uppercase font-bold tracking-wider text-brand-muted font-mono">
                Feedback & Review
              </span>
              <h3 className="text-base font-serif text-brand-text">
                How was your experience working with {project.users?.full_name || 'your freelancer'}?
              </h3>
              <p className="text-xs text-brand-muted">
                Submit your review and rating to complete the project loop.
              </p>
            </div>

            <form onSubmit={handleSubmitFeedback} className="flex flex-col gap-4">
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoveredRating(star)}
                    onMouseLeave={() => setHoveredRating(0)}
                    className="p-1 text-zinc-700 hover:text-amber-400 transition-colors"
                  >
                    <Star
                      size={20}
                      className={
                        star <= (hoveredRating || rating)
                          ? 'text-[#F59E0B] fill-[#F59E0B]'
                          : 'text-zinc-700'
                      }
                    />
                  </button>
                ))}
              </div>

              <textarea
                placeholder="Write your review message (optional)..."
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
                rows={3}
                className="w-full bg-brand-bg border border-brand-border text-xs p-3 focus:outline-none focus:border-brand-accent transition-colors font-sans text-brand-text placeholder-brand-muted/40"
              />

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={submittingFeedback || rating === 0}
                  className="h-9 px-4 bg-brand-accent text-black font-bold text-[11px] uppercase tracking-wider hover:bg-[#b2d63f] disabled:opacity-40 select-none flex items-center justify-center gap-1.5"
                >
                  {submittingFeedback ? 'Submitting...' : 'Submit Feedback'}
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="bg-brand-surface border border-brand-border p-5 sm:p-6 flex flex-col gap-3 font-sans shadow-[0_4px_20px_-12px_rgba(0,0,0,0.5)]">
            <div className="flex items-center justify-between border-b border-brand-border/40 pb-2">
              <div className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-[10px] text-brand-accent font-mono">
                <CheckCircle size={12} />
                Project Review Completed
              </div>
              <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    size={12}
                    className={
                      star <= project.client_rating
                        ? 'text-[#F59E0B] fill-[#F59E0B]'
                        : 'text-zinc-700'
                    }
                  />
                ))}
              </div>
            </div>
            {project.client_feedback && (
              <p className="text-xs text-brand-muted leading-relaxed italic">
                "{project.client_feedback}"
              </p>
            )}
          </div>
        )}

        {/* Tab Selection */}
        <div className="flex border-b border-brand-border select-none overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0 font-mono">
          {[
            { id: 'files', name: 'Deliverables', icon: FileCheck },
            { id: 'feedback', name: 'Feedback', icon: MessageSquare },
            { id: 'invoice', name: 'Invoices', icon: FileText },
            { id: 'contract', name: 'Agreement', icon: ShieldCheck },
          ].map((tab) => {
            const Icon = tab.icon;
            const isTabActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-6 py-3 sm:py-3.5 text-[10px] sm:text-xs font-bold uppercase tracking-wider transition-all border-b-2 shrink-0 ${
                  isTabActive
                    ? 'border-[#C8F04B] text-[#C8F04B]'
                    : 'border-transparent text-brand-muted hover:text-brand-text'
                }`}
              >
                <Icon size={14} />
                {tab.name}
              </button>
            );
          })}
        </div>

        {/* Dynamic Tab Body */}
        <div className="bg-brand-surface border border-brand-border p-5 sm:p-8 min-h-[320px] sm:min-h-[380px] shadow-[0_4px_20px_-12px_rgba(0,0,0,0.5)]">
          
          {/* FILES TAB */}
          {activeTab === 'files' && (
            <div className="flex flex-col gap-6 animate-fade-in">
              <div className="flex flex-col gap-1 select-none">
                <h3 className="text-lg font-serif text-brand-text">Project Deliverables</h3>
                <p className="text-xs text-brand-muted">
                  Download work assets, source archives, or approve versions to finalize development.
                </p>
              </div>

              {projectFiles.length === 0 ? (
                <div className="text-center py-12 text-brand-muted text-xs font-sans border border-dashed border-brand-border bg-brand-bg/10">
                  No files have been delivered yet. Awaiting freelancer action.
                </div>
              ) : (
                <div className="flex flex-col border border-brand-border divide-y divide-brand-border bg-brand-bg/20">
                  {projectFiles.map((file: any) => (
                    <div key={file.id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-brand-surface border border-brand-border text-brand-text">
                          <FileText size={18} />
                        </div>
                        
                        <div className="flex flex-col min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold truncate text-brand-text">{file.name}</span>
                            <span className="text-[9px] font-mono font-bold bg-brand-surface border border-brand-border text-[#C8F04B] px-1.5 py-0.5">
                              v{file.version}
                            </span>
                          </div>
                          
                          <span className="text-[10px] text-brand-muted font-mono mt-0.5 uppercase">
                            Delivered: {new Date(file.uploaded_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      {/* Download & Approve Actions */}
                      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                        {file.approved_by_client ? (
                          <div className="flex items-center gap-1.5 text-xs text-emerald-500 font-bold uppercase font-mono tracking-wider px-3 py-1 bg-emerald-950/20 border border-emerald-900/30">
                            <Check size={12} />
                            Approved
                          </div>
                        ) : (
                          <button
                            onClick={() => handleApproveFile(file.id)}
                            disabled={approvingFile === file.id}
                            className="h-8 px-3 text-[10px] font-bold uppercase tracking-wider border border-brand-border hover:border-brand-accent hover:text-black hover:bg-brand-accent bg-brand-surface text-brand-text transition-colors"
                          >
                            {approvingFile === file.id ? 'Processing...' : 'Approve'}
                          </button>
                        )}

                        <button
                          onClick={() => handleDownloadFile(file)}
                          className="p-2 border border-brand-border hover:border-brand-accent hover:bg-brand-bg text-brand-text bg-brand-surface transition-colors"
                          title="Download asset"
                        >
                          <Download size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* FEEDBACK HUB TAB */}
          {activeTab === 'feedback' && (
            <div className="flex flex-col gap-5 animate-fade-in">
              <div className="flex flex-col gap-1 select-none">
                <h3 className="text-lg font-serif text-brand-text">Alignment Correspondence</h3>
                <p className="text-xs text-brand-muted">
                  Leave instructions, feedback or questions for the freelancer. Discussions are private.
                </p>
              </div>

              {/* Message box */}
              <div className="border border-brand-border bg-brand-bg/40 p-4 h-64 sm:h-80 overflow-y-auto flex flex-col gap-4">
                {comments.length === 0 ? (
                  <div className="flex-1 flex items-center justify-center text-brand-muted text-xs font-sans py-12">
                    No comments found. Drop a line below.
                  </div>
                ) : (
                  comments.map((c: any) => {
                    const isSelf = c.sender === 'client';
                    return (
                      <div
                        key={c.id}
                        className={`flex flex-col max-w-[85%] ${
                          isSelf ? 'self-end items-end' : 'self-start items-start'
                        }`}
                      >
                        <span className="text-[9px] uppercase font-mono text-brand-muted mb-1 font-bold">
                          {c.sender === 'client' ? project.client_name : (project.users?.full_name || 'Freelancer')} •{' '}
                          {new Date(c.created_at).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                        </span>
                        
                        <div
                          className={`px-4 py-2.5 text-xs font-sans leading-relaxed border ${
                            isSelf
                              ? 'bg-brand-accent/10 border-brand-accent/30 text-brand-text'
                              : 'bg-brand-surface border-brand-border text-brand-text'
                          }`}
                        >
                          {c.body}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Input Form */}
              <form onSubmit={handleSendComment} className="flex gap-2 sm:gap-3">
                <input
                  type="text"
                  placeholder={`Reply to ${project.users?.full_name || 'freelancer'}...`}
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  disabled={submittingComment}
                  className="flex-1 border border-brand-border bg-brand-bg text-xs px-3 sm:px-4 py-2.5 focus:outline-none focus:border-brand-accent text-brand-text placeholder-brand-muted/40"
                />
                
                <button
                  type="submit"
                  disabled={submittingComment || !newComment.trim()}
                  className="h-10 px-4 bg-brand-accent hover:bg-[#b2d63f] text-black font-bold text-xs uppercase tracking-wider disabled:opacity-40 select-none flex items-center justify-center shrink-0"
                >
                  <Send size={12} />
                </button>
              </form>
            </div>
          )}

          {/* INVOICE TAB */}
          {activeTab === 'invoice' && (
            <div className="flex flex-col gap-6 animate-fade-in">
              <div className="flex flex-col gap-1 select-none">
                <h3 className="text-lg font-serif text-brand-text">Invoices & Payments</h3>
                <p className="text-xs text-brand-muted">
                  Review invoices and follow the payment instructions provided by your freelancer.
                </p>
              </div>

              {invoices.length === 0 ? (
                <div className="text-center py-12 text-brand-muted text-xs font-sans border border-dashed border-brand-border bg-brand-bg/10">
                  No invoices have been issued yet.
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {invoices.map((inv: any) => (
                    <div key={inv.id} className="border border-brand-border bg-brand-surface shadow-[0_4px_20px_-12px_rgba(0,0,0,0.5)]">
                      <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-brand-bg border border-brand-border text-brand-text">
                            <Receipt size={16} className={inv.status === 'paid' ? 'text-emerald-500' : 'text-[#F59E0B]'} />
                          </div>
                          
                          <div className="flex flex-col min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-mono font-semibold text-brand-text">
                                INV-{inv.id.substring(0, 6).toUpperCase()}
                              </span>
                              
                              <Badge variant={inv.status === 'paid' ? 'green' : 'amber'}>
                                {inv.status}
                              </Badge>
                            </div>
                            
                            <span className="text-[10px] text-brand-muted font-mono mt-0.5 uppercase">
                              {inv.due_date ? `Due: ${new Date(inv.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}` : 'Payment due upon receipt'}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-6 shrink-0 justify-between sm:justify-end">
                          <span className="text-sm font-mono font-bold text-brand-text">
                            ${Number(inv.amount).toFixed(2)}
                          </span>
                          
                          {inv.status === 'paid' ? (
                            <button
                              onClick={() => setReceiptInvoice(inv)}
                              className="h-8 px-3 text-[10px] font-bold uppercase tracking-wider bg-brand-bg border border-brand-border hover:border-brand-accent hover:text-[#C8F04B] text-brand-text font-mono transition-colors"
                            >
                              [View Receipt]
                            </button>
                          ) : (
                            <div className="flex items-center gap-1.5 text-[9px] font-bold text-[#F59E0B] uppercase font-mono tracking-wider bg-amber-950/10 border border-amber-900/20 px-2 py-0.5">
                              Pending
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Payment Instructions */}
                      {inv.status !== 'paid' && inv.notes && (
                        <div className="border-t border-brand-border bg-brand-bg/40 p-4 sm:p-5">
                          <span className="text-[10px] uppercase font-bold tracking-wider text-brand-muted mb-2 block font-mono">
                            Payment Details & Instructions
                          </span>
                          <div className="text-xs text-brand-text font-sans leading-relaxed whitespace-pre-line bg-brand-surface p-3 border border-brand-border/60">
                            {inv.notes}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* CONTRACT TAB */}
          {activeTab === 'contract' && (
            <div className="flex flex-col gap-6 animate-fade-in">
              <div className="flex flex-col gap-1 select-none">
                <h3 className="text-lg font-serif text-brand-text">Legal Scope & Agreement</h3>
                <p className="text-xs text-brand-muted">
                  Review the terms of engagement and execute a digital signature block to authorize development.
                </p>
              </div>

              {contract ? (
                <div className="flex flex-col gap-6">
                  {/* High-Contrast Key Terms Summary Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 select-none">
                    <div className="bg-brand-bg border border-brand-border p-4 flex flex-col gap-1">
                      <span className="text-[9px] font-mono text-brand-accent uppercase font-bold tracking-wider">
                        01 / Primary Scope
                      </span>
                      <span className="text-xs font-bold text-brand-text">Service Scope</span>
                      <p className="text-[10px] text-brand-muted leading-relaxed mt-1">
                        Alignment and development of "{project.title}" requirements, source template design, and frontend code delivery.
                      </p>
                    </div>

                    <div className="bg-brand-bg border border-brand-border p-4 flex flex-col gap-1">
                      <span className="text-[9px] font-mono text-brand-accent uppercase font-bold tracking-wider">
                        02 / Deliverables
                      </span>
                      <span className="text-xs font-bold text-brand-text">Assets Scheduled</span>
                      <p className="text-[10px] text-brand-muted leading-relaxed mt-1 truncate">
                        {projectFiles.length > 0 
                          ? projectFiles.map((f: any) => f.name).join(', ')
                          : 'Source materials, high-fidelity mockups, and deployment archives.'}
                      </p>
                    </div>

                    <div className="bg-brand-bg border border-brand-border p-4 flex flex-col gap-1">
                      <span className="text-[9px] font-mono text-brand-accent uppercase font-bold tracking-wider">
                        03 / Payment Schedule
                      </span>
                      <span className="text-xs font-bold text-brand-text">Fee Breakdown</span>
                      <p className="text-[10px] text-brand-muted leading-relaxed mt-1">
                        Milestone progress payments totaling ${invoices.reduce((sum: number, i: any) => sum + Number(i.amount), 0).toFixed(2)} USD.
                      </p>
                    </div>
                  </div>

                  {/* Contract Scroll Content Container (Collapsible) */}
                  <div className="border border-brand-border bg-brand-surface relative flex flex-col">
                    <div className="p-3 border-b border-brand-border/40 select-none flex justify-between items-center bg-brand-bg/25">
                      <span className="text-[9px] font-mono uppercase text-brand-muted font-bold">
                        Official Legal Contract Draft
                      </span>
                      <span className="text-[9px] font-mono text-brand-muted uppercase">
                        Legal Document Agreement
                      </span>
                    </div>

                    <div className={`p-5 sm:p-6 transition-all duration-300 ${
                      isContractExpanded 
                        ? 'max-h-[500px] overflow-y-auto' 
                        : 'max-h-28 overflow-hidden select-none relative'
                    }`}>
                      <div className="text-[11px] leading-relaxed font-sans prose max-w-none text-brand-text whitespace-pre-line">
                        {contract.body}
                      </div>

                      {!isContractExpanded && (
                        <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-brand-surface to-transparent pointer-events-none" />
                      )}
                    </div>

                    {/* Expand/Collapse Trigger */}
                    <div className="border-t border-brand-border/40 p-2.5 flex justify-center bg-brand-bg/15">
                      <button
                        onClick={() => setIsContractExpanded(!isContractExpanded)}
                        className="flex items-center gap-1 text-[10px] font-mono font-bold text-[#C8F04B] uppercase hover:underline"
                      >
                        {isContractExpanded ? (
                          <>
                            <ChevronUp size={12} />
                            [Hide Full legal Agreement]
                          </>
                        ) : (
                          <>
                            <ChevronDown size={12} />
                            [Expand Full legal Agreement]
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Sign Form Container */}
                  <div className="border border-brand-border p-4 sm:p-5 bg-brand-bg/20 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 select-none">
                    {contract.client_signed ? (
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-emerald-950/20 border border-emerald-900/30 text-emerald-500">
                          <CheckCircle size={20} />
                        </div>
                        
                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-emerald-500 uppercase tracking-wide font-mono">
                            Contract Executed Legally
                          </span>
                          <span className="text-[10px] text-brand-muted font-mono mt-0.5 uppercase">
                            SIGNED VIA IP: {contract.ip_address} • TIMESTAMP: {new Date(contract.signed_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <>
                        <label className="flex items-start gap-3 cursor-pointer max-w-lg">
                          <input
                            type="checkbox"
                            checked={signingChecked}
                            onChange={(e) => setSigningChecked(e.target.checked)}
                            className="mt-0.5 border-brand-border text-black focus:ring-0 focus:ring-offset-0 focus:outline-none rounded-none bg-brand-surface"
                          />
                          <span className="text-[11px] text-brand-muted leading-relaxed font-sans">
                            I accept the details, milestone specifications, deliverables, and payment obligations outlined in this services agreement.
                          </span>
                        </label>

                        <button
                          onClick={handleSignContract}
                          disabled={signing || !signingChecked}
                          className="h-10 px-5 bg-[#C8F04B] text-black font-bold text-xs uppercase tracking-wider hover:bg-[#b2d63f] disabled:opacity-40 flex items-center justify-center shrink-0"
                        >
                          {signing ? 'Signing...' : 'E-Sign Agreement'}
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-brand-muted text-xs font-sans border border-dashed border-brand-border bg-brand-bg/10">
                  No contract draft has been prepared for review yet.
                </div>
              )}
            </div>
          )}

        </div>

        {/* Project Activity Timeline */}
        <div className="bg-brand-surface border border-brand-border p-5 sm:p-8 shadow-[0_4px_20px_-12px_rgba(0,0,0,0.5)]">
          <Timeline
            events={logs || []}
            freelancerName={project.users?.full_name || 'Freelancer'}
            clientName={project.client_name || 'Client'}
          />
        </div>
      </main>

      {/* Luxury Payment Receipt Modal */}
      {receiptInvoice && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-brand-surface border border-brand-border w-full max-w-md p-6 relative flex flex-col gap-4 font-mono text-brand-text shadow-[0_10px_50px_rgba(0,0,0,0.8)]">
            {/* Close Button */}
            <button 
              onClick={() => setReceiptInvoice(null)}
              className="absolute top-4 right-4 text-brand-muted hover:text-brand-text transition-colors"
            >
              <X size={16} />
            </button>

            {/* Receipt Header */}
            <div className="flex flex-col items-center text-center gap-1.5 pb-4 border-b border-brand-border/40 select-none">
              <Logo size="sm" />
              <span className="text-[10px] uppercase tracking-widest text-brand-muted mt-2">Official Payment Receipt</span>
              <div className="mt-2 px-3 py-1 bg-emerald-950/20 text-emerald-500 border border-emerald-900/30 text-xs font-bold uppercase tracking-wider">
                ✓ PAID IN FULL
              </div>
            </div>

            {/* Transaction metadata */}
            <div className="flex flex-col gap-2 text-xs border-b border-brand-border/40 pb-4">
              <div className="flex justify-between">
                <span className="text-brand-muted">INVOICE:</span>
                <span className="font-bold">INV-{receiptInvoice.id.substring(0, 6).toUpperCase()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-brand-muted">PAYER:</span>
                <span className="font-bold">{project.client_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-brand-muted">RECIPIENT:</span>
                <span className="font-bold">{project.users?.full_name || 'Service Provider'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-brand-muted">DATE CONFIRMED:</span>
                <span className="font-bold">{receiptInvoice.updated_at ? new Date(receiptInvoice.updated_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-brand-muted">METHOD:</span>
                <span className="font-bold uppercase">Digital Wallet Transfer</span>
              </div>
            </div>

            {/* Line items list */}
            <div className="flex flex-col gap-2 text-xs">
              <span className="text-[9px] uppercase font-bold tracking-wider text-brand-muted mb-1 block">Line Items</span>
              <div className="flex justify-between items-center bg-brand-bg/50 p-2 border border-brand-border/60">
                <div className="flex flex-col">
                  <span className="font-bold">{project.title}</span>
                  <span className="text-[9px] text-brand-muted uppercase">Milestone Progress Delivery</span>
                </div>
                <span className="font-bold">${Number(receiptInvoice.amount).toFixed(2)}</span>
              </div>
            </div>

            {/* Dashed line */}
            <div className="border-t border-dashed border-brand-border/60 my-2" />

            {/* Totals */}
            <div className="flex justify-between items-center text-sm font-bold">
              <span>TOTAL SETTLED:</span>
              <span className="text-[#C8F04B] font-mono font-bold">${Number(receiptInvoice.amount).toFixed(2)}</span>
            </div>

            {/* Actions footer */}
            <div className="flex gap-3 mt-2 select-none">
              <button
                onClick={() => window.print()}
                className="flex-1 h-9 border border-brand-border hover:border-brand-accent hover:text-[#C8F04B] text-brand-text bg-brand-surface font-mono uppercase tracking-wider text-[10px] font-bold transition-colors"
              >
                [Print Receipt]
              </button>
              <button
                onClick={() => setReceiptInvoice(null)}
                className="flex-1 h-9 bg-brand-accent text-black hover:bg-[#b2d63f] font-mono uppercase tracking-wider text-[10px] font-bold transition-colors"
              >
                Close View
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
