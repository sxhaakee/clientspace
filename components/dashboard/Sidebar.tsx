'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, Briefcase, Settings, CreditCard, LogOut, User, Shield, Menu, X } from 'lucide-react';
import { Logo } from '@/components/ui/Logo';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'react-hot-toast';

export const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserEmail(user.email ?? null);
        setUserName(user.user_metadata?.full_name ?? user.email?.split('@')[0] ?? null);

        // Fetch user role
        const { data: profile } = await supabase
          .from('users')
          .select('role')
          .eq('id', user.id)
          .single();
        
        if (profile?.role === 'admin') {
          setIsAdmin(true);
        }
      }
    };
    fetchUser();
  }, [supabase]);

  // Close mobile nav on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Projects', href: '/dashboard/projects', icon: Briefcase },
    { name: 'Billing', href: '/dashboard/billing', icon: CreditCard },
    ...(isAdmin ? [{ name: 'Admin Control', href: '/dashboard/admin', icon: Shield }] : []),
    { name: 'Settings', href: '/dashboard/settings', icon: Settings },
  ];

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      toast.success('Logged out successfully.');
      router.push('/login');
      router.refresh();
    } catch (err) {
      console.error('Logout error:', err);
      toast.error('Error logging out.');
    }
  };

  const sidebarContent = (
    <>
      {/* Top Section */}
      <div className="flex flex-col">
        {/* Logo Container */}
        <div className="p-6 border-b border-brand-border flex items-center justify-between">
          <Logo size="md" />
          {/* Close button — only visible on mobile */}
          <button
            onClick={() => setMobileOpen(false)}
            className="lg:hidden p-1 text-brand-muted hover:text-brand-text transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="mt-6 flex flex-col">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-6 py-3.5 text-xs font-medium uppercase tracking-wider transition-colors border-l-2 ${
                  isActive
                    ? 'bg-brand-bg/50 border-brand-accent text-brand-text font-bold'
                    : 'border-transparent text-brand-muted hover:text-brand-text hover:bg-brand-bg/20'
                }`}
              >
                <Icon size={16} className={isActive ? 'text-brand-accent' : 'text-brand-muted'} />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom Section (User Card & Log Out) */}
      <div className="p-4 border-t border-brand-border flex flex-col gap-3">
        {/* User Card */}
        <div className="flex items-center gap-3 px-2 py-1.5 bg-brand-bg/30 border border-brand-border/40">
          <div className="w-8 h-8 bg-brand-border flex items-center justify-center text-brand-accent border border-brand-border shrink-0">
            <User size={14} />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-xs font-semibold text-brand-text truncate">
              {userName || 'User'}
            </span>
            <span className="text-[9px] text-brand-muted truncate mono font-mono uppercase">
              {userEmail || 'Loading...'}
            </span>
          </div>
        </div>

        {/* Logout Button */}
        <button
          onClick={handleSignOut}
          className="flex items-center justify-center gap-2 w-full py-2 bg-transparent hover:bg-danger/10 border border-brand-border hover:border-danger/30 text-brand-muted hover:text-danger text-[10px] uppercase font-bold tracking-wider transition-colors"
        >
          <LogOut size={12} />
          Log Out
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile Hamburger Button — fixed in top-left corner */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-[60] p-2.5 bg-brand-surface border border-brand-border text-brand-text hover:bg-brand-bg transition-colors shadow-sm"
        aria-label="Open navigation menu"
      >
        <Menu size={18} />
      </button>

      {/* Mobile Overlay Backdrop */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/30 z-[70] backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar — Desktop: always visible. Mobile: slide-in overlay */}
      <aside
        className={`
          fixed lg:sticky top-0 left-0 z-[80] h-screen w-64
          bg-brand-surface border-r border-brand-border
          flex flex-col justify-between select-none
          transition-transform duration-300 ease-in-out
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {sidebarContent}
      </aside>
    </>
  );
};
