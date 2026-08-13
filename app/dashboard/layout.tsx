import React from 'react';
import { Sidebar } from '@/components/dashboard/Sidebar';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex bg-brand-bg text-brand-text min-h-screen">
      {/* Persistent Sidebar (Desktop sticky, Mobile overlay via internal state) */}
      <Sidebar />

      {/* Main Workspace Scroll Area */}
      <main className="flex-1 min-h-screen overflow-y-auto bg-brand-bg px-4 pt-16 pb-10 sm:px-6 md:px-8 lg:px-12 lg:pt-10">
        <div className="max-w-6xl mx-auto w-full flex flex-col gap-8">
          {children}
        </div>
      </main>
    </div>
  );
}
