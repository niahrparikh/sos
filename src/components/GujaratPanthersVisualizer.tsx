import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trophy, Users, Calendar, Play, Sparkles, RefreshCw, Radio } from 'lucide-react';

interface Player {
  name: string;
  country: string;
  ranking: string;
  role: string;
  gender: 'M' | 'F';
  imagePlaceholderColor: string;
}

const ROSTER: Player[] = [
  {
    name: 'ANIRUDH CHANDRASEKHAR',
    country: 'INDIA',
    ranking: 'AITA (D): 6',
    role: 'Doubles Specialist',
    gender: 'M',
    imagePlaceholderColor: 'from-[#2E1065] to-[#701A75]'
  },
  {
    name: 'NURIA BRANCACCIO',
    country: 'ITALY',
    ranking: 'WTA (S): 188',
    role: 'Singles Ace',
    gender: 'F',
    imagePlaceholderColor: 'from-[#1E1B4B] to-[#4338CA]'
  },
  {
    name: 'MUKUND SASIKUMAR',
    country: 'INDIA',
    ranking: 'ATP (S): 354',
    role: 'Power Baseline',
    gender: 'M',
    imagePlaceholderColor: 'from-[#311042] to-[#D97706]'
  }
];

export default function GujaratPanthersVisualizer() {
  const [activeView, setActiveView] = useState<'roster' | 'matchday' | 'scoreboard'>('roster');
  const [selectedPlayer, setSelectedPlayer] = useState<number>(0);
  
  // Matchday simulator states
  const [matchScore, setMatchScore] = useState({ panthers: 50, smashers: 50 });
  const [isSimulating, setIsSimulating] = useState(false);
  const [isLive, setIsLive] = useState(true);

  // Scoreboard simulator
  const [results, setResults] = useState([
    { teamA: 'Gujarat Panthers', scoreA: 50, teamB: 'Gurgaon Slammers', scoreB: 50, active: false },
    { teamA: 'Chennai Smashers', scoreA: 55, teamB: 'Hyderabad Strikers', scoreB: 45, active: false },
    { teamA: 'GS Delhi Aces', scoreA: 49, teamB: 'SG Pipers', scoreB: 51, active: false },
    { teamA: 'Yash Mumbai Eagles', scoreA: 51, teamB: 'Rajasthan Rangers', scoreB: 49, active: false }
  ]);

  const simulatePoint = () => {
    if (isSimulating) return;
    setIsSimulating(true);
    let count = 0;
    const interval = setInterval(() => {
      setMatchScore(prev => {
        const rand = Math.random();
        const deltaPanthers = rand > 0.52 ? 1 : 0;
        const deltaSmashers = rand <= 0.52 ? 1 : 0;
        return {
          panthers: Math.min(80, prev.panthers + deltaPanthers),
          smashers: Math.min(80, prev.smashers + deltaSmashers)
        };
      });
      count++;
      if (count >= 15) {
        clearInterval(interval);
        setIsSimulating(false);
      }
    }, 150);
  };

  const resetSimulation = () => {
    setMatchScore({ panthers: 50, smashers: 50 });
  };

  const player = ROSTER[selectedPlayer];

  return (
    <div className="w-full h-full flex flex-col justify-between text-left font-mono text-white relative z-10 p-1 md:p-2 select-none">
      {/* Top Title & Tabs */}
      <div className="flex gap-2 border-b border-purple-950 pb-2 mb-2 items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-yellow-500 animate-ping shrink-0" />
          <span className="text-[9px] text-yellow-400 font-black tracking-widest uppercase">
            TPL Franchise: Gujarat Panthers
          </span>
        </div>
        <div className="flex gap-1">
          {(['roster', 'matchday', 'scoreboard'] as const).map((view) => (
            <button
              key={view}
              onClick={() => setActiveView(view)}
              className={`text-[8px] md:text-[9px] px-2 py-0.5 border font-bold uppercase transition-all duration-150 cursor-pointer ${
                activeView === view
                  ? 'bg-yellow-500 text-black border-yellow-500'
                  : 'bg-black text-purple-300 border-purple-900/60 hover:text-white hover:border-purple-700'
              }`}
            >
              [{view}]
            </button>
          ))}
        </div>
      </div>

      {/* Main Viewport */}
      <div className="flex-1 min-h-[220px] flex items-center justify-center bg-black/70 relative p-2 md:p-3 overflow-hidden border border-purple-950/40">
        
        {/* VIEW 1: ROSTER ANNOUNCEMENT CARDS */}
        {activeView === 'roster' && (
          <div className="w-full h-full flex flex-col md:flex-row gap-3 items-stretch">
            {/* Player List Selection */}
            <div className="w-full md:w-[130px] flex md:flex-col gap-1 shrink-0 justify-center">
              {ROSTER.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedPlayer(idx)}
                  className={`text-left text-[8px] md:text-[9px] p-1.5 border transition-all cursor-pointer flex justify-between items-center ${
                    selectedPlayer === idx
                      ? 'border-yellow-500 bg-yellow-950/20 text-white'
                      : 'border-purple-950 bg-black/40 text-purple-300 hover:border-purple-900'
                  }`}
                >
                  <span className="truncate">{p.name.split(' ')[0]}</span>
                  <span className="text-[7px] text-yellow-500 font-bold">[{p.country}]</span>
                </button>
              ))}
              
              <div className="hidden md:block mt-2 p-1.5 border border-purple-950/40 bg-purple-950/10 text-[7px] text-purple-400">
                <span className="text-yellow-500 block font-bold mb-1">BRAND MATRIX:</span>
                • Gold & Purple theme
                • High impact outlines
                • Framer web-ready
              </div>
            </div>

            {/* Poster Card Recreating the Creative */}
            <div className="flex-1 flex items-center justify-center">
              <AnimatePresence mode="wait">
                <motion.div
                  key={selectedPlayer}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="w-full max-w-[210px] h-full min-h-[180px] bg-gradient-to-b from-[#1C0933] to-[#0A0216] border border-purple-900 rounded-sm overflow-hidden flex flex-col justify-between p-2 relative shadow-lg shadow-purple-950/30"
                >
                  {/* Glowing Background Lines */}
                  <div className="absolute inset-0 bg-grid opacity-5 pointer-events-none" />
                  
                  {/* Top bar */}
                  <div className="flex justify-between items-center border-b border-purple-900/60 pb-1.5 text-[7px] text-purple-300">
                    <span className="font-bold">SEASON 7 RETAINER</span>
                    <span className="text-yellow-400">GUJARAT PANTHERS</span>
                  </div>

                  {/* Player Image Simulation */}
                  <div className="flex-1 my-1.5 relative flex flex-col justify-end items-center overflow-hidden bg-black/40 border border-purple-950/60">
                    {/* Simulated Player avatar illustration */}
                    <div className={`absolute inset-0 bg-gradient-to-t ${player.imagePlaceholderColor} opacity-40`} />
                    
                    {/* Retro Grid behind player */}
                    <div className="absolute inset-0 bg-radial-glowing opacity-20" />

                    <div className="relative z-10 text-center pb-2 px-1">
                      <div className="text-[7px] bg-yellow-400 text-black px-1 py-0.5 rounded-xs font-black inline-block mb-1">
                        {player.role.toUpperCase()}
                      </div>
                      <h4 className="text-[10px] font-black text-white leading-tight tracking-tight uppercase drop-shadow-md">
                        {player.name}
                      </h4>
                      <p className="text-[7px] text-purple-300 leading-none mt-0.5 uppercase">
                        Country: {player.country} • {player.ranking}
                      </p>
                    </div>
                  </div>

                  {/* Banner Recreating "SOLD TO GUJARAT PANTHERS" */}
                  <div className="bg-[#4C1D95] border-t border-b border-yellow-400 py-1 text-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-yellow-400/5 animate-pulse" />
                    <span className="text-[8px] font-black text-yellow-400 tracking-wider block">
                      ★ SOLD TO GUJARAT PANTHERS ★
                    </span>
                  </div>

                  {/* Footer tag */}
                  <div className="flex justify-between text-[6px] text-purple-400 mt-1.5">
                    <span>#EVERYPOINTMATTERS</span>
                    <span>TPLSPORT.COM</span>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        )}

        {/* VIEW 2: INTERACTIVE MATCHDAY SCORE BUILDER */}
        {activeView === 'matchday' && (
          <div className="w-full flex flex-col md:flex-row gap-3 items-center justify-between">
            {/* Left Score Card Mockup */}
            <div className="w-full md:max-w-[200px] bg-gradient-to-br from-[#2E1065] to-black border border-purple-900 p-2.5 relative flex flex-col justify-between">
              <div className="flex justify-between items-center border-b border-purple-950 pb-1 mb-2">
                <span className="text-[7px] text-yellow-400 font-bold">MATCHDAY PREVIEW</span>
                <span className="text-[6px] bg-red-600 px-1 py-0.5 rounded-xs font-bold animate-pulse text-white uppercase">LIVE</span>
              </div>

              <div className="space-y-2 py-1">
                {/* Team A */}
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-yellow-400" />
                    <span className="text-[8px] font-bold text-white uppercase">GUJARAT PANTHERS</span>
                  </div>
                  <span className="text-[9px] font-mono font-black text-yellow-400">{matchScore.panthers}</span>
                </div>

                <div className="text-center text-[7px] text-purple-400 my-0.5 font-bold">VS</div>

                {/* Team B */}
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                    <span className="text-[8px] font-bold text-purple-300 uppercase">CHENNAI SMASHERS</span>
                  </div>
                  <span className="text-[9px] font-mono font-black text-white">{matchScore.smashers}</span>
                </div>
              </div>

              <div className="border-t border-purple-950 pt-2 mt-2 flex justify-between items-center text-[6px] text-purple-400">
                <span>DECEMBER 9TH @ 9:00 PM</span>
                <span className="text-yellow-400 font-bold">TPL ROUND 4</span>
              </div>
            </div>

            {/* Right Simulation Controls */}
            <div className="flex-1 space-y-3 pl-0 md:pl-2">
              <div>
                <h4 className="text-[9px] text-yellow-400 font-black tracking-wider uppercase mb-1">
                  MATCHDAY CONTROLLER
                </h4>
                <p className="text-[8px] text-purple-300 leading-snug">
                  Execute mock live tennis telemetry updates. Recreates real-time digital engagement formats.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-1.5">
                <button
                  onClick={simulatePoint}
                  disabled={isSimulating}
                  className={`flex items-center gap-1 px-2 py-1 text-[8px] border font-bold uppercase transition-all cursor-pointer ${
                    isSimulating
                      ? 'border-purple-800 text-purple-500 bg-black/40'
                      : 'border-yellow-500 bg-yellow-500 text-black hover:bg-yellow-400'
                  }`}
                >
                  <Play className="w-2.5 h-2.5 shrink-0" />
                  {isSimulating ? 'SIMULATING...' : 'SIMULATE POINT'}
                </button>
                <button
                  onClick={resetSimulation}
                  className="flex items-center gap-1 px-2 py-1 text-[8px] border border-purple-800 hover:border-purple-600 bg-black text-purple-300 hover:text-white cursor-pointer"
                >
                  <RefreshCw className="w-2.5 h-2.5 shrink-0" />
                  RESET SCORE
                </button>
              </div>

              {/* Broadcasters Display */}
              <div className="p-1.5 bg-black/50 border border-purple-950 rounded-xs">
                <div className="text-[6px] text-purple-500 uppercase tracking-widest mb-1 flex items-center gap-1">
                  <Radio className="w-2 h-2 text-yellow-400" />
                  BROADCAST INLET
                </div>
                <div className="flex gap-2 items-center">
                  <span className="text-[7px] text-white font-bold bg-neutral-900 px-1 border border-neutral-800">JioHotstar</span>
                  <span className="text-[7px] text-[#FF3B30] font-black italic">SONY SPORTS 5 HD</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* VIEW 3: DAY 4 LEAGUE RESULTS BOARD */}
        {activeView === 'scoreboard' && (
          <div className="w-full flex flex-col justify-between">
            <div className="flex justify-between items-center text-[7px] text-purple-400 border-b border-purple-950 pb-1 mb-2">
              <span>OFFICIAL TENNIS PREMIER LEAGUE MATRIX</span>
              <span className="text-yellow-400">DECEMBER 12TH</span>
            </div>

            {/* Results Grid Table */}
            <div className="space-y-1.5">
              {results.map((r, idx) => (
                <div
                  key={idx}
                  className="flex justify-between items-center bg-[#07020E] border border-purple-950/80 p-1.5 hover:border-purple-900 transition-all"
                >
                  <div className="w-[42%] text-left">
                    <span className={`text-[8px] font-bold block uppercase ${r.teamA === 'Gujarat Panthers' ? 'text-yellow-400 font-black' : 'text-neutral-300'}`}>
                      {r.teamA}
                    </span>
                  </div>
                  
                  {/* Central score divider */}
                  <div className="flex items-center gap-1 text-[8px] font-black tracking-widest text-white px-2 py-0.5 bg-purple-950/40 border border-purple-900/40 rounded-xs">
                    <span className={r.teamA === 'Gujarat Panthers' ? 'text-yellow-400' : ''}>{r.scoreA}</span>
                    <span className="text-[6px] text-purple-500">VS</span>
                    <span>{r.scoreB}</span>
                  </div>

                  <div className="w-[42%] text-right">
                    <span className="text-[8px] font-bold text-neutral-300 block uppercase">
                      {r.teamB}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="text-center mt-2.5">
              <span className="text-[7px] text-purple-500 uppercase tracking-widest">
                ★ LEAGUE TOURNAMENT POINT ACCURACY GUARANTEED ★
              </span>
            </div>
          </div>
        )}

      </div>

      {/* Footer Descriptor */}
      <div className="text-[8px] md:text-[9px] text-neutral-500 border-t border-purple-950/40 pt-1.5 flex justify-between items-center">
        <span>GUJARAT PANTHERS SOCIAL BRAND GRAPHICS SYSTEM</span>
        <span className="text-yellow-400 font-bold">STATE: LOADED</span>
      </div>
    </div>
  );
}
