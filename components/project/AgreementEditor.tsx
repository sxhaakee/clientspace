'use client';

import React, { useState, useEffect } from 'react';
import { ShieldCheck, FileCode, Check, Send } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/Button';
import { toast } from 'react-hot-toast';

interface AgreementEditorProps {
  projectId: string;
  contract: any;
  onRefresh: () => void;
  freelancerName: string;
  clientName: string;
}

export const AgreementEditor: React.FC<AgreementEditorProps> = ({
  projectId,
  contract,
  onRefresh,
  freelancerName,
  clientName,
}) => {
  const [body, setBody] = useState('');
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    if (contract) {
      setBody(contract.body || '');
      setIsEditing(!contract.client_signed);
    } else {
      // Default template
      setBody(
        `## Services Agreement\n\nThis agreement is made between **${freelancerName}** (the "Service Provider") and **${clientName}** (the "Client").\n\n### 1. Scope of Work\nThe Service Provider agrees to deliver the services as described in the project dashboard.\n\n### 2. Fees & Payment\nPayment will be structured according to project milestones agreed upon. Outstanding balances must be paid within the timeline specified in individual invoices.\n\n### 3. Acceptance\nBy clicking the e-sign button in the client portal, the Client accepts the terms and conditions outlined in this agreement.`
      );
      setIsEditing(true);
    }
  }, [contract, freelancerName, clientName]);

  const handleSave = async () => {
    if (!body.trim()) {
      toast.error('Agreement content cannot be empty.');
      return;
    }

    setLoading(true);
    try {
      if (contract) {
        // Update existing
        const { error } = await supabase
          .from('contracts')
          .update({ body: body.trim() })
          .eq('id', contract.id);
        if (error) throw error;
        toast.success('Agreement updated successfully!');
      } else {
        // Create new
        const { error } = await supabase.from('contracts').insert({
          project_id: projectId,
          body: body.trim(),
        });
        if (error) throw error;
        toast.success('Agreement created and published to portal!');
      }

      // Log event
      await supabase.from('logs').insert({
        event: 'contract_updated',
        project_id: projectId,
        meta: {
          text: `${freelancerName} updated the service agreement`
        }
      });

      onRefresh();
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Failed to save agreement');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-brand-surface border border-brand-border p-6 flex flex-col gap-4 select-none">
      <div className="border-b border-brand-border pb-3 flex items-center justify-between font-mono">
        <div className="flex items-center gap-1.5">
          <FileCode size={12} className="text-brand-muted" />
          <span className="text-[10px] uppercase font-bold tracking-wider text-brand-muted">
            Legal & Agreement Draft
          </span>
        </div>
        {contract?.client_signed && (
          <span className="inline-flex items-center gap-1 text-[9px] uppercase font-bold text-success bg-success/10 px-2 py-0.5 border border-success/20">
            Signed & Locked
          </span>
        )}
      </div>

      {isEditing ? (
        <div className="flex flex-col gap-3">
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Write agreement terms using markdown..."
            rows={8}
            className="w-full bg-brand-bg border border-brand-border text-brand-text text-xs p-3 focus:outline-none focus:border-brand-accent transition-colors font-mono resize-y leading-relaxed"
          />
          <div className="flex justify-end gap-2">
            <Button
              onClick={handleSave}
              isLoading={loading}
              variant="secondary"
              className="text-[10px] uppercase tracking-wider font-bold h-9 px-4 flex items-center gap-1.5"
            >
              <Send size={11} />
              Publish Agreement
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <div className="bg-brand-bg/40 border border-brand-border p-3 max-h-48 overflow-y-auto">
            <pre className="text-[11px] text-brand-muted font-mono whitespace-pre-wrap leading-relaxed">
              {body}
            </pre>
          </div>

          {contract?.client_signed ? (
            <div className="bg-success/5 border border-success/20 p-3.5 flex flex-col gap-2 font-mono text-[9px] text-success">
              <div className="flex items-center gap-1.5 font-bold uppercase text-[10px]">
                <ShieldCheck size={12} />
                Signed by {clientName}
              </div>
              <div className="flex flex-col gap-0.5 mt-1 border-t border-success/10 pt-1.5 text-brand-muted">
                <span>IP ADDRESS: {contract.ip_address || 'Unrecorded'}</span>
                <span>TIMESTAMP: {new Date(contract.signed_at).toLocaleString()}</span>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-brand-muted italic">Awaiting client signature...</span>
              <button
                onClick={() => setIsEditing(true)}
                className="text-[10px] uppercase font-bold tracking-wider text-brand-accent hover:underline"
              >
                Edit Draft
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
