import React from 'react';

interface LogoProps {
  id?: string;
  className?: string;
  dotSize?: string; // e.g. "w-2 py-2"
  textSize?: string; // e.g. "text-lg md:text-xl"
  isLightBg?: boolean; // If true, renders light bg variant (dark text + pink dot)
}

export default function Logo({
  id,
  className = '',
  dotSize = 'w-2.5 h-2.5 md:w-3 md:h-3',
  textSize = 'text-xl md:text-2xl',
  isLightBg = false
}: LogoProps) {
  const textColor = isLightBg ? 'text-[#111111]' : 'text-white';
  const dotColor = isLightBg ? 'bg-[#E8368F]' : 'bg-[#D4F000]';

  return (
    <div
      id={id || 'sos-logo'}
      className={`inline-flex items-center gap-1.5 select-none font-sans ${className}`}
    >
      <div className={`flex items-baseline font-extrabold ${textSize} tracking-tighter leading-none`}>
        <span className={textColor}>SOS</span>
        {/* The trademark square dot */}
        <span className={`${dotColor} ${dotSize} ml-1 inline-block shrink-0`} style={{ borderRadius: '0px' }} />
      </div>
    </div>
  );
}

