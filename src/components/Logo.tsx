import React from 'react';

interface LogoProps {
  id?: string;
  className?: string;
  dotSize?: string; // e.g. "w-2.5 h-2.5"
  textSize?: string; // e.g. "text-lg md:text-xl"
  tracking?: string; // e.g. "tracking-wider"
}

export default function Logo({
  id,
  className = '',
  dotSize = 'w-2.5 h-2.5 md:w-3 md:h-3',
  textSize = 'text-lg md:text-xl',
  tracking = 'tracking-wider'
}: LogoProps) {
  return (
    <div
      id={id || 'sos-logo'}
      className={`inline-flex items-center gap-2 md:gap-2.5 select-none font-mono ${className}`}
    >
      {/* Precision Emergency Dot Indicator */}
      <span className={`rounded-full bg-[#FF3B30] ${dotSize} shrink-0 animate-pulse shadow-[0_0_10px_rgba(255,59,48,0.7)]`} />
      
      {/* Brand Text Elements */}
      <div className={`flex items-center font-black ${textSize} ${tracking} leading-none uppercase`}>
        <span className="text-[#FF3B30]">SOS</span>
        <span className="text-neutral-500 font-medium ml-1.5 md:ml-2">AGENCY</span>
      </div>
    </div>
  );
}
