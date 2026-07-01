import { PhoneCall } from 'lucide-react';

interface CallUsButtonProps {
  id?: string;
  className?: string;
}

export default function CallUsButton({ id, className = '' }: CallUsButtonProps) {
  return (
    <a
      id={id || 'call-us-now'}
      href="tel:+919099906631"
      className={`flex items-center gap-2 px-5 py-2.5 bg-[#FF3B30] hover:bg-red-700 text-white font-mono text-xs font-bold uppercase tracking-widest border border-transparent transition-all duration-300 shadow-[0_0_15px_rgba(255,59,48,0.4)] ${className}`}
    >
      <PhoneCall size={14} className="shrink-0" />
      <span>[CALL US NOW]</span>
    </a>
  );
}
