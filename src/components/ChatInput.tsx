import React, { useState } from 'react';
import { SendHorizonal } from 'lucide-react';
import { playSuccessSound } from '../lib/audio';

interface ChatInputProps {
  id?: string;
  onSend: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
  onFocus?: () => void;
  onChange?: (val: string) => void;
}

export default function ChatInput({
  id,
  onSend,
  disabled = false,
  placeholder = 'ENTER DISTRESS SIGNAL...',
  onFocus,
  onChange
}: ChatInputProps) {
  const [inputValue, setInputValue] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || disabled) return;
    playSuccessSound();
    onSend(inputValue.trim());
    setInputValue('');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputValue(val);
    if (val.trim()) {
      onChange?.(val);
    }
  };

  return (
    <form
      id={id || 'chat-input-form'}
      onSubmit={handleSubmit}
      className="flex items-center gap-2 border border-neutral-800 bg-[#0E6B58]/10 p-1 relative focus-within:border-[#D4F000] transition-colors w-full rounded-[4px]"
    >
      <span className="font-sans text-[#D4F000] pl-3 select-none text-xs">█</span>
      <input
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        onFocus={onFocus}
        disabled={disabled}
        placeholder={placeholder}
        className="flex-1 bg-transparent text-white font-sans text-base focus:outline-none placeholder-neutral-500 disabled:opacity-50 py-2.5 min-w-0"
      />
      <button
        type="submit"
        disabled={disabled || !inputValue.trim()}
        className="px-4 sm:px-6 py-2.5 bg-[#D4F000] hover:bg-[#E8368F] disabled:bg-neutral-900 disabled:text-neutral-600 disabled:border-neutral-800 text-[#111111] hover:text-white font-sans text-xs font-extrabold uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer disabled:cursor-not-allowed rounded-[4px] shrink-0"
      >
        <span>SEND</span>
        <SendHorizonal size={12} />
      </button>
    </form>
  );
}
