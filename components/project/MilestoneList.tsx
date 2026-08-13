'use client';

import React, { useState } from 'react';
import { DollarSign, Plus, Calendar } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { toast } from 'react-hot-toast';

export interface Milestone {
  id: string;
  project_id: string;
  title: string;
  amount: number;
  due_date: string | null;
  status: 'pending' | 'invoiced' | 'paid';
}

interface MilestoneListProps {
  projectId: string;
  milestones: Milestone[];
  onRefresh: () => void;
}

export const MilestoneList: React.FC<MilestoneListProps> = ({
  projectId,
  milestones,
  onRefresh,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [billingLoading, setBillingLoading] = useState<string | null>(null);
  
  const supabase = createClient();

  const handleCreateMilestone = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !amount) {
      toast.error('Title and Amount are required');
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase
        .from('milestones')
        .insert({
          project_id: projectId,
          title,
          amount: parseFloat(amount),
          due_date: dueDate || null,
          status: 'pending',
        });

      if (error) throw error;

      toast.success('Milestone created!');
      setTitle('');
      setAmount('');
      setDueDate('');
      setIsModalOpen(false);
      onRefresh();
    } catch (err: unknown) {
      console.error(err);
      toast.error(err instanceof Error ? err.message : 'Failed to create milestone');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateInvoice = async (milestone: Milestone) => {
    setBillingLoading(milestone.id);
    try {
      // 1. Create a checkout link using Lemon Squeezy (or custom mock payment placeholder URL until post-launch keys)
      const paymentUrl = `https://checkout.lemonsqueezy.com/checkout/buy/mock?amount=${milestone.amount}&invoice_id=mock_${milestone.id}`;

      // 2. Insert invoice row
      const { error: invoiceError } = await supabase
        .from('invoices')
        .insert({
          project_id: projectId,
          milestone_id: milestone.id,
          amount: milestone.amount,
          status: 'sent', // Automatically send invoice
          due_date: milestone.due_date,
          payment_url: paymentUrl,
        });

      if (invoiceError) throw invoiceError;

      // 3. Update milestone status to 'invoiced'
      const { error: milestoneError } = await supabase
        .from('milestones')
        .update({ status: 'invoiced' })
        .eq('id', milestone.id);

      if (milestoneError) throw milestoneError;

      // 4. Log event
      await supabase.from('logs').insert({
        event: 'invoice_sent',
        project_id: projectId,
        meta: { amount: milestone.amount, milestone_id: milestone.id },
      });

      // Dispatch invoice notification email to client
      try {
        await fetch('/api/notifications', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'invoice',
            payload: {
              projectId,
              amount: milestone.amount,
              dueDate: milestone.due_date ? new Date(milestone.due_date).toLocaleDateString() : 'Immediate',
              paymentUrl,
            }
          })
        });
      } catch (notifyErr) {
        console.warn('Invoice email notification failed: ', notifyErr);
      }

      toast.success('Invoice generated and sent to client!');
      onRefresh();
    } catch (err: unknown) {
      console.error(err);
      toast.error(err instanceof Error ? err.message : 'Failed to generate invoice');
    } finally {
      setBillingLoading(null);
    }
  };

  const statusVariants = {
    pending: 'gray' as const,
    invoiced: 'amber' as const,
    paid: 'green' as const,
  };

  return (
    <div className="bg-brand-surface border border-brand-border p-6 flex flex-col gap-5 select-none">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-brand-border pb-3">
        <span className="text-[10px] uppercase font-bold tracking-wider text-brand-muted flex items-center gap-1.5 font-mono">
          <DollarSign size={12} />
          Payment Milestones
        </span>
        <button
          onClick={() => setIsModalOpen(true)}
          className="text-brand-text hover:text-brand-accent p-1 transition-colors border border-transparent"
        >
          <Plus size={16} />
        </button>
      </div>

      {/* List */}
      {milestones.length === 0 ? (
        <div className="text-[11px] text-brand-muted font-sans py-4 text-center">
          No payment milestones defined. Click + to add.
        </div>
      ) : (
        <div className="flex flex-col divide-y divide-brand-border/60">
          {milestones.map((milestone) => (
            <div key={milestone.id} className="py-4 first:pt-0 last:pb-0 flex items-center justify-between gap-4">
              <div className="flex flex-col gap-1 min-w-0">
                <span className="text-xs font-semibold text-brand-text truncate">
                  {milestone.title}
                </span>
                
                <div className="flex items-center gap-2 text-[10px] text-brand-muted font-mono uppercase">
                  <span>${Number(milestone.amount).toFixed(2)}</span>
                  <span>•</span>
                  <div className="flex items-center gap-1">
                    <Calendar size={10} />
                    <span>
                      {milestone.due_date
                        ? new Date(milestone.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                        : 'No date'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action / Badge Column */}
              <div className="flex items-center gap-3 shrink-0">
                <Badge variant={statusVariants[milestone.status]}>
                  {milestone.status}
                </Badge>
                
                {milestone.status === 'pending' && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-[9px] h-7 px-2.5 font-bold"
                    isLoading={billingLoading === milestone.id}
                    onClick={() => handleGenerateInvoice(milestone)}
                  >
                    Bill
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Milestone Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add Payment Milestone">
        <form onSubmit={handleCreateMilestone} className="flex flex-col gap-5">
          <Input
            label="Milestone Title"
            placeholder="e.g. 50% Upfront Deposit"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Amount ($)"
              type="number"
              step="0.01"
              placeholder="e.g. 1500"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />

            <Input
              label="Target Due Date"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>

          <div className="border-t border-brand-border pt-4 flex justify-end gap-2 mt-2">
            <Button variant="outline" type="button" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="secondary" isLoading={loading}>
              Create Milestone
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
