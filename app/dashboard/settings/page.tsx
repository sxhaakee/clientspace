/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, react-hooks/exhaustive-deps */
'use client';

import React, { useState, useEffect } from 'react';
import { Settings, User, Database, ShieldAlert, Sparkles } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { toast } from 'react-hot-toast';

export const dynamic = 'force-dynamic';

export default function SettingsPage() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setEmail(user.email || '');
          const { data: profileData } = await supabase
            .from('users')
            .select('*')
            .eq('id', user.id)
            .single();
          
          if (profileData) {
            setProfile(profileData);
            setFullName(profileData.full_name || '');
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      toast.error('Full name is required');
      return;
    }

    setSaving(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Unauthenticated user context.');

      // 1. Update public.users table
      const { error: dbError } = await supabase
        .from('users')
        .update({ full_name: fullName.trim() })
        .eq('id', user.id);

      if (dbError) throw dbError;

      // 2. Update auth.users metadata
      const { error: authError } = await supabase.auth.updateUser({
        data: { full_name: fullName.trim() }
      });

      if (authError) throw authError;

      // 3. Log event
      await supabase.from('logs').insert({
        event: 'user_profile_updated',
        user_id: user.id,
        meta: { name: fullName.trim() }
      });

      toast.success('Professional profile updated successfully!');
    } catch (err: any) {
      toast.error(err.message || 'Failed to save changes.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[50vh] gap-4">
        <svg className="animate-spin h-6 w-6 text-[#C8F04B]" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        <span className="text-xs uppercase font-mono tracking-widest text-brand-muted">Loading settings console...</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 animate-fade-in select-none">
      
      {/* Header */}
      <div className="border-b border-brand-border pb-6">
        <div className="flex items-center gap-1.5 mb-1 text-brand-muted font-mono text-[9px] uppercase tracking-widest">
          <Settings size={12} className="text-[#C8F04B]" />
          <span>Account Parameters</span>
        </div>
        <h1 className="text-3xl font-serif text-brand-text tracking-tight mt-1">
          Workspace Settings
        </h1>
        <p className="text-xs text-brand-muted font-sans">
          Configure your professional freelancing name, view credentials, and trace system parameters.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Profile Settings Card (2/3 width) */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <div className="relative bg-brand-surface border border-brand-border p-8 shadow-[0_4px_20px_-12px_rgba(0,0,0,0.5)]">
            
            {/* Tech line */}
            <div className="absolute top-0 right-0 w-8 h-[1px] bg-[#C8F04B]" />
            <div className="absolute top-0 right-0 w-[1px] h-8 bg-[#C8F04B]" />

            <h3 className="text-[10px] uppercase font-bold tracking-widest text-brand-muted border-b border-brand-border pb-3 mb-6 flex items-center gap-2 font-mono">
              <User size={13} className="text-brand-text" />
              Professional Profile
            </h3>

            <form onSubmit={handleSaveProfile} className="flex flex-col gap-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="Freelancer Full Name"
                  placeholder="e.g. Mohammed Shakeeb"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  className="focus:border-[#C8F04B] transition-colors"
                />

                <Input
                  label="Registered Email Address"
                  type="email"
                  value={email}
                  disabled
                  title="To change your email, contact system support"
                  className="opacity-60 cursor-not-allowed select-none focus:border-brand-border"
                />
              </div>

              <div className="border-t border-brand-border pt-6 flex justify-end">
                <Button 
                  type="submit" 
                  isLoading={saving}
                  variant="secondary"
                  className="py-2.5 px-6 flex items-center gap-2"
                >
                  <Sparkles size={11} />
                  Save Changes
                </Button>
              </div>
            </form>
          </div>
        </div>

        {/* Integration Status Sidebar (1/3 width) */}
        <div className="flex flex-col gap-6">
          <div className="bg-brand-surface border border-brand-border p-6 flex flex-col gap-5 shadow-[0_4px_20px_-12px_rgba(0,0,0,0.5)]">
            <span className="text-[10px] uppercase font-bold tracking-widest text-brand-muted border-b border-brand-border pb-3 flex items-center gap-1.5 font-mono">
              <Database size={13} className="text-brand-text" />
              Core Integrations
            </span>

            <div className="flex flex-col gap-4 font-sans text-xs">
              
              {/* Supabase */}
              <div className="flex items-center justify-between border-b border-brand-border/40 pb-2">
                <span className="text-brand-text">Supabase Postgres</span>
                <div className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-emerald-500" />
                  <span className="text-[9px] font-mono text-emerald-500 uppercase font-bold tracking-wider">Active</span>
                </div>
              </div>

              {/* Lemon Squeezy */}
              <div className="flex items-center justify-between border-b border-brand-border/40 pb-2">
                <span className="text-brand-text">Lemon Squeezy Webhooks</span>
                <div className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-emerald-500" />
                  <span className="text-[9px] font-mono text-emerald-500 uppercase font-bold tracking-wider">Active</span>
                </div>
              </div>

              {/* Mistral AI */}
              <div className="flex items-center justify-between border-b border-brand-border/40 pb-2">
                <span className="text-brand-text">Mistral Large AI</span>
                <div className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-[#C8F04B]" />
                  <span className="text-[9px] font-mono text-brand-accent uppercase font-bold tracking-wider">Ready</span>
                </div>
              </div>

              {/* Resend */}
              <div className="flex items-center justify-between">
                <span className="text-brand-text">Resend SMTP Gateway</span>
                <div className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-emerald-500" />
                  <span className="text-[9px] font-mono text-emerald-500 uppercase font-bold tracking-wider">Ready</span>
                </div>
              </div>

            </div>

            {/* Note on production keys */}
            <div className="mt-2 bg-brand-bg border border-brand-border p-3 flex gap-2">
              <ShieldAlert size={16} className="text-brand-text shrink-0 mt-0.5" />
              <p className="text-[9px] text-brand-muted leading-relaxed font-sans font-light">
                Secure integration values are loaded environment-wide from your serverless `.env.local` configs. Never expose role keys client-side.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
