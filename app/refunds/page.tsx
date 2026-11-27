import React from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Refund Policy | ClientSpace',
  description: 'Understand the billing cycles, subscriptions, and refund conditions for ClientSpace plans.',
  alternates: {
    canonical: 'https://www.clientspace.xyz/refunds',
  },
};

export default function RefundPolicyPage() {
  return (
    <div className="min-h-screen bg-[#FAFAF8] text-[#18181B] font-sans selection:bg-[#C8F04B] selection:text-[#18181B]">
      
      {/* NAV */}
      <header style={{ background: 'rgba(250,250,248,0.92)', borderBottom: '1px solid #E4E4E7' }} className="sticky top-0 z-50 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-5 md:px-12 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <span className="font-mono text-sm font-bold px-2 py-1 tracking-wider group-hover:scale-110 transition-transform" style={{ background: '#C8F04B', color: '#18181B' }}>{"[ ]"}</span>
            <span className="font-serif text-xl tracking-wide font-semibold">ClientSpace</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-[11px] uppercase font-bold tracking-widest px-4 py-2.5 text-[#71717A] hover:text-[#18181B] transition-colors">Log In</Link>
            <Link href="/signup" className="text-[11px] uppercase font-bold tracking-widest px-5 py-2.5 hover:brightness-95 transition-all" style={{ background: '#C8F04B', color: '#18181B' }}>Get Started Free</Link>
          </div>
        </div>
      </header>

      {/* HERO / HEADER */}
      <section className="py-16 md:py-20 px-5 md:px-12 border-b border-[#E4E4E7]">
        <div className="max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 mb-4 border border-[#E4E4E7] bg-white">
            <span className="text-[9px] uppercase font-bold tracking-wider text-[#71717A]">Last Updated: June 2, 2026</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-serif tracking-tight leading-tight">
            Refund Policy
          </h1>
          <p className="text-sm text-[#71717A] mt-2 font-mono">
            Clear guidelines on billing, cancellations, and refunds.
          </p>
        </div>
      </section>

      {/* CONTENT */}
      <main className="py-16 px-5 md:px-12">
        <div className="max-w-3xl mx-auto prose prose-zinc prose-sm md:prose-base leading-relaxed flex flex-col gap-8 text-[#52525B]">
          
          <section className="flex flex-col gap-3">
            <h2 className="text-lg font-serif text-[#18181B] font-bold uppercase tracking-wide border-b border-[#E4E4E7] pb-2">
              1. Free Plan
            </h2>
            <p>
              ClientSpace has a free Starter plan, so you can use client portals, contracts and invoices before upgrading. The Pro plan can be cancelled at any time.
            </p>
          </section>

          <section className="flex flex-col gap-3">
            <h2 className="text-lg font-serif text-[#18181B] font-bold uppercase tracking-wide border-b border-[#E4E4E7] pb-2">
              2. Subscription Cancellation
            </h2>
            <p>
              You can cancel your subscription at any time directly through your billing settings in the ClientSpace dashboard. Once canceled, your active premium features will remain accessible until the end of your current billing cycle, and no further renewals will be charged.
            </p>
          </section>

          <section className="flex flex-col gap-3">
            <h2 className="text-lg font-serif text-[#18181B] font-bold uppercase tracking-wide border-b border-[#E4E4E7] pb-2">
              3. Refund Conditions
            </h2>
            <p>
              Since ClientSpace is a digital software platform with costs associated with hosting, file storage allocations, AI queries, and transactional emails, we operate under a strict refund policy:
            </p>
            <ul className="list-disc pl-5 flex flex-col gap-2">
              <li><strong>Monthly Renewals:</strong> Payments for monthly subscription terms are generally non-refundable.</li>
              <li><strong>First-Time Purchases:</strong> If you are unhappy with the platform, you may request a refund within <strong>7 days</strong> of your initial paid transaction. Requests submitted after 7 days will not be approved.</li>
              <li><strong>Accidental Renewals:</strong> Yearly plans are eligible for a partial refund if requested within 3 days of renewal, minus any transactional fees.</li>
            </ul>
          </section>

          <section className="flex flex-col gap-3">
            <h2 className="text-lg font-serif text-[#18181B] font-bold uppercase tracking-wide border-b border-[#E4E4E7] pb-2">
              4. How to Request a Refund
            </h2>
            <p>
              To initiate a refund request, send an email to our billing desk with your registered account email and subscription invoice copy.
            </p>
            <div className="bg-white border border-[#E4E4E7] p-5 font-mono text-xs text-[#18181B] flex items-center justify-between">
              <span>Billing Node Email:</span>
              <a href="mailto:sheriefshakeeb313@gmail.com" className="text-[#18181B] font-bold underline hover:text-[#C8F04B] transition-colors">
                sheriefshakeeb313@gmail.com
              </a>
            </div>
          </section>

        </div>
      </main>

      {/* FOOTER */}
      <footer className="py-10 px-5 md:px-12 border-t border-[#E4E4E7] bg-white">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-xs text-[#71717A]">
            <span className="font-mono text-sm font-bold px-1.5 py-0.5 bg-[#C8F04B] text-[#18181B]">{"[ ]"}</span>
            <span>© {new Date().getFullYear()} ClientSpace. All rights reserved.</span>
          </div>
          <div className="flex gap-6 text-[10px] uppercase font-bold tracking-[0.15em] text-[#71717A]">
            <Link href="/" className="hover:text-[#18181B] transition-colors">Home</Link>
            <Link href="/privacy" className="hover:text-[#18181B] transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-[#18181B] transition-colors">Terms</Link>
          </div>
        </div>
      </footer>

    </div>
  );
}
