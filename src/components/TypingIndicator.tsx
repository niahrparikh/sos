import { motion } from 'motion/react';

interface TypingIndicatorProps {
  id?: string;
}

export default function TypingIndicator({ id }: TypingIndicatorProps) {
  return (
    <div
      id={id || 'typing-indicator'}
      className="flex items-center gap-2 font-mono text-xs text-[#FF3B30] tracking-widest bg-black/40 px-3 py-2 rounded border border-red-900/30 w-fit"
    >
      {/* Blinking radio dot */}
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-2 w-2 bg-red-600"></span>
      </span>
      <span>DISPATCH IS TYPING</span>
      {/* Flashing terminal dots */}
      <div className="flex gap-0.5">
        <motion.span
          animate={{ opacity: [0.2, 1, 0.2] }}
          transition={{ repeat: Infinity, duration: 1.2, delay: 0 }}
          className="font-bold"
        >
          .
        </motion.span>
        <motion.span
          animate={{ opacity: [0.2, 1, 0.2] }}
          transition={{ repeat: Infinity, duration: 1.2, delay: 0.3 }}
          className="font-bold"
        >
          .
        </motion.span>
        <motion.span
          animate={{ opacity: [0.2, 1, 0.2] }}
          transition={{ repeat: Infinity, duration: 1.2, delay: 0.6 }}
          className="font-bold"
        >
          .
        </motion.span>
      </div>
    </div>
  );
}
