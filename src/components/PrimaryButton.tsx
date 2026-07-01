import React from 'react';

interface PrimaryButtonProps {
  id?: string;
  onClick?: () => void;
  children: React.ReactNode;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
}

export default function PrimaryButton({
  id,
  onClick,
  children,
  className = '',
  type = 'button'
}: PrimaryButtonProps) {
  return (
    <button
      id={id || 'primary-btn'}
      type={type}
      onClick={onClick}
      className={`relative group px-6 py-3 font-mono text-sm uppercase tracking-wider font-bold transition-all duration-300 border-2 border-white text-black bg-white hover:text-white hover:bg-transparent overflow-hidden ${className}`}
    >
      <span className="relative z-10 flex items-center justify-center gap-2">
        {children}
      </span>
      {/* Background slide effect */}
      <span className="absolute inset-0 bg-[#FF3B30] transition-transform duration-300 transform translate-y-full group-hover:translate-y-0 z-0" />
    </button>
  );
}
