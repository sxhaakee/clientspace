import React, { ButtonHTMLAttributes, forwardRef } from 'react';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = '', variant = 'primary', size = 'md', isLoading, children, disabled, ...props }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#C8F04B] disabled:opacity-50 disabled:pointer-events-none uppercase tracking-wider text-xs border border-transparent font-sans';
    
    const variants = {
      // Primary: Green BG -> Black text. Hover: Black BG -> Green text
      primary: 'bg-[#C8F04B] text-black border-[#C8F04B] hover:bg-black hover:text-[#C8F04B] hover:border-black font-bold',
      // Secondary: Black BG -> Green text. Hover: Green BG -> Black text
      secondary: 'bg-black text-[#C8F04B] border-black hover:bg-[#C8F04B] hover:text-black hover:border-[#C8F04B] font-bold',
      // Outline: Transparent border, light text, highlights green
      outline: 'bg-transparent text-[#FAFAF8] border-[#27272A] hover:border-[#C8F04B] hover:text-[#C8F04B]',
      // Ghost: transparent
      ghost: 'bg-transparent text-[#FAFAF8] hover:bg-[#121214] border-transparent',
      // Danger: red
      danger: 'bg-red-600 text-white hover:bg-red-700 border-red-600 hover:border-red-700',
    };

    const sizes = {
      sm: 'h-8 px-3 text-[10px]',
      md: 'h-10 px-4',
      lg: 'h-12 px-6',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
        {...props}
      >
        {isLoading ? (
          <span className="flex items-center gap-2">
            <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Processing...
          </span>
        ) : (
          children
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';
