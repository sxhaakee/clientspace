/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, react-hooks/exhaustive-deps */
'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { CreditCard, Check, Sparkles, ShieldCheck, CheckCircle, Flame, Star, Zap } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { toast } from 'react-hot-toast';

export const dynamic = 'force-dynamic';

function BillingPageContent() {
  const [profile, setProfile] = useState<any>(null);
  const [projectCount, setProjectCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [upgrading, setUpgrading] = useState(false);
  const supabase = createClient();
  const searchParams = useSearchParams();

  const fetchBillingContext = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profileData } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();
      setProfile(profileData);

      const { count } = await supabase
        .from('projects')
        .select('*', { count: 'exact', head: true });
      setProjectCount(count || 0);

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBillingContext();
  }, []);

  // Handle checkout success redirect
  useEffect(() => {
    if (searchParams.get('success') === 'true') {
      toast.success('Payment successful! Your Pro upgrade is being activated...', { id: 'checkout-success' });
      // Refresh billing context to reflect new plan
      setTimeout(() => fetchBillingContext(), 2000);
    }
  }, [searchParams]);

  const handleUpgrade = async () => {
    if (!profile) return;
    setUpgrading(true);

    try {
      toast.loading('Creating secure checkout...', { id: 'billing' });

      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: profile.email, userId: profile.id }),
      });

      const data = await res.json();

      if (data.testMode) {
        toast('LemonSqueezy store not configured yet. Use sandbox upgrade for now.', { id: 'billing', icon: '⚠️' });
        return;
      }

      if (data.checkoutUrl) {
        toast.success('Redirecting to secure checkout...', { id: 'billing' });
        window.open(data.checkoutUrl, '_blank');
      } else {
        toast.error('Could not generate checkout link.', { id: 'billing' });
      }
    } catch (err) {
      toast.error('Checkout failed. Please try again.', { id: 'billing' });
    } finally {
      setUpgrading(false);
    }
  };

  const handleSandboxUpgrade = async () => {
    if (!profile) return;
    setUpgrading(true);
    toast.loading('Activating sandbox Pro upgrade...', { id: 'billing' });

    try {
      const { error } = await supabase
        .from('users')
        .update({ plan: 'pro' })
        .eq('id', profile.id);

      if (error) throw error;

      toast.success('Sandbox Pro upgrade active!', { id: 'billing' });
      
      try {
        await supabase.from('logs').insert({
          event: 'subscription_created',
          user_id: profile.id,
          meta: { mock: true }
        });
      } catch { /* non-critical */ }

      fetchBillingContext();
    } catch (err: any) {
      toast.error(err.message || 'Upgrade failed.', { id: 'billing' });
    } finally {
      setUpgrading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[50vh] gap-4">
        <svg className="animate-spin h-6 w-6 text-[#C8F04B]" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        <span className="text-xs uppercase font-mono tracking-widest text-brand-muted">Fetching billing profile...</span>
      </div>
    );
  }

  const isPro = profile?.plan === 'pro' || profile?.plan === 'agency';

  return (
    <div className="flex flex-col gap-8 animate-fade-in select-none">
      
      {/* Header */}
      <div className="border-b border-brand-border pb-6">
        <div className="flex items-center gap-1.5 mb-1 text-brand-muted font-mono text-[9px] uppercase tracking-widest">
          <CreditCard size={12} className="text-[#C8F04B]" />
          <span>Billing Node Control</span>
        </div>
        <h1 className="text-3xl font-serif text-brand-text tracking-tight mt-1">
          Subscription & Plan
        </h1>
        <p className="text-xs text-brand-muted font-sans">
          Manage your ClientSpace subscription package. Upgrade to unlock full AI potential.
        </p>
      </div>

      {/* Main Billing Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Current Plan Overview (2/3 width) */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <div className="relative bg-brand-surface border border-brand-border p-8 flex flex-col gap-8 shadow-[0_4px_20px_-12px_rgba(0,0,0,0.5)]">
            
            {/* Tech line */}
            <div className="absolute top-0 right-0 w-8 h-[1px] bg-[#C8F04B]" />
            <div className="absolute top-0 right-0 w-[1px] h-8 bg-[#C8F04B]" />

            {/* Upper row: Plan status */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-brand-border pb-5">
              <div className="flex flex-col gap-0.5">
                <span className="text-[9px] uppercase font-bold tracking-widest text-brand-muted font-mono">Active Package</span>
                <span className="text-xl font-serif text-brand-text tracking-wide mt-0.5 flex items-center gap-2">
                  ClientSpace {isPro ? 'Pro Workspace' : 'Free Sandbox'}
                  {isPro && <Sparkles size={16} className="text-brand-accent fill-brand-accent/20" />}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <Badge variant={isPro ? 'lime' : 'gray'} className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5">
                  {profile?.plan || 'free'}
                </Badge>
                {isPro && (
                  <div className="flex items-center gap-1 text-[9px] text-[#C8F04B] font-mono uppercase bg-black px-2.5 py-1 font-bold tracking-widest">
                    <CheckCircle size={10} className="fill-[#C8F04B] text-black" />
                    Verified
                  </div>
                )}
              </div>
            </div>

            {/* Middle row: resource metrics */}
            <div className="grid grid-cols-2 gap-8 py-2">
              <div className="flex flex-col gap-1 border-r border-brand-border pr-4">
                <span className="text-[9px] uppercase font-bold tracking-widest text-brand-muted font-mono">Registered Projects</span>
                <span className="text-3xl font-mono font-bold text-brand-text mt-1">{projectCount}</span>
                <span className="text-[10px] text-brand-muted font-sans mt-0.5">
                  {isPro ? 'All features + AI drafting' : 'All core features'}
                </span>
              </div>

              <div className="flex flex-col gap-1">
                <span className="text-[9px] uppercase font-bold tracking-widest text-brand-muted font-mono">Price Rate</span>
                <span className="text-3xl font-mono font-bold text-brand-text mt-1">
                  {isPro ? '$12 / mo' : '$0 / free'}
                </span>
                <span className="text-[10px] text-brand-muted font-sans mt-0.5">
                  {isPro ? 'Billed via LemonSqueezy' : 'Free developer testing'}
                </span>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="border-t border-brand-border pt-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <div className="flex items-center gap-2 text-[9px] text-brand-muted font-mono uppercase tracking-wider">
                <ShieldCheck size={13} className="text-brand-text" />
                <span>SECURED WITH LEMON SQUEEZY</span>
              </div>

              {!isPro && (
                <div className="flex flex-wrap gap-3">
                  <Button
                    variant="outline"
                    className="text-[10px] h-9 font-bold tracking-widest uppercase hover:bg-black hover:text-[#C8F04B] hover:border-black"
                    isLoading={upgrading}
                    onClick={handleSandboxUpgrade}
                  >
                    Sandbox Bypass
                  </Button>
                  
                  <Button
                    variant="secondary"
                    className="text-[10px] h-9 font-bold tracking-widest uppercase flex items-center gap-2"
                    isLoading={upgrading}
                    onClick={handleUpgrade}
                  >
                    <Zap size={11} className="fill-current" />
                    Upgrade to Pro ($12)
                  </Button>
                </div>
              )}
            </div>

          </div>
        </div>

        {/* Feature Comparison Sidebar (1/3 width) */}
        <div className="flex flex-col gap-6">
          <div className="tilt-card bg-brand-surface border border-brand-border p-6 flex flex-col gap-5 shadow-[0_4px_20px_-12px_rgba(0,0,0,0.5)]">
            <span className="text-[9px] uppercase font-bold tracking-widest text-brand-muted border-b border-brand-border pb-3 font-mono flex items-center gap-1.5">
              <Star size={12} className="text-[#C8F04B] fill-[#C8F04B]" />
              Pro Features Included
            </span>

            <div className="flex flex-col gap-4">
              {[
                'Unlimited client workspace portals',
                'Professional invoicing & live payment tracking',
                'File version history & live uploads',
                'AI contract proposal drafted on-the-fly',
                'AI status summary draft writer',
                'Priority server resources & email support',
              ].map((feat, index) => (
                <div key={index} className="flex items-start gap-2.5 text-xs text-brand-text font-sans">
                  <Check size={14} className="text-[#C8F04B] shrink-0 mt-0.5 bg-[#C8F04B]/10 border border-[#C8F04B]/20 p-0.5 rounded-none" />
                  <span>{feat}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

export default function BillingPage() {
  return (
    <Suspense fallback={
      <div className="flex-1 flex flex-col items-center justify-center min-h-[50vh] gap-4">
        <svg className="animate-spin h-6 w-6 text-[#C8F04B]" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        <span className="text-xs uppercase font-mono tracking-widest text-brand-muted">Loading Billing Console...</span>
      </div>
    }>
      <BillingPageContent />
    </Suspense>
  );
}
