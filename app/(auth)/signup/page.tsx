'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Logo } from '@/components/ui/Logo';
import { toast } from 'react-hot-toast';
import { ArrowLeft, Sparkles, KeyRound, Mail, User, ArrowRight } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default function SignupPage() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email || !password) {
      toast.error('All fields are required');
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) throw error;

      toast.success('Registration request sent! Please check your email for validation.');
      router.push('/login');
    } catch (err: unknown) {
      console.error(err);
      toast.error(err instanceof Error ? err.message : 'Registration failed. Please check details and retry.');
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

      {/* Elegant Back to Home Link in Top Left */}
      <div className="absolute top-6 left-6 z-50 animate-hero">
        <Link 
          href="/" 
          className="group flex items-center gap-2 border border-[#E4E4E7] bg-white/80 hover:bg-black hover:text-[#C8F04B] hover:border-black px-4 py-2 text-[10px] uppercase font-bold tracking-widest transition-all backdrop-blur-md"
        >
          <ArrowLeft size={12} className="group-hover:-translate-x-0.5 transition-transform" />
          Back to Home
        </Link>
      </div>

      {/* Signup Card Panel */}
      <div className="relative w-full max-w-[430px] bg-white border border-[#E4E4E7] p-8 md:p-10 shadow-[0_12px_40px_-12px_rgba(0,0,0,0.04)] animate-scale-in">
        
        {/* Tech decorative corner line */}
        <div className="absolute top-0 right-0 w-8 h-[1px] bg-[#C8F04B]" />
        <div className="absolute top-0 right-0 w-[1px] h-8 bg-[#C8F04B]" />

        {/* Logo and Header */}
        <div className="flex flex-col items-center mb-8">
          <div className="mb-4 transform hover:scale-105 transition-transform">
            <Logo size="lg" colorClass="text-[#18181B]" />
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 mb-3 bg-[#C8F04B]/10 border border-[#C8F04B]/30">
            <Sparkles size={11} className="text-[#18181B]" />
            <span className="text-[9px] uppercase font-bold tracking-[0.15em] text-[#18181B]">Establish Node</span>
          </div>
          <h1 className="text-2xl font-serif text-[#18181B] tracking-wide text-center">
            Create your space
          </h1>
          <p className="text-xs text-[#71717A] mt-1 text-center font-sans">
            Start delivering projects with premium clarity.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSignup} className="flex flex-col gap-5">
          <div className="relative">
            <Input
              label="Full Name"
              type="text"
              placeholder="John Doe"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              autoComplete="name"
              className="pl-9 focus:border-[#C8F04B] transition-colors"
            />
            <User size={14} className="absolute left-3 bottom-3.5 text-[#71717A] opacity-60" />
          </div>

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

          <div className="relative">
            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="new-password"
              className="pl-9 focus:border-[#C8F04B] transition-colors"
            />
            <KeyRound size={14} className="absolute left-3 bottom-3.5 text-[#71717A] opacity-60" />
          </div>

          <Button 
            type="submit" 
            isLoading={isLoading} 
            className="w-full mt-2 bg-black hover:bg-[#18181B] text-white hover:text-[#C8F04B] border border-black hover:border-black font-bold tracking-widest text-[11px] uppercase transition-all py-3 flex items-center justify-center gap-2 group"
          >
            Create Space
            <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
          </Button>
        </form>

        {/* Separator */}
        <div className="mt-6 flex items-center gap-3">
          <div className="flex-1 h-px bg-[#E4E4E7]" />
          <span className="text-[9px] uppercase font-bold tracking-[0.15em] text-[#A1A1AA]">or</span>
          <div className="flex-1 h-px bg-[#E4E4E7]" />
        </div>

        {/* Google OAuth */}
        <button
          onClick={async () => {
            const { error } = await supabase.auth.signInWithOAuth({
              provider: 'google',
              options: {
                redirectTo: `${window.location.origin}/auth/callback`,
              },
            });
            if (error) toast.error(error.message);
          }}
          className="mt-4 w-full flex items-center justify-center gap-3 border border-[#E4E4E7] bg-white hover:bg-[#F4F4F5] text-[#18181B] py-3 text-[11px] uppercase font-bold tracking-widest transition-all group"
        >
          <svg width="16" height="16" viewBox="0 0 48 48" className="shrink-0">
            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
          </svg>
          Continue with Google
        </button>

        {/* Links */}
        <div className="mt-6 pt-5 border-t border-[#E4E4E7] flex flex-col gap-4">
          <p className="text-xs text-[#71717A] text-center font-sans mt-1">
            Already have an account?{' '}
            <Link href="/login" className="text-[#18181B] hover:underline font-semibold">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
