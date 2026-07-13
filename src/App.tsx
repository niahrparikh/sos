import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldAlert, Terminal, MessageSquare, ArrowDown, ArrowUp, Send, CheckCircle } from 'lucide-react';

import { ChatMessageData } from './types';
import { CASE_FILES } from './data/caseFiles';
import { TESTIMONIALS } from './data/testimonials';
import { playClickSound, playTapSound, playSuccessSound, playWarningSound } from './lib/audio';

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
import Logo from './components/Logo';
import VelluxiaVisualizer from './components/VelluxiaVisualizer';
import GujaratPanthersVisualizer from './components/GujaratPanthersVisualizer';
import BeingBeyondVisualizer from './components/BeingBeyondVisualizer';
import QuotationDashboard from './components/QuotationDashboard';
import ConsentBanner from './components/ConsentBanner';
import { Analytics } from '@vercel/analytics/react';

export default function App() {
  // Simple client-side routing state
  const [currentPath, setCurrentPath] = useState(window.location.pathname);
  const [currentHash, setCurrentHash] = useState(window.location.hash);

  // Guarantee page loads at the absolute top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const handleLocationChange = () => {
      setCurrentPath(window.location.pathname);
      setCurrentHash(window.location.hash);
    };
    window.addEventListener('popstate', handleLocationChange);
    window.addEventListener('hashchange', handleLocationChange);
    // Initial check
    handleLocationChange();
    return () => {
      window.removeEventListener('popstate', handleLocationChange);
      window.removeEventListener('hashchange', handleLocationChange);
    };
  }, []);

  const navigateTo = (to: string) => {
    if (to.startsWith('#') || to.includes('#')) {
      window.location.hash = to.includes('#') ? to.substring(to.indexOf('#')) : to;
      setCurrentHash(window.location.hash);
    } else {
      window.history.pushState({}, '', to);
      // Remove hash from the URL completely
      if (window.location.hash) {
        window.history.replaceState(null, '', window.location.pathname);
      }
      setCurrentPath(to);
      setCurrentHash('');
    }
  };

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
  const [selectedCaseId, setSelectedCaseId] = useState<string>('case-being-beyond');

  // Unified scroll helper to keep messages fully visible
  const forceScrollToBottom = (behavior: 'smooth' | 'auto' = 'smooth') => {
    // Delay slightly to allow layout changes (like going full screen or adding message nodes) to complete
    setTimeout(() => {
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

    // 2. Resolve response locally (instant, fully reliable, zero-API dependency)
    setTimeout(() => {
      const lower = text.toLowerCase().trim();
      let reply = '';

      // Contact / Call / Email / Human
      if (
        lower.includes('contact') || 
        lower.includes('call') || 
        lower.includes('phone') || 
        lower.includes('email') || 
        lower.includes('number') || 
        lower.includes('human') || 
        lower.includes('talk') || 
        lower.includes('reach') ||
        lower.includes('connect') ||
        lower.includes('support') ||
        lower.includes('address') ||
        lower.includes('where') ||
        lower.includes('mumbai') ||
        lower.includes('location')
      ) {
        reply = `DISPATCH: Connection direct to Emergency Response Unit. 

📞 **HOTLINE**: +91 - 9099906631
✉️ **EMAIL**: contact@sosagency.in
📍 **STATION**: Lokhandwala, Mumbai, MH, India

Call or email us directly, or scroll down to the **Offline Channel** form to submit a physical dispatch request. We respond within 120 minutes.`;
      }
      // Services / Work / Capabilities
      else if (
        lower.includes('service') || 
        lower.includes('what do you do') || 
        lower.includes('offer') || 
        lower.includes('tier') || 
        lower.includes('rescue') || 
        lower.includes('sprint') || 
        lower.includes('launch') || 
        lower.includes('logo') || 
        lower.includes('branding') || 
        lower.includes('rebrand') ||
        lower.includes('advertising') ||
        lower.includes('marketing') ||
        lower.includes('social') ||
        lower.includes('campaign')
      ) {
        reply = `DISPATCH: Active tactical branding & digital advertising programs:

• **Rescue Sprint** (Solo/small brands in acute crisis, 2-3 weeks)
• **Full Rebrand** (For established entities outgrowing their identity, 6-8 weeks)
• **Launch Kit** (For new brands starting from zero, 4-6 weeks)
• **Brand Tune-Up** (High-intensity creative optimization, 3-4 weeks)
• **Performance Marketing & Ads** (B2C customer acquisition, ongoing)

Reply with the program you need to begin immediate diagnostics.`;
      }
      // Pricing / Cost / Quote
      else if (
        lower.includes('price') || 
        lower.includes('pricing') || 
        lower.includes('cost') || 
        lower.includes('quote') || 
        lower.includes('budget') || 
        lower.includes('how much') || 
        lower.includes('rate') || 
        lower.includes('fee')
      ) {
        reply = `DISPATCH: All operations are customized based on current brand threat level and scope of deployment. 

For an instant, detailed, structured cost estimation with fully customized line-items, click the **Quotation Suite** in the top menu or scroll to the **Offline Channel** form to file your brief. We'll deploy a tactical quotation blueprint immediately.`;
      }
      // Portfolio / Work / Proof
      else if (
        lower.includes('portfolio') || 
        lower.includes('work') || 
        lower.includes('client') || 
        lower.includes('example') || 
        lower.includes('case') || 
        lower.includes('proof') || 
        lower.includes('show') ||
        lower.includes('panthers') ||
        lower.includes('beyond')
      ) {
        reply = `DISPATCH: Proof points are online in the database:

• **Gujarat Panthers Visualizer**: Tactical visual reconstruction for the Pro Kabaddi League team.
• **Being Beyond Wellness**: Calm visual identity system & packaging for holistic wellness.

Scroll down to the **Proof Points** section of the website to view the full interactive design files and case breakdowns.`;
      }
      // Process / Method / Speed
      else if (
        lower.includes('process') || 
        lower.includes('how') || 
        lower.includes('step') || 
        lower.includes('method') || 
        lower.includes('timeline') || 
        lower.includes('duration') || 
        lower.includes('time') || 
        lower.includes('deadline') || 
        lower.includes('urgent') || 
        lower.includes('fast')
      ) {
        reply = `DISPATCH: Tactical timing is prioritized. Depending on your selection:
• Sprints take **2-3 weeks**.
• Full rebranding launches in **6-8 weeks**.
• For extreme emergencies, we have a **48-hour Creative Triage** protocol.

Our process has zero fluff: **Diagnosis ➔ Strategy ➔ Creative Reconstruction ➔ Live Deployment**. Let us know if you need to accelerate.`;
      }
      // Socials
      else if (
        lower.includes('instagram') || 
        lower.includes('linkedin') || 
        lower.includes('facebook') || 
        lower.includes('social') || 
        lower.includes('handle')
      ) {
        reply = `DISPATCH: Outbound channels verified:
• **Instagram**: https://www.instagram.com/sosagency.in
• **LinkedIn**: https://www.linkedin.com/company/sosagency
• **Facebook**: https://www.facebook.com/sosagency

Follow for brand emergency dispatch logs and behind-the-scenes strategy.`;
      }
      // Greetings
      else if (
        lower.includes('hello') || 
        lower.includes('hi') || 
        lower.includes('hey') || 
        lower.includes('yo') || 
        lower.includes('greeting') || 
        lower.includes('good morning') || 
        lower.includes('good afternoon') || 
        lower.includes('good evening')
      ) {
        reply = `DISPATCH: Connection established. High-priority creative signal received. 

What brand emergency are we dealing with today? (e.g. need a *rebrand*, *better pricing info*, our *portfolio*, or *direct contact* with a human operator?)`;
      }
      // Fallback
      else {
        reply = `DISPATCH: Signal acknowledged. To ensure we deploy the perfect creative response unit for your specific scenario:

1. 📞 **Call Hotline**: +91 - 9099906631
2. ✉️ **Email HQ**: contact@sosagency.in
3. 📝 **Submit BRIEF**: Scroll down to the **Offline Channel** form to enter your brand details.

Tell us more about your brand (e.g., are you launching a new company, or do you need to rescue a failing narrative?)`;
      }

      const botMsg: ChatMessageData = {
        id: `bot-${Date.now()}`,
        role: 'assistant',
        content: reply,
        timestamp: getTimestamp(),
      };
      setMessages((prev) => [...prev, botMsg]);
      setIsTyping(false);
    }, 1000);
  };

  // Contact form submission state
  const [formSubmitted, setFormSubmitted] = useState(false);
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitted(true);
  };

  const isSalesRoute = 
    currentPath === '/admin' || 
    currentPath === '/login' || 
    currentPath === '/quotation' || 
    currentPath === '/quotations' || 
    currentPath === '/sales' ||
    currentHash === '#/sales' || 
    currentHash === '#sales' || 
    currentHash === '#/admin' || 
    currentHash === '#admin';

  if (isSalesRoute) {
    return (
      <QuotationDashboard onBackToMain={() => navigateTo('/')} />
    );
  }

  return (
    <div className="min-h-screen bg-[#0A4A3D] text-[#F5F5F0] font-sans flex flex-col selection:bg-[#E8368F] selection:text-white overflow-x-hidden">
      
      {/* ═══════════════════════════════════════
          HEADER BAR (Aligned with Page 16: wordmark left, 4 links max, lime CTA)
          ═══════════════════════════════════════ */}
      <header className="sticky top-0 z-50 bg-[#0A4A3D] border-b border-[#0E6B58]/35 px-4 py-3.5 md:px-8 flex justify-between items-center select-none shadow-[0_4px_20px_rgba(10,74,61,0.4)]">
        <Logo dotSize="w-3 h-3 md:w-3.5 md:h-3.5" textSize="text-lg md:text-xl" />

        {/* 4 links max as requested in Page 16 Guidelines */}
        <nav className="hidden md:flex items-center gap-6 text-xs uppercase font-extrabold text-[#F5F5F0]">
          <button onClick={() => { playClickSound(); scrollToSection('chat-section'); }} className="hover:text-[#D4F000] transition-colors cursor-pointer">DIAGNOSTICS</button>
          <button onClick={() => { playClickSound(); scrollToSection('case-files'); }} className="hover:text-[#D4F000] transition-colors cursor-pointer">PROOF POINTS</button>
          <button onClick={() => { playClickSound(); scrollToSection('process'); }} className="hover:text-[#D4F000] transition-colors cursor-pointer">PROTOCOL</button>
          <button onClick={() => { playClickSound(); scrollToSection('offline-form'); }} className="hover:text-[#D4F000] transition-colors cursor-pointer">OFFLINE CHANNEL</button>
        </nav>

        <div className="flex items-center gap-4">
          <CallUsButton className="scale-90" />
        </div>
      </header>

      {/* ═══════════════════════════════════════
          SECTION 1: HERO / LIVE CHAT TERMINAL (Deep Teal gradient)
          ═══════════════════════════════════════ */}
      <section
        id="chat-section"
        className="relative flex-1 flex flex-col items-center justify-center py-8 md:py-16 px-4 bg-gradient-to-b from-[#0A4A3D] to-[#001c17] min-h-[calc(100vh-60px)]"
      >
        {/* Subtle repeating grid scan-line overlay */}
        <div className="absolute inset-0 bg-scanlines opacity-10 pointer-events-none" />

        {/* Alarm Banner Header */}
        <div className="text-center max-w-4xl mx-auto mb-6 md:mb-10 z-10 select-none px-2">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 bg-black border border-[#0E6B58]/45 text-[#D4F000] font-bold text-xs uppercase px-4 py-1.5 rounded-full mb-4 md:mb-6 scanline-glow"
          >
            <ShieldAlert size={14} className="animate-bounce text-[#E8368F]" />
            <span>CRITICAL BRANDING STATUS: ACTIVE EMERGENCY</span>
          </motion.div>
          <h1 className="text-4xl md:text-6xl font-extrabold mb-6 leading-none tracking-tight uppercase select-none text-[#F5F5F0] cursor-default">
            <motion.span 
              className="inline-block"
              onMouseEnter={() => playTapSound()}
              whileHover={{ 
                scale: 1.05, 
                rotate: -1, 
                color: "#D4F000",
                textShadow: "0 0 12px rgba(212,240,0,0.45)" 
              }}
              transition={{ type: "spring", stiffness: 450, damping: 10 }}
            >
              BRAND IN TROUBLE?
            </motion.span>
            <br />
            <motion.span 
              className="text-[#E8368F] italic inline-block mt-1"
              onMouseEnter={() => playTapSound()}
              whileHover={{ 
                scale: 1.15, 
                skewX: -12,
                color: "#D4F000",
                textShadow: "0 0 15px rgba(212,240,0,0.55)"
              }}
              transition={{ type: "spring", stiffness: 350, damping: 8 }}
            >
              SEND SOS.
            </motion.span>
          </h1>
          <p className="font-sans text-sm md:text-base text-neutral-200 mt-3 max-w-2xl mx-auto leading-relaxed font-medium">
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
              className="h-[520px] md:h-[600px] border-[#0E6B58] scanline-glow"
              onClose={() => setTerminalState('closed')}
              onMinimize={() => setTerminalState('minimized')}
              onMaximize={() => setTerminalState('maximized')}
            >
              <div className="flex-1 flex flex-col items-center justify-center text-center p-6 space-y-4 select-none">
                <Logo dotSize="w-4 h-4 animate-bounce" textSize="text-2xl" className="mb-2" />
                <div className="text-[#E8368F] font-sans text-xs animate-pulse font-extrabold">● SIGNAL TERMINATED — OPERATOR DISCONNECTED</div>
                <h3 className="font-sans text-base md:text-lg font-extrabold text-[#F5F5F0] uppercase tracking-wider">UPLINK CONNECTION OFFLINE</h3>
                <p className="font-sans text-xs text-neutral-400 max-w-sm leading-relaxed font-medium">
                  The emergency distress transceiver was disconnected by the operator. Telemetry stream is suspended.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    playSuccessSound();
                    setTerminalState('normal');
                    forceScrollToBottom('smooth');
                  }}
                  className="px-6 py-2.5 bg-[#D4F000] hover:bg-[#E8368F] text-[#111111] hover:text-white font-sans text-xs font-extrabold uppercase tracking-wider rounded-[4px] transition-all hover:scale-105 active:scale-95 cursor-pointer"
                >
                  REBOOT TRANSMISSION SYSTEM
                </button>
              </div>
            </TerminalWindow>
          ) : terminalState === 'minimized' ? (
            <div
              onClick={() => {
                playSuccessSound();
                setTerminalState('normal');
                forceScrollToBottom('smooth');
              }}
              className="w-full bg-[#001c17] border-l-4 border-[#D4F000] border-r border-t border-b border-[#0E6B58]/35 p-4 flex justify-between items-center select-none cursor-pointer hover:bg-[#0A4A3D]/30 transition-all shadow-lg rounded-[4px]"
            >
              <div className="flex items-center gap-3">
                <Logo dotSize="w-2.5 h-2.5" textSize="text-xs" className="scale-95 mr-1" />
                <span className="w-1.5 h-1.5 rounded-full bg-[#D4F000] animate-pulse shrink-0" />
                <span className="font-sans text-[10px] md:text-xs text-neutral-300 uppercase tracking-wider font-extrabold">
                  SIGNAL SUSPENDED (MINIMIZED)
                </span>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  playSuccessSound();
                  e.stopPropagation();
                  setTerminalState('normal');
                  forceScrollToBottom('smooth');
                }}
                className="font-sans text-[9px] md:text-[10px] text-[#D4F000] hover:underline uppercase font-extrabold"
              >
                RESTORE UPLINK
              </button>
            </div>
          ) : (
            <TerminalWindow
              state={terminalState}
              className={
                terminalState === 'maximized'
                  ? "w-full h-full max-w-6xl max-h-[92vh] border-[#0E6B58]"
                  : "h-[520px] md:h-[600px] border-[#0E6B58]/60 scanline-glow"
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
                          <span className="text-[#D4F000] font-bold">&gt;</span>
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
                            className="bg-neutral-950 border border-[#0E6B58]/55 text-[#D4F000] focus:border-[#D4F000] focus:outline-none px-3.5 py-2.5 rounded text-base tracking-wider uppercase font-extrabold flex-1 font-sans"
                            maxLength={30}
                          />
                          <button
                            type="submit"
                            className="px-4 py-2.5 bg-[#D4F000] hover:bg-[#E8368F] text-[#111111] hover:text-white font-sans font-extrabold rounded text-[10px] uppercase tracking-widest border border-transparent transition-colors cursor-pointer"
                          >
                            SECURE LINK
                          </button>
                        </form>
                      )}
                    </div>

                    {/* Boot progress meter */}
                    <div className="border-t border-[#0E6B58]/20 pt-4 mt-auto">
                      <div className="flex justify-between text-[10px] text-neutral-400 mb-1.5 font-sans font-extrabold">
                        <span>UPLINK DIAGNOSTICS STREAM</span>
                        <span>{Math.min(Math.floor((bootStep / BOOT_SEQUENCE.length) * 100), 100)}% COMPLETE</span>
                      </div>
                      <div className="w-full bg-neutral-950 h-2 rounded overflow-hidden">
                        <div
                          className="bg-[#D4F000] h-full transition-all duration-300"
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
                        onClick={() => {
                          playClickSound();
                          setTerminalTab('chat');
                        }}
                        className={`px-3 py-1.5 font-sans text-[10px] md:text-xs font-extrabold uppercase tracking-wider border rounded-[4px] transition-all cursor-pointer ${
                          terminalTab === 'chat'
                            ? 'bg-[#D4F000] text-[#111111] border-transparent shadow-[0_0_8px_rgba(212,240,0,0.25)]'
                            : 'bg-neutral-950 text-neutral-400 border-neutral-900 hover:text-[#D4F000] hover:border-[#D4F000]'
                        }`}
                      >
                        📟 DISPATCH CHAT
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          playClickSound();
                          setTerminalTab('cases');
                        }}
                        className={`px-3 py-1.5 font-sans text-[10px] md:text-xs font-extrabold uppercase tracking-wider border rounded-[4px] transition-all cursor-pointer ${
                          terminalTab === 'cases'
                            ? 'bg-[#D4F000] text-[#111111] border-transparent shadow-[0_0_8px_rgba(212,240,0,0.25)]'
                            : 'bg-neutral-950 text-neutral-400 border-neutral-900 hover:text-[#D4F000] hover:border-[#D4F000]'
                        }`}
                      >
                        📁 CLASSIFIED PROJECTS
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          playClickSound();
                          setTerminalTab('contact');
                        }}
                        className={`px-3 py-1.5 font-sans text-[10px] md:text-xs font-extrabold uppercase tracking-wider border rounded-[4px] transition-all cursor-pointer ${
                          terminalTab === 'contact'
                            ? 'bg-[#D4F000] text-[#111111] border-transparent shadow-[0_0_8px_rgba(212,240,0,0.25)]'
                            : 'bg-neutral-950 text-neutral-400 border-neutral-900 hover:text-[#D4F000] hover:border-[#D4F000]'
                        }`}
                      >
                        ☎️ DIRECT CONNECTIONS
                      </button>
                    </div>

                    {/* TAB CONTENT 1: AI CHAT DISPATCH */}
                    {terminalTab === 'chat' && (
                      <div className="flex-1 flex flex-col overflow-hidden">
                        {/* Chat messages viewport */}
                        <div
                          ref={chatContainerRef}
                          className="flex-1 overflow-y-auto pr-1 terminal-scrollbar pb-4 relative"
                        >
                          {/* Ambient Logo Watermark */}
                          <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none select-none z-0">
                            <Logo dotSize="w-16 h-16" textSize="text-5xl md:text-6xl" className="tracking-widest" />
                          </div>

                          <div className="relative z-10 space-y-3.5 pr-1">
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
                          </div>
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
                          <div className="text-[9px] text-[#E8368F] font-bold uppercase tracking-widest pb-1">
                            📁 TELEMETRY CASE ARCHIVES
                          </div>
                          {CASE_FILES.map((file) => (
                            <button
                              key={file.id}
                              type="button"
                              onClick={() => setSelectedCaseId(file.id)}
                              className={`w-full text-left p-2.5 border transition-all flex flex-col justify-between cursor-pointer rounded-none ${
                                selectedCaseId === file.id
                                  ? 'bg-neutral-900 border-[#D4F000]'
                                  : 'bg-black border-neutral-900/60 hover:border-neutral-800 hover:bg-neutral-950'
                              }`}
                            >
                              <div className="flex items-center justify-between w-full">
                                <span className="font-bold text-white uppercase text-[10px] md:text-xs truncate">{file.client}</span>
                                <span className="text-[8px] text-[#E8368F] bg-[#E8368F]/10 px-1 py-0.5 border border-[#E8368F]/20">{file.number}</span>
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
                                <div className="bg-[#080808] border border-neutral-900 min-h-[460px] sm:min-h-[500px] w-full flex flex-col p-2.5 sm:p-4 relative overflow-hidden">
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
                                  {activeFile.id === 'case-being-beyond' && (
                                    <BeingBeyondVisualizer />
                                  )}

                                  {activeFile.id === 'case-gujarat-panthers' && (
                                    <GujaratPanthersVisualizer />
                                  )}

                                  {activeFile.id === 'case-velluxia' && (
                                    <VelluxiaVisualizer />
                                  )}

                                  {activeFile.id === 'case-01' && (
                                    <div className="text-center relative z-10 flex flex-col items-center my-auto mx-auto">
                                      <div className="relative mb-2">
                                        <div className="w-12 h-12 border-2 border-[#E8368F] rotate-45 flex items-center justify-center relative animate-pulse">
                                          <div className="w-6 h-6 bg-[#E8368F]/30" />
                                        </div>
                                        <div className="absolute -top-1 -right-1 w-2 h-2 bg-white rounded-full animate-ping" />
                                      </div>
                                      <span className="font-mono text-[11px] text-white font-extrabold uppercase tracking-[0.3em] italic">ANARCHY CAPITAL</span>
                                      <span className="font-mono text-[8px] text-[#E8368F] tracking-[0.1em] mt-0.5 uppercase">GEOMETRIC APEX SPECIFICATION</span>
                                    </div>
                                  )}

                                  {activeFile.id === 'case-02' && (
                                    <div className="text-center relative z-10 flex flex-col items-center w-full max-w-[200px] my-auto mx-auto">
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
                                    <div className="text-center relative z-10 flex flex-col items-center my-auto mx-auto">
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
                                    <div className="text-center relative z-10 flex flex-col items-center my-auto mx-auto">
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
                                    <span className="font-bold text-[#E8368F] uppercase text-[9px] tracking-wider block mb-1">INCIDENT PROTOCOL DIAGNOSIS</span>
                                    <p className="text-neutral-400 text-[10px] md:text-[11px] leading-relaxed">
                                      {activeFile.incident}
                                    </p>
                                  </div>

                                  <div className="bg-black p-3 border border-neutral-900/80 flex flex-col justify-between">
                                    <div>
                                      <span className="font-bold text-[#E8368F] uppercase text-[9px] tracking-wider block mb-1">RECONSTRUCTION SOLUTION</span>
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
                                    className="px-3.5 py-1.5 bg-[#D4F000] hover:bg-[#E8368F] text-[#111111] hover:text-white font-bold uppercase text-[9px] tracking-widest cursor-pointer whitespace-nowrap rounded-[4px] transition-colors"
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
                              <span className="font-bold text-[#E8368F] uppercase text-[10px] tracking-widest block">📞 DIRECT MOBILE HOTLINE</span>
                              <p className="text-neutral-400 text-[11px] leading-relaxed">
                                Bypass all automated dispatch systems and connect directly with a senior emergency paramedic. Response guaranteed under 10 minutes.
                              </p>
                              <a
                                href="tel:+919099906631"
                                className="flex items-center gap-2 px-4 py-2.5 bg-[#D4F000] hover:bg-[#E8368F] text-[#111111] hover:text-white font-bold uppercase tracking-widest text-center justify-center rounded-[4px] transition-colors shadow-lg text-[10px]"
                              >
                                <span>DIAL: +91 - 9099906631</span>
                              </a>
                            </div>

                            {/* Column 2: Digital Signal details */}
                            <div className="bg-black border border-neutral-900 p-4 space-y-3.5">
                              <span className="font-bold text-[#E8368F] uppercase text-[10px] tracking-widest block">✉️ SECURE TELEMETRY MAIL</span>
                              <p className="text-neutral-400 text-[11px] leading-relaxed">
                                Queue pitch decks, current design assets, or custom distress guidelines directly onto our high-priority evaluation server.
                              </p>
                              <a
                                href="mailto:contact@sosagency.in"
                                className="flex items-center gap-2 px-4 py-2.5 bg-neutral-950 hover:bg-neutral-900 text-white border border-neutral-800 hover:border-[#D4F000] font-bold uppercase tracking-widest text-center justify-center transition-all text-[10px]"
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
                            className="text-[#E8368F] hover:underline uppercase font-bold cursor-pointer"
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
      <section id="transmission-log" className="bg-[#001c17] py-12 md:py-20 select-none border-b border-[#0E6B58]/20">
        <div className="px-4 md:px-8 max-w-7xl mx-auto">
          {/* Label Header */}
          <div className="flex items-center gap-2 border-b border-[#0E6B58]/25 pb-3 mb-10">
            <span className="text-[#E8368F] font-bold">&gt;</span>
            <h2 className="font-sans text-xs md:text-sm text-[#F5F5F0]/80 font-extrabold tracking-widest uppercase">
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
          SECTION 3: CASE FILES ("SHOW CASES") (Aligned with 25% Cream ratio)
          ═══════════════════════════════════════ */}
      <section id="case-files" className="bg-[#F5F5F0] py-16 md:py-24 text-[#111111]">
        <div className="px-4 md:px-8 max-w-7xl mx-auto">
          
          {/* Section Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-[#111111]/15 pb-4 mb-10 md:mb-14">
            <div>
              <div className="flex items-center gap-2 mb-1 select-none">
                <span className="text-[#E8368F] font-bold">&gt;</span>
                <span className="font-sans text-xs md:text-sm text-[#111111]/70 font-extrabold tracking-widest uppercase">
                  CLASSIFIED RECOVERY HISTORIES
                </span>
              </div>
              <h2 className="text-2xl md:text-4xl font-extrabold tracking-tight text-[#111111] uppercase leading-none">
                SHOW CASES
              </h2>
            </div>
            <p className="font-sans text-[11px] md:text-xs text-[#111111]/60 mt-2 md:mt-0 max-w-sm select-none font-medium">
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
      <section id="process" className="bg-[#001c17] py-16 md:py-24 select-none border-t border-b border-[#0E6B58]/20">
        <div className="px-4 md:px-8 max-w-7xl mx-auto">
          
          {/* Section Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-[#0E6B58]/25 pb-4 mb-12">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[#D4F000] font-bold">&gt;</span>
                <span className="font-sans text-xs md:text-sm text-neutral-300 font-extrabold tracking-widest uppercase">
                  OPERATIONAL RUNBOOK
                </span>
              </div>
              <h2 className="text-2xl md:text-4xl font-extrabold tracking-tight text-white uppercase leading-none">
                HOW WE RESPOND
              </h2>
            </div>
            <p className="font-sans text-[11px] md:text-xs text-neutral-400 mt-2 md:mt-0 max-w-sm font-medium">
              Standard agency procedures are sluggish. We operate like visual paramedics. Seconds translate to market value.
            </p>
          </div>

          {/* Process step layout */}
          <ProcessStep />

        </div>
      </section>

      {/* ═══════════════════════════════════════
          SECTION 5: TESTIMONIALS ("SURVIVOR STORIES") (Cream ratio)
          ═══════════════════════════════════════ */}
      <section id="testimonials" className="bg-[#F5F5F0] py-16 md:py-24 text-[#111111] border-t border-[#111111]/10">
        <div className="px-4 md:px-8 max-w-7xl mx-auto">
          
          {/* Section Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-[#111111]/15 pb-4 mb-12">
            <div>
              <div className="flex items-center gap-2 mb-1 select-none">
                <span className="text-[#E8368F] font-bold">&gt;</span>
                <span className="font-sans text-xs md:text-sm text-[#111111]/70 font-extrabold tracking-widest uppercase">
                  COMMENTS FROM THE FIELD
                </span>
              </div>
              <h2 className="text-2xl md:text-4xl font-extrabold tracking-tight text-[#111111] uppercase leading-none">
                SURVIVOR STORIES
              </h2>
            </div>
            <p className="font-sans text-[11px] md:text-xs text-[#111111]/60 mt-2 md:mt-0 max-w-sm select-none font-medium">
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
      <section id="offline-form" className="bg-[#0A4A3D] py-16 md:py-24 border-t border-[#0E6B58]/30">
        <div className="px-4 md:px-8 max-w-3xl mx-auto">
          <div className="text-center mb-10 select-none">
            <span className="text-xs font-extrabold text-[#D4F000] bg-[#D4F000]/10 border border-[#D4F000]/25 px-3.5 py-1.5 rounded-[4px] uppercase tracking-wider">
              OFFLINEPROTOCOL.SYS
            </span>
            <h3 className="text-2xl md:text-3xl font-extrabold text-[#F5F5F0] uppercase tracking-tight mt-3">
              STATIC DISTRESS SIGNAL UPLINK
            </h3>
            <p className="font-sans text-xs text-neutral-300 mt-2 max-w-md mx-auto leading-relaxed font-medium">
              If you prefer to bypass the AI terminal interface, fill out the emergency telemetry packet below. Our paramedics will triage it within 1 hour.
            </p>
          </div>

          <div className="relative group/offline max-w-3xl mx-auto">
            {/* Pink sliding box underlay */}
            <div className="absolute inset-0 bg-[#E8368F] rounded-[6px] translate-x-2.5 translate-y-2.5 group-hover/offline:translate-x-4 group-hover/offline:translate-y-4 transition-transform duration-300 ease-out pointer-events-none z-0 shadow-lg" />
            
            {/* The actual form container */}
            <div className="relative bg-[#001c17] border-2 border-[#0E6B58]/35 rounded-[6px] p-6 md:p-8 group-hover/offline:-translate-x-1 group-hover/offline:-translate-y-1 transition-transform duration-300 ease-out z-10">
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
                <h4 className="font-sans text-sm md:text-base font-extrabold text-[#F5F5F0] tracking-widest uppercase">
                  TRANSMISSION SECURED
                </h4>
                <p className="font-sans text-xs text-neutral-300 mt-2 leading-relaxed max-w-sm mx-auto font-medium">
                  Distress signal queued into emergency triage pool. Paramedics have been dispatched. Response targeted within 60 minutes.
                </p>
                <button
                  onClick={() => setFormSubmitted(false)}
                  className="mt-6 font-sans text-xs text-[#E8368F] font-extrabold hover:underline"
                >
                  DISPATCH NEW SIGNAL
                </button>
              </motion.div>
            ) : (
              <form onSubmit={handleFormSubmit} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-sans text-[10px] uppercase text-[#F5F5F0]/80 mb-1.5 font-extrabold tracking-wider">
                      Your Name / Commander *
                    </label>
                    <input
                      required
                      type="text"
                      className="w-full bg-[#0A4A3D] border border-[#0E6B58]/35 text-white focus:border-[#D4F000] focus:outline-none rounded-[4px] px-3.5 py-2.5 font-sans text-base tracking-wider font-semibold"
                      placeholder="e.g. Commander Marcus"
                    />
                  </div>
                  <div>
                    <label className="block font-sans text-[10px] uppercase text-[#F5F5F0]/80 mb-1.5 font-extrabold tracking-wider">
                      Brand / Distress Target *
                    </label>
                    <input
                      required
                      type="text"
                      className="w-full bg-[#0A4A3D] border border-[#0E6B58]/35 text-white focus:border-[#D4F000] focus:outline-none rounded-[4px] px-3.5 py-2.5 font-sans text-base tracking-wider font-semibold"
                      placeholder="e.g. Apex Fintech"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-sans text-[10px] uppercase text-[#F5F5F0]/80 mb-1.5 font-extrabold tracking-wider">
                      Uplink Signal Address (Email) *
                    </label>
                    <input
                      required
                      type="email"
                      className="w-full bg-[#0A4A3D] border border-[#0E6B58]/35 text-white focus:border-[#D4F000] focus:outline-none rounded-[4px] px-3.5 py-2.5 font-sans text-base tracking-wider font-semibold"
                      placeholder="commander@brand.com"
                    />
                  </div>
                  <div>
                    <label className="block font-sans text-[10px] uppercase text-[#F5F5F0]/80 mb-1.5 font-extrabold tracking-wider">
                      Estimated Urgent Deadline *
                    </label>
                    <select
                      className="w-full bg-[#0A4A3D] border border-[#0E6B58]/35 text-white focus:border-[#D4F000] focus:outline-none rounded-[4px] px-3.5 py-2.5 font-sans text-base tracking-wider cursor-pointer font-semibold"
                    >
                      <option>Under 2 weeks (EXTREME EMERGENCY)</option>
                      <option>2-4 weeks (Urgently Launching)</option>
                      <option>1-2 months (Standard Triage)</option>
                      <option>No rush, just wants optimization</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-sans text-[10px] uppercase text-[#F5F5F0]/80 mb-1.5 font-extrabold tracking-wider">
                    Symptom Analysis / Describe the Emergency *
                  </label>
                  <textarea
                    required
                    rows={4}
                    className="w-full bg-[#0A4A3D] border border-[#0E6B58]/35 text-white focus:border-[#D4F000] focus:outline-none rounded-[4px] px-3.5 py-2.5 font-sans text-base tracking-wider leading-relaxed font-semibold"
                    placeholder="Describe exactly where the brand narrative is flatlining or what your last agency did wrong..."
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    onClick={() => playSuccessSound()}
                    className="w-full relative group px-6 py-3 font-sans text-sm uppercase tracking-widest font-extrabold transition-all duration-300 border-2 border-[#D4F000] text-[#111111] bg-[#D4F000] hover:text-white hover:bg-transparent overflow-hidden rounded-[4px] cursor-pointer"
                  >
                    <span className="relative z-10 flex items-center justify-center gap-2">
                      &gt; SEND DISTRESS UPLINK SIGNAL
                    </span>
                    <span className="absolute inset-0 bg-[#E8368F] transition-transform duration-300 transform translate-y-full group-hover:translate-y-0 z-0" />
                  </button>
                </div>
              </form>
            )}
          </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          SECTION 6: FINAL CTA
          ═══════════════════════════════════════ */}
      <section className="bg-gradient-to-t from-[#001c17] to-[#0A4A3D] py-16 md:py-24 text-center select-none relative border-t border-[#0E6B58]/30">
        <div className="absolute inset-0 bg-scanlines opacity-10 pointer-events-none" />
        <div className="px-4 max-w-4xl mx-auto z-10 relative">
          <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-[#F5F5F0] uppercase mb-4 leading-none">
            Brand in trouble? <br className="inline" />
            <span className="text-[#E8368F] scanline-glow bg-[#001c17] border border-[#0E6B58]/30 px-4 py-1.5 inline-block mt-3 rounded-[4px]">Send SOS.</span>
          </h2>
          <p className="font-sans text-xs md:text-sm text-neutral-300 mt-4 max-w-md mx-auto leading-relaxed font-medium">
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
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-[#001c17] hover:bg-[#0A4A3D]/40 border-2 border-[#0E6B58]/30 hover:border-[#D4F000] text-white font-sans text-sm font-extrabold uppercase tracking-wider transition-all duration-300 rounded-[4px]"
            >
              <span>DIAL EMERGENCY PROTOCOL</span>
            </a>
          </div>

          <div className="text-[10px] text-neutral-400 font-sans mt-4 uppercase tracking-widest font-extrabold">
            Avg. response time: 24 hours
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          SECTION 7: FOOTER
          ═══════════════════════════════════════ */}
      <footer className="bg-[#001c17] border-t border-[#0E6B58]/25 py-10 md:py-16 text-neutral-400 select-none">
        <div className="px-4 md:px-8 max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-12">
          
          {/* Col 1: Bio */}
          <div className="md:col-span-2">
            <Logo className="mb-4" dotSize="w-3.5 h-3.5" textSize="text-xl" />
            <p className="font-sans text-xs leading-relaxed text-neutral-400 max-w-sm font-medium">
              We are a premium creative & positioning agency. We do not do "rebranding cycles" or visual posturing. We operate like paramedics to deliver extreme branding.
            </p>
          </div>

          {/* Col 2: Navigation Links */}
          <div>
            <div className="font-sans text-xs font-extrabold text-[#F5F5F0] tracking-wider uppercase mb-4">
              &gt; SECTIONS
            </div>
            <ul className="space-y-2.5 font-sans text-xs font-bold text-neutral-400">
              <li>
                <button onClick={() => scrollToSection('chat-section')} className="hover:text-[#D4F000] transition-colors cursor-pointer">
                  [01] HERO TRANSMITTER
                </button>
              </li>
              <li>
                <button onClick={() => scrollToSection('transmission-log')} className="hover:text-[#D4F000] transition-colors cursor-pointer">
                  [02] STATS LOG
                </button>
              </li>
              <li>
                <button onClick={() => scrollToSection('case-files')} className="hover:text-[#D4F000] transition-colors cursor-pointer">
                  [03] SHOW CASES
                </button>
              </li>
              <li>
                <button onClick={() => scrollToSection('process')} className="hover:text-[#D4F000] transition-colors cursor-pointer">
                  [04] OPERATING PROTOCOL
                </button>
              </li>
              <li>
                <button onClick={() => scrollToSection('offline-form')} className="hover:text-[#D4F000] transition-colors cursor-pointer">
                  [05] OFFLINE FORM
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Social & Systems */}
          <div>
            <div className="font-sans text-xs font-extrabold text-[#F5F5F0] tracking-wider uppercase mb-4">
              &gt; CONNECT PROTOCOL
            </div>
            <ul className="space-y-2.5 font-sans text-xs font-bold text-neutral-400 font-mono">
              <li>
                <a href="tel:+919099906631" className="hover:text-[#D4F000] transition-colors">
                  TEL: +91 - 9099906631
                </a>
              </li>
              <li>
                <a href="mailto:contact@sosagency.in" className="hover:text-[#D4F000] transition-colors">
                  EMAIL: CONTACT@SOSAGENCY.IN
                </a>
              </li>
            </ul>
          </div>

        </div>

        {/* Signoff bar */}
        <div className="px-4 md:px-8 max-w-7xl mx-auto border-t border-[#0E6B58]/20 mt-10 md:mt-14 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 font-sans text-[10px] text-neutral-500 font-bold">
          <div>
            SESSION SECURED. // SOS AGENCY © 2026. ALL TELEMETRY PROTECTED.
          </div>
          <div className="flex gap-4">
            <span className="hover:text-white cursor-pointer">[SECURE_PROTOCOL]</span>
            <span className="hover:text-white cursor-pointer">[COOKIES_BYPASS]</span>
          </div>
        </div>
      </footer>

      <ConsentBanner />
      <Analytics />
    </div>
  );
}
