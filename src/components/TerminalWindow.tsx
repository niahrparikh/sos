import React from 'react';

interface TerminalWindowProps {
  id?: string;
  title?: string;
  children: React.ReactNode;
  className?: string;
  onClose?: () => void;
  onMinimize?: () => void;
  onMaximize?: () => void;
  state?: 'normal' | 'minimized' | 'maximized' | 'closed';
}

export default function TerminalWindow({
  id,
  title = 'SOS AGENCY — DISTRESS TERMINAL',
  children,
  className = '',
  onClose,
  onMinimize,
  onMaximize,
  state = 'normal'
}: TerminalWindowProps) {
  return (
    <div
      id={id || 'terminal-window'}
      className={`relative rounded-lg border border-[#0E6B58] bg-[#001c17]/90 shadow-[0_25px_60px_-15px_rgba(10,74,61,0.5)] overflow-hidden flex flex-col ${className}`}
    >
      {/* Browser Chrome Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-[#0A4A3D]/40 border-b border-[#0E6B58]/20 select-none h-9">
        {/* Chrome Dots with functional hover triggers */}
        <div className="flex items-center gap-2 z-30">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onClose?.();
            }}
            title="Disconnect Terminal [Close]"
            className="w-3 h-3 rounded-full bg-[#E8368F] hover:scale-110 active:scale-95 transition-transform flex items-center justify-center cursor-pointer relative group/dot"
          >
            <span className="absolute inset-0 bg-white/20 rounded-full opacity-0 group-hover/dot:opacity-100 transition-opacity" />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onMinimize?.();
            }}
            title="Minimize Terminal [Collapse]"
            className="w-3 h-3 rounded-full bg-[#D4F000] hover:scale-110 active:scale-95 transition-transform flex items-center justify-center cursor-pointer relative group/dot"
          >
            <span className="absolute inset-0 bg-white/20 rounded-full opacity-0 group-hover/dot:opacity-100 transition-opacity" />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onMaximize?.();
            }}
            title={state === 'maximized' ? "Restore Window Size" : "Fullscreen [Maximize]"}
            className="w-3 h-3 rounded-full bg-[#0E6B58] hover:scale-110 active:scale-95 transition-transform flex items-center justify-center cursor-pointer relative group/dot"
          >
            <span className="absolute inset-0 bg-white/20 rounded-full opacity-0 group-hover/dot:opacity-100 transition-opacity" />
          </button>
        </div>
        
        {/* Title */}
        <div className="text-[10px] font-sans font-bold tracking-wider text-neutral-300 select-none text-center flex-1">
          {title}
        </div>
        
        {/* Extra element to balance spacing */}
        <div className="w-16 text-right font-mono text-[9px] text-[#D4F000] uppercase font-bold tracking-widest hidden md:block animate-pulse">
          {state === 'maximized' ? 'FS_LINK' : 'LIVE_CONN'}
        </div>
      </div>
      
      {/* Content Area with subtle scan-lines */}
      <div className="relative flex-1 flex flex-col overflow-hidden">
        {/* CRT Scanline Overlay */}
        <div className="pointer-events-none absolute inset-0 bg-scanlines opacity-5 z-20" />
        <div className="relative z-10 flex-1 flex flex-col overflow-hidden">
          {children}
        </div>
      </div>
    </div>
  );
}
