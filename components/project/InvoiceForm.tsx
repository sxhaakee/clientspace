'use client';

import React, { useState } from 'react';
import { FileText, Plus, Trash2, Send, CheckCircle2, BanknoteIcon } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { toast } from 'react-hot-toast';

export interface Invoice {
  id: string;
  project_id: string;
  milestone_id: string | null;
  amount: number;
  status: 'draft' | 'sent' | 'paid';
  due_date: string | null;
  payment_url: string | null;
  paid_at: string | null;
  notes: string | null;
}

interface InvoiceFormProps {
  projectId: string;
  invoices: Invoice[];
  onRefresh: () => void;
  freelancerName?: string;
  clientName?: string;
}

interface LineItem {
  description: string;
  amount: string;
}

export const InvoiceForm: React.FC<InvoiceFormProps> = ({
  projectId,
  invoices,
  onRefresh,
  freelancerName = 'Freelancer',
  clientName = 'Client',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [dueDate, setDueDate] = useState('');
  const [paymentInstructions, setPaymentInstructions] = useState('');
  const [lineItems, setLineItems] = useState<LineItem[]>([{ description: '', amount: '' }]);
  const [loading, setLoading] = useState(false);
  const [markingPaid, setMarkingPaid] = useState<string | null>(null);
  const supabase = createClient();

  const handleAddLineItem = () => {
    setLineItems([...lineItems, { description: '', amount: '' }]);
  };

  const handleRemoveLineItem = (index: number) => {
    if (lineItems.length === 1) return;
    setLineItems(lineItems.filter((_, i) => i !== index));
  };

  const handleLineItemChange = (index: number, field: keyof LineItem, value: string) => {
    const updated = [...lineItems];
    updated[index][field] = value;
    setLineItems(updated);
  };

  const calculateTotal = () => {
    return lineItems.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);
  };

  const handleCreateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validLines = lineItems.filter(item => item.description.trim() && parseFloat(item.amount) > 0);
    if (validLines.length === 0) {
      toast.error('At least one valid line item is required');
      return;
    }

    setLoading(true);

    try {
      const totalAmount = calculateTotal();
      
      // Build notes from line items + payment instructions
      const itemSummary = validLines.map(l => `• ${l.description}: $${parseFloat(l.amount).toFixed(2)}`).join('\n');
      const notes = `${itemSummary}${paymentInstructions ? `\n\nPayment Instructions:\n${paymentInstructions}` : ''}`;

      const { data: invData, error } = await supabase
        .from('invoices')
        .insert({
          project_id: projectId,
          amount: totalAmount,
          status: 'sent',
          due_date: dueDate || null,
          payment_url: null, // No payment URL — client pays freelancer directly
          notes,
        })
        .select()
        .single();

      if (error) throw error;

      // Log event
      try {
        const { data: { user } } = await supabase.auth.getUser();
        await supabase.from('logs').insert({
          event: 'invoice_sent',
          project_id: projectId,
          user_id: user?.id,
          meta: { 
            amount: totalAmount,
            invoice_id: invData?.id,
            text: `${freelancerName} issued Invoice INV-${invData?.id?.substring(0, 6).toUpperCase()} for $${parseFloat(totalAmount.toString()).toFixed(2)}`
          },
        });
      } catch { /* non-critical */ }

      // Dispatch invoice notification email to client
      try {
        await fetch('/api/notifications', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'invoice',
            payload: {
              projectId,
              amount: totalAmount,
              dueDate: dueDate ? new Date(dueDate).toLocaleDateString() : 'Immediate',
              paymentInstructions: paymentInstructions || 'Contact freelancer for payment details.',
            }
          })
        });
      } catch (notifyErr) {
        console.warn('Invoice email notification failed: ', notifyErr);
      }

      toast.success('Invoice sent to client portal!');
      setLineItems([{ description: '', amount: '' }]);
      setDueDate('');
      setPaymentInstructions('');
      setIsOpen(false);
      onRefresh();
    } catch (err: unknown) {
      console.error(err);
      toast.error(err instanceof Error ? err.message : 'Failed to dispatch invoice');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkPaid = async (invoiceId: string) => {
    setMarkingPaid(invoiceId);
    try {
      const { error } = await supabase
        .from('invoices')
        .update({ status: 'paid', paid_at: new Date().toISOString() })
        .eq('id', invoiceId);

      if (error) throw error;

      // Log event
      try {
        const { data: { user } } = await supabase.auth.getUser();
        await supabase.from('logs').insert({
          event: 'invoice_paid',
          project_id: projectId,
          user_id: user?.id,
          meta: {
            invoice_id: invoiceId,
            text: `${freelancerName} confirmed payment of Invoice INV-${invoiceId.substring(0, 6).toUpperCase()}`
          },
        });
      } catch { /* non-critical */ }

      toast.success('Invoice marked as paid!');
      onRefresh();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to update invoice');
    } finally {
      setMarkingPaid(null);
    }
  };

  const statusVariants = {
    draft: 'gray' as const,
    sent: 'amber' as const,
    paid: 'green' as const,
  };

  return (
    <div className="bg-brand-surface border border-brand-border p-4 sm:p-6 flex flex-col gap-6 select-none animate-fade-in">
      {/* Header */}
      <div className="border-b border-brand-border pb-3 flex items-center justify-between">
        <span className="text-[10px] uppercase font-bold tracking-wider text-brand-muted flex items-center gap-1.5 font-mono">
          <FileText size={12} />
          Invoices & Billings
        </span>
        <button
          onClick={() => setIsOpen(true)}
          className="text-brand-text hover:text-brand-accent p-1 transition-colors border border-transparent"
        >
          <Plus size={16} />
        </button>
      </div>

      {/* Invoice List */}
      {invoices.length === 0 ? (
        <div className="text-[11px] text-brand-muted font-sans text-center py-2">
          No invoices created yet. Click + to bill client.
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          <div className="flex flex-col border border-brand-border bg-brand-bg/30 divide-y divide-brand-border">
            {invoices.map((inv) => (
              <div key={inv.id} className="p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="p-2 bg-brand-surface border border-brand-border text-brand-text shrink-0">
                    <FileText size={16} />
                  </div>
                  
                  <div className="flex flex-col min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-semibold text-brand-text truncate">
                        INV-{inv.id.substring(0, 6).toUpperCase()}
                      </span>
                      <Badge variant={statusVariants[inv.status]}>{inv.status}</Badge>
                    </div>

                    <span className="text-[10px] text-brand-muted font-mono uppercase mt-0.5">
                      {inv.due_date
                        ? `Due: ${new Date(inv.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
                        : 'No due date'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 sm:gap-4 shrink-0">
                  <span className="text-xs font-mono font-bold text-brand-text">
                    ${Number(inv.amount).toFixed(2)}
                  </span>
                  
                  {inv.status === 'paid' ? (
                    <div className="p-1 border border-brand-border bg-brand-surface text-success text-[10px] font-bold uppercase font-mono tracking-wider flex items-center gap-1">
                      <CheckCircle2 size={10} />
                      Paid
                    </div>
                  ) : (
                    <button
                      onClick={() => handleMarkPaid(inv.id)}
                      disabled={markingPaid === inv.id}
                      className="text-[9px] uppercase font-bold tracking-wider text-brand-text hover:text-success border border-brand-border bg-brand-surface px-2.5 py-1.5 flex items-center gap-1 hover:border-success transition-all disabled:opacity-40"
                    >
                      <BanknoteIcon size={10} />
                      {markingPaid === inv.id ? 'Saving...' : 'Mark Paid'}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Invoice Creation Modal */}
      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Create Client Invoice">
        <form onSubmit={handleCreateInvoice} className="flex flex-col gap-5">
          <Input
            label="Due Date"
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            required
          />

          {/* Payment Instructions */}
          <div className="flex flex-col gap-1.5">
            <span className="text-[10px] uppercase tracking-wider text-brand-muted font-bold font-mono">
              Payment Instructions (visible to client)
            </span>
            <textarea
              placeholder="e.g. Bank: XYZ Bank, A/C: 1234567890, IFSC: XYZB0001234&#10;Or: PayPal me@email.com&#10;Or: UPI: myid@upi"
              value={paymentInstructions}
              onChange={(e) => setPaymentInstructions(e.target.value)}
              rows={3}
              className="w-full border border-brand-border bg-brand-surface text-xs px-3 py-2.5 focus:outline-none focus:border-brand-text text-brand-text placeholder-brand-muted/50 resize-none font-sans"
            />
            <span className="text-[9px] text-brand-muted">
              Client pays you directly — ClientSpace never processes or holds funds.
            </span>
          </div>

          {/* Line Items Table */}
          <div className="flex flex-col gap-2">
            <span className="text-[10px] uppercase tracking-wider text-brand-muted font-bold font-mono">
              Line Items
            </span>
            
            <div className="flex flex-col gap-3">
              {lineItems.map((item, index) => (
                <div key={index} className="flex items-end gap-2 sm:gap-3">
                  <div className="flex-1">
                    <Input
                      placeholder="Item description"
                      value={item.description}
                      onChange={(e) => handleLineItemChange(index, 'description', e.target.value)}
                      required
                    />
                  </div>
                  
                  <div className="w-24 sm:w-28">
                    <Input
                      placeholder="$ Amount"
                      type="number"
                      step="0.01"
                      value={item.amount}
                      onChange={(e) => handleLineItemChange(index, 'amount', e.target.value)}
                      required
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRemoveLineItem(index)}
                    disabled={lineItems.length === 1}
                    className="p-2 border border-brand-border hover:border-danger hover:text-danger text-brand-muted bg-brand-surface disabled:opacity-40 disabled:pointer-events-none transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>

             <button
              type="button"
              onClick={handleAddLineItem}
              className="text-[10px] uppercase font-bold tracking-wider text-brand-text hover:text-brand-muted mt-2 flex items-center gap-1 font-mono self-start border-b border-[#C8F04B] hover:border-brand-text transition-colors"
            >
              <Plus size={12} />
              Add Line Item
            </button>
          </div>

          {/* Sum Subtotal */}
          <div className="border-t border-brand-border pt-4 flex items-center justify-between">
            <span className="text-xs text-brand-muted uppercase font-bold tracking-wider font-mono">
              Total:
            </span>
            <span className="text-lg font-mono font-bold text-brand-text">
              ${calculateTotal().toFixed(2)}
            </span>
          </div>

          <div className="border-t border-brand-border pt-4 flex justify-end gap-2">
            <Button variant="outline" type="button" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="secondary" isLoading={loading} className="flex items-center gap-2">
              <Send size={12} />
              Send Invoice
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
