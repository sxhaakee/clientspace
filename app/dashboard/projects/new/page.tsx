'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Plus, Sparkles, Send, Target, Calendar } from 'lucide-react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/Button';
import { Input, Textarea } from '@/components/ui/Input';
import { toast } from 'react-hot-toast';

export const dynamic = 'force-dynamic';

export default function NewProjectPage() {
  const [title, setTitle] = useState('');
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [description, setDescription] = useState('');
  const [deadline, setDeadline] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !clientName || !clientEmail) {
      toast.error('Project Title, Client Name, and Client Email are required');
      return;
    }

    setIsLoading(true);

    try {
      // Get current authenticated user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) throw new Error('Unauthenticated user. Please log in.');

      // Insert new project
      const { data: newProj, error: insertError } = await supabase
        .from('projects')
        .insert({
          user_id: user.id,
          title,
          client_name: clientName,
          client_email: clientEmail,
          description: description || null,
          deadline: deadline || null,
          status: 'brief',
        })
        .select()
        .single();

      if (insertError) throw insertError;

      // Automatically create a blank contract draft for this project
      const { error: contractError } = await supabase
        .from('contracts')
        .insert({
          project_id: newProj.id,
          body: `## Services Agreement\n\nThis agreement is made between **${user.user_metadata?.full_name || 'Freelancer'}** (the "Service Provider") and **${clientName}** (the "Client").\n\n### 1. Scope of Work\nThe Service Provider agrees to deliver the project "**${title}**" as detailed in the project brief:\n\n*${description || 'No description provided.'}*\n\n### 2. Fees & Payment\nPayment will be structured according to project milestones as agreed upon in the dashboard. Outstanding balances must be paid within the timeline specified in individual invoices.\n\n### 3. Acceptance\nBy signing below, the Client agrees to the terms and conditions outlined in this agreement.`,
        });

      if (contractError) {
        console.error('Error creating contract: ', contractError);
      }

      // Log the event
      await supabase.from('logs').insert({
        event: 'project_created',
        user_id: user.id,
        project_id: newProj.id,
        meta: { title, client_name: clientName },
      });

      toast.success('Workspace initialized successfully!');
      router.push(`/dashboard/projects/${newProj.id}`);
      router.refresh();
    } catch (err: unknown) {
      console.error(err);
      toast.error(err instanceof Error ? err.message : 'Failed to initialize project.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-8 animate-fade-in select-none">
      
      {/* Navigation Header */}
      <div className="flex items-center gap-4 border-b border-brand-border pb-6 select-none">
        <Link
          href="/dashboard"
          className="p-2 border border-brand-border text-brand-muted hover:text-brand-text hover:border-brand-text bg-brand-surface transition-colors"
        >
          <ArrowLeft size={14} />
        </Link>
        <div className="flex flex-col gap-0.5">
          <span className="text-[9px] uppercase font-bold tracking-widest text-brand-muted font-mono">
            Initialize Space Node
          </span>
          <h1 className="text-2xl font-serif text-brand-text tracking-tight">
            New Project Workspace
          </h1>
        </div>
      </div>

      {/* Main Creation Card */}
      <div className="relative max-w-2xl bg-brand-surface border border-brand-border p-8 md:p-10 shadow-[0_4px_20px_-12px_rgba(0,0,0,0.5)]">
        
        {/* Tech decorative corner line */}
        <div className="absolute top-0 right-0 w-8 h-[1px] bg-[#C8F04B]" />
        <div className="absolute top-0 right-0 w-[1px] h-8 bg-[#C8F04B]" />

        <div className="inline-flex items-center gap-1.5 px-3 py-1 mb-6 bg-[#C8F04B]/10 border border-[#C8F04B]/30">
          <Sparkles size={11} className="text-brand-text" />
          <span className="text-[9px] uppercase font-bold tracking-[0.15em] text-brand-text">Setup Workspace & Portal</span>
        </div>

        <form onSubmit={handleCreateProject} className="flex flex-col gap-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <Input
                label="Project Title"
                placeholder="e.g. Meridian E-Commerce Redesign"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="focus:border-[#C8F04B] transition-colors"
              />
            </div>

            <Input
              label="Client Name"
              placeholder="e.g. Mohammed Shakeeb"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              required
              className="focus:border-[#C8F04B] transition-colors"
            />

            <Input
              label="Client Email"
              type="email"
              placeholder="client@company.com"
              value={clientEmail}
              onChange={(e) => setClientEmail(e.target.value)}
              required
              className="focus:border-[#C8F04B] transition-colors"
            />

            <div className="md:col-span-2">
              <Input
                label="Project Deadline"
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="focus:border-[#C8F04B] transition-colors"
              />
            </div>
          </div>

          <Textarea
            label="Project Description / Brief Scope"
            placeholder="Outline the main objectives, milestones, deliverables, and timelines..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={5}
            className="focus:border-[#C8F04B] transition-colors"
          />

          <div className="border-t border-brand-border pt-6 flex justify-end gap-3 select-none">
            <Link href="/dashboard">
              <Button variant="outline" type="button" className="text-[10px] font-bold tracking-widest uppercase hover:bg-black hover:text-[#C8F04B] hover:border-black">
                Cancel
              </Button>
            </Link>
            <Button 
              type="submit" 
              isLoading={isLoading} 
              variant="secondary"
              className="font-bold tracking-widest text-[10px] uppercase transition-all flex items-center gap-2"
            >
              <Plus size={13} strokeWidth={2.5} />
              Initialize Workspace
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
