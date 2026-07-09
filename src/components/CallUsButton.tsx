import { PhoneCall } from 'lucide-react';
import { playClickSound } from '../lib/audio';

interface CallUsButtonProps {
  id?: string;
  className?: string;
}

export default function CallUsButton({ id, className = '' }: CallUsButtonProps) {
  return (
    <a
      id={id || 'call-us-now'}
      href="tel:+919099906631"
      onClick={() => playClickSound()}
      className={`flex items-center justify-center gap-2 px-5 py-2.5 bg-[#D4F000] hover:bg-[#E8368F] text-[#111111] hover:text-white font-sans text-xs font-extrabold uppercase tracking-wider rounded-[4px] border border-transparent transition-all duration-300 shadow-[0_4px_12px_rgba(212,240,0,0.15)] active:scale-95 cursor-pointer ${className}`}
    >
      <PhoneCall size={14} className="shrink-0" />
      <span>CALL US NOW</span>
    </a>
  );
}

