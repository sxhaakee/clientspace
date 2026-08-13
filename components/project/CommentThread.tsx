'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Send, MessageSquare } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/Button';
import { toast } from 'react-hot-toast';

export interface Comment {
  id: string;
  project_id: string;
  sender: 'freelancer' | 'client';
  body: string;
  created_at: string;
}

interface CommentThreadProps {
  projectId: string;
  comments: Comment[];
  sender: 'freelancer' | 'client';
  onRefresh: () => void;
  portalToken?: string; // Optional token for clientportal mutations
  freelancerName?: string;
  clientName?: string;
}

export const CommentThread: React.FC<CommentThreadProps> = ({
  projectId,
  comments,
  sender,
  onRefresh,
  portalToken,
  freelancerName = 'Freelancer',
  clientName = 'Client',
}) => {
  const [body, setBody] = useState('');
  const [loading, setLoading] = useState(false);
  const threadEndRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();

  useEffect(() => {
    threadEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [comments]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!body.trim()) return;

    setLoading(true);

    try {
      if (sender === 'client' && portalToken) {
        // Use secure RPC for public client
        const { error } = await supabase.rpc('add_comment_by_token', {
          token: portalToken,
          body: body.trim(),
        });
        if (error) throw error;
        
        // Log event
        await supabase.from('logs').insert({
          event: 'comment_added',
          project_id: projectId,
          meta: { 
            sender: 'client',
            sender_name: clientName,
            text: `${clientName} left a message`
          },
        });

        // Dispatch comment notification email to freelancer
        try {
          await fetch('/api/notifications', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              type: 'comment',
              payload: { projectId, senderRole: 'client', commentBody: body.trim(), portalToken }
            })
          });
        } catch (notifyErr) {
          console.warn('Comment email notification failed: ', notifyErr);
        }
      } else {
        // Authenticated freelancer insert
        const { error } = await supabase
          .from('comments')
          .insert({
            project_id: projectId,
            sender: 'freelancer',
            body: body.trim(),
          });
        if (error) throw error;

        // Log event
        await supabase.from('logs').insert({
          event: 'comment_added',
          project_id: projectId,
          meta: { 
            sender: 'freelancer',
            sender_name: freelancerName,
            text: `${freelancerName} left a message`
          },
        });

        // Dispatch comment notification email to client
        try {
          await fetch('/api/notifications', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              type: 'comment',
              payload: { projectId, senderRole: 'freelancer', commentBody: body.trim(), portalToken }
            })
          });
        } catch (notifyErr) {
          console.warn('Comment email notification failed: ', notifyErr);
        }
      }

      setBody('');
      onRefresh();
      toast.success('Comment shared');
    } catch (err: unknown) {
      console.error(err);
      toast.error(err instanceof Error ? err.message : 'Failed to send comment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-brand-surface border border-brand-border p-6 flex flex-col gap-4 h-[460px]">
      {/* Header */}
      <div className="border-b border-brand-border pb-3 flex items-center gap-1.5 select-none">
        <MessageSquare size={12} className="text-brand-muted" />
        <span className="text-[10px] uppercase font-bold tracking-wider text-brand-muted font-mono">
          Feedback & Thread
        </span>
      </div>

      {/* Message List */}
      <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-4">
        {comments.length === 0 ? (
          <div className="flex-1 flex items-center justify-center text-center text-brand-muted text-[11px] font-sans py-10">
            No messages yet. Send a note to start the alignment.
          </div>
        ) : (
          comments.map((comment) => {
            const isSelf = comment.sender === sender;
            const displayName = comment.sender === 'freelancer' ? freelancerName : clientName;
            return (
              <div
                key={comment.id}
                className={`flex flex-col max-w-[85%] animate-fade-in ${
                  isSelf ? 'self-end items-end' : 'self-start items-start'
                }`}
              >
                {/* Sender Tag */}
                <span className="text-[9px] uppercase tracking-wider font-mono text-brand-muted font-bold mb-1">
                  {displayName} •{' '}
                  {new Date(comment.created_at).toLocaleTimeString('en-US', {
                    hour: 'numeric',
                    minute: '2-digit',
                    hour12: true,
                  })}
                </span>

                {/* Message Body */}
                <div
                  className={`px-4 py-2.5 text-xs font-sans leading-relaxed border ${
                    isSelf
                      ? 'bg-brand-accent/10 border-brand-accent/30 text-brand-text'
                      : 'bg-brand-bg/50 border-brand-border text-brand-text'
                  }`}
                >
                  {comment.body}
                </div>
              </div>
            );
          })
        )}
        <div ref={threadEndRef} />
      </div>

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="border-t border-brand-border pt-4 flex gap-3">
        <input
          type="text"
          placeholder={sender === 'freelancer' ? `Leave ${clientName} a message...` : `Reply to ${freelancerName}...`}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          disabled={loading}
          className="flex-1 bg-brand-bg border border-brand-border text-brand-text text-xs px-3 py-2 focus:outline-none focus:border-brand-accent transition-colors"
        />
        <Button
          type="submit"
          isLoading={loading}
          variant="secondary"
          className="h-9 px-3 shrink-0 flex items-center justify-center"
        >
          <Send size={12} />
        </Button>
      </form>
    </div>
  );
};
