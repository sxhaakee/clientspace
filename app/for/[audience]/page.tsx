import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, CheckCircle2, Sparkles, FileCheck, Send, ShieldCheck, Star, Users, Zap, Palette, Video, PenTool, Megaphone, Layout, Camera, Share2, Briefcase, Code, Film } from 'lucide-react';
import { notFound } from 'next/navigation';

// ─── AUDIENCE DATA ───
const AUDIENCES: Record<string, {
  title: string;
  headline: string;
  subheadline: string;
  description: string;
  icon: any;
  painPoints: string[];
  solutions: string[];
  keywords: string[];
}> = {
  'web-designers': {
    title: 'Web Designers',
    headline: 'The Client Portal Built for Web Designers',
    subheadline: 'Stop sending mockups over email. Deliver website designs with a premium client experience.',
    description: 'ClientSpace is the best client portal software for web designers. Share mockups, collect feedback, manage revisions, send invoices, and get contracts signed — all from one beautiful workspace.',
    icon: Layout,
    painPoints: [
      'Clients lose track of which version is the latest',
      'Feedback gets scattered across email, WhatsApp, and Slack',
      'Chasing payments with manual invoicing',
      'No professional way to present deliverables',
      'Contracts require printing, scanning, and back-and-forth',
    ],
    solutions: [
      'Version-controlled file delivery with one-click client approval',
      'Threaded feedback attached directly to deliverables',
      'Built-in invoicing with payment tracking',
      'A premium, branded portal that makes you look professional',
      'Digital e-signing with IP logging and timestamps',
    ],
    keywords: ['client portal for web designers', 'web design client management', 'freelance web designer tools', 'design deliverable sharing', 'web design project management'],
  },
  'video-editors': {
    title: 'Video Editors',
    headline: 'Stop Sending WeTransfer Links. Use a Real Client Portal.',
    subheadline: 'Deliver video projects with version control, inline feedback, and professional invoicing.',
    description: 'ClientSpace is the best file delivery and client management tool for video editors. Share cuts, collect timestamped feedback, track milestones, and get paid faster.',
    icon: Video,
    painPoints: [
      'Clients download the wrong video cut every time',
      'Revision notes get lost in email threads',
      'No way to track which version was approved',
      'Invoices are sent separately and forgotten',
      'Projects feel disorganized to clients',
    ],
    solutions: [
      'Organized file delivery with clear version labels (v1, v2, v3)',
      'Client-side approval buttons — one click to confirm',
      'Milestone tracking so clients see progress in real-time',
      'Invoice management built into the same portal',
      'A polished client experience that builds trust',
    ],
    keywords: ['client portal for video editors', 'video editing client management', 'file delivery for video editors', 'freelance video editor tools', 'video project management software'],
  },
  'copywriters': {
    title: 'Copywriters',
    headline: 'Deliver Copy Like a Premium Agency, Not a Freelancer',
    subheadline: 'Share drafts, collect revisions, sign contracts, and invoice — all in one elegant workspace.',
    description: 'ClientSpace gives freelance copywriters and content writers a professional client portal to deliver work, manage revisions, and handle payments without the back-and-forth chaos.',
    icon: PenTool,
    painPoints: [
      'Clients reply to the wrong email with feedback',
      'Draft versions get confused (Final_v2_REAL_FINAL.docx)',
      'No structured way to get sign-off on copy',
      'Contract signing is a manual nightmare',
      'You look like every other freelancer on Upwork',
    ],
    solutions: [
      'Clean file delivery with version control and approval buttons',
      'Dedicated feedback threads per project topic',
      'Digital contract e-signing built right in',
      'Professional portal that positions you as an authority',
      'Milestone tracking to show clients the writing process',
    ],
    keywords: ['client portal for copywriters', 'freelance writing client management', 'copywriting project delivery', 'content writer tools', 'freelance copywriter software'],
  },
  'marketing-agencies': {
    title: 'Marketing Agencies',
    headline: 'The Client Experience Platform for Marketing Agencies',
    subheadline: 'Replace scattered tools with one branded workspace your clients will love.',
    description: 'ClientSpace helps marketing agencies deliver campaigns, reports, and creative assets through a unified client portal. Manage multiple projects, track approvals, and streamline billing.',
    icon: Megaphone,
    painPoints: [
      'Clients can\'t find deliverables across Slack, email, and Drive',
      'Agency looks disorganized despite great work',
      'Approval processes are informal and undocumented',
      'Invoicing is handled separately from project delivery',
      'No single source of truth for client communication',
    ],
    solutions: [
      'Centralized delivery hub for all campaign assets',
      'Client-facing portal that reflects your agency brand',
      'One-click approval workflows with audit trail',
      'Integrated invoicing and contract management',
      'Activity timeline showing every project milestone',
    ],
    keywords: ['client portal for marketing agencies', 'agency client management', 'marketing agency tools', 'campaign delivery software', 'agency project management'],
  },
  'ui-ux-designers': {
    title: 'UI/UX Designers',
    headline: 'Your Design Deserves a Better Delivery Experience',
    subheadline: 'Share prototypes, collect contextual feedback, and manage the entire design project lifecycle.',
    description: 'ClientSpace is the premium client portal for UI/UX designers. Deliver wireframes, prototypes, and design systems with version control, feedback loops, and professional invoicing.',
    icon: Palette,
    painPoints: [
      'Clients don\'t know how to navigate Figma links',
      'Design feedback is vague and unstructured',
      'Multiple rounds of revisions with no clear tracking',
      'Contract terms are discussed informally over calls',
      'Payments are delayed because invoicing is separate',
    ],
    solutions: [
      'Upload and deliver design files with clear version tags',
      'Structured feedback threads organized by topic',
      'Visual milestone tracker showing design phases',
      'Legal e-signing with timestamped contract execution',
      'Invoicing integrated into the project workspace',
    ],
    keywords: ['client portal for designers', 'UI UX client management', 'design deliverable software', 'freelance designer tools', 'design project management'],
  },
  'photographers': {
    title: 'Photographers',
    headline: 'Deliver Photo Galleries Like a Luxury Studio',
    subheadline: 'Share high-res images, get approvals, sign contracts, and invoice — all from one polished workspace.',
    description: 'ClientSpace helps photographers deliver images, manage client selections, handle contracts, and track payments in a single premium portal. No more Google Drive links.',
    icon: Camera,
    painPoints: [
      'Clients download compressed previews instead of finals',
      'Gallery selections are communicated over text messages',
      'Contracts are signed with pen and scanned PDFs',
      'Payment tracking is a spreadsheet nightmare',
      'Your delivery process doesn\'t match your photography quality',
    ],
    solutions: [
      'Organized file delivery with download tracking',
      'Client approval system for selected images',
      'Digital contract signing with legal timestamps',
      'Invoice management with status tracking',
      'A premium portal that matches your creative brand',
    ],
    keywords: ['client portal for photographers', 'photography client management', 'photo delivery software', 'photographer invoicing', 'photography business tools'],
  },
  'social-media-managers': {
    title: 'Social Media Managers',
    headline: 'Manage Social Clients Without the WhatsApp Chaos',
    subheadline: 'Deliver content calendars, collect approvals, and handle monthly retainers in one workspace.',
    description: 'ClientSpace helps social media managers share content plans, get client approval on posts, manage monthly invoicing, and keep all feedback organized and professional.',
    icon: Share2,
    painPoints: [
      'Clients approve content via random WhatsApp messages',
      'Content calendars get lost in email attachments',
      'Monthly retainer invoicing is manual and inconsistent',
      'No clear record of what was approved vs. what wasn\'t',
      'Managing multiple clients feels overwhelming',
    ],
    solutions: [
      'Upload content packages with version-controlled delivery',
      'Client approval workflow with status badges',
      'Recurring invoice tracking for retainer clients',
      'Organized feedback by topic and month',
      'Professional portal that scales with your client base',
    ],
    keywords: ['client portal for social media managers', 'social media client management', 'content approval software', 'social media tools for freelancers', 'social media project management'],
  },
  'consultants': {
    title: 'Consultants',
    headline: 'Deliver Consulting Engagements with Executive Clarity',
    subheadline: 'Share reports, proposals, and SOWs through a secure, professional client workspace.',
    description: 'ClientSpace is the premium client portal for independent consultants. Share deliverables, manage engagement milestones, sign agreements digitally, and track payments — all professionally.',
    icon: Briefcase,
    painPoints: [
      'Clients request the same document multiple times',
      'SOWs and contracts are signed informally',
      'Deliverable handoffs happen over scattered emails',
      'Invoice follow-ups are awkward and time-consuming',
      'Your delivery doesn\'t reflect your expertise',
    ],
    solutions: [
      'Centralized document delivery with client access',
      'Digital contract execution with legal audit trail',
      'Milestone-based progress tracking',
      'Professional invoicing with payment status',
      'A premium workspace that builds executive trust',
    ],
    keywords: ['client portal for consultants', 'consulting client management', 'consultant tools', 'consulting delivery software', 'professional services portal'],
  },
  'developers': {
    title: 'Developers',
    headline: 'Ship Code Deliverables Like a Pro Studio',
    subheadline: 'Deliver builds, collect feedback, manage milestone payments, and sign contracts — without the overhead.',
    description: 'ClientSpace helps freelance developers and dev agencies share project builds, manage code delivery milestones, handle client approvals, and get paid on time.',
    icon: Code,
    painPoints: [
      'Clients don\'t understand GitHub or staging links',
      'Feedback on builds comes through random channels',
      'Milestone payments require manual chasing',
      'Contracts are PDFs emailed back and forth',
      'Project scope creep happens because nothing is documented',
    ],
    solutions: [
      'Clean deliverable sharing with version labels',
      'Structured client feedback organized by topic',
      'Milestone tracker showing development phases',
      'Built-in invoicing with payment status tracking',
      'Digital e-signing to lock in scope and terms',
    ],
    keywords: ['client portal for developers', 'freelance developer tools', 'code delivery management', 'developer client management', 'freelance dev project management'],
  },
  'motion-designers': {
    title: 'Motion Designers',
    headline: 'Present Motion Work Without WeTransfer Links',
    subheadline: 'Deliver animations and motion graphics with version control, client approvals, and professional billing.',
    description: 'ClientSpace helps motion designers share animation drafts, collect structured feedback, manage revision cycles, and handle invoicing through one premium client portal.',
    icon: Film,
    painPoints: [
      'Large files get lost in email or expire on file-sharing links',
      'Clients confuse animation versions during review',
      'Revision feedback is spread across calls and messages',
      'Invoicing happens outside the delivery context',
      'The delivery process feels unprofessional for premium work',
    ],
    solutions: [
      'Reliable file delivery with version tracking',
      'One-click client approval for final animations',
      'Contextual feedback threads per deliverable',
      'Integrated invoicing so payment follows delivery',
      'A branded portal that matches your creative standard',
    ],
    keywords: ['client portal for motion designers', 'motion design client management', 'animation delivery software', 'freelance motion designer tools', 'motion graphics project management'],
  },
};

// ─── METADATA GENERATOR ───
export async function generateMetadata({ params }: { params: { audience: string } }): Promise<Metadata> {
  const data = AUDIENCES[params.audience];
  if (!data) return {};

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.clientspace.xyz';

  return {
    title: `Client Portal for ${data.title} — ClientSpace`,
    description: data.description,
    keywords: data.keywords,
    alternates: {
      canonical: `${baseUrl}/for/${params.audience}`,
    },
    openGraph: {
      title: data.headline,
      description: data.subheadline,
      url: `${baseUrl}/for/${params.audience}`,
      siteName: 'ClientSpace',
      type: 'website',
      images: [{ url: `${baseUrl}/og-image.png`, width: 1200, height: 630 }],
    },
    twitter: {
      card: 'summary_large_image',
      title: data.headline,
      description: data.subheadline,
    },
  };
}

// ─── STATIC PARAMS ───
export function generateStaticParams() {
  return Object.keys(AUDIENCES).map((audience) => ({ audience }));
}

// ─── PAGE COMPONENT ───
export default function AudiencePage({ params }: { params: { audience: string } }) {
  const data = AUDIENCES[params.audience];
  if (!data) notFound();

  const Icon = data.icon;

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
            <Link href="/login" className="hidden sm:block text-[11px] uppercase font-bold tracking-widest px-4 py-2.5 text-[#71717A]">Log In</Link>
            <Link href="/signup" className="text-[11px] uppercase font-bold tracking-widest px-5 py-2.5 hover:brightness-95 transition-all" style={{ background: '#C8F04B', color: '#18181B' }}>Get Started Free</Link>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section className="relative py-20 md:py-28 px-5 md:px-12">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-6 border border-[#C8F04B]/40 bg-[#C8F04B]/10">
            <Icon size={14} />
            <span className="text-[10px] uppercase font-bold tracking-[0.15em]">Built for {data.title}</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif tracking-tight leading-tight mb-5">
            {data.headline}
          </h1>

          <p className="text-base md:text-lg text-[#71717A] max-w-2xl mx-auto leading-relaxed mb-8">
            {data.subheadline}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/signup" className="flex items-center gap-2 text-[11px] uppercase font-bold tracking-widest px-8 py-3.5 hover:brightness-95 transition-all group" style={{ background: '#C8F04B', color: '#18181B' }}>
              Start Free — No Credit Card
              <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
            </Link>
            <Link href="/#features" className="text-[11px] uppercase font-bold tracking-widest px-6 py-3.5 border border-[#E4E4E7] hover:border-[#18181B] transition-colors">
              See All Features
            </Link>
          </div>
        </div>
      </section>

      {/* PAIN POINTS VS SOLUTIONS */}
      <section className="py-16 md:py-24 px-5 md:px-12 border-t border-[#E4E4E7]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-[#71717A] font-mono">The Problem → The Solution</span>
            <h2 className="text-2xl md:text-3xl font-serif mt-3">Why {data.title} Choose ClientSpace</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8 md:gap-12">
            {/* Pain Points */}
            <div className="bg-white border border-[#E4E4E7] p-6 md:p-8">
              <h3 className="text-xs uppercase font-bold tracking-wider text-red-500 font-mono mb-5">❌ Without ClientSpace</h3>
              <div className="flex flex-col gap-4">
                {data.painPoints.map((p, i) => (
                  <div key={i} className="flex items-start gap-3 text-sm text-[#52525B] leading-relaxed">
                    <span className="text-red-400 shrink-0 mt-0.5">✗</span>
                    {p}
                  </div>
                ))}
              </div>
            </div>

            {/* Solutions */}
            <div className="bg-white border border-[#C8F04B]/30 p-6 md:p-8 shadow-[0_4px_20px_-8px_rgba(200,240,75,0.15)]">
              <h3 className="text-xs uppercase font-bold tracking-wider text-[#18181B] font-mono mb-5">✓ With ClientSpace</h3>
              <div className="flex flex-col gap-4">
                {data.solutions.map((s, i) => (
                  <div key={i} className="flex items-start gap-3 text-sm text-[#18181B] leading-relaxed">
                    <CheckCircle2 size={16} className="text-[#C8F04B] shrink-0 mt-0.5" />
                    {s}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES GRID */}
      <section className="py-16 md:py-24 px-5 md:px-12 bg-white border-t border-[#E4E4E7]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-[#71717A] font-mono">Everything You Need</span>
            <h2 className="text-2xl md:text-3xl font-serif mt-3">One Portal. Every Client Interaction.</h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: FileCheck, title: 'File Delivery', desc: 'Upload and share deliverables with version control and client approval buttons.' },
              { icon: Send, title: 'Feedback Hub', desc: 'Threaded discussions organized by topic. No more lost emails or Slack messages.' },
              { icon: Star, title: 'Invoice Tracking', desc: 'Create and track invoices with payment status. Clients see everything in one place.' },
              { icon: ShieldCheck, title: 'Contract E-Signing', desc: 'Digital signatures with IP logging and timestamps. Legally binding, zero friction.' },
              { icon: Zap, title: 'Milestone Tracking', desc: 'Visual progress tracker so clients always know where the project stands.' },
              { icon: Users, title: 'Client Portal', desc: 'A polished, branded workspace your clients access via a secure magic link.' },
            ].map((f, i) => (
              <div key={i} className="border border-[#E4E4E7] p-5 flex flex-col gap-2 hover:border-[#C8F04B]/50 transition-colors">
                <f.icon size={18} className="text-[#C8F04B]" />
                <h3 className="text-sm font-bold">{f.title}</h3>
                <p className="text-xs text-[#71717A] leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 md:py-24 px-5 md:px-12 border-t border-[#E4E4E7] bg-[#18181B] text-white">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl md:text-4xl font-serif mb-4">
            Ready to Upgrade Your Client Experience?
          </h2>
          <p className="text-sm text-zinc-400 mb-8 max-w-lg mx-auto leading-relaxed">
            Join thousands of {data.title.toLowerCase()} who deliver work with premium clarity. Free to start, no credit card required.
          </p>
          <Link href="/signup" className="inline-flex items-center gap-2 text-[11px] uppercase font-bold tracking-widest px-10 py-4 hover:brightness-95 transition-all group" style={{ background: '#C8F04B', color: '#18181B' }}>
            Create Your Free Space
            <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </section>

      {/* STRUCTURED DATA */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'SoftwareApplication',
            name: 'ClientSpace',
            applicationCategory: 'BusinessApplication',
            operatingSystem: 'Web',
            description: data.description,
            url: `https://www.clientspace.xyz/for/${params.audience}`,
            offers: {
              '@type': 'Offer',
              price: '0',
              priceCurrency: 'USD',
              description: 'Free Starter plan. Pro plan at $12/month adds AI drafting.',
            },
            aggregateRating: {
              '@type': 'AggregateRating',
              ratingValue: '4.9',
              reviewCount: '127',
            },
          }),
        }}
      />
    </div>
  );
}
