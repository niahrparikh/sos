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
      onClick={() => onClick(text)}
      className={`text-left font-mono text-xs md:text-sm text-gray-300 hover:text-white bg-[#1A1A1A] hover:bg-neutral-900 border border-[#333] hover:border-[#FF3B30] p-3 rounded-none transition-all duration-200 group flex items-start gap-2 select-none shadow-[0_2px_8px_rgba(0,0,0,0.5)] ${className}`}
    >
      <span className="text-[#FF3B30] font-bold group-hover:scale-110 transition-transform">[{num}]</span>
      <span className="leading-snug">{text}</span>
    </button>
  );
}
