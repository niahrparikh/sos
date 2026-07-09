import { playTapSound } from '../lib/audio';

interface QuickReplyChipProps {
  id?: string;
  num: number;
  text: string;
  onClick: (text: string) => void;
  className?: string;
}

export default function QuickReplyChip({
  id,
  num,
  text,
  onClick,
  className = ''
}: QuickReplyChipProps) {
  return (
    <button
      id={id || `quick-reply-${num}`}
      type="button"
      onClick={() => {
        playTapSound();
        onClick(text);
      }}
      className={`text-left font-sans text-xs md:text-sm text-gray-300 hover:text-white bg-[#0A4A3D]/15 hover:bg-[#0A4A3D]/30 border border-[#0E6B58]/35 hover:border-[#D4F000] p-3 rounded-[4px] transition-all duration-200 group flex items-start gap-2 select-none ${className}`}
    >
      <span className="text-[#D4F000] font-extrabold group-hover:scale-110 transition-transform">[{num}]</span>
      <span className="leading-snug font-medium">{text}</span>
    </button>
  );
}
