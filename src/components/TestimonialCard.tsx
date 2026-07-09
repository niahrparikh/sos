import React from 'react';
import { Testimonial } from '../types';
import { motion } from 'motion/react';
import { Quote } from 'lucide-react';

interface TestimonialCardProps {
  key?: any;
  id?: string;
  testimonial: Testimonial;
  index: number;
}

export default function TestimonialCard({ id, testimonial, index }: TestimonialCardProps) {
  // Rotating left border colors: pink, lime, teal
  const borderColors = ['border-[#E8368F]', 'border-[#D4F000]', 'border-[#0E6B58]'];
  const leftBorderColor = borderColors[index % 3];

  // Alternating background colors: Cream (#F5F5F0), White (#FFFFFF)
  const bgColors = ['bg-[#F5F5F0]', 'bg-white'];
  const cardBg = bgColors[index % 2];

  return (
    <motion.div
      id={id || `testimonial-card-${testimonial.id}`}
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className={`${cardBg} border-l-4 ${leftBorderColor} border-r border-t border-b border-neutral-200/60 p-6 rounded-[6px] relative flex flex-col justify-between group hover:shadow-lg transition-all select-none`}
    >
      {/* Decorative quote icon */}
      <div className="absolute right-6 top-6 text-neutral-200/50 group-hover:text-[#E8368F]/5 transition-colors z-0">
        <Quote size={40} strokeWidth={2} />
      </div>

      <div className="relative z-10">
        {/* Quote body */}
        <p className="font-sans text-sm sm:text-base text-[#111111]/95 leading-relaxed italic font-medium mb-6">
          "{testimonial.quote}"
        </p>
      </div>

      {/* Signature attribution line */}
      <div className="border-t border-neutral-200/80 pt-4 mt-auto select-none">
        <div className="font-sans text-sm font-extrabold text-[#111111] group-hover:text-[#0E6B58] uppercase tracking-tight transition-colors">
          {testimonial.client}
        </div>
        <div className="font-mono text-[9px] text-[#E8368F] uppercase tracking-widest mt-0.5 font-bold">
          {testimonial.role}
        </div>
      </div>
    </motion.div>
  );
}

