import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Heart, Play, BookOpen, RefreshCw, Sparkles, CheckCircle, ArrowRight, Video } from 'lucide-react';

interface CardPrompt {
  category: 'MOMENT' | 'INTERPRETATION' | 'SOLUTION';
  title: string;
  question: string;
  color: string;
}

const DECK: CardPrompt[] = [
  {
    category: 'MOMENT',
    title: 'The Silent Inception',
    question: 'Identify the exact, silent minute during our disagreement where you felt the first physical shift from connection to defense. Describe what you felt inside.',
    color: 'border-pink-500/40 bg-pink-950/10'
  },
  {
    category: 'INTERPRETATION',
    title: 'Unspoken Narratives',
    question: 'When I stopped speaking, what was the story you instantly told yourself about my feelings toward you? Was that narrative based on the moment, or an old wound?',
    color: 'border-indigo-500/40 bg-indigo-950/10'
  },
  {
    category: 'SOLUTION',
    title: 'Co-Created Repair',
    question: 'If we could hit reset and rewrite the last five minutes of our conversation, what is the single sentence you wished you had said, and what is the single sentence you wished to hear?',
    color: 'border-teal-500/40 bg-teal-950/10'
  },
  {
    category: 'MOMENT',
    title: 'Tone Modulation',
    question: 'How did my vocal tone affect your sense of safety? Let’s repeat the last statement using a neutral, descriptive volume to observe the change.',
    color: 'border-pink-500/40 bg-pink-950/10'
  },
  {
    category: 'INTERPRETATION',
    title: 'The Hidden Needs',
    question: 'What underlying need was disguised as an accusation? "You never do this" actually means "I am feeling lonely because...". Let’s translate it together.',
    color: 'border-indigo-500/40 bg-indigo-950/10'
  }
];

const YOUTUBE_VIDEOS = [
  {
    title: "5 Negative thinking patterns destroying your Confidence",
    views: "182K views",
    duration: "14:22",
    tag: "CONFIDENCE",
    gradient: "from-purple-900 to-indigo-950"
  },
  {
    title: "Reset your Life - 4 changes in 2025!",
    views: "340K views",
    duration: "18:05",
    tag: "LIFESTYLE RESET",
    gradient: "from-pink-900 to-rose-950"
  },
  {
    title: "Fix your Relationships - 3 step Framework!",
    views: "295K views",
    duration: "22:11",
    tag: "RELATIONSHIPS",
    gradient: "from-emerald-900 to-teal-950"
  },
  {
    title: "3 Techniques to Stop Overthinking Part 2",
    views: "410K views",
    duration: "11:45",
    tag: "OVERTHINKING",
    gradient: "from-cyan-900 to-blue-950"
  }
];

const BLOCKS = [
  {
    name: "Overthinking & Loop Cycles",
    key: "overthink",
    quote: "I can't shut off my brain; I keep rewriting worst-case scenarios.",
    repair: "MOMENT INTERPRETATION: Pause and list 3 concrete physical facts in your current room. Separate real observable inputs from internal generated narratives."
  },
  {
    name: "Relationship Communication Friction",
    key: "friction",
    quote: "Every minor mismatch escalates into a cold war or defensive wall.",
    repair: "INTERPRETATION SOLUTION: Swap perspectives for 60 seconds. Articulate your partner's argument with full empathy before stating your own."
  },
  {
    name: "Confidence & Core Alignment",
    key: "confidence",
    quote: "I am constantly seeking validation and doubting my natural path.",
    repair: "SOLUTION RESET: Dedicate 10 minutes to write down decisions made entirely from internal curiosity rather than parental or societal expectation."
  }
];

export default function BeingBeyondVisualizer() {
  const [activeTab, setActiveTab] = useState<'cards' | 'youtube' | 'consulting'>('cards');
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [activeBlock, setActiveBlock] = useState('overthink');
  const [isVideoPlaying, setIsVideoPlaying] = useState<number | null>(null);

  const drawNextCard = () => {
    setCurrentCardIndex((prev) => (prev + 1) % DECK.length);
  };

  const selectedCard = DECK[currentCardIndex];
  const selectedBlockObj = BLOCKS.find(b => b.key === activeBlock) || BLOCKS[0];

  return (
    <div className="w-full h-full flex flex-col justify-between text-left font-mono text-white relative z-10 p-1 md:p-2 select-none">
      {/* Top Navigation Bar */}
      <div className="flex gap-2 border-b border-purple-950 pb-2 mb-2 items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-pink-500 animate-pulse shrink-0" />
          <span className="text-[9px] text-pink-400 font-black tracking-widest uppercase">
            BRAND LAB: BEING BEYOND CO
          </span>
        </div>
        <div className="flex gap-1">
          {(['cards', 'youtube', 'consulting'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`text-[8px] md:text-[9px] px-2 py-0.5 border font-bold uppercase transition-all duration-150 cursor-pointer ${
                activeTab === tab
                  ? 'bg-pink-600 text-white border-pink-500'
                  : 'bg-black text-purple-300 border-purple-900/60 hover:text-white hover:border-purple-700'
              }`}
            >
              [{tab === 'cards' ? 'Let\'s Fix It' : tab}]
            </button>
          ))}
        </div>
      </div>

      {/* Primary Visual Stage */}
      <div className="flex-1 min-h-[220px] flex items-center justify-center bg-black/70 relative p-2 md:p-3 overflow-hidden border border-purple-950/40">
        
        {/* VIEW 1: LET'S FIX IT CARDS (Interactive card drawer) */}
        {activeTab === 'cards' && (
          <div className="w-full h-full flex flex-col items-center justify-center relative">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentCardIndex}
                initial={{ opacity: 0, rotateY: 90 }}
                animate={{ opacity: 1, rotateY: 0 }}
                exit={{ opacity: 0, rotateY: -90 }}
                transition={{ duration: 0.3 }}
                className={`w-full max-w-[260px] min-h-[160px] border rounded-md p-3 flex flex-col justify-between relative shadow-lg shadow-pink-950/20 ${selectedCard.color}`}
              >
                {/* Accent Header */}
                <div className="flex justify-between items-center border-b border-neutral-800 pb-1.5 mb-2">
                  <span className="text-[7px] text-pink-400 font-black tracking-widest uppercase">
                    [ {selectedCard.category} DECK ]
                  </span>
                  <span className="text-[7px] text-neutral-500 font-bold">
                    CARD {currentCardIndex + 1}/{DECK.length}
                  </span>
                </div>

                {/* Question Area */}
                <div className="flex-1 flex flex-col justify-center">
                  <h5 className="text-[9px] font-black text-white uppercase mb-1 tracking-tight">
                    {selectedCard.title}
                  </h5>
                  <p className="text-[8px] md:text-[9px] text-neutral-200 leading-normal italic font-sans font-medium">
                    "{selectedCard.question}"
                  </p>
                </div>

                {/* Card Subtitle */}
                <div className="border-t border-neutral-800/40 pt-1.5 mt-2 flex justify-between items-center text-[6px] text-neutral-500">
                  <span>MIS REPAIR METHOD™</span>
                  <span className="text-pink-400 font-bold">HEAL INTIMACY</span>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Controller row */}
            <div className="mt-3 flex gap-2">
              <button
                onClick={drawNextCard}
                className="flex items-center gap-1.5 px-3 py-1 bg-pink-600 hover:bg-pink-500 text-white border border-pink-500 text-[8px] font-black uppercase tracking-wider cursor-pointer"
              >
                <RefreshCw className="w-2.5 h-2.5" />
                DRAW NEXT CARD
              </button>
            </div>
          </div>
        )}

        {/* VIEW 2: YOUTUBE TRACKER (Interactive slide list) */}
        {activeTab === 'youtube' && (
          <div className="w-full h-full flex flex-col justify-between">
            <div className="flex justify-between items-center text-[7px] text-purple-400 border-b border-purple-950 pb-1 mb-2">
              <span>EXPLORE CURRENT MINDSET LESSONS</span>
              <span className="text-pink-400 font-bold flex items-center gap-1">
                <Video className="w-2 h-2" /> IPSITA ON YOUTUBE
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {YOUTUBE_VIDEOS.map((v, idx) => (
                <div
                  key={idx}
                  onClick={() => setIsVideoPlaying(isVideoPlaying === idx ? null : idx)}
                  className={`border border-purple-950/60 p-2 cursor-pointer relative overflow-hidden transition-all duration-200 ${
                    isVideoPlaying === idx
                      ? 'border-pink-500 bg-black'
                      : 'bg-gradient-to-br hover:border-purple-800'
                  }`}
                  style={{ backgroundImage: isVideoPlaying !== idx ? `linear-gradient(to bottom right, #09011a, #030009)` : '' }}
                >
                  <div className="absolute top-1 right-1 text-[6px] bg-black/60 px-1 py-0.5 rounded-xs text-neutral-400 font-bold">
                    {v.duration}
                  </div>
                  
                  {/* Playing simulated visual overlay */}
                  {isVideoPlaying === idx ? (
                    <div className="h-[46px] w-full bg-pink-950/20 border border-pink-500/30 flex items-center justify-center relative mb-1.5">
                      <div className="absolute inset-0 bg-radial-glowing opacity-20" />
                      <div className="w-2 h-2 rounded-full bg-pink-500 animate-ping absolute" />
                      <span className="text-[7px] text-pink-400 font-bold z-10 uppercase tracking-widest animate-pulse">STREAMING ANALYSIS...</span>
                    </div>
                  ) : (
                    <div className="h-[46px] w-full bg-neutral-900/40 flex items-center justify-center relative mb-1.5 rounded-xs border border-purple-950/40">
                      <Play className="w-4 h-4 text-pink-500" />
                    </div>
                  )}

                  <h5 className="text-[8px] font-black text-white leading-tight mb-1 truncate uppercase">
                    {v.title}
                  </h5>
                  <div className="flex justify-between text-[6px] text-neutral-500">
                    <span className="text-pink-400/80 font-bold">#{v.tag}</span>
                    <span>{v.views}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* VIEW 3: 1:1 CONSULTING ALIGNMENT MATRIX */}
        {activeTab === 'consulting' && (
          <div className="w-full h-full flex flex-col md:flex-row gap-3 items-stretch">
            {/* Block list selection */}
            <div className="w-full md:w-[130px] flex md:flex-col gap-1 shrink-0 justify-center">
              {BLOCKS.map((b) => (
                <button
                  key={b.key}
                  onClick={() => setActiveBlock(b.key)}
                  className={`text-left text-[8px] p-1.5 border transition-all cursor-pointer ${
                    activeBlock === b.key
                      ? 'border-pink-500 bg-pink-950/20 text-white'
                      : 'border-purple-950 bg-black/40 text-purple-300 hover:border-purple-900'
                  }`}
                >
                  <span className="block truncate">{b.name}</span>
                </button>
              ))}
            </div>

            {/* Diagnostic panel */}
            <div className="flex-1 bg-[#090117] border border-purple-950 p-2.5 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-center border-b border-purple-950 pb-1 mb-1.5 text-[7px] text-neutral-500">
                  <span>MINDSET ALIGNMENT ASSESSMENT</span>
                  <span className="text-pink-400">ACTIVE FORMULA</span>
                </div>
                <p className="text-[7px] text-neutral-400 italic mb-2 leading-snug">
                  "{selectedBlockObj.quote}"
                </p>
                <div className="bg-black/60 p-1.5 border-l-2 border-pink-500 rounded-r-xs">
                  <span className="text-[8px] text-pink-400 font-bold uppercase block mb-1">
                    MIS THERAPY REPAIR ENGINE:
                  </span>
                  <p className="text-[8px] text-neutral-200 leading-normal font-sans">
                    {selectedBlockObj.repair}
                  </p>
                </div>
              </div>

              <div className="border-t border-purple-950 pt-2 mt-1 flex justify-between items-center">
                <span className="text-[7px] text-neutral-500 uppercase">1:1 CONSULTING SYSTEM</span>
                <span className="text-[7px] bg-pink-600 text-white px-1 py-0.5 font-bold uppercase flex items-center gap-1 cursor-pointer">
                  ALIGNED <CheckCircle className="w-2 h-2 text-white shrink-0" />
                </span>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* Footer descriptor */}
      <div className="text-[8px] md:text-[9px] text-neutral-500 border-t border-purple-950/40 pt-1.5 flex justify-between items-center">
        <span>BEING BEYOND CO BRAND & PLAYING CARD DESIGN KIT</span>
        <span className="text-pink-500 font-bold">STATE: COMPILED</span>
      </div>
    </div>
  );
}
