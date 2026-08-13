import type { Metadata } from 'next';
import { DM_Sans, DM_Serif_Display, JetBrains_Mono } from 'next/font/google';
import { Toaster } from 'react-hot-toast';
import './globals.css';

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dm-sans',
  weight: ['300', '400', '500', '700'],
});

const dmSerifDisplay = DM_Serif_Display({
  subsets: ['latin'],
  variable: '--font-dm-serif-display',
  weight: ['400'],
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
  weight: ['400', '500', '700'],
});

const getAppUrl = () => {
  const url = process.env.NEXT_PUBLIC_APP_URL || 'https://www.clientspace.xyz';
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  return `https://${url}`;
};

const APP_URL = getAppUrl();

export const metadata: Metadata = {
  title: {
    default: 'ClientSpace — Best Client Portal Software for Freelancers & Agencies',
    template: '%s | ClientSpace',
  },
  description: 'The #1 client experience platform for freelancers. Deliver projects, share files, collect feedback, send invoices, sign contracts — all from one beautiful workspace. Free to start.',
  keywords: [
    'client portal software',
    'freelancer client portal',
    'best client portal for freelancers',
    'client management software',
    'freelance invoicing tool',
    'project delivery platform',
    'freelancer tools',
    'client workspace',
    'contract e-signing',
    'file delivery for freelancers',
    'milestone tracking',
    'freelancer dashboard',
    'client portal for agencies',
    'freelance project management',
    'ClientSpace',
    'client portal alternative to bonsai',
    'honeybook alternative',
    'dubsado alternative',
    'freelance client management',
    'share files with clients',
    'client approval software',
  ],
  authors: [{ name: 'ClientSpace' }],
  creator: 'ClientSpace',
  publisher: 'ClientSpace',
  metadataBase: new URL(APP_URL),
  alternates: {
    canonical: APP_URL,
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: APP_URL,
    siteName: 'ClientSpace',
    title: 'ClientSpace — The Client Experience OS for Freelancers',
    description: 'Deliver projects with premium clarity. Files, feedback, invoices, contracts — one elegant workspace your clients will love.',
    images: [
      {
        url: `${APP_URL}/og-image.png`,
        width: 1200,
        height: 630,
        alt: 'ClientSpace — Best Client Portal for Freelancers',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ClientSpace — Best Client Portal for Freelancers',
    description: 'Deliver projects with premium clarity. Free to start, no credit card required.',
    images: [`${APP_URL}/og-image.png`],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: '/favicon.ico',
  },
  other: {
    'theme-color': '#161618',
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${dmSans.variable} ${dmSerifDisplay.variable} ${jetbrainsMono.variable}`}
    >
      <body className="antialiased font-sans bg-brand-bg text-brand-text min-h-screen">
        {children}
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: '#161618',
              color: '#F0EFE8',
              border: '1px solid #2A2A2E',
              borderRadius: '0px',
              fontFamily: 'var(--font-dm-sans), sans-serif',
            },
            success: {
              iconTheme: {
                primary: '#C8F04B',
                secondary: '#161618',
              },
            },
          }}
        />
      </body>
    </html>
  );
}
