'use client';
import React, { useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, CheckCircle2, Shield, Zap, Sparkles, FileText, Send, Globe, Lock, Layers } from 'lucide-react';

const G = '#C8F04B', D = '#18181B', M = '#71717A', W = '#FAFAF8', B = '#E4E4E7';

export default function LandingPage() {
  useEffect(() => {
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
    }, { threshold: 0.1 });
    document.querySelectorAll('.reveal').forEach(el => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  return (
    <div style={{ background: W, color: D }} className="min-h-screen flex flex-col font-sans overflow-x-hidden selection:bg-[#C8F04B] selection:text-[#18181B]">

      {/* NAV */}
      <header style={{ background: 'rgba(250,250,248,0.92)', borderBottom: `1px solid ${B}` }} className="sticky top-0 z-50 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-5 md:px-12 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <span style={{ background: G, color: D }} className="font-mono text-sm font-bold px-2 py-1 tracking-wider group-hover:scale-110 transition-transform">{"[ ]"}</span>
            <span className="font-serif text-xl tracking-wide font-semibold">ClientSpace</span>
          </Link>
          <nav className="hidden md:flex items-center gap-10 text-[11px] uppercase font-bold tracking-[0.15em]" style={{ color: M }}>
            <a href="#features" className="hover:text-[#18181B] transition-colors">Features</a>
            <a href="#process" className="hover:text-[#18181B] transition-colors">Process</a>
            <a href="#pricing" className="hover:text-[#18181B] transition-colors">Pricing</a>
          </nav>
          <div className="flex items-center gap-3">
            <Link href="/login" className="hidden sm:block text-[11px] uppercase font-bold tracking-widest px-4 py-2.5" style={{ color: M }}>Log In</Link>
            <Link href="/signup" className="text-[11px] uppercase font-bold tracking-widest px-5 py-2.5 hover:brightness-95 transition-all" style={{ background: G, color: D }}>Get Started</Link>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section className="relative min-h-[85vh] lg:min-h-[90vh] flex items-center overflow-hidden">

        {/* 3D Pixar Hero Avatar — Desktop: absolute right side, blended */}
        <div
          className="absolute right-[-2%] xl:right-[1%] top-1/2 -translate-y-1/2 hidden lg:flex items-center justify-center w-[520px] h-[520px] xl:w-[620px] xl:h-[620px] z-20"
          style={{
            maskImage: 'radial-gradient(ellipse 75% 75% at 50% 48%, black 55%, transparent 100%)',
            WebkitMaskImage: 'radial-gradient(ellipse 75% 75% at 50% 48%, black 55%, transparent 100%)',
          }}
        >
          <Image
            src="/hero-avatar.png"
            alt="ClientSpace — Pixar-style freelancer waving hello"
            width={620}
            height={620}
            priority
            className="relative z-10 select-none pointer-events-none"
            style={{ mixBlendMode: 'multiply' }}
          />
        </div>

        {/* Orb */}
        <div className="orb-pulse absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full pointer-events-none" style={{ background: `radial-gradient(circle, ${G}15 0%, transparent 70%)` }} />

        <div className="max-w-7xl mx-auto px-5 md:px-12 w-full relative z-10 py-16 md:py-0">
          <div className="max-w-3xl">
            <div className="animate-hero inline-flex items-center gap-2 px-4 py-2 mb-8" style={{ background: `${G}20`, border: `1px solid ${G}44` }}>
              <Sparkles size={13} style={{ color: D }} />
              <span className="text-[10px] sm:text-[11px] uppercase font-bold tracking-[0.18em]" style={{ color: D }}>AI-Powered Freelance Workspace</span>
            </div>

            <h1 className="animate-hero animate-hero-delay-1 text-4xl sm:text-6xl lg:text-8xl font-serif leading-[0.95] tracking-tight">
              Stop chasing.<br />
              <span className="relative inline-block">Start delivering
                <span style={{ background: G, height: '14px', bottom: '6px' }} className="absolute left-0 right-0 -z-10 opacity-70" />
              </span>.
            </h1>

            <p className="animate-hero animate-hero-delay-2 mt-6 sm:mt-8 text-base sm:text-xl leading-relaxed max-w-2xl" style={{ color: M }}>
              One polished workspace to manage projects, share files, sign contracts, and collect payments — through a portal your clients never need to sign up for.
            </p>

            {/* Mobile Hero Avatar — shown only on small screens */}
            <div
              className="animate-hero animate-hero-delay-3 lg:hidden flex justify-center my-8 w-full"
              style={{
                maskImage: 'radial-gradient(ellipse 80% 80% at 50% 48%, black 50%, transparent 100%)',
                WebkitMaskImage: 'radial-gradient(ellipse 80% 80% at 50% 48%, black 50%, transparent 100%)',
              }}
            >
              <Image
                src="/hero-avatar.png"
                alt="ClientSpace — Pixar-style freelancer"
                width={280}
                height={280}
                priority
                className="select-none pointer-events-none"
                style={{ mixBlendMode: 'multiply' }}
              />
            </div>

            <div className="animate-hero animate-hero-delay-3 mt-8 sm:mt-12 flex flex-col sm:flex-row gap-4">
              <Link href="/signup" className="flex items-center justify-center gap-2.5 text-sm uppercase font-bold tracking-widest px-8 py-4 sm:py-5 hover:gap-3.5 group transition-all" style={{ background: D, color: W }}>
                Start Building Free <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <a href="#features" className="flex items-center justify-center text-sm uppercase font-bold tracking-widest px-8 py-4 sm:py-5 hover:bg-[#F0F0EC] transition-colors" style={{ border: `2px solid ${B}`, color: D }}>
                Explore Features
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* MARQUEE */}
      <div style={{ background: D }} className="py-5 overflow-hidden select-none">
        <div className="animate-marquee flex whitespace-nowrap gap-16">
          {[0, 1].map(idx => (
            <div key={idx} className="flex gap-16 items-center shrink-0">
              {['Contracts', 'Invoices', 'File Delivery', 'Milestones', 'Client Portals', 'AI Proposals', 'E-Signatures', 'Billing'].map(t => (
                <span key={t + idx} className="text-sm uppercase font-bold tracking-[0.2em]" style={{ color: `${G}88` }}>
                  <span style={{ color: G }} className="mr-3">◆</span>{t}
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* STATS */}
      <section style={{ background: G }}>
        <div className="max-w-7xl mx-auto px-5 md:px-12 py-8 sm:py-10 grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 text-center">
          {[
            { v: '2,400+', l: 'Projects Delivered' },
            { v: '$1.2M+', l: 'Total Invoiced' },
            { v: '< 60s', l: 'Portal Setup' },
            { v: '4.9★', l: 'Average Rating' },
          ].map(s => (
            <div key={s.l} className="reveal flex flex-col gap-1">
              <span className="text-2xl sm:text-4xl font-serif font-bold" style={{ color: D }}>{s.v}</span>
              <span className="text-[9px] sm:text-[10px] uppercase font-bold tracking-[0.15em]" style={{ color: '#3d4a00' }}>{s.l}</span>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="py-20 sm:py-28 px-5 md:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="reveal mb-14 sm:mb-20">
            <span className="text-[11px] uppercase font-bold tracking-[0.2em] px-3 py-1.5" style={{ background: `${G}30`, color: D }}>Core Platform</span>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-serif mt-6 leading-[1.05]" style={{ color: D }}>
              Every tool a premium freelancer needs.
            </h2>
          </div>

          {/* Row 1: 2 big cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
            <div className="reveal premium-card p-8 sm:p-12 flex flex-col justify-between min-h-[300px] sm:min-h-[380px] relative overflow-hidden" style={{ background: G }}>
              <div className="absolute -bottom-8 -right-8 opacity-10 text-[200px] font-serif font-bold leading-none select-none" style={{ color: D }}>{"[ ]"}</div>
              <Shield size={32} style={{ color: D }} />
              <div className="relative z-10">
                <h3 className="text-2xl sm:text-3xl font-serif font-semibold" style={{ color: D }}>Zero-Login Client Portals</h3>
                <p className="text-sm sm:text-base mt-3 leading-relaxed max-w-md" style={{ color: '#3d4a00' }}>
                  Send one cryptographic URL. Clients review, approve, sign & pay — no account needed.
                </p>
              </div>
            </div>
            <div className="reveal reveal-delay-1 premium-card p-8 sm:p-12 flex flex-col justify-between min-h-[300px] sm:min-h-[380px]" style={{ background: D }}>
              <Sparkles size={32} style={{ color: G }} />
              <div>
                <h3 className="text-2xl sm:text-3xl font-serif font-semibold" style={{ color: W }}>AI Invoice & Proposal Engine</h3>
                <p className="text-sm sm:text-base mt-3 leading-relaxed" style={{ color: '#888' }}>
                  Describe your work in plain English. Mistral-Large generates structured invoices & proposals instantly.
                </p>
              </div>
            </div>
          </div>

          {/* Row 2: 3 smaller cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {[
              { icon: Send, title: 'Email Automation', desc: 'Clients get an email when you post an update, send an invoice or comment, and you hear back when they approve files or sign.', bg: D, fg: W, ic: G, tc: '#888' },
              { icon: FileText, title: 'Digital Contracts', desc: 'Draft contracts and collect e-signatures, with the signer\'s IP and time recorded.', bg: G, fg: D, ic: D, tc: '#3d4a00' },
              { icon: Lock, title: 'Enterprise Security', desc: 'Row-level security in Supabase scopes every record to the account that owns it.', bg: '#F0F0EC', fg: D, ic: D, tc: M },
            ].map((f, i) => (
              <div key={f.title} className={`reveal reveal-delay-${i + 1} premium-card p-8 sm:p-10 flex flex-col justify-between min-h-[260px] sm:min-h-[300px]`} style={{ background: f.bg, color: f.fg }}>
                <f.icon size={28} style={{ color: f.ic }} />
                <div>
                  <h3 className="text-xl sm:text-2xl font-serif font-semibold">{f.title}</h3>
                  <p className="text-sm mt-3 leading-relaxed" style={{ color: f.tc }}>{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PROCESS */}
      <section id="process" style={{ background: D }} className="relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: `repeating-linear-gradient(90deg, ${G} 0px, ${G} 1px, transparent 1px, transparent 80px), repeating-linear-gradient(0deg, ${G} 0px, ${G} 1px, transparent 1px, transparent 80px)` }} />
        <div className="max-w-7xl mx-auto px-5 md:px-12 py-20 sm:py-28 relative z-10">
          <div className="reveal text-center mb-16 sm:mb-20">
            <span className="text-[11px] uppercase font-bold tracking-[0.2em]" style={{ color: G }}>Simple Process</span>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-serif mt-5" style={{ color: W }}>Three steps. Done.</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { n: '01', icon: Layers, t: 'Build Your Space', d: 'Name a project, add client details, set milestones. Your portal generates instantly.' },
              { n: '02', icon: Globe, t: 'Share One Link', d: 'Client opens the portal — no signup. They see progress, approve files, sign contracts.' },
              { n: '03', icon: Zap, t: 'Deliver & Earn', d: 'Upload revisions, trigger AI updates, close milestones. Payments flow automatically.' },
            ].map((s, i) => (
              <div key={s.n} className={`reveal reveal-delay-${i + 1} p-8 sm:p-10 flex flex-col gap-6`} style={{ background: '#1E1E21', border: '1px solid #2A2A2E' }}>
                <div className="flex items-center gap-4">
                  <span className="text-5xl sm:text-6xl font-mono font-bold" style={{ color: W }}>{s.n}</span>
                  <div className="h-14 w-14 flex items-center justify-center shrink-0" style={{ background: i === 0 ? G : '#2A2A2E' }}>
                    <s.icon size={22} style={{ color: i === 0 ? D : G }} />
                  </div>
                </div>
                <h3 className="text-2xl sm:text-3xl font-serif font-semibold" style={{ color: W }}>{s.t}</h3>
                <p className="text-sm sm:text-base leading-relaxed" style={{ color: '#71717A' }}>{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" className="py-20 sm:py-28 px-5 md:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="reveal text-center mb-14 sm:mb-20">
            <span className="text-[11px] uppercase font-bold tracking-[0.2em] px-3 py-1.5" style={{ background: `${G}30`, color: D }}>Pricing</span>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-serif mt-6" style={{ color: D }}>Pick your plan. Scale when ready.</h2>
            <p className="mt-5 text-lg max-w-xl mx-auto leading-relaxed" style={{ color: M }}>No hidden fees. No commissions. Cancel anytime.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-3xl mx-auto">
            {/* Free */}
            <div className="reveal reveal-delay-1 premium-card p-8 sm:p-10 flex flex-col gap-6" style={{ background: '#F4F4F5', border: `1px solid ${B}` }}>
              <div>
                <span className="text-[10px] uppercase font-bold tracking-[0.2em]" style={{ color: M }}>Starter</span>
                <div className="flex items-baseline gap-1 mt-3">
                  <span className="text-5xl sm:text-6xl font-serif font-bold" style={{ color: D }}>$0</span>
                  <span className="text-base" style={{ color: M }}>/mo</span>
                </div>
                <p className="text-sm mt-2" style={{ color: M }}>Explore the platform free.</p>
              </div>
              <ul className="flex flex-col gap-3 text-sm flex-1" style={{ color: D }}>
                {['Projects & Client Portals', 'Milestones, Files & Feedback', 'Invoices', 'Contract E-Signing', 'Email Notifications'].map(f => (
                  <li key={f} className="flex items-center gap-2.5"><CheckCircle2 size={16} style={{ color: M }} />{f}</li>
                ))}
              </ul>
              <Link href="/signup" className="w-full text-center text-sm uppercase font-bold tracking-widest py-4 transition-colors hover:bg-[#E8E8EB]" style={{ border: `2px solid ${B}`, color: D }}>
                Get Started Free
              </Link>
            </div>

            {/* Pro */}
            <div className="reveal reveal-delay-2 premium-card relative flex flex-col glow-pulse" style={{ background: D }}>
              <div style={{ background: G, height: '4px' }} />
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 text-[9px] uppercase font-bold tracking-[0.2em] px-4 py-1.5 z-10" style={{ background: G, color: D }}>Most Popular</div>
              <div className="p-8 sm:p-10 flex flex-col gap-6 flex-1">
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-[0.2em]" style={{ color: G }}>Professional</span>
                  <div className="flex items-baseline gap-1 mt-3">
                    <span className="text-5xl sm:text-6xl font-serif font-bold" style={{ color: W }}>$12</span>
                    <span className="text-base" style={{ color: '#71717A' }}>/mo</span>
                  </div>
                  <p className="text-sm mt-2" style={{ color: '#71717A' }}>Everything for premium delivery.</p>
                </div>
                <ul className="flex flex-col gap-3 text-sm flex-1" style={{ color: '#ccc' }}>
                  {['Everything in Starter', 'AI-Drafted Invoices', 'AI-Drafted Proposals', 'AI Status Updates'].map(f => (
                    <li key={f} className="flex items-center gap-2.5"><CheckCircle2 size={16} style={{ color: G }} />{f}</li>
                  ))}
                </ul>
                <Link href="/signup" className="w-full text-center text-sm uppercase font-bold tracking-widest py-4 flex items-center justify-center gap-2 hover:brightness-95 transition-all" style={{ background: G, color: D }}>
                  Get Started <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative overflow-hidden" style={{ background: G }}>
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'repeating-linear-gradient(90deg, #18181B 0px, #18181B 1px, transparent 1px, transparent 60px), repeating-linear-gradient(0deg, #18181B 0px, #18181B 1px, transparent 1px, transparent 60px)' }} />
        <div className="max-w-4xl mx-auto px-5 md:px-12 py-20 sm:py-28 text-center relative z-10">
          <h2 className="reveal text-4xl sm:text-5xl lg:text-6xl font-serif leading-tight" style={{ color: D }}>
            Your clients deserve better than a Google Drive link.
          </h2>
          <p className="reveal reveal-delay-1 mt-6 text-lg leading-relaxed max-w-lg mx-auto" style={{ color: '#3d4a00' }}>
            One link for files, approvals, contracts and invoices.
          </p>
          <Link href="/signup" className="reveal reveal-delay-2 inline-flex items-center gap-2.5 mt-12 text-sm uppercase font-bold tracking-widest px-10 py-5 hover:gap-3.5 group transition-all" style={{ background: D, color: G }}>
            Create Your Free Space <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-12 px-5 md:px-12" style={{ background: W, borderTop: `1px solid ${B}` }}>
        <div className="max-w-7xl mx-auto flex flex-col gap-6 sm:gap-4 sm:flex-row items-center justify-between">
          <div className="flex flex-col sm:flex-row items-center gap-3 text-xs text-center sm:text-left" style={{ color: M }}>
            <span className="font-mono text-sm font-bold px-1.5 py-0.5" style={{ background: G, color: D }}>{"[ ]"}</span>
            <span>© {new Date().getFullYear()} ClientSpace. All rights reserved. Support: <a href="mailto:sheriefshakeeb313@gmail.com" className="font-bold underline hover:text-[#18181B] transition-colors">sheriefshakeeb313@gmail.com</a></span>
          </div>
          <div className="flex flex-wrap justify-center gap-6 sm:gap-8 text-[10px] uppercase font-bold tracking-[0.15em]" style={{ color: M }}>
            <Link href="/privacy" className="hover:text-[#18181B] transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-[#18181B] transition-colors">Terms</Link>
            <Link href="/refunds" className="hover:text-[#18181B] transition-colors">Refunds</Link>
            <Link href="/login" className="hover:text-[#18181B] transition-colors">Sign In</Link>
          </div>
        </div>
      </footer>

      {/* 3D cube keyframe */}
      <style>{`
        @keyframes spinCube {
          0% { transform: rotateX(-15deg) rotateY(0deg); }
          25% { transform: rotateX(-20deg) rotateY(90deg); }
          50% { transform: rotateX(-10deg) rotateY(180deg); }
          75% { transform: rotateX(-25deg) rotateY(270deg); }
          100% { transform: rotateX(-15deg) rotateY(360deg); }
        }
      `}</style>
    </div>
  );
}
