import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';

interface ChatMessageProps {
  key?: any;
  id?: string;
  role: 'assistant' | 'user';
  content: string;
  timestamp: string;
  isNew?: boolean;
}

export default function ChatMessage({ id, role, content, timestamp, isNew = false }: ChatMessageProps) {
  const isBot = role === 'assistant';
  const [displayedText, setDisplayedText] = useState(isNew && isBot ? '' : content);

  useEffect(() => {
    if (isNew && isBot) {
      let index = 0;
      const interval = setInterval(() => {
        setDisplayedText((prev) => prev + content.charAt(index));
        index++;
        if (index >= content.length) {
          clearInterval(interval);
        }
      }, 15); // Adjust typewriter speed here
      return () => clearInterval(interval);
    } else {
      setDisplayedText(content);
    }
  }, [content, isNew, isBot]);

  return (
    <div
      id={id || `msg-${timestamp}`}
      className="flex gap-3 font-sans text-xs md:text-sm leading-relaxed transition-all duration-200"
    >
      {/* Sender Avatar Block */}
      <div className={`w-8 h-8 rounded-[4px] flex-shrink-0 flex items-center justify-center font-extrabold select-none ${
        isBot ? 'bg-[#D4F000] text-[#111111]' : 'bg-[#0E6B58] text-white'
      }`}>
        {isBot ? 'D' : 'U'}
      </div>

      {/* Bubble Content */}
      <div className={`flex-1 p-3.5 rounded-[4px] border ${
        isBot
          ? 'bg-[#0A4A3D]/25 border-[#0E6B58]/30 text-white'
          : 'bg-[#0E6B58]/5 border-[#0E6B58]/20 text-neutral-100'
      }`}>
        <div className="flex items-center justify-between border-b border-neutral-800/40 pb-1.5 mb-2 select-none">
          <span className={`font-extrabold tracking-wider text-[10px] uppercase ${isBot ? 'text-[#D4F000]' : 'text-[#E8368F]'}`}>
            {isBot ? 'DISPATCH_OPERATOR' : 'OUTBOUND_SIGNAL'}
          </span>
          <span className="text-neutral-400 text-[9px] font-mono">{timestamp}</span>
        </div>
        
        <div className="whitespace-pre-wrap font-sans leading-relaxed text-xs sm:text-sm font-medium">
          {displayedText}
          {isNew && isBot && displayedText.length < content.length && (
            <span className="inline-block w-1.5 h-3.5 bg-[#D4F000] ml-0.5 animate-pulse" />
          )}
        </div>
      </div>
    </div>
  );
}
