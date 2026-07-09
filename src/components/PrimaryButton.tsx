import React from 'react';
import { playClickSound } from '../lib/audio';

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
  const handleClick = () => {
    playClickSound();
    if (onClick) onClick();
  };

  return (
    <button
      id={id || 'primary-btn'}
      type={type}
      onClick={handleClick}
      className={`relative group px-6 py-3 font-sans text-xs sm:text-sm uppercase tracking-wider font-extrabold transition-all duration-300 bg-[#D4F000] text-[#111111] hover:bg-[#E8368F] hover:text-white rounded-[4px] shadow-[0_4px_12px_rgba(212,240,0,0.15)] active:scale-95 cursor-pointer flex items-center justify-center gap-2 ${className}`}
    >
      {children}
    </button>
  );
}

