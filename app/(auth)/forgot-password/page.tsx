'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Logo } from '@/components/ui/Logo';
import { toast } from 'react-hot-toast';
import { ArrowLeft, Mail, ArrowRight, CheckCircle } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error('Email is required');
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`,
      });

      if (error) throw error;

      setIsSent(true);
      toast.success('Password reset link sent! Check your inbox.');
    } catch (err: unknown) {
      console.error(err);
      toast.error(err instanceof Error ? err.message : 'Failed to send reset link.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="relative min-h-screen flex items-center justify-center bg-[#FAFAF8] text-[#18181B] px-4 py-12 overflow-hidden selection:bg-[#C8F04B] selection:text-[#18181B]">
      
      {/* Premium Tech Grid Background */}
      <div 
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(to right, #18181B 1px, transparent 1px),
            linear-gradient(to bottom, #18181B 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
        }}
      />

      {/* Floating Animated Orbs */}
      <div className="orb-pulse absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, #C8F04B18 0%, transparent 70%)' }} />
      <div className="orb-pulse absolute -bottom-40 -right-40 w-[600px] h-[600px] rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, #C8F04B12 0%, transparent 70%)', animationDelay: '2s' }} />

      {/* Back to Login */}
      <div className="absolute top-6 left-6 z-50 animate-hero">
        <Link 
          href="/login" 
          className="group flex items-center gap-2 border border-[#E4E4E7] bg-white/80 hover:bg-black hover:text-[#C8F04B] hover:border-black px-4 py-2 text-[10px] uppercase font-bold tracking-widest transition-all backdrop-blur-md"
        >
          <ArrowLeft size={12} className="group-hover:-translate-x-0.5 transition-transform" />
          Back to Login
        </Link>
      </div>

      {/* Card */}
      <div className="relative w-full max-w-[430px] bg-white border border-[#E4E4E7] p-8 md:p-10 shadow-[0_12px_40px_-12px_rgba(0,0,0,0.04)] animate-scale-in">
        
        {/* Tech decorative corner line */}
        <div className="absolute top-0 right-0 w-8 h-[1px] bg-[#C8F04B]" />
        <div className="absolute top-0 right-0 w-[1px] h-8 bg-[#C8F04B]" />

        {/* Logo and Header */}
        <div className="flex flex-col items-center mb-8">
          <div className="mb-4 transform hover:scale-105 transition-transform">
            <Logo size="lg" colorClass="text-[#18181B]" />
          </div>
          <h1 className="text-2xl font-serif text-[#18181B] tracking-wide text-center">
            Reset your password
          </h1>
          <p className="text-xs text-[#71717A] mt-1 text-center font-sans max-w-[300px]">
            Enter the email address associated with your account and we&apos;ll send a password reset link.
          </p>
        </div>

        {isSent ? (
          <div className="flex flex-col items-center gap-4 py-4">
            <div className="p-3 bg-[#C8F04B]/10 border border-[#C8F04B]/30">
              <CheckCircle size={28} className="text-[#18181B]" />
            </div>
            <div className="text-center">
              <h2 className="text-sm font-bold mb-1">Reset Link Sent</h2>
              <p className="text-xs text-[#71717A] leading-relaxed max-w-[280px]">
                We&apos;ve sent a password reset link to <strong className="text-[#18181B]">{email}</strong>. Check your inbox and follow the instructions.
              </p>
            </div>
            <Link
              href="/login"
              className="mt-2 text-[10px] uppercase font-bold tracking-widest text-[#18181B] border-b border-[#C8F04B] hover:border-black transition-colors pb-0.5"
            >
              Return to Login
            </Link>
          </div>
        ) : (
          <>
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <div className="relative">
                <Input
                  label="Email Address"
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  className="pl-9 focus:border-[#C8F04B] transition-colors"
                />
                <Mail size={14} className="absolute left-3 bottom-3.5 text-[#71717A] opacity-60" />
              </div>

              <Button 
                type="submit" 
                isLoading={isLoading} 
                className="w-full mt-2 bg-black hover:bg-[#18181B] text-white hover:text-[#C8F04B] border border-black hover:border-black font-bold tracking-widest text-[11px] uppercase transition-all py-3 flex items-center justify-center gap-2 group"
              >
                Send Reset Link
                <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
              </Button>
            </form>

            <div className="mt-8 pt-6 border-t border-[#E4E4E7] text-center">
              <p className="text-xs text-[#71717A] font-sans">
                Remember your password?{' '}
                <Link href="/login" className="text-[#18181B] hover:underline font-semibold">
                  Sign In
                </Link>
              </p>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
