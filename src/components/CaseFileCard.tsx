import React from 'react';
import { CaseFile } from '../types';
import { motion } from 'motion/react';

interface CaseFileCardProps {
  key?: any;
  id?: string;
  caseFile: CaseFile;
  index: number;
  onViewDetails?: (caseId: string) => void;
}

export default function CaseFileCard({ id, caseFile, index, onViewDetails }: CaseFileCardProps) {
  return (
    <motion.div
      id={id || `case-card-${caseFile.id}`}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="bg-[#0A0A0A] border-l-4 border-[#FF3B30] border-r border-t border-b border-neutral-900 p-5 rounded-none flex flex-col justify-between hover:border-neutral-800 transition-all group hover:shadow-[0_4px_24px_rgba(255,59,48,0.05)] select-none"
    >
      <div>
        {/* Case File Badge */}
        <div className="flex items-center justify-between mb-4">
          <span className="font-mono text-[10px] font-bold text-[#FF3B30] tracking-widest uppercase bg-red-950/40 border border-red-900/60 px-2 py-0.5 rounded-none">
            {caseFile.number}
          </span>
          <span className="font-mono text-[10px] text-neutral-500 tracking-wider">
            STATUS: SECURED // RETRIEVED
          </span>
        </div>

        {/* Client */}
        <div className="mb-3">
          <label className="font-mono text-[9px] uppercase text-[#FF3B30] block tracking-widest font-bold">CLIENT SYSTEM</label>
          <span className="font-mono text-base font-black text-white group-hover:text-[#FF3B30] uppercase italic tracking-wider transition-colors">
            {caseFile.client}
          </span>
        </div>

        {/* Incident description */}
        <div className="mb-4">
          <label className="font-mono text-[10px] uppercase text-neutral-400 block tracking-widest font-bold">INCIDENT SUMMARY</label>
          <p className="font-mono text-xs sm:text-sm text-neutral-200 leading-relaxed mt-1.5">
            {caseFile.incident}
          </p>
        </div>

        {/* Response Time */}
        <div className="mb-4 flex items-center justify-between">
          <div>
            <label className="font-mono text-[10px] uppercase text-neutral-400 block tracking-widest font-bold">RESPONSE TIME</label>
            <span className="font-mono text-xs sm:text-sm text-[#FF3B30] font-bold">
              ⚡ {caseFile.responseTime}
            </span>
          </div>
          <div className="text-right">
            <label className="font-mono text-[10px] uppercase text-neutral-400 block tracking-widest font-bold">RESOLUTION</label>
            <span className="font-mono text-xs sm:text-sm text-green-500 font-bold">
              STABLE
            </span>
          </div>
        </div>
      </div>

      <div>
        {/* Outcome & Progress Bar */}
        <div className="mb-5 bg-neutral-950 p-3 rounded-none border border-neutral-900">
          <div className="flex justify-between items-center mb-1.5 select-none">
            <span className="font-mono text-[10px] text-neutral-400 tracking-wider">BRAND RECONSTRUCTION STRENGTH</span>
            <span className="font-mono text-sm text-[#FF3B30] font-bold">{caseFile.outcome}%</span>
          </div>
          {/* Bar */}
          <div className="w-full bg-neutral-900 h-1.5 rounded-none overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              whileInView={{ width: `${caseFile.outcome}%` }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="bg-[#FF3B30] h-full"
            />
          </div>
          <p className="font-mono text-xs sm:text-sm text-neutral-300 mt-2 leading-relaxed">
            {caseFile.outcomeText}
          </p>
        </div>

        {/* Button link */}
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            if (onViewDetails) {
              onViewDetails(caseFile.id);
            } else {
              // fallback
              const elem = document.getElementById('chat-section');
              elem?.scrollIntoView({ behavior: 'smooth' });
            }
          }}
          className="inline-flex items-center gap-1 font-mono text-xs text-white hover:text-[#FF3B30] font-bold uppercase tracking-wider transition-colors mt-1 cursor-pointer bg-transparent border-none p-0"
        >
          <span>[VIEW FULL CASE FILE →]</span>
        </button>
      </div>
    </motion.div>
  );
}
