import React from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy | ClientSpace',
  description: 'Learn how ClientSpace handles and protects your personal and workspace data.',
  alternates: {
    canonical: 'https://www.clientspace.xyz/privacy',
  },
};

export default function PrivacyPolicyPage() {
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
            Privacy Policy
          </h1>
          <p className="text-sm text-[#71717A] mt-2 font-mono">
            How we collect, use, and protect your information.
          </p>
        </div>
      </section>

      {/* CONTENT */}
      <main className="py-16 px-5 md:px-12">
        <div className="max-w-3xl mx-auto prose prose-zinc prose-sm md:prose-base leading-relaxed flex flex-col gap-8 text-[#52525B]">
          
          <section className="flex flex-col gap-3">
            <h2 className="text-lg font-serif text-[#18181B] font-bold uppercase tracking-wide border-b border-[#E4E4E7] pb-2">
              1. Information We Collect
            </h2>
            <p>
              We collect information to provide better services to our users. This includes:
            </p>
            <ul className="list-disc pl-5 flex flex-col gap-2">
              <li><strong>Account Credentials:</strong> When you register for ClientSpace, we collect your email address, full name, and authentication logs (such as Google OAuth profile data).</li>
              <li><strong>Workspace Content:</strong> Documents, project descriptions, invoice details, client contact emails, and files uploaded to your portals.</li>
              <li><strong>Usage Analytics:</strong> Metadata about how you navigate the application, API access times, and features used.</li>
            </ul>
          </section>

          <section className="flex flex-col gap-3">
            <h2 className="text-lg font-serif text-[#18181B] font-bold uppercase tracking-wide border-b border-[#E4E4E7] pb-2">
              2. How We Use Information
            </h2>
            <p>
              We process your personal information for the following purposes:
            </p>
            <ul className="list-disc pl-5 flex flex-col gap-2">
              <li>To provide and maintain the ClientSpace platform, including processing invoices, delivering portal notifications, and securing contract e-signatures.</li>
              <li>To prevent fraud, abuse, and unauthorized access to workspace databases.</li>
              <li>To send service notifications, transactional emails (such as payment receipts), and product updates.</li>
            </ul>
          </section>

          <section className="flex flex-col gap-3">
            <h2 className="text-lg font-serif text-[#18181B] font-bold uppercase tracking-wide border-b border-[#E4E4E7] pb-2">
              3. Data Security and Isolation
            </h2>
            <p>
              We implement industry-standard security measures, including Row Level Security (RLS) at the database layer and HTTPS encryption in transit. Your workspace files are isolated so that only authenticated users authorized by your client portal links can view them.
            </p>
          </section>

          <section className="flex flex-col gap-3">
            <h2 className="text-lg font-serif text-[#18181B] font-bold uppercase tracking-wide border-b border-[#E4E4E7] pb-2">
              4. Cookies and Tracking
            </h2>
            <p>
              We use functional cookies to maintain user authentication sessions and preserve app preferences. You can configure your browser to reject cookies, but some functions of the portal may not work correctly.
            </p>
          </section>

          <section className="flex flex-col gap-3">
            <h2 className="text-lg font-serif text-[#18181B] font-bold uppercase tracking-wide border-b border-[#E4E4E7] pb-2">
              5. Contact Us
            </h2>
            <p>
              If you have any questions about this Privacy Policy or your data, please contact our privacy compliance node at:
            </p>
            <div className="bg-white border border-[#E4E4E7] p-5 font-mono text-xs text-[#18181B] flex items-center justify-between">
              <span>Privacy Node Email:</span>
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
            <Link href="/terms" className="hover:text-[#18181B] transition-colors">Terms</Link>
            <Link href="/refunds" className="hover:text-[#18181B] transition-colors">Refunds</Link>
          </div>
        </div>
      </footer>

    </div>
  );
}
