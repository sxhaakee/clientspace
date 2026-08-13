import React from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service | ClientSpace',
  description: 'Read the terms and conditions governing your use of the ClientSpace platform.',
  alternates: {
    canonical: 'https://www.clientspace.xyz/terms',
  },
};

export default function TermsOfServicePage() {
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
            Terms of Service
          </h1>
          <p className="text-sm text-[#71717A] mt-2 font-mono">
            Please read these terms carefully before using our platform.
          </p>
        </div>
      </section>

      {/* CONTENT */}
      <main className="py-16 px-5 md:px-12">
        <div className="max-w-3xl mx-auto prose prose-zinc prose-sm md:prose-base leading-relaxed flex flex-col gap-8 text-[#52525B]">
          
          <section className="flex flex-col gap-3">
            <h2 className="text-lg font-serif text-[#18181B] font-bold uppercase tracking-wide border-b border-[#E4E4E7] pb-2">
              1. Acceptance of Terms
            </h2>
            <p>
              By accessing or using ClientSpace (the &ldquo;Service&rdquo;), you agree to be bound by these Terms of Service. If you do not agree to these terms, you are prohibited from using the platform.
            </p>
          </section>

          <section className="flex flex-col gap-3">
            <h2 className="text-lg font-serif text-[#18181B] font-bold uppercase tracking-wide border-b border-[#E4E4E7] pb-2">
              2. Description of Service
            </h2>
            <p>
              ClientSpace provides a web-based client portal software designed for freelancers and digital teams to manage invoices, sign agreements, track project milestones, and share digital assets.
            </p>
          </section>

          <section className="flex flex-col gap-3">
            <h2 className="text-lg font-serif text-[#18181B] font-bold uppercase tracking-wide border-b border-[#E4E4E7] pb-2">
              3. Account Registration and Billing
            </h2>
            <p>
              You must provide accurate, complete, and current information when registering. You are responsible for safeguarding the credentials you use to access the Service. Billing is processed securely through our merchant of record partners (such as LemonSqueezy).
            </p>
          </section>

          <section className="flex flex-col gap-3">
            <h2 className="text-lg font-serif text-[#18181B] font-bold uppercase tracking-wide border-b border-[#E4E4E7] pb-2">
              4. User Conduct & Prohibited Content
            </h2>
            <p>
              You agree not to use the Service for any unlawful or unauthorized activity. You may not upload malware, spam, copyrighted content without authorization, or materials that violate standard guidelines. We reserve the right to suspend accounts that violate these guidelines.
            </p>
          </section>

          <section className="flex flex-col gap-3">
            <h2 className="text-lg font-serif text-[#18181B] font-bold uppercase tracking-wide border-b border-[#E4E4E7] pb-2">
              5. Intellectual Property
            </h2>
            <p>
              The ClientSpace software, branding, design system, layout, and visual code are owned exclusively by ClientSpace. You retain full intellectual property rights to any content, invoices, files, and SOW agreements uploaded inside your portals.
            </p>
          </section>

          <section className="flex flex-col gap-3">
            <h2 className="text-lg font-serif text-[#18181B] font-bold uppercase tracking-wide border-b border-[#E4E4E7] pb-2">
              6. Limitation of Liability
            </h2>
            <p>
              In no event shall ClientSpace be liable for any indirect, incidental, special, or consequential damages resulting from your use of or inability to use the platform.
            </p>
          </section>

          <section className="flex flex-col gap-3">
            <h2 className="text-lg font-serif text-[#18181B] font-bold uppercase tracking-wide border-b border-[#E4E4E7] pb-2">
              7. Contact Information
            </h2>
            <p>
              For legal inquiries, dispute notifications, or terms clarification, please contact our legal desk:
            </p>
            <div className="bg-white border border-[#E4E4E7] p-5 font-mono text-xs text-[#18181B] flex items-center justify-between">
              <span>Legal Desk Email:</span>
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
            <Link href="/refunds" className="hover:text-[#18181B] transition-colors">Refunds</Link>
          </div>
        </div>
      </footer>

    </div>
  );
}
