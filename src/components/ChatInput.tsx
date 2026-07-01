import React, { useState } from 'react';
import { SendHorizonal } from 'lucide-react';

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
      className="flex items-center gap-2 border border-[#333] bg-[#151515] p-1 relative focus-within:border-[#FF3B30] transition-colors w-full"
    >
      <span className="font-mono text-[#FF3B30] pl-3 select-none">█</span>
      <input
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        onFocus={onFocus}
        disabled={disabled}
        placeholder={placeholder}
        className="flex-1 bg-transparent text-white font-mono text-sm focus:outline-none placeholder-neutral-600 disabled:opacity-50 py-2 min-w-0"
      />
      <button
        type="submit"
        disabled={disabled || !inputValue.trim()}
        className="px-4 sm:px-6 py-2 bg-[#FF3B30] hover:bg-red-700 disabled:bg-[#1A1A1A] disabled:text-neutral-700 disabled:border-neutral-800 text-white font-mono text-xs font-bold uppercase tracking-widest flex items-center gap-1.5 transition-all cursor-pointer disabled:cursor-not-allowed shrink-0"
      >
        <span>SEND</span>
        <SendHorizonal size={12} />
      </button>
    </form>
  );
}
