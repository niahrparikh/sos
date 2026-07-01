import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldAlert, Terminal, MessageSquare, ArrowDown, ArrowUp, Send, CheckCircle } from 'lucide-react';

import { ChatMessageData } from './types';
import { CASE_FILES } from './data/caseFiles';
import { TESTIMONIALS } from './data/testimonials';

// Reusable components
import TerminalWindow from './components/TerminalWindow';
import ChatMessage from './components/ChatMessage';
import TypingIndicator from './components/TypingIndicator';
import ChatInput from './components/ChatInput';
import QuickReplyChip from './components/QuickReplyChip';
import CallUsButton from './components/CallUsButton';
import CaseFileCard from './components/CaseFileCard';
import StatCounter from './components/StatCounter';
import LogoMarquee from './components/LogoMarquee';
import ProcessStep from './components/ProcessStep';
import TestimonialCard from './components/TestimonialCard';
import PrimaryButton from './components/PrimaryButton';

export default function App() {
  // Terminal states
  const [bootStep, setBootStep] = useState(0);
  const [bootLines, setBootLines] = useState<string[]>([]);
  const [isBooted, setIsBooted] = useState(false);
  const [messages, setMessages] = useState<ChatMessageData[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [messageCount, setMessageCount] = useState(0);

  // Brand Name Input for personalization during boot
  const [brandInput, setBrandInput] = useState('');
  const [brandSaved, setBrandSaved] = useState(false);

  // Scroll ref for chat messages
  const chatEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Boot lines sequence
  const BOOT_SEQUENCE = [
    "> INITIALIZING SOS AGENCY DISTRESS TERMINAL...",
    "> SCANNING FOR BRAND EMERGENCIES...",
    "> CONNECTION ESTABLISHED.",
    "> AWAITING TRANSMISSION FROM: [your brand]_"
  ];

  // Terminal view states: 'normal' | 'minimized' | 'maximized' | 'closed'
  const [terminalState, setTerminalState] = useState<'normal' | 'minimized' | 'maximized' | 'closed'>('normal');

  // Terminal navigation tab state: 'chat' | 'cases' | 'contact'
  const [terminalTab, setTerminalTab] = useState<'chat' | 'cases' | 'contact'>('chat');
  // Selected case file inside the terminal case system
  const [selectedCaseId, setSelectedCaseId] = useState<string>('case-01');

  // Unified scroll helper to keep messages fully visible
  const forceScrollToBottom = (behavior: 'smooth' | 'auto' = 'smooth') => {
    // Delay slightly to allow layout changes (like going full screen or adding message nodes) to complete
    setTimeout(() => {
      if (chatEndRef.current) {
        chatEndRef.current.scrollIntoView({ behavior });
      }
      if (chatContainerRef.current) {
        chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
      }
    }, 50);
  };

  // Auto scroll chat to bottom on state updates
  useEffect(() => {
    forceScrollToBottom('smooth');
  }, [messages, isTyping, isBooted, terminalState]);

  // Keyboard shortcut listener for ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        scrollToSection('transmission-log');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Boot animation sequence
  useEffect(() => {
    if (bootStep < BOOT_SEQUENCE.length) {
      const delay = bootStep === 0 ? 500 : bootStep === 3 ? 1200 : 800;
      const timer = setTimeout(() => {
        setBootLines((prev) => [...prev, BOOT_SEQUENCE[bootStep]]);
        setBootStep((prev) => prev + 1);
      }, delay);
      return () => clearTimeout(timer);
    } else {
      // Boot finished
      const timer = setTimeout(() => {
        setIsBooted(true);
        // Load initial greeting
        const initialGreet: ChatMessageData = {
          id: 'greet-1',
          role: 'assistant',
          content: "DISPATCH: SOS Agency, this is Dispatch. What's the emergency?",
          timestamp: getTimestamp(),
        };
        setMessages([initialGreet]);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [bootStep]);

  // Utility to generate dynamic timestamps
  const getTimestamp = () => {
    const now = new Date();
    return now.toTimeString().split(' ')[0];
  };

  // Scroll to helper
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Handler to open full case file in the terminal
  const handleViewCaseInTerminal = (caseId: string) => {
    // Ensure booted
    setIsBooted(true);
    
    // Ensure visible
    if (terminalState === 'closed' || terminalState === 'minimized') {
      setTerminalState('normal');
    }
    
    // Select the tab & specific case
    setTerminalTab('cases');
    setSelectedCaseId(caseId);
    
    // Scroll to terminal smoothly
    scrollToSection('chat-section');
  };

  // Submit Brand Name to speed up boot
  const handleBrandSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!brandInput.trim()) return;
    setBrandSaved(true);
    // Replace the last boot line with customized brand
    setBootLines((prev) => {
      const updated = [...prev];
      updated[updated.length - 1] = `> UPLINK SECURED WITH: [${brandInput.toUpperCase()}]`;
      return updated;
    });
  };

  // Chat message sender logic
  const handleSendMessage = async (text: string) => {
    if (!isBooted || isTyping) return;

    // 1. Append User Message
    const userMsg: ChatMessageData = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: getTimestamp(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsTyping(true);
    setMessageCount((prev) => prev + 1);

    // 2. Query Full-stack Express Backend
    try {
      const payload = {
        messages: [...messages, userMsg].map(m => ({ role: m.role, content: m.content }))
      };

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();

      // Append bot response
      const botMsg: ChatMessageData = {
        id: `bot-${Date.now()}`,
        role: 'assistant',
        content: data.reply || "Signal received, but dispatch translation is weak. Re-routing signal...",
        timestamp: getTimestamp(),
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      console.error(err);
      const errorMsg: ChatMessageData = {
        id: `err-${Date.now()}`,
        role: 'assistant',
        content: "DISPATCH [ALERT]: Connection lost or credentials unverified. Skip protocol and reach out directly using [CALL US NOW].",
        timestamp: getTimestamp(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  // Contact form submission state
  const [formSubmitted, setFormSubmitted] = useState(false);
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-[#8B0000] text-white font-mono flex flex-col selection:bg-[#FF3B30] selection:text-white overflow-x-hidden">
      
      {/* ═══════════════════════════════════════
          HEADER BAR
          ═══════════════════════════════════════ */}
      <header className="sticky top-0 z-50 bg-[#0A0A0A] border-b border-neutral-900 px-4 py-3.5 md:px-8 flex justify-between items-center select-none shadow-[0_4px_20px_rgba(0,0,0,0.6)]">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-white text-[#8B0000] font-black flex items-center justify-center text-xl">S</div>
          <span className="text-xl tracking-tighter font-bold uppercase italic text-white">SOS AGENCY</span>
        </div>

        <div className="flex items-center gap-6">
          <div className="text-[10px] opacity-60 tracking-[0.2em] text-right uppercase text-white/80 hidden sm:block">
            Signal Strength: Optimized<br/>
            Latency: 14ms
          </div>
          {/* Escape Human Mode Switch */}
          <button
            onClick={() => scrollToSection('offline-form')}
            className="px-3 py-1.5 border border-white text-[11px] hover:bg-white hover:text-[#8B0000] bg-transparent text-white transition-colors uppercase font-bold"
          >
            [ESC] HUMAN MODE
          </button>
        </div>
      </header>

      {/* ═══════════════════════════════════════
          SECTION 1: HERO / LIVE CHAT TERMINAL
          ═══════════════════════════════════════ */}
      <section
        id="chat-section"
        className="relative flex-1 flex flex-col items-center justify-center py-8 md:py-16 px-4 bg-gradient-to-b from-[#8B0000] to-[#500000] min-h-[calc(100vh-60px)]"
      >
        {/* Subtle repeating grid scan-line overlay */}
        <div className="absolute inset-0 bg-scanlines opacity-10 pointer-events-none" />

        {/* Alarm Banner Header */}
        <div className="text-center max-w-4xl mx-auto mb-6 md:mb-10 z-10 select-none px-2">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 bg-black border border-red-900/60 text-[#FF3B30] font-bold text-xs uppercase px-4 py-1.5 rounded-full mb-4 md:mb-6 scanline-glow"
          >
            <ShieldAlert size={14} className="animate-bounce" />
            <span>CRITICAL BRANDING STATUS: ACTIVE EMERGENCY</span>
          </motion.div>
          <h1 className="text-4xl md:text-6xl font-black mb-6 leading-none tracking-tight uppercase select-none text-white">
            BRAND IN TROUBLE?<br />
            <span className="text-[#FF3B30] italic">SEND SOS.</span>
          </h1>
          <p className="font-mono text-xs md:text-sm text-neutral-300 mt-3 max-w-xl mx-auto leading-relaxed">
            Connect immediately to Dispatch, our senior creative AI agent, trained to triage identity, positioning, and visual debt under high pressure.
          </p>
        </div>

        {/* distress-terminal Wrapper */}
        <div className={
          terminalState === 'maximized'
            ? "fixed inset-0 bg-[#0A0A0A]/95 backdrop-blur-md z-[9999] p-2 md:p-8 flex flex-col items-center justify-center animate-fade-in"
            : "w-full max-w-4xl z-10 px-1 md:px-4 transition-all duration-300"
        }>
          {terminalState === 'closed' ? (
            <TerminalWindow
              state="closed"
              className="h-[520px] md:h-[600px] border-[#FF3B30] scanline-glow"
              onClose={() => setTerminalState('closed')}
              onMinimize={() => setTerminalState('minimized')}
              onMaximize={() => setTerminalState('maximized')}
            >
              <div className="flex-1 flex flex-col items-center justify-center text-center p-6 space-y-4 select-none">
                <div className="text-[#FF3B30] font-mono text-xs animate-pulse">● SIGNAL TERMINATED — OPERATOR DISCONNECTED</div>
                <h3 className="font-mono text-base md:text-lg font-bold text-white uppercase tracking-wider">UPLINK CONNECTION OFFLINE</h3>
                <p className="font-mono text-xs text-neutral-400 max-w-sm leading-relaxed">
                  The emergency distress transceiver was disconnected by the operator. Telemetry stream is suspended.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setTerminalState('normal');
                    forceScrollToBottom('smooth');
                  }}
                  className="px-6 py-2.5 bg-[#FF3B30] hover:bg-red-700 text-white font-mono text-xs font-bold uppercase tracking-widest transition-all hover:scale-105 active:scale-95 cursor-pointer"
                >
                  [ REBOOT TRANSMISSION SYSTEM ]
                </button>
              </div>
            </TerminalWindow>
          ) : terminalState === 'minimized' ? (
            <div
              onClick={() => {
                setTerminalState('normal');
                forceScrollToBottom('smooth');
              }}
              className="w-full bg-[#0A0A0A] border-l-4 border-[#FF3B30] border-r border-t border-b border-neutral-900 p-4 flex justify-between items-center select-none cursor-pointer hover:bg-neutral-900 transition-all shadow-[0_15px_40px_rgba(0,0,0,0.8)]"
            >
              <div className="flex items-center gap-3">
                <span className="w-2.5 h-2.5 rounded-full bg-[#FFCC00] animate-pulse" />
                <span className="font-mono text-[10px] md:text-xs text-neutral-300 font-bold uppercase tracking-widest">
                  DISTRESS TERMINAL SIGNAL SUSPENDED (MINIMIZED)
                </span>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setTerminalState('normal');
                  forceScrollToBottom('smooth');
                }}
                className="font-mono text-[9px] md:text-[10px] text-[#FF3B30] hover:underline uppercase font-bold"
              >
                [ RESTORE UPLINK ]
              </button>
            </div>
          ) : (
            <TerminalWindow
              state={terminalState}
              className={
                terminalState === 'maximized'
                  ? "w-full h-full max-w-6xl max-h-[92vh] border-[#FF3B30]"
                  : "h-[520px] md:h-[600px] border-[#FF3B30]/30 scanline-glow"
              }
              onClose={() => setTerminalState('closed')}
              onMinimize={() => setTerminalState('minimized')}
              onMaximize={() => {
                setTerminalState(terminalState === 'maximized' ? 'normal' : 'maximized');
                forceScrollToBottom('smooth');
              }}
            >
              {/* Terminal Inner screen */}
              <div className="flex-1 flex flex-col p-4 overflow-hidden relative">
                
                {/* Boot Sequence display */}
                {!isBooted ? (
                  <div className="flex-1 flex flex-col justify-between font-mono text-xs md:text-sm text-neutral-300 p-2 select-none overflow-y-auto">
                    <div className="space-y-2">
                      {bootLines.map((line, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <span className="text-red-500 font-bold">&gt;</span>
                          <span>{line}</span>
                        </div>
                      ))}

                      {/* Interactive brand input during boot line */}
                      {bootStep === 3 && !brandSaved && (
                        <form onSubmit={handleBrandSubmit} className="mt-4 flex flex-col sm:flex-row gap-2 max-w-md">
                          <input
                            type="text"
                            value={brandInput}
                            onChange={(e) => setBrandInput(e.target.value)}
                            onFocus={() => {
                              setTerminalState('maximized');
                              forceScrollToBottom('smooth');
                            }}
                            placeholder="ENTER BRAND SYSTEM NAME..."
                            className="bg-neutral-900 border border-neutral-800 text-[#FF3B30] focus:border-[#FF3B30] focus:outline-none px-3 py-2 rounded text-xs tracking-wider uppercase font-bold flex-1"
                            maxLength={30}
                          />
                          <button
                            type="submit"
                            className="px-4 py-2 bg-neutral-800 hover:bg-[#FF3B30] text-white font-bold rounded text-[10px] uppercase tracking-widest border border-neutral-700 transition-colors"
                          >
                            SECURE_LINK
                          </button>
                        </form>
                      )}
                    </div>

                    {/* Boot progress meter */}
                    <div className="border-t border-neutral-900 pt-4 mt-auto">
                      <div className="flex justify-between text-[10px] text-neutral-500 mb-1.5">
                        <span>UPLINK DIAGNOSTICS STREAM</span>
                        <span>{Math.min(Math.floor((bootStep / BOOT_SEQUENCE.length) * 100), 100)}% COMPLETE</span>
                      </div>
                      <div className="w-full bg-neutral-950 h-2 rounded overflow-hidden">
                        <div
                          className="bg-[#FF3B30] h-full transition-all duration-300"
                          style={{ width: `${(bootStep / BOOT_SEQUENCE.length) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Booted Screen with Tab Navigation */
                  <div className="flex-1 flex flex-col overflow-hidden">
                    
                    {/* Navigation Tab Bar */}
                    <div className="flex flex-wrap items-center gap-1.5 border-b border-neutral-900 pb-2 mb-3 select-none">
                      <button
                        type="button"
                        onClick={() => setTerminalTab('chat')}
                        className={`px-3 py-1.5 font-mono text-[10px] md:text-xs font-bold uppercase tracking-widest border transition-all cursor-pointer ${
                          terminalTab === 'chat'
                            ? 'bg-[#FF3B30] text-white border-transparent shadow-[0_0_8px_rgba(255,59,48,0.3)]'
                            : 'bg-neutral-950 text-neutral-500 border-neutral-900 hover:text-white hover:border-neutral-800'
                        }`}
                      >
                        [ 📟 DISPATCH CHAT ]
                      </button>
                      <button
                        type="button"
                        onClick={() => setTerminalTab('cases')}
                        className={`px-3 py-1.5 font-mono text-[10px] md:text-xs font-bold uppercase tracking-widest border transition-all cursor-pointer ${
                          terminalTab === 'cases'
                            ? 'bg-[#FF3B30] text-white border-transparent shadow-[0_0_8px_rgba(255,59,48,0.3)]'
                            : 'bg-neutral-950 text-neutral-500 border-neutral-900 hover:text-white hover:border-neutral-800'
                        }`}
                      >
                        [ 📁 CLASSIFIED PROJECTS ]
                      </button>
                      <button
                        type="button"
                        onClick={() => setTerminalTab('contact')}
                        className={`px-3 py-1.5 font-mono text-[10px] md:text-xs font-bold uppercase tracking-widest border transition-all cursor-pointer ${
                          terminalTab === 'contact'
                            ? 'bg-[#FF3B30] text-white border-transparent shadow-[0_0_8px_rgba(255,59,48,0.3)]'
                            : 'bg-neutral-950 text-neutral-500 border-neutral-900 hover:text-white hover:border-neutral-800'
                        }`}
                      >
                        [ ☎️ DIRECT CONNECTIONS ]
                      </button>
                    </div>

                    {/* TAB CONTENT 1: AI CHAT DISPATCH */}
                    {terminalTab === 'chat' && (
                      <div className="flex-1 flex flex-col overflow-hidden">
                        {/* Chat messages viewport */}
                        <div
                          ref={chatContainerRef}
                          className="flex-1 overflow-y-auto pr-1 space-y-3.5 terminal-scrollbar pb-4"
                        >
                          {messages.map((msg, index) => (
                            <ChatMessage
                              key={msg.id}
                              role={msg.role}
                              content={msg.content}
                              timestamp={msg.timestamp}
                              isNew={index === messages.length - 1}
                            />
                          ))}
                          
                          {isTyping && <TypingIndicator />}
                          <div ref={chatEndRef} />
                        </div>

                        {/* Bottom Controls Panel (Chips + Inputs) */}
                        <div className="border-t border-neutral-900/80 pt-3 mt-auto bg-black/60 backdrop-blur-sm -mx-4 -mb-4 p-4 z-10">
                          
                          {/* Quick Replies */}
                          {messages.length === 1 && !isTyping && (
                            <div className="mb-3.5">
                              <div className="text-[10px] text-neutral-500 font-bold tracking-widest mb-2 select-none uppercase">
                                ⚡ SELECT AN EMERGENCY PROTOCOL TO START TRANSMISSION:
                              </div>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                <QuickReplyChip
                                  num={1}
                                  text="Our brand doesn't feel like us anymore"
                                  onClick={(txt) => {
                                    setTerminalState('maximized');
                                    handleSendMessage(txt);
                                    forceScrollToBottom('smooth');
                                  }}
                                />
                                <QuickReplyChip
                                  num={2}
                                  text="We're launching and have nothing"
                                  onClick={(txt) => {
                                    setTerminalState('maximized');
                                    handleSendMessage(txt);
                                    forceScrollToBottom('smooth');
                                  }}
                                />
                                <QuickReplyChip
                                  num={3}
                                  text="Our last agency ghosted us mid-project"
                                  onClick={(txt) => {
                                    setTerminalState('maximized');
                                    handleSendMessage(txt);
                                    forceScrollToBottom('smooth');
                                  }}
                                />
                                <QuickReplyChip
                                  num={4}
                                  text="Everything's fine, just want it to slap harder"
                                  onClick={(txt) => {
                                    setTerminalState('maximized');
                                    handleSendMessage(txt);
                                    forceScrollToBottom('smooth');
                                  }}
                                />
                              </div>
                            </div>
                          )}

                          {/* Chat Input row */}
                          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
                            <div className="flex-1">
                              <ChatInput
                                onSend={handleSendMessage}
                                disabled={isTyping}
                                onFocus={() => {
                                  setTerminalState('maximized');
                                  forceScrollToBottom('smooth');
                                }}
                                onChange={() => {
                                  setTerminalState('maximized');
                                  forceScrollToBottom('smooth');
                                }}
                              />
                            </div>
                            <div className="flex items-center justify-between sm:justify-start gap-2">
                              <CallUsButton />
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* TAB CONTENT 2: SYSTEM PROJECTS AND CASE FILES */}
                    {terminalTab === 'cases' && (
                      <div className="flex-1 flex flex-col md:flex-row overflow-hidden text-neutral-200 font-mono text-xs select-none">
                        {/* Left sidebar: Projects List */}
                        <div className="w-full md:w-1/3 border-b md:border-b-0 md:border-r border-neutral-900 pr-0 md:pr-3.5 pb-2.5 md:pb-0 flex flex-col overflow-y-auto space-y-1.5 h-[130px] md:h-full shrink-0 terminal-scrollbar">
                          <div className="text-[9px] text-[#FF3B30] font-bold uppercase tracking-widest pb-1">
                            📁 TELEMETRY CASE ARCHIVES
                          </div>
                          {CASE_FILES.map((file) => (
                            <button
                              key={file.id}
                              type="button"
                              onClick={() => setSelectedCaseId(file.id)}
                              className={`w-full text-left p-2.5 border transition-all flex flex-col justify-between cursor-pointer rounded-none ${
                                selectedCaseId === file.id
                                  ? 'bg-neutral-900 border-[#FF3B30]'
                                  : 'bg-black border-neutral-900/60 hover:border-neutral-800 hover:bg-neutral-950'
                              }`}
                            >
                              <div className="flex items-center justify-between w-full">
                                <span className="font-bold text-white uppercase text-[10px] md:text-xs truncate">{file.client}</span>
                                <span className="text-[8px] text-[#FF3B30] bg-red-950/40 px-1 py-0.5 border border-red-900/20">{file.number}</span>
                              </div>
                              <span className="text-[9px] text-neutral-500 mt-1 uppercase">Response: {file.responseTime}</span>
                            </button>
                          ))}
                        </div>

                        {/* Right: Selected Case Detailed Report */}
                        <div className="flex-1 pl-0 md:pl-3.5 pt-2.5 md:pt-0 overflow-y-auto flex flex-col space-y-3.5 h-full terminal-scrollbar">
                          {(() => {
                            const activeFile = CASE_FILES.find((f) => f.id === selectedCaseId) || CASE_FILES[0];
                            return (
                              <div className="space-y-3.5 pb-4">
                                {/* Case Identity Header */}
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-neutral-900 pb-2">
                                  <div>
                                    <h4 className="text-xs md:text-sm font-black text-white uppercase tracking-wider">{activeFile.client} RECOVERY FILE</h4>
                                    <p className="text-[9px] text-neutral-500 tracking-wider">SYSTEM: STABILIZED // CORE RECONSTRUCTION PROGRESS</p>
                                  </div>
                                  <div className="text-right mt-1 sm:mt-0">
                                    <span className="text-[9px] font-bold text-green-500 uppercase bg-green-950/30 border border-green-900/40 px-2 py-0.5 inline-block">
                                      STRENGTH {activeFile.outcome}%
                                    </span>
                                  </div>
                                </div>

                                {/* EMBEDDED HIGH-TECH BRAND IMAGE / VECTOR SCHEMATIC */}
                                <div className="bg-[#080808] border border-neutral-900 aspect-[16/7] w-full flex items-center justify-center p-4 relative overflow-hidden">
                                  <div className="absolute inset-0 bg-scanlines opacity-20 pointer-events-none" />
                                  
                                  {/* Overlay ciphers */}
                                  <div className="absolute top-2 left-2 text-[8px] text-neutral-700 font-mono select-none">GRID: RECON_V1.1</div>
                                  <div className="absolute bottom-2 right-2 text-[8px] text-neutral-700 font-mono select-none">STABILITY_FLAG: OK</div>

                                  {/* Grid representation */}
                                  <div className="absolute inset-0 grid grid-cols-6 grid-rows-4 opacity-5 pointer-events-none">
                                    {Array.from({ length: 24 }).map((_, i) => (
                                      <div key={i} className="border border-white/20" />
                                    ))}
                                  </div>

                                  {/* Interactive simulated brand designs */}
                                  {activeFile.id === 'case-01' && (
                                    <div className="text-center relative z-10 flex flex-col items-center">
                                      <div className="relative mb-2">
                                        <div className="w-12 h-12 border-2 border-[#FF3B30] rotate-45 flex items-center justify-center relative animate-pulse">
                                          <div className="w-6 h-6 bg-[#FF3B30]/30" />
                                        </div>
                                        <div className="absolute -top-1 -right-1 w-2 h-2 bg-white rounded-full animate-ping" />
                                      </div>
                                      <span className="font-mono text-[11px] text-white font-extrabold uppercase tracking-[0.3em] italic">ANARCHY CAPITAL</span>
                                      <span className="font-mono text-[8px] text-red-500 tracking-[0.1em] mt-0.5 uppercase">GEOMETRIC APEX SPECIFICATION</span>
                                    </div>
                                  )}

                                  {activeFile.id === 'case-02' && (
                                    <div className="text-center relative z-10 flex flex-col items-center w-full max-w-[200px]">
                                      <div className="w-full h-8 flex items-end justify-between gap-1.5 mb-2.5">
                                        {[20, 60, 40, 95, 30, 10, 50, 75, 45, 100, 30, 60, 20].map((h, idx) => (
                                          <div
                                            key={idx}
                                            className="bg-green-500/80 flex-1 hover:bg-white transition-all duration-300"
                                            style={{ height: `${h}%` }}
                                          />
                                        ))}
                                      </div>
                                      <span className="font-mono text-[11px] text-white font-extrabold uppercase tracking-[0.3em] italic">SOLAS CLINICAL</span>
                                      <span className="font-mono text-[8px] text-green-500 tracking-[0.1em] mt-0.5 uppercase">SIGNAL ACTIVE // EMER_LAUNCH</span>
                                    </div>
                                  )}

                                  {activeFile.id === 'case-03' && (
                                    <div className="text-center relative z-10 flex flex-col items-center">
                                      <div className="relative w-12 h-12 mb-2 flex items-center justify-center">
                                        <div className="absolute inset-0 border border-cyan-500 rounded-full animate-spin [animation-duration:12s]" />
                                        <div className="absolute w-8 h-8 border border-dashed border-cyan-400 rounded-full animate-spin [animation-duration:5s]" />
                                        <div className="w-3 h-3 bg-cyan-500 rounded-full shadow-[0_0_8px_rgba(6,182,212,0.8)]" />
                                      </div>
                                      <span className="font-mono text-[11px] text-white font-extrabold uppercase tracking-[0.3em] italic">HYPERION QUANTUM</span>
                                      <span className="font-mono text-[8px] text-cyan-400 tracking-[0.1em] mt-0.5 uppercase">SPATIAL BRAND SYST_MATRIX</span>
                                    </div>
                                  )}

                                  {activeFile.id === 'case-04' && (
                                    <div className="text-center relative z-10 flex flex-col items-center">
                                      <div className="w-14 h-9 border border-yellow-500 relative mb-2 flex items-center justify-center font-black text-[9px] text-yellow-500 bg-yellow-950/20 tracking-tighter">
                                        <div className="absolute top-0 left-0 w-1.5 h-1.5 border-b border-r border-yellow-500" />
                                        <div className="absolute bottom-0 right-0 w-1.5 h-1.5 border-t border-l border-yellow-500" />
                                        VAPOR_SYS
                                      </div>
                                      <span className="font-mono text-[11px] text-white font-extrabold uppercase tracking-[0.3em] italic">VAPOR INDUSTRIAL</span>
                                      <span className="font-mono text-[8px] text-yellow-500 tracking-[0.1em] mt-0.5 uppercase">BRUTALIST ARCHETYPE APPLIED</span>
                                    </div>
                                  )}
                                </div>

                                {/* Incident description and Resolution Breakdown */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                  <div className="bg-black p-3 border border-neutral-900/80">
                                    <span className="font-bold text-[#FF3B30] uppercase text-[9px] tracking-wider block mb-1">INCIDENT PROTOCOL DIAGNOSIS</span>
                                    <p className="text-neutral-400 text-[10px] md:text-[11px] leading-relaxed">
                                      {activeFile.incident}
                                    </p>
                                  </div>

                                  <div className="bg-black p-3 border border-neutral-900/80 flex flex-col justify-between">
                                    <div>
                                      <span className="font-bold text-[#FF3B30] uppercase text-[9px] tracking-wider block mb-1">RECONSTRUCTION SOLUTION</span>
                                      <p className="text-neutral-300 text-[10px] md:text-[11px] leading-relaxed">
                                        {activeFile.outcomeText}
                                      </p>
                                    </div>
                                    <div className="mt-3 pt-2.5 border-t border-neutral-900 flex justify-between items-center text-[9px] text-neutral-500 font-mono">
                                      <div>RESPONSE: <span className="text-white font-bold">{activeFile.responseTime}</span></div>
                                      <div>TRIAGE STATUS: <span className="text-green-500 font-bold">SECURED</span></div>
                                    </div>
                                  </div>
                                </div>

                                {/* Inline Call to Action link */}
                                <div className="bg-[#0c0c0c] border border-neutral-900 p-3 flex flex-col sm:flex-row justify-between items-center gap-3">
                                  <div className="text-left">
                                    <span className="text-white font-bold text-[10px] uppercase tracking-wide block">DOES YOUR BRAND NEED EMERGENCY REPOSITIONING?</span>
                                    <span className="text-[9px] text-neutral-400 font-mono">Bypass the line instantly. Dial +91 - 9099906631 or email contact@sosagency.in</span>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => setTerminalTab('contact')}
                                    className="px-3.5 py-1.5 bg-[#FF3B30] hover:bg-red-700 text-white font-bold uppercase text-[9px] tracking-widest cursor-pointer whitespace-nowrap transition-colors"
                                  >
                                    [ CONNECT TO PARAMEDIC ]
                                  </button>
                                </div>
                              </div>
                            );
                          })()}
                        </div>
                      </div>
                    )}

                    {/* TAB CONTENT 3: DIRECT EMERGENCY CONTACT DETAILS */}
                    {terminalTab === 'contact' && (
                      <div className="flex-1 flex flex-col justify-between overflow-y-auto space-y-4 text-neutral-200 font-mono text-xs select-none p-1.5 terminal-scrollbar">
                        <div className="space-y-4">
                          {/* Contact Channels header */}
                          <div className="border-b border-neutral-900 pb-2 flex justify-between items-center">
                            <div>
                              <h4 className="text-xs md:text-sm font-black text-white uppercase tracking-wider">☎️ EMERGENCY BROADCAST CHANNELS</h4>
                              <p className="text-[9px] text-neutral-500 tracking-wider">DIRECT HOTLINE COORDINATES OPERATIONAL 24/7/365</p>
                            </div>
                            <span className="text-[9px] font-bold text-green-500 uppercase bg-green-950/30 border border-green-900/40 px-2 py-0.5">
                              TELEMETRY: LIVE
                            </span>
                          </div>

                          {/* Action Grid */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {/* Column 1: Hotline details */}
                            <div className="bg-black border border-neutral-900 p-4 space-y-3.5">
                              <span className="font-bold text-[#FF3B30] uppercase text-[10px] tracking-widest block">📞 DIRECT MOBILE HOTLINE</span>
                              <p className="text-neutral-400 text-[11px] leading-relaxed">
                                Bypass all automated dispatch systems and connect directly with a senior emergency paramedic. Response guaranteed under 10 minutes.
                              </p>
                              <a
                                href="tel:+919099906631"
                                className="flex items-center gap-2 px-4 py-2.5 bg-[#FF3B30] hover:bg-red-700 text-white font-bold uppercase tracking-widest text-center justify-center transition-colors shadow-lg text-[10px]"
                              >
                                <span>DIAL: +91 - 9099906631</span>
                              </a>
                            </div>

                            {/* Column 2: Digital Signal details */}
                            <div className="bg-black border border-neutral-900 p-4 space-y-3.5">
                              <span className="font-bold text-[#FF3B30] uppercase text-[10px] tracking-widest block">✉️ SECURE TELEMETRY MAIL</span>
                              <p className="text-neutral-400 text-[11px] leading-relaxed">
                                Queue pitch decks, current design assets, or custom distress guidelines directly onto our high-priority evaluation server.
                              </p>
                              <a
                                href="mailto:contact@sosagency.in"
                                className="flex items-center gap-2 px-4 py-2.5 bg-neutral-950 hover:bg-neutral-900 text-white border border-neutral-800 hover:border-[#FF3B30] font-bold uppercase tracking-widest text-center justify-center transition-all text-[10px]"
                              >
                                <span>EMAIL: contact@sosagency.in</span>
                              </a>
                            </div>
                          </div>

                          {/* Guidelines card */}
                          <div className="bg-[#090909] border border-neutral-900 p-3 space-y-1.5">
                            <span className="font-bold text-neutral-400 uppercase text-[9px] tracking-widest block">🚨 EMERGENCY TRIAGE PROTOCOL RUNBOOK</span>
                            <ul className="space-y-1 text-neutral-500 text-[10px] list-disc pl-4 leading-relaxed">
                              <li>All communication is entirely confidential and protected by NDA agreements.</li>
                              <li>We take on a strictly limited queue of client rescues concurrently to protect our design reconstruction quality.</li>
                              <li>If your current creative team is in critical failure status, indicate this during your call or email.</li>
                            </ul>
                          </div>
                        </div>

                        {/* Back navigation */}
                        <div className="border-t border-neutral-900 pt-3 flex justify-between items-center text-[10px] text-neutral-500">
                          <span>UPLINK STATION: DEPLOYED</span>
                          <button
                            type="button"
                            onClick={() => setTerminalTab('chat')}
                            className="text-[#FF3B30] hover:underline uppercase font-bold cursor-pointer"
                          >
                            [ RETURN TO AUTOMATED DISPATCH CHAT ]
                          </button>
                        </div>
                      </div>
                    )}

                  </div>
                )}

              </div>
            </TerminalWindow>
          )}
        </div>

        {/* Scroll helper indicator */}
        <div
          onClick={() => scrollToSection('transmission-log')}
          className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex flex-col items-center gap-1 text-white/50 hover:text-white transition-colors cursor-pointer select-none text-[10px] tracking-widest"
        >
          <span>SURVIVORS STORIES BELOW</span>
          <ArrowDown size={14} className="animate-bounce" />
        </div>
      </section>

      {/* ═══════════════════════════════════════
          SECTION 2: TRANSMISSION LOG (MARQUEE + STATS)
          ═══════════════════════════════════════ */}
      <section id="transmission-log" className="bg-[#0A0A0A] py-12 md:py-20 select-none">
        <div className="px-4 md:px-8 max-w-7xl mx-auto">
          {/* Label Header */}
          <div className="flex items-center gap-2 border-b border-neutral-900 pb-3 mb-10">
            <span className="text-[#FF3B30] font-bold">&gt;</span>
            <h2 className="font-mono text-xs md:text-sm text-neutral-400 font-extrabold tracking-widest uppercase">
              TRANSMISSION LOG — BRANDS RESCUED
            </h2>
          </div>

          {/* Infinite Marquee */}
          <div className="mb-14 md:mb-20">
            <LogoMarquee />
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            <StatCounter target={142} label="BRANDS RESCUED" />
            <StatCounter target={98} suffix="%" label="REPEAT CLIENTS" />
            <StatCounter target={24} suffix="H" label="AVG RESPONSE TIME" />
            <StatCounter target={7} suffix="Y" label="YEARS ON CALL" />
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          SECTION 3: CASE FILES ("SHOW CASES")
          ═══════════════════════════════════════ */}
      <section id="case-files" className="bg-[#000000] py-16 md:py-24">
        <div className="px-4 md:px-8 max-w-7xl mx-auto">
          
          {/* Section Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-neutral-900 pb-4 mb-10 md:mb-14">
            <div>
              <div className="flex items-center gap-2 mb-1 select-none">
                <span className="text-[#FF3B30] font-bold">&gt;</span>
                <span className="font-mono text-xs md:text-sm text-neutral-400 font-extrabold tracking-widest uppercase">
                  CLASSIFIED RECOVERY HISTORIES
                </span>
              </div>
              <h2 className="text-2xl md:text-4xl font-extrabold tracking-tight text-white uppercase leading-none">
                SHOW CASES
              </h2>
            </div>
            <p className="font-mono text-[11px] md:text-xs text-neutral-500 mt-2 md:mt-0 max-w-sm select-none">
              Real telemetry. Every brand listed was retrieved from severe market dilution or complete systemic neglect.
            </p>
          </div>

          {/* Grid of Case Files */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
            {CASE_FILES.map((file, idx) => (
              <CaseFileCard
                key={file.id}
                caseFile={file}
                index={idx}
                onViewDetails={handleViewCaseInTerminal}
              />
            ))}
          </div>

        </div>
      </section>

      {/* ═══════════════════════════════════════
          SECTION 4: PROCESS ("HOW WE RESPOND")
          ═══════════════════════════════════════ */}
      <section id="process" className="bg-[#0A0A0A] py-16 md:py-24 select-none">
        <div className="px-4 md:px-8 max-w-7xl mx-auto">
          
          {/* Section Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-neutral-900 pb-4 mb-12">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[#FF3B30] font-bold">&gt;</span>
                <span className="font-mono text-xs md:text-sm text-neutral-400 font-extrabold tracking-widest uppercase">
                  OPERATIONAL RUNBOOK
                </span>
              </div>
              <h2 className="text-2xl md:text-4xl font-extrabold tracking-tight text-white uppercase leading-none">
                HOW WE RESPOND
              </h2>
            </div>
            <p className="font-mono text-[11px] md:text-xs text-neutral-500 mt-2 md:mt-0 max-w-sm">
              Standard agency procedures are sluggish. We operate like visual paramedics. Seconds translate to market value.
            </p>
          </div>

          {/* Process step layout */}
          <ProcessStep />

        </div>
      </section>

      {/* ═══════════════════════════════════════
          SECTION 5: TESTIMONIALS ("SURVIVOR STORIES")
          ═══════════════════════════════════════ */}
      <section id="testimonials" className="bg-[#000000] py-16 md:py-24">
        <div className="px-4 md:px-8 max-w-7xl mx-auto">
          
          {/* Section Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-neutral-900 pb-4 mb-12">
            <div>
              <div className="flex items-center gap-2 mb-1 select-none">
                <span className="text-[#FF3B30] font-bold">&gt;</span>
                <span className="font-mono text-xs md:text-sm text-neutral-400 font-extrabold tracking-widest uppercase">
                  COMMENTS FROM THE FIELD
                </span>
              </div>
              <h2 className="text-2xl md:text-4xl font-extrabold tracking-tight text-white uppercase leading-none">
                SURVIVOR STORIES
              </h2>
            </div>
            <p className="font-mono text-[11px] md:text-xs text-neutral-500 mt-2 md:mt-0 max-w-sm select-none">
              Verified testimonials retrieved from founders who bypassed traditional agencies and survived to tell the story.
            </p>
          </div>

          {/* Testimonial grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {TESTIMONIALS.map((test, idx) => (
              <TestimonialCard key={test.id} testimonial={test} index={idx} />
            ))}
          </div>

        </div>
      </section>

      {/* ═══════════════════════════════════════
          ACCESSIBILITY SECTION: DETAILED OFFLINE TRANSMISSION FORM
          ═══════════════════════════════════════ */}
      <section id="offline-form" className="bg-[#0A0A0A] py-16 md:py-24 border-t border-neutral-900">
        <div className="px-4 md:px-8 max-w-3xl mx-auto">
          <div className="text-center mb-10 select-none">
            <span className="text-xs font-bold text-[#FF3B30] bg-[#FF3B30]/10 border border-[#FF3B30]/30 px-3 py-1 rounded-full uppercase tracking-widest">
              OFFLINEPROTOCOL.SYS
            </span>
            <h3 className="text-2xl md:text-3xl font-extrabold text-white uppercase tracking-tight mt-3">
              STATIC DISTRESS SIGNAL UPLINK
            </h3>
            <p className="font-mono text-xs text-neutral-400 mt-2 max-w-md mx-auto leading-relaxed">
              If you prefer to bypass the AI terminal interface, fill out the emergency telemetry packet below. Our paramedics will triage it within 1 hour.
            </p>
          </div>

          <div className="bg-[#000000] border-2 border-neutral-900 rounded-lg p-6 md:p-8 relative">
            <div className="absolute top-3 right-4 font-mono text-[9px] text-neutral-600 select-none">
              ENCRYPTED_SIGNAL_UPLINK
            </div>

            {formSubmitted ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-10"
              >
                <div className="w-16 h-16 bg-green-950/40 border-2 border-green-500 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
                  <CheckCircle size={32} />
                </div>
                <h4 className="font-mono text-sm md:text-base font-extrabold text-white tracking-widest uppercase">
                  TRANSMISSION SECURED
                </h4>
                <p className="font-mono text-xs text-neutral-400 mt-2 leading-relaxed max-w-sm mx-auto">
                  Distress signal queued into emergency triage pool. Paramedics have been dispatched. Response targeted within 60 minutes.
                </p>
                <button
                  onClick={() => setFormSubmitted(false)}
                  className="mt-6 font-mono text-xs text-[#FF3B30] hover:underline"
                >
                  [DISPATCH NEW SIGNAL]
                </button>
              </motion.div>
            ) : (
              <form onSubmit={handleFormSubmit} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-mono text-[10px] uppercase text-neutral-400 mb-1.5 font-bold tracking-wider">
                      Your Name / Commander *
                    </label>
                    <input
                      required
                      type="text"
                      className="w-full bg-[#0A0A0A] border border-neutral-800 text-white focus:border-[#FF3B30] focus:outline-none rounded px-3.5 py-2.5 font-mono text-xs tracking-wider"
                      placeholder="e.g. Commander Marcus"
                    />
                  </div>
                  <div>
                    <label className="block font-mono text-[10px] uppercase text-neutral-400 mb-1.5 font-bold tracking-wider">
                      Brand / Distress Target *
                    </label>
                    <input
                      required
                      type="text"
                      className="w-full bg-[#0A0A0A] border border-neutral-800 text-white focus:border-[#FF3B30] focus:outline-none rounded px-3.5 py-2.5 font-mono text-xs tracking-wider"
                      placeholder="e.g. Apex Fintech"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-mono text-[10px] uppercase text-neutral-400 mb-1.5 font-bold tracking-wider">
                      Uplink Signal Address (Email) *
                    </label>
                    <input
                      required
                      type="email"
                      className="w-full bg-[#0A0A0A] border border-neutral-800 text-white focus:border-[#FF3B30] focus:outline-none rounded px-3.5 py-2.5 font-mono text-xs tracking-wider"
                      placeholder="commander@brand.com"
                    />
                  </div>
                  <div>
                    <label className="block font-mono text-[10px] uppercase text-neutral-400 mb-1.5 font-bold tracking-wider">
                      Estimated Urgent Deadline *
                    </label>
                    <select
                      className="w-full bg-[#0A0A0A] border border-neutral-800 text-white focus:border-[#FF3B30] focus:outline-none rounded px-3.5 py-2.5 font-mono text-xs tracking-wider cursor-pointer"
                    >
                      <option>Under 2 weeks (EXTREME EMERGENCY)</option>
                      <option>2-4 weeks (Urgently Launching)</option>
                      <option>1-2 months (Standard Triage)</option>
                      <option>No rush, just wants optimization</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-mono text-[10px] uppercase text-neutral-400 mb-1.5 font-bold tracking-wider">
                    Symptom Analysis / Describe the Emergency *
                  </label>
                  <textarea
                    required
                    rows={4}
                    className="w-full bg-[#0A0A0A] border border-neutral-800 text-white focus:border-[#FF3B30] focus:outline-none rounded px-3.5 py-2.5 font-mono text-xs tracking-wider leading-relaxed"
                    placeholder="Describe exactly where the brand narrative is flatlining or what your last agency did wrong..."
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full relative group px-6 py-3 font-mono text-sm uppercase tracking-widest font-bold transition-all duration-300 border-2 border-white text-black bg-white hover:text-white hover:bg-transparent overflow-hidden"
                  >
                    <span className="relative z-10 flex items-center justify-center gap-2">
                      &gt; SEND DISTRESS UPLINK SIGNAL
                    </span>
                    <span className="absolute inset-0 bg-[#FF3B30] transition-transform duration-300 transform translate-y-full group-hover:translate-y-0 z-0" />
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          SECTION 6: FINAL CTA
          ═══════════════════════════════════════ */}
      <section className="bg-gradient-to-t from-[#8B0000] to-[#500000] py-16 md:py-24 text-center select-none relative">
        <div className="absolute inset-0 bg-scanlines opacity-10 pointer-events-none" />
        <div className="px-4 max-w-4xl mx-auto z-10 relative">
          <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white uppercase mb-4 leading-none">
            Brand in trouble? <br className="inline" />
            <span className="text-[#FF3B30] scanline-glow bg-black px-4 py-1 inline-block mt-2">Send SOS.</span>
          </h2>
          <p className="font-mono text-xs md:text-sm text-neutral-300 mt-4 max-w-md mx-auto leading-relaxed">
            Our dispatch team is currently listening. Jump right into terminal diagnostics or bypass the protocol.
          </p>
          
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <PrimaryButton
              onClick={() => scrollToSection('chat-section')}
              className="w-full sm:w-auto"
            >
              <span>&gt; START TRANSMISSION</span>
            </PrimaryButton>
            <a
              href="tel:+919099906631"
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-[#0A0A0A] hover:bg-neutral-900 border-2 border-neutral-800 hover:border-[#FF3B30] text-white font-mono text-sm font-bold uppercase tracking-wider transition-all duration-300"
            >
              <span>[DIAL EMERGENCY PROTOCOL]</span>
            </a>
          </div>

          <div className="text-[10px] text-neutral-400 font-mono mt-4 uppercase tracking-widest">
            Avg. response time: 24 hours
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          SECTION 7: FOOTER
          ═══════════════════════════════════════ */}
      <footer className="bg-[#0A0A0A] border-t border-neutral-900 py-10 md:py-16 text-neutral-400 select-none">
        <div className="px-4 md:px-8 max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-12">
          
          {/* Col 1: Bio */}
          <div className="md:col-span-2">
            <div className="text-white font-black tracking-tighter text-xl mb-4 flex items-center gap-2">
              <span className="text-[#FF3B30] animate-pulse">●</span>
              <span className="tracking-widest font-extrabold text-[#FF3B30]">SOS</span>
              <span className="text-neutral-500 font-normal">AGENCY</span>
            </div>
            <p className="font-mono text-xs leading-relaxed text-neutral-500 max-w-sm">
              We are a premium creative & positioning agency. We do not do "rebranding cycles" or visual posturing. We operate like paramedics to deliver extreme branding.
            </p>
          </div>

          {/* Col 2: Navigation Links */}
          <div>
            <div className="font-mono text-xs font-bold text-white tracking-widest uppercase mb-4">
              &gt; SECTIONS
            </div>
            <ul className="space-y-2.5 font-mono text-xs">
              <li>
                <button onClick={() => scrollToSection('chat-section')} className="hover:text-[#FF3B30] transition-colors">
                  [01] HERO TRANSMITTER
                </button>
              </li>
              <li>
                <button onClick={() => scrollToSection('transmission-log')} className="hover:text-[#FF3B30] transition-colors">
                  [02] STATS LOG
                </button>
              </li>
              <li>
                <button onClick={() => scrollToSection('case-files')} className="hover:text-[#FF3B30] transition-colors">
                  [03] SHOW CASES
                </button>
              </li>
              <li>
                <button onClick={() => scrollToSection('process')} className="hover:text-[#FF3B30] transition-colors">
                  [04] OPERATING PROTOCOL
                </button>
              </li>
              <li>
                <button onClick={() => scrollToSection('offline-form')} className="hover:text-[#FF3B30] transition-colors">
                  [05] OFFLINE FORM
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Social & Systems */}
          <div>
            <div className="font-mono text-xs font-bold text-white tracking-widest uppercase mb-4">
              &gt; CONNECT_PROTOCOL
            </div>
            <ul className="space-y-2.5 font-mono text-xs">
              <li>
                <a href="tel:+919099906631" className="hover:text-[#FF3B30] transition-colors">
                  TEL: +91 - 9099906631
                </a>
              </li>
              <li>
                <a href="mailto:contact@sosagency.in" className="hover:text-[#FF3B30] transition-colors">
                  EMAIL: CONTACT@SOSAGENCY.IN
                </a>
              </li>
              <li>
                <a href="https://github.com" target="_blank" rel="noreferrer" className="hover:text-[#FF3B30] transition-colors">
                  GITHUB: /SOS-AGENCY
                </a>
              </li>
              <li>
                <a href="https://twitter.com" target="_blank" rel="noreferrer" className="hover:text-[#FF3B30] transition-colors">
                  TWITTER: @SOS_AGENCY
                </a>
              </li>
            </ul>
          </div>

        </div>

        {/* Signoff bar */}
        <div className="px-4 md:px-8 max-w-7xl mx-auto border-t border-neutral-900 mt-10 md:mt-14 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-[10px] text-neutral-600">
          <div>
            SESSION TERMINATED. // SOS AGENCY © 2026. ALL TELEMETRY PROTECTED.
          </div>
          <div className="flex gap-4">
            <span className="hover:text-white cursor-pointer">[SECURE_PROTOCOL]</span>
            <span className="hover:text-white cursor-pointer">[COOKIES_BYPASS]</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
