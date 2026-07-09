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
  // Rotating left border colors: pink, lime, teal
  const borderColors = ['border-[#E8368F]', 'border-[#D4F000]', 'border-[#0E6B58]'];
  const leftBorderColor = borderColors[index % 3];

  // Alternating background colors: Cream (#F5F5F0), White (#FFFFFF)
  const bgColors = ['bg-[#F5F5F0]', 'bg-white'];
  const cardBg = bgColors[index % 2];

  // Accent text colors based on the left border to tie visual systems together
  const accentTextColors = ['text-[#E8368F]', 'text-[#0E6B58]', 'text-[#0E6B58]'];
  const accentText = accentTextColors[index % 3];

  return (
    <motion.div
      id={id || `case-card-${caseFile.id}`}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className={`${cardBg} border-l-4 ${leftBorderColor} border-r border-t border-b border-neutral-200/60 p-6 rounded-[6px] flex flex-col justify-between hover:shadow-lg transition-all group select-none`}
    >
      <div>
        {/* Case File Badge */}
        <div className="flex items-center justify-between mb-4">
          <span className="font-mono text-[10px] font-bold text-[#0A4A3D] tracking-widest uppercase bg-[#0A4A3D]/5 border border-[#0A4A3D]/20 px-2 py-0.5 rounded-[4px]">
            {caseFile.number}
          </span>
          <span className="font-mono text-[10px] text-neutral-500 tracking-wider">
            STATUS: SECURED
          </span>
        </div>

        {/* Client */}
        <div className="mb-4">
          <label className="font-sans text-[10px] uppercase text-[#0E6B58] block tracking-widest font-extrabold mb-1">CLIENT SYSTEM</label>
          <span className="font-sans text-xl font-extrabold text-[#111111] group-hover:text-[#0E6B58] uppercase tracking-tight transition-colors">
            {caseFile.client}
          </span>
        </div>

        {/* Incident description */}
        <div className="mb-5">
          <label className="font-sans text-[10px] uppercase text-neutral-500 block tracking-widest font-extrabold mb-1">INCIDENT SUMMARY</label>
          <p className="font-sans text-xs sm:text-sm text-[#111111]/90 leading-relaxed font-medium">
            {caseFile.incident}
          </p>
        </div>

        {/* Response Time */}
        <div className="mb-5 flex items-center justify-between">
          <div>
            <label className="font-sans text-[10px] uppercase text-neutral-500 block tracking-widest font-extrabold">RESPONSE TIME</label>
            <span className="font-mono text-sm text-[#0E6B58] font-bold">
              ⚡ {caseFile.responseTime}
            </span>
          </div>
          <div className="text-right">
            <label className="font-sans text-[10px] uppercase text-neutral-500 block tracking-widest font-extrabold">RESOLUTION</label>
            <span className="font-sans text-xs sm:text-sm text-green-700 font-bold">
              STABLE
            </span>
          </div>
        </div>
      </div>

      <div>
        {/* Outcome & Progress Bar */}
        <div className="mb-5 bg-neutral-100/70 p-4 rounded-[4px] border border-neutral-200/50">
          <div className="flex justify-between items-center mb-1.5 select-none">
            <span className="font-sans text-[10px] text-neutral-500 font-bold tracking-wider">BRAND RECONSTRUCTION STRENGTH</span>
            <span className="font-mono text-sm text-[#0E6B58] font-bold">{caseFile.outcome}%</span>
          </div>
          {/* Bar */}
          <div className="w-full bg-neutral-200 h-1.5 rounded-none overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              whileInView={{ width: `${caseFile.outcome}%` }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="bg-[#0E6B58] h-full"
            />
          </div>
          <p className="font-sans text-xs text-neutral-600 font-medium mt-2.5 leading-relaxed">
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
          className="inline-flex items-center gap-1.5 font-sans text-xs text-[#0A4A3D] hover:text-[#E8368F] font-extrabold uppercase tracking-wider transition-colors mt-1 cursor-pointer bg-transparent border-none p-0"
        >
          <span>[VIEW FULL CASE FILE →]</span>
        </button>
      </div>
    </motion.div>
  );
}

