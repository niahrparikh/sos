import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  SCOSBook,
  SCOS_INTELLIGENCE_BOOKS,
  SCOS_KNOWLEDGE_BOOKS,
  SCOS_MEMORY_BOOKS
} from '../data/scosData';
import { playClickSound, playSuccessSound, playTapSound } from '../lib/audio';
import { BookOpen, ShieldAlert, Cpu, CheckSquare, Square, Info, Layers, RefreshCw } from 'lucide-react';

interface SCOSViewerProps {
  category: 'intelligence' | 'knowledge' | 'memory';
}

export default function SCOSViewer({ category }: SCOSViewerProps) {
  const books =
    category === 'intelligence'
      ? SCOS_INTELLIGENCE_BOOKS
      : category === 'knowledge'
      ? SCOS_KNOWLEDGE_BOOKS
      : SCOS_MEMORY_BOOKS;

  const [selectedBookId, setSelectedBookId] = useState<string>(books[0]?.id || '');
  const activeBook = books.find((b) => b.id === selectedBookId) || books[0];

  // Store completed modules state locally to make the checklist interactive and engaging!
  const [completedModules, setCompletedModules] = useState<Record<string, boolean>>({});

  // Sync state if selected book is not found in the current category
  React.useEffect(() => {
    if (books.length > 0 && !books.some((b) => b.id === selectedBookId)) {
      setSelectedBookId(books[0].id);
    }
  }, [category, books, selectedBookId]);

  const toggleModule = (bookId: string, moduleTitle: string) => {
    const key = `${bookId}-${moduleTitle}`;
    playTapSound();
    setCompletedModules((prev) => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleInjectAll = () => {
    playSuccessSound();
    const newCompleted: Record<string, boolean> = { ...completedModules };
    activeBook.modules?.forEach((mod) => {
      newCompleted[`${activeBook.id}-${mod.title}`] = true;
    });
    setCompletedModules(newCompleted);
  };

  return (
    <div className="flex-1 flex flex-col md:flex-row overflow-hidden text-neutral-200 font-mono text-xs select-none h-full">
      {/* Left Sidebar: Book Selector */}
      <div className="w-full md:w-1/3 border-b md:border-b-0 md:border-r border-[#0E6B58]/35 pr-0 md:pr-3 pb-2.5 md:pb-0 flex flex-col overflow-y-auto space-y-2 h-[140px] md:h-full shrink-0 terminal-scrollbar">
        <div className="text-[9px] text-[#E8368F] font-bold uppercase tracking-widest pb-1 flex items-center gap-1.5 border-b border-[#0E6B58]/10">
          <BookOpen size={10} />
          <span>ACTIVE COGNITIVE ARCHIVES</span>
        </div>
        <div className="space-y-1.5">
          {books.map((book) => {
            const isSelected = book.id === selectedBookId;
            // Calculate progress of completed modules for this book
            const totalMods = book.modules?.length || 0;
            const completedCount = book.modules?.reduce((acc, mod) => {
              return acc + (completedModules[`${book.id}-${mod.title}`] ? 1 : 0);
            }, 0) || 0;
            const percent = totalMods > 0 ? Math.round((completedCount / totalMods) * 100) : 100;

            return (
              <button
                key={book.id}
                type="button"
                onClick={() => {
                  playClickSound();
                  setSelectedBookId(book.id);
                }}
                className={`w-full text-left p-2.5 border transition-all flex flex-col justify-between cursor-pointer rounded-none ${
                  isSelected
                    ? 'bg-[#0A4A3D]/40 border-[#D4F000]'
                    : 'bg-black/60 border-neutral-900 hover:border-neutral-800 hover:bg-neutral-950/80'
                }`}
              >
                <div className="flex items-start justify-between w-full gap-2">
                  <span className="font-bold text-white uppercase text-[10px] md:text-xs leading-tight">
                    {book.title}
                  </span>
                  <span className="text-[8px] font-bold text-[#D4F000] bg-[#D4F000]/10 border border-[#D4F000]/25 px-1.5 py-0.5 shrink-0">
                    V{book.version || '1.0'}
                  </span>
                </div>
                {totalMods > 0 && (
                  <div className="w-full mt-2 flex items-center justify-between gap-2">
                    <div className="flex-1 bg-neutral-950 h-1 rounded overflow-hidden">
                      <div
                        className="bg-[#D4F000] h-full transition-all duration-300"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                    <span className="text-[8px] text-neutral-500 font-bold shrink-0">
                      {percent}% INJECTED
                    </span>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Right Area: Book Core Guideline details */}
      <div className="flex-1 pl-0 md:pl-4 pt-2.5 md:pt-0 overflow-y-auto flex flex-col space-y-4 h-full terminal-scrollbar">
        {activeBook ? (
          <AnimatePresence mode="wait">
            <motion.div
              key={activeBook.id}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.15 }}
              className="space-y-4 pb-4 flex-1 flex flex-col justify-between"
            >
              <div className="space-y-4">
                {/* Book Metadata & Title */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#0E6B58]/35 pb-2.5">
                  <div>
                    <h3 className="text-xs md:text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                      <Cpu size={12} className="text-[#D4F000] animate-pulse" />
                      <span>{activeBook.title}</span>
                    </h3>
                    <p className="text-[9px] text-neutral-500 tracking-wider uppercase mt-0.5">
                      CLASSIFICATION: {activeBook.classification || 'INTERNAL COGNITIVE OS'} // TELEMETRY LINK LOCKED
                    </p>
                  </div>
                  <div className="text-left sm:text-right mt-1 sm:mt-0 flex gap-2 sm:flex-col items-start sm:items-end">
                    <span className="text-[9px] font-bold text-[#E8368F] bg-[#E8368F]/15 border border-[#E8368F]/30 px-2 py-0.5 uppercase tracking-widest rounded-none">
                      OS LEVEL: ACTIVE
                    </span>
                  </div>
                </div>

                {/* SCOS Purpose statement in retro CRT box */}
                <div className="bg-[#04100c] border border-[#0E6B58]/35 p-3 rounded relative overflow-hidden">
                  <div className="absolute top-1 right-1.5 text-[8px] text-[#0E6B58] font-bold select-none tracking-widest">
                    SYSTEM_PURPOSE
                  </div>
                  <p className="text-neutral-300 text-[11px] leading-relaxed select-text pr-4 italic">
                    &quot;{activeBook.purpose}&quot;
                  </p>
                </div>

                {/* Modules Checklist */}
                {activeBook.modules && activeBook.modules.length > 0 && (
                  <div className="space-y-2 border-b border-[#0E6B58]/20 pb-4">
                    <div className="flex justify-between items-center text-[9px] font-bold text-[#D4F000] tracking-wider uppercase">
                      <span>📚 COGNITIVE INTEL MODULES</span>
                      <button
                        onClick={handleInjectAll}
                        className="text-[8px] text-[#E8368F] hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <RefreshCw size={8} />
                        [ SYNCHRONIZE ALL MODULES ]
                      </button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {activeBook.modules.map((mod, mIdx) => {
                        const isDone = completedModules[`${activeBook.id}-${mod.title}`];
                        return (
                          <div
                            key={mIdx}
                            onClick={() => toggleModule(activeBook.id, mod.title)}
                            className={`p-2.5 border flex items-center justify-between cursor-pointer transition-all ${
                              isDone
                                ? 'bg-[#0E6B58]/15 border-[#D4F000] text-white'
                                : 'bg-black border-neutral-900 text-neutral-400 hover:border-neutral-800'
                            }`}
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              {isDone ? (
                                <CheckSquare size={12} className="text-[#D4F000] shrink-0" />
                              ) : (
                                <Square size={12} className="text-neutral-600 shrink-0" />
                              )}
                              <div className="truncate">
                                <span className="font-extrabold text-[9px] block text-neutral-500 uppercase tracking-wider">
                                  {mod.title}
                                </span>
                                <span className="text-[10px] md:text-[11px] font-semibold text-neutral-300 truncate block mt-0.5">
                                  {mod.items.join(', ')}
                                </span>
                              </div>
                            </div>
                            {isDone && (
                              <span className="text-[7px] text-[#D4F000] bg-[#D4F000]/10 px-1 border border-[#D4F000]/20 font-bold shrink-0">
                                LOADED
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Detailed Guideline Sections */}
                <div className="space-y-3">
                  <div className="text-[9px] font-bold text-[#E8368F] tracking-widest uppercase">
                    ⚡ CONSULTING REASONING & PROTOCOLS
                  </div>
                  <div className="space-y-3.5 max-h-[300px] overflow-y-auto pr-1 terminal-scrollbar select-text">
                    {activeBook.sections.map((sec, sIdx) => (
                      <div key={sIdx} className="bg-black/40 border border-[#0E6B58]/20 p-3 relative group rounded">
                        <div className="absolute top-1 right-2 text-[8px] text-[#0E6B58]/40 font-bold uppercase select-none tracking-wider">
                          SCOS_SEC_{sIdx + 1}
                        </div>
                        <h4 className="text-[10px] md:text-xs font-extrabold text-white uppercase tracking-wider mb-1.5 flex items-center gap-1.5 border-b border-[#0E6B58]/10 pb-1">
                          <span className="w-1 h-3 bg-[#D4F000] block" />
                          <span>{sec.heading}</span>
                        </h4>
                        <p className="text-neutral-300 text-[10px] md:text-[11px] leading-relaxed whitespace-pre-line">
                          {sec.content}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action area footer */}
              <div className="bg-[#030e0b] border border-[#0E6B58]/25 p-3 flex flex-col sm:flex-row justify-between items-center gap-3 mt-4">
                <div className="text-left flex items-start gap-2 max-w-md">
                  <Info size={14} className="text-[#D4F000] shrink-0 mt-0.5" />
                  <div>
                    <span className="text-white font-bold text-[10px] uppercase tracking-wide block">
                      DISTRESS OPERATING COGNITIVE STATE
                    </span>
                    <span className="text-[9px] text-neutral-400 font-semibold leading-normal">
                      This knowledge base guides all dynamic diagnostics and consulting logic within our system offline nodes.
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    playSuccessSound();
                    const nextBookIndex = (books.findIndex((b) => b.id === selectedBookId) + 1) % books.length;
                    setSelectedBookId(books[nextBookIndex].id);
                  }}
                  className="px-4 py-2 bg-[#D4F000] hover:bg-[#E8368F] text-[#111111] hover:text-white font-extrabold uppercase text-[9px] tracking-widest cursor-pointer whitespace-nowrap rounded-[4px] transition-all flex items-center gap-1.5"
                >
                  <Layers size={10} />
                  <span>NEXT LOGICAL FILE</span>
                </button>
              </div>
            </motion.div>
          </AnimatePresence>
        ) : (
          <div className="text-center text-neutral-500 py-10 font-bold uppercase">
            No cognitive records found in this class.
          </div>
        )}
      </div>
    </div>
  );
}
