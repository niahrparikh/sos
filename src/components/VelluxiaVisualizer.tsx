import React, { useState } from 'react';
import { motion } from 'motion/react';

export default function VelluxiaVisualizer() {
  const [activeTab, setActiveTab] = useState<'prescription' | 'anatomy' | 'clinical'>('prescription');
  
  // States for interactive parts
  const [checkedDays, setCheckedDays] = useState<Record<number, boolean>>({
    1: true, 2: true, 3: true, 4: false, 5: false, 6: false, 7: false
  });
  
  const [sliderVal, setSliderVal] = useState<number>(50); // for before-after slider

  const toggleDay = (day: number) => {
    setCheckedDays(prev => ({ ...prev, [day]: !prev[day] }));
  };

  return (
    <div className="w-full h-full flex flex-col justify-between text-left font-mono text-white relative z-10 p-1 md:p-2 select-none">
      {/* Visualizer header tabs */}
      <div className="flex gap-2 border-b border-neutral-900 pb-2 mb-2 items-center justify-between">
        <div className="text-[9px] text-[#FF3B30] font-black tracking-widest">
          SYSTEM_CAMPAIGN: VELLUXIA
        </div>
        <div className="flex gap-1">
          {(['prescription', 'anatomy', 'clinical'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`text-[8px] md:text-[9px] px-2 py-0.5 border font-bold uppercase transition-all duration-150 cursor-pointer ${
                activeTab === tab
                  ? 'bg-[#FF3B30] text-white border-[#FF3B30]'
                  : 'bg-black text-neutral-400 border-neutral-800 hover:text-white hover:border-neutral-700'
              }`}
            >
              [{tab}]
            </button>
          ))}
        </div>
      </div>

      {/* Main interactive viewport */}
      <div className="flex-1 min-h-[140px] flex items-center justify-center bg-black/60 relative p-2 overflow-hidden border border-neutral-900/40">
        
        {/* TAB 1: DAILY PRESCRIPTION */}
        {activeTab === 'prescription' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-sm bg-[#070707] border border-neutral-900 p-2.5 md:p-3 relative"
          >
            <div className="absolute top-1 right-1 text-[7px] text-[#FF3B30] animate-pulse">● CAMPAIGN_READY</div>
            <h4 className="text-[10px] md:text-xs font-black text-neutral-200 tracking-wider mb-1 text-center border-b border-neutral-900 pb-1.5 uppercase">
              PRESCRIPTION FOR MARCH MORNINGS
            </h4>
            
            <p className="text-[8px] text-neutral-500 text-center mb-2 leading-none uppercase">
              Reset System // Daily Skin Defence & Protect
            </p>

            {/* Checkable days representing March reset capsules */}
            <div className="grid grid-cols-7 gap-1 md:gap-2 mb-2">
              {Array.from({ length: 7 }).map((_, idx) => {
                const day = idx + 1;
                const isChecked = checkedDays[day];
                return (
                  <button
                    key={day}
                    onClick={() => toggleDay(day)}
                    className={`flex flex-col items-center justify-center p-1 border cursor-pointer transition-all ${
                      isChecked
                        ? 'border-[#FF3B30] bg-red-950/20 text-white'
                        : 'border-neutral-800 bg-neutral-950 text-neutral-500 hover:border-neutral-700'
                    }`}
                  >
                    <span className="text-[7px] text-neutral-500 block uppercase mb-1">D-0{day}</span>
                    <div className={`w-3 h-5 rounded-full border flex items-center justify-center ${
                      isChecked ? 'border-[#FF3B30] bg-[#FF3B30]' : 'border-neutral-600'
                    }`}>
                      {isChecked && <div className="w-1 h-2 bg-white rounded-full" />}
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="text-center">
              <span className="text-[8px] text-[#FF3B30] font-bold uppercase tracking-wide">
                [ {Object.values(checkedDays).filter(Boolean).length}/7 CAPSULES DEPLOYED ]
              </span>
            </div>
          </motion.div>
        )}

        {/* TAB 2: ANATOMY GRID BLUEPRINT */}
        {activeTab === 'anatomy' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full h-full flex items-center justify-between gap-4 max-w-md"
          >
            {/* Technical Bottle representation in pure CSS/SVG */}
            <div className="w-20 md:w-24 h-full flex flex-col items-center justify-center relative shrink-0">
              <div className="w-8 h-4 border border-neutral-700 rounded-t-sm bg-neutral-900/60" /> {/* clear cap */}
              <div className="w-10 h-20 border-x border-b border-neutral-700 bg-neutral-950 flex flex-col items-center justify-between p-1.5 relative">
                <div className="absolute inset-0 bg-grid opacity-10 pointer-events-none" />
                <span className="text-[7px] font-black text-white italic tracking-wider leading-none mt-2">VELLUXIA</span>
                <span className="text-[5px] text-neutral-500 uppercase leading-none mb-1 text-center">KOREAN DERM</span>
              </div>
            </div>

            {/* Pointer System */}
            <div className="flex-1 flex flex-col gap-2 justify-center text-[8px] md:text-[9px] text-neutral-400">
              <div className="border-l-2 border-[#FF3B30] pl-2 py-0.5">
                <span className="text-white block font-bold uppercase">1. CLEAR CAP & PUMP</span>
                <span className="text-neutral-500 text-[8px]">Sealed pharmaceutical distribution hygiene</span>
              </div>
              <div className="border-l-2 border-[#FF3B30] pl-2 py-0.5">
                <span className="text-white block font-bold uppercase">2. MACADAMIA ILLUSTRATION</span>
                <span className="text-neutral-500 text-[8px]">Minimalist scientific outline design</span>
              </div>
              <div className="border-l-2 border-[#FF3B30] pl-2 py-0.5">
                <span className="text-white block font-bold uppercase">3. WHITE OPAQUE BOTTLE</span>
                <span className="text-neutral-500 text-[8px]">Blocks light degradation of active compounds</span>
              </div>
            </div>
          </motion.div>
        )}

        {/* TAB 3: CLINICAL TELEMETRY BEFORE/AFTER */}
        {activeTab === 'clinical' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full h-full flex flex-col justify-between"
          >
            {/* Before After simulated Slider */}
            <div className="flex-1 flex gap-3 items-center">
              {/* Simulator view */}
              <div className="w-1/2 h-full border border-neutral-900 bg-neutral-950 relative overflow-hidden flex items-center justify-center">
                <div className="absolute inset-0 flex">
                  {/* Before state (Redness, dullness representation) */}
                  <div className="w-full h-full bg-red-950/20 flex flex-col items-center justify-center p-2 relative" style={{ opacity: (100 - sliderVal) / 100 }}>
                    <div className="text-[8px] text-red-500 font-bold uppercase absolute top-1 left-1">BEFORE PROTOCOL</div>
                    <div className="w-12 h-12 rounded-full border border-red-900/40 bg-red-900/10 flex items-center justify-center animate-pulse">
                      <span className="text-[6px] text-red-400 text-center uppercase">CONGESTION<br/>& REDNESS</span>
                    </div>
                  </div>
                </div>

                <div className="absolute inset-0 flex">
                  {/* After state (Clean, radiant representation) */}
                  <div className="w-full h-full bg-neutral-900/80 flex flex-col items-center justify-center p-2 absolute inset-0" style={{ opacity: sliderVal / 100 }}>
                    <div className="text-[8px] text-green-500 font-bold uppercase absolute top-1 left-1">AFTER (2 WEEKS)</div>
                    <div className="w-12 h-12 rounded-full border border-green-900/40 bg-green-950/20 flex items-center justify-center">
                      <span className="text-[6px] text-green-400 text-center uppercase">RADIANT<br/>BARRIER</span>
                    </div>
                  </div>
                </div>

                {/* Drag label */}
                <div className="absolute bottom-1 right-2 text-[6px] text-neutral-600 font-mono uppercase">
                  SIMULATION SLIDER
                </div>
              </div>

              {/* Slider controls & stats */}
              <div className="flex-1 flex flex-col justify-between py-1.5">
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center text-[8px] md:text-[9px]">
                    <span className="text-neutral-500 uppercase">RECOVERY TELEMETRY</span>
                    <span className="text-white font-bold">{sliderVal}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={sliderVal}
                    onChange={(e) => setSliderVal(Number(e.target.value))}
                    className="w-full h-1 bg-neutral-900 rounded-none appearance-none cursor-pointer accent-[#FF3B30] outline-none"
                  />
                </div>

                <div className="grid grid-cols-3 gap-1 pt-2 border-t border-neutral-900 mt-2">
                  <div className="text-center">
                    <span className="text-[9px] font-black text-white block">90%</span>
                    <span className="text-[6px] text-neutral-500 block uppercase leading-none">FRESH</span>
                  </div>
                  <div className="text-center border-x border-neutral-900">
                    <span className="text-[9px] font-black text-[#FF3B30] block">100%</span>
                    <span className="text-[6px] text-neutral-500 block uppercase leading-none">REDNESS⇩</span>
                  </div>
                  <div className="text-center">
                    <span className="text-[9px] font-black text-white block">87%</span>
                    <span className="text-[6px] text-neutral-500 block uppercase leading-none">TEXTURE</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Footer descriptor */}
      <div className="text-[8px] md:text-[9px] text-neutral-500 border-t border-neutral-900/60 pt-1.5 flex justify-between items-center">
        <span>WWW.VELLUXIA.COM SOCIAL MEDIA SYSTEM</span>
        <span className="text-[#FF3B30] font-bold">STABILITY_LINK: SECURED</span>
      </div>
    </div>
  );
}
