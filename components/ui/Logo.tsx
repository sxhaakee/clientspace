import React from 'react';

export const Logo: React.FC<{ size?: 'sm' | 'md' | 'lg'; className?: string; colorClass?: string }> = ({ 
  size = 'md', 
  className = '', 
  colorClass = 'text-brand-text'
}) => {
  const sizes = {
    sm: { text: 'text-sm', block: 'text-[9px] px-1 py-0.5' },
    md: { text: 'text-lg', block: 'text-xs px-2 py-1' },
    lg: { text: 'text-2xl', block: 'text-sm px-2.5 py-1.5' },
  };

  const current = sizes[size];

  return (
    <div className={`flex items-center gap-2 select-none font-semibold ${className}`}>
      <span 
        className={`${current.block} font-mono font-bold bg-brand-accent text-[#18181B] tracking-wider transition-transform`}
      >
        {"[ ]"}
      </span>
      <span className={`${current.text} font-serif tracking-wide ${colorClass} font-semibold`}>
        ClientSpace
      </span>
    </div>
  );
};
