'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Logo } from '@/components/ui/Logo';
import { toast } from 'react-hot-toast';
import { ArrowLeft, KeyRound, ArrowRight, CheckCircle, Eye, EyeOff } from 'lucide-react';

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isReset, setIsReset] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!password || !confirmPassword) {
      toast.error('Both password fields are required');
      return;
    }

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password,
      });

      if (error) throw error;

      setIsReset(true);
      toast.success('Password updated successfully!');
      
      // Redirect after a short delay
      setTimeout(() => {
        router.push('/dashboard');
        router.refresh();
      }, 2000);
    } catch (err: unknown) {
      console.error(err);
      toast.error(err instanceof Error ? err.message : 'Failed to update password.');
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
            Set new password
          </h1>
          <p className="text-xs text-[#71717A] mt-1 text-center font-sans max-w-[300px]">
            Choose a strong, unique password to protect your workspace.
          </p>
        </div>

        {isReset ? (
          <div className="flex flex-col items-center gap-4 py-4">
            <div className="p-3 bg-[#C8F04B]/10 border border-[#C8F04B]/30">
              <CheckCircle size={28} className="text-[#18181B]" />
            </div>
            <div className="text-center">
              <h2 className="text-sm font-bold mb-1">Password Updated</h2>
              <p className="text-xs text-[#71717A] leading-relaxed max-w-[280px]">
                Your password has been changed. Redirecting to your dashboard...
              </p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div className="relative">
              <Input
                label="New Password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="new-password"
                className="pl-9 pr-10 focus:border-[#C8F04B] transition-colors"
              />
              <KeyRound size={14} className="absolute left-3 bottom-3.5 text-[#71717A] opacity-60" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 bottom-3 text-[#71717A] hover:text-[#18181B] transition-colors"
              >
                {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>

            <div className="relative">
              <Input
                label="Confirm New Password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                autoComplete="new-password"
                className="pl-9 focus:border-[#C8F04B] transition-colors"
              />
              <KeyRound size={14} className="absolute left-3 bottom-3.5 text-[#71717A] opacity-60" />
            </div>

            {/* Password strength indicator */}
            {password && (
              <div className="flex items-center gap-2">
                <div className="flex-1 h-1 bg-[#E4E4E7]">
                  <div 
                    className="h-full transition-all duration-300"
                    style={{ 
                      width: password.length >= 12 ? '100%' : password.length >= 8 ? '66%' : password.length >= 6 ? '33%' : '10%',
                      background: password.length >= 12 ? '#22C55E' : password.length >= 8 ? '#C8F04B' : password.length >= 6 ? '#F59E0B' : '#EF4444',
                    }}
                  />
                </div>
                <span className="text-[9px] uppercase font-bold tracking-wider text-[#71717A] font-mono">
                  {password.length >= 12 ? 'Strong' : password.length >= 8 ? 'Good' : password.length >= 6 ? 'Fair' : 'Weak'}
                </span>
              </div>
            )}

            <Button 
              type="submit" 
              isLoading={isLoading} 
              className="w-full mt-2 bg-black hover:bg-[#18181B] text-white hover:text-[#C8F04B] border border-black hover:border-black font-bold tracking-widest text-[11px] uppercase transition-all py-3 flex items-center justify-center gap-2 group"
            >
              Update Password
              <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
            </Button>
          </form>
        )}
      </div>
    </main>
  );
}
