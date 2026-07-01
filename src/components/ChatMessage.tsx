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
      className="flex gap-3 font-mono text-xs md:text-sm leading-relaxed transition-all duration-200"
    >
      {/* Sender Avatar Block */}
      <div className={`w-8 h-8 flex-shrink-0 flex items-center justify-center font-bold select-none ${
        isBot ? 'bg-[#FF3B30] text-white' : 'bg-neutral-800 text-[#FF3B30]'
      }`}>
        {isBot ? 'D' : 'U'}
      </div>

      {/* Bubble Content */}
      <div className={`flex-1 p-3.5 rounded-r-lg rounded-bl-lg border ${
        isBot
          ? 'bg-[#151515] border-neutral-800 text-white'
          : 'bg-neutral-900 border-neutral-850 text-gray-100'
      }`}>
        <div className="flex items-center justify-between border-b border-neutral-800/40 pb-1.5 mb-2 select-none">
          <span className={`font-bold tracking-wider text-[10px] uppercase ${isBot ? 'text-[#FF3B30]' : 'text-neutral-400'}`}>
            {isBot ? 'DISPATCH_OPERATOR' : 'OUTBOUND_SIGNAL'}
          </span>
          <span className="text-neutral-500 text-[9px]">{timestamp}</span>
        </div>
        
        <div className="whitespace-pre-wrap font-mono leading-relaxed">
          {displayedText}
          {isNew && isBot && displayedText.length < content.length && (
            <span className="inline-block w-1.5 h-3.5 bg-[#FF3B30] ml-0.5 animate-pulse" />
          )}
        </div>
      </div>
    </div>
  );
}
