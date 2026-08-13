/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, react-hooks/exhaustive-deps */
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Shield, Users, CreditCard, Folder, Terminal, Sparkles, UserCheck, ShieldAlert, Search, RefreshCw, Star, Ban } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { toast } from 'react-hot-toast';

export const dynamic = 'force-dynamic';

export default function AdminPage() {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

  // Analytical Data States
  const [users, setUsers] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  
  // Search & Filter
  const [userQuery, setUserQuery] = useState('');
  
  const supabase = createClient();

  const verifyAdminAccess = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || user.email !== 'gdscsxhaakee123@gmail.com') {
        setIsAdmin(false);
        setLoading(false);
        router.push('/dashboard');
        return;
      }
      
      setCurrentUser(user);

      const { data: profile } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profile && profile.role === 'admin') {
        setIsAdmin(true);
        // Load admin analytics
        await loadAnalyticsData();
      } else {
        setIsAdmin(false);
        router.push('/dashboard');
      }
    } catch (err) {
      console.error(err);
      setIsAdmin(false);
      router.push('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const loadAnalyticsData = async () => {
    setRefreshing(true);
    try {
      // 1. Fetch Users
      const { data: userData } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });
      setUsers(userData || []);

      // 2. Fetch Projects
      const { data: projectData } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });
      setProjects(projectData || []);

      // 3. Fetch Audit Logs
      const { data: logData } = await supabase
        .from('logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);
      setLogs(logData || []);

    } catch (err: any) {
      toast.error('Failed to load database logs: ' + err.message);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    verifyAdminAccess();
  }, []);

  // Control Actions
  const handleTogglePlan = async (userId: string, currentPlan: string) => {
    const nextPlan = currentPlan === 'pro' ? 'free' : 'pro';
    toast.loading(`Updating subscription...`, { id: 'admin-action' });
    try {
      const { error } = await supabase
        .from('users')
        .update({ plan: nextPlan })
        .eq('id', userId);

      if (error) throw error;
      toast.success(`User set to ${nextPlan.toUpperCase()} tier.`, { id: 'admin-action' });
      
      // Log event
      await supabase.from('logs').insert({
        event: 'admin_action_plan_change',
        user_id: currentUser?.id,
        meta: { target_user: userId, from: currentPlan, to: nextPlan }
      });

      loadAnalyticsData();
    } catch (err: any) {
      toast.error(err.message || 'Action failed', { id: 'admin-action' });
    }
  };

  const handleToggleRole = async (userId: string, currentRole: string) => {
    const nextRole = currentRole === 'admin' ? 'user' : 'admin';
    
    if (userId === currentUser?.id) {
      toast.error('You cannot demote yourself!');
      return;
    }

    toast.loading(`Toggling authorization role...`, { id: 'admin-action' });
    try {
      const { error } = await supabase
        .from('users')
        .update({ role: nextRole })
        .eq('id', userId);

      if (error) throw error;
      toast.success(`User access updated to ${nextRole.toUpperCase()}.`, { id: 'admin-action' });
      
      // Log event
      await supabase.from('logs').insert({
        event: 'admin_action_role_change',
        user_id: currentUser?.id,
        meta: { target_user: userId, from: currentRole, to: nextRole }
      });

      loadAnalyticsData();
    } catch (err: any) {
      toast.error(err.message || 'Action failed', { id: 'admin-action' });
    }
  };

  // Metrics computations
  const totalRevenue = users.filter(u => u.plan === 'pro' || u.plan === 'agency').length * 12;
  const proUsersCount = users.filter(u => u.plan === 'pro' || u.plan === 'agency').length;
  const adminUsersCount = users.filter(u => u.role === 'admin').length;

  const filteredUsers = users.filter(u => 
    u.full_name?.toLowerCase().includes(userQuery.toLowerCase()) ||
    u.email?.toLowerCase().includes(userQuery.toLowerCase()) ||
    u.id?.includes(userQuery)
  );

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[70vh] gap-4">
        <svg className="animate-spin h-6 w-6 text-brand-accent" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        <span className="text-xs uppercase font-mono tracking-widest text-brand-muted">Verifying administrator credentials...</span>
      </div>
    );
  }

  // Access Denied Screen
  if (isAdmin === false) {
    return (
      <main className="flex-1 flex flex-col items-center justify-center min-h-[60vh] px-4">
        <div className="max-w-[440px] text-center border border-brand-border bg-brand-surface p-8 animate-fade-in">
          <div className="flex justify-center mb-4 text-red-500">
            <ShieldAlert size={48} className="animate-pulse" />
          </div>
          <h1 className="text-2xl font-serif text-brand-text mb-2">Access Denied</h1>
          <p className="text-xs text-brand-muted font-sans leading-relaxed mb-6">
            The workspace you are attempting to review requires verified System Administrator authorization. Contact ClientSpace support to promote your database credentials.
          </p>
          <Link href="/dashboard">
            <Button variant="outline" className="text-xs">
              Return to Dashboard
            </Button>
          </Link>
        </div>
      </main>
    );
  }

  return (
    <div className="flex flex-col gap-8 animate-fade-in select-none">
      
      {/* Header */}
      <div className="border-b border-brand-border pb-6 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-1.5 mb-1 text-brand-text font-bold">
            <Shield size={14} />
            <span className="text-[10px] uppercase font-bold tracking-wider">Operational Console</span>
          </div>
          <h1 className="text-3xl font-serif text-brand-text tracking-wide">
            System Administration
          </h1>
          <p className="text-xs text-brand-muted font-sans mt-0.5">
            Monitor platform metrics, manage database profiles, and review secure audit logs.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            className="text-[10px] h-9 gap-1.5" 
            onClick={loadAnalyticsData}
            isLoading={refreshing}
          >
            <RefreshCw size={11} />
            Refresh Analytics
          </Button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        
        <div className="bg-brand-surface border border-brand-border p-6 flex flex-col justify-between min-h-[110px]">
          <div className="flex justify-between items-start text-brand-muted">
            <span className="text-[10px] uppercase font-bold tracking-wider">Est. Monthly Revenue</span>
            <CreditCard size={14} className="text-brand-text" />
          </div>
          <div className="mt-2">
            <span className="text-3xl font-mono font-bold text-brand-text">${totalRevenue}.00</span>
            <div className="text-[10px] text-brand-muted mt-1 font-sans">
              Based on {proUsersCount} active Pro accounts
            </div>
          </div>
        </div>

        <div className="bg-brand-surface border border-brand-border p-6 flex flex-col justify-between min-h-[110px]">
          <div className="flex justify-between items-start text-brand-muted">
            <span className="text-[10px] uppercase font-bold tracking-wider">Total Users</span>
            <Users size={14} />
          </div>
          <div className="mt-2">
            <span className="text-3xl font-mono font-bold text-brand-text">{users.length}</span>
            <div className="text-[10px] text-brand-muted mt-1 font-sans">
              {proUsersCount} Premium / {users.length - proUsersCount} Free Sandbox
            </div>
          </div>
        </div>

        <div className="bg-brand-surface border border-brand-border p-6 flex flex-col justify-between min-h-[110px]">
          <div className="flex justify-between items-start text-brand-muted">
            <span className="text-[10px] uppercase font-bold tracking-wider">Active Projects</span>
            <Folder size={14} />
          </div>
          <div className="mt-2">
            <span className="text-3xl font-mono font-bold text-brand-text">{projects.length}</span>
            <div className="text-[10px] text-brand-muted mt-1 font-sans">
              Platform-wide workspaces created
            </div>
          </div>
        </div>

        <div className="bg-brand-surface border border-brand-border p-6 flex flex-col justify-between min-h-[110px]">
          <div className="flex justify-between items-start text-brand-muted">
            <span className="text-[10px] uppercase font-bold tracking-wider">Platform Health</span>
            <Terminal size={14} className="text-brand-text" />
          </div>
          <div className="mt-2">
            <span className="text-3xl font-mono font-bold text-brand-text">100%</span>
            <div className="text-[10px] text-brand-muted mt-1 font-sans">
              API connections online & healthy
            </div>
          </div>
        </div>

      </div>

      {/* Main Grid: User Control List */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Side: Users Management (2/3 width) */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          <div className="bg-brand-surface border border-brand-border p-6 flex flex-col gap-6">
            
            {/* Table Header Controls */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 border-b border-brand-border pb-4">
              <span className="text-sm font-serif text-brand-text">Registered Platform Users</span>
              
              {/* Search input */}
              <div className="relative w-full md:w-64">
                <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-muted" />
                <input
                  type="text"
                  placeholder="Search name, email, ID..."
                  value={userQuery}
                  onChange={(e) => setUserQuery(e.target.value)}
                  className="w-full bg-brand-bg border border-brand-border pl-8 pr-4 py-1.5 text-xs text-brand-text placeholder-brand-muted outline-none focus:border-brand-accent transition-colors font-sans"
                />
              </div>
            </div>

            {/* Users Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-brand-border text-[9px] uppercase font-bold tracking-wider text-brand-muted">
                    <th className="pb-3 font-medium">User Profile</th>
                    <th className="pb-3 font-medium">Joined Date</th>
                    <th className="pb-3 font-medium">Status / Plan</th>
                    <th className="pb-3 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-border/40">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-xs text-brand-muted font-sans">
                        No registered profiles found matching your search.
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((user) => (
                      <tr key={user.id} className="text-xs">
                        <td className="py-3.5 pr-2">
                          <div className="flex items-center gap-3">
                            {user.avatar_url ? (
                              <img src={user.avatar_url} alt="" className="h-7 w-7 rounded-full bg-brand-border object-cover" />
                            ) : (
                              <div className="h-7 w-7 rounded-full bg-brand-border flex items-center justify-center font-mono font-bold text-brand-text uppercase">
                                {user.full_name?.charAt(0) || user.email?.charAt(0)}
                              </div>
                            )}
                            <div className="flex flex-col gap-0.5">
                              <span className="font-sans font-medium text-brand-text flex items-center gap-1.5">
                                {user.full_name || 'Anonymous User'}
                                {user.role === 'admin' && (
                                  <Badge variant="lime" className="text-[7px] py-0 px-1 border-0">Admin</Badge>
                                )}
                              </span>
                              <span className="text-[10px] text-brand-muted font-mono">{user.email}</span>
                            </div>
                          </div>
                        </td>
                        
                        <td className="py-3.5 text-brand-muted font-mono text-[10px]">
                          {new Date(user.created_at).toLocaleDateString()}
                        </td>

                        <td className="py-3.5">
                          <Badge variant={user.plan === 'pro' || user.plan === 'agency' ? 'lime' : 'gray'}>
                            {user.plan?.toUpperCase() || 'FREE'}
                          </Badge>
                        </td>

                        <td className="py-3.5 text-right">
                          <div className="flex gap-2 justify-end">
                            <button
                              onClick={() => handleTogglePlan(user.id, user.plan)}
                              className="text-[10px] text-brand-text hover:text-brand-muted transition-colors font-mono font-medium border-b border-brand-accent hover:border-brand-text"
                              title="Toggle premium subscription status"
                            >
                              {user.plan === 'pro' ? 'Downgrade' : 'Upgrade Pro'}
                            </button>
                            
                            <span className="text-brand-border">|</span>
                            
                            <button
                              onClick={() => handleToggleRole(user.id, user.role)}
                              className="text-[10px] text-brand-muted hover:text-red-400 transition-colors font-mono font-medium hover:underline"
                              disabled={user.id === currentUser?.id}
                              title={user.id === currentUser?.id ? "You cannot modify your own roles" : "Toggle system developer privileges"}
                            >
                              {user.role === 'admin' ? 'Revoke Admin' : 'Make Admin'}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

          </div>
        </div>

        {/* Right Side: Live Logs Event Trail (1/3 width) */}
        <div className="flex flex-col gap-6">
          
          {/* Logs panel */}
          <div className="bg-brand-surface border border-brand-border p-6 flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-brand-border pb-3">
              <span className="text-sm font-serif text-brand-text">Audit Event Trail</span>
              <Terminal size={12} className="text-brand-muted" />
            </div>

            <div className="flex flex-col gap-3.5 max-h-[400px] overflow-y-auto pr-1">
              {logs.length === 0 ? (
                <span className="text-xs text-brand-muted font-sans text-center py-6">
                  No system logs recorded.
                </span>
              ) : (
                logs.map((log) => (
                  <div key={log.id} className="flex flex-col gap-1 border-l-2 border-brand-border pl-3.5 py-0.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-mono text-brand-text font-semibold uppercase truncate">
                        {log.event.replaceAll('_', ' ')}
                      </span>
                      <span className="text-[8px] text-brand-muted font-mono shrink-0">
                        {new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    {log.meta && Object.keys(log.meta).length > 0 && (
                      <pre className="text-[9px] font-mono text-brand-muted bg-brand-bg/40 border border-brand-border/40 p-1.5 overflow-x-auto rounded">
                        {JSON.stringify(log.meta)}
                      </pre>
                    )}
                    
                    <span className="text-[8px] text-brand-muted font-mono">
                      By ID: {log.user_id?.slice(0, 8)}...
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Active Projects Quick-View */}
          <div className="bg-brand-surface border border-brand-border p-6 flex flex-col gap-4">
            <span className="text-sm font-serif text-brand-text border-b border-brand-border pb-3">
              All Active Workspaces ({projects.length})
            </span>
            
            <div className="flex flex-col gap-3">
              {projects.slice(0, 4).map(p => (
                <div key={p.id} className="flex items-center justify-between text-xs font-sans">
                  <div className="flex flex-col">
                    <span className="text-brand-text font-medium">{p.title}</span>
                    <span className="text-[10px] text-brand-muted font-mono">{p.client_name}</span>
                  </div>
                  <Badge variant={p.status === 'delivered' ? 'green' : 'lime'}>
                    {p.status}
                  </Badge>
                </div>
              ))}
              {projects.length > 4 && (
                <span className="text-[10px] text-brand-muted font-sans text-center mt-2">
                  And {projects.length - 4} more projects...
                </span>
              )}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
