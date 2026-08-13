import React, { InputHTMLAttributes, TextareaHTMLAttributes, forwardRef } from 'react';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', label, error, type = 'text', ...props }, ref) => {
    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <label className="text-[10px] uppercase tracking-wider text-brand-muted font-bold font-sans">
            {label}
          </label>
        )}
        <input
          ref={ref}
          type={type}
          className={`w-full bg-brand-surface border ${
            error ? 'border-danger' : 'border-brand-border'
          } text-brand-text px-3 py-2 text-sm focus:outline-none focus:border-brand-accent transition-colors font-sans text-brand-text placeholder-brand-muted/70 ${className}`}
          {...props}
        />
        {error && <span className="text-[10px] text-danger font-mono">{error}</span>}
      </div>
    );
  }
);

Input.displayName = 'Input';

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className = '', label, error, rows = 4, ...props }, ref) => {
    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <label className="text-[10px] uppercase tracking-wider text-brand-muted font-bold font-sans">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          rows={rows}
          className={`w-full bg-brand-surface border ${
            error ? 'border-danger' : 'border-brand-border'
          } text-brand-text px-3 py-2 text-sm focus:outline-none focus:border-brand-accent transition-colors font-sans text-brand-text placeholder-brand-muted/70 resize-none ${className}`}
          {...props}
        />
        {error && <span className="text-[10px] text-danger font-mono">{error}</span>}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';
