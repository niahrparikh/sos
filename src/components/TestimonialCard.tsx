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
  return (
    <motion.div
      id={id || `testimonial-card-${testimonial.id}`}
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="bg-[#0A0A0A] border-l-4 border-[#FF3B30] border-r border-t border-b border-neutral-900 p-6 rounded-none relative flex flex-col justify-between group hover:border-[#FF3B30] transition-all shadow-[0_10px_35px_rgba(0,0,0,0.6)] select-none"
    >
      {/* Decorative quote icon */}
      <div className="absolute right-6 top-6 text-neutral-900 group-hover:text-[#FF3B30]/5 transition-colors z-0">
        <Quote size={40} strokeWidth={2} />
      </div>

      <div className="relative z-10">
        {/* Quote body */}
        <p className="font-mono text-xs md:text-sm text-neutral-200 leading-relaxed italic mb-6">
          "{testimonial.quote}"
        </p>
      </div>

      {/* Signature attribution line */}
      <div className="border-t border-neutral-900 pt-4 mt-auto select-none">
        <div className="font-mono text-sm font-black text-white group-hover:text-[#FF3B30] uppercase italic tracking-wider transition-colors">
          {testimonial.client}
        </div>
        <div className="font-mono text-[9px] text-[#FF3B30] uppercase tracking-widest mt-0.5 font-bold">
          {testimonial.role}
        </div>
      </div>
    </motion.div>
  );
}
