import { motion } from 'motion/react';

interface LogoMarqueeProps {
  id?: string;
}

const BRAND_LOGOS = [
  { name: 'BEING_BEYOND', text: '❀ BEING BEYOND CO' },
  { name: 'GUJARAT_PANTHERS', text: '⚡ GUJARAT PANTHERS' },
  { name: 'VELLUXIA', text: '✴ VELLUXIA' },
  { name: 'APEX_FIN', text: 'APEX // CAPITAL' },
  { name: 'SOLAS_MED', text: '⚡ SOLAS.TX' },
  { name: 'HYPERION', text: 'HYPERION_LABS' },
  { name: 'VAPOR_SYS', text: '[VAPOR.WEAR]' },
  { name: 'ANARCHY', text: '▲ ANARCHY_CO' },
  { name: 'CYBER_SEC', text: '█ CYBER.OPS' },
  { name: 'ECLIPSE', text: 'ECLIPSE_MEDIA' },
  { name: 'KRONOS', text: '⧖ KRONOS_TECH' }
];

export default function LogoMarquee({ id }: LogoMarqueeProps) {
  // Duplicate array for seamless looping
  const doubledLogos = [...BRAND_LOGOS, ...BRAND_LOGOS, ...BRAND_LOGOS];

  return (
    <div
      id={id || 'logo-marquee-container'}
      className="relative w-full overflow-hidden bg-[#0A0A0A] py-6 border-y border-neutral-900 select-none group"
    >
      {/* Gradients on edge for fade effect */}
      <div className="absolute left-0 top-0 bottom-0 w-20 md:w-36 bg-gradient-to-r from-[#0A0A0A] to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-20 md:w-36 bg-gradient-to-l from-[#0A0A0A] to-transparent z-10 pointer-events-none" />

      {/* Scrolling container */}
      <div className="flex w-max relative overflow-hidden">
        <motion.div
          animate={{ x: [0, -1000] }}
          transition={{
            ease: "linear",
            duration: 35,
            repeat: Infinity
          }}
          className="flex gap-16 md:gap-24 items-center"
        >
          {doubledLogos.map((logo, index) => (
            <div
              key={`${logo.name}-${index}`}
              className="flex items-center gap-3 hover:text-[#D4F000] transition-colors cursor-pointer text-neutral-400 font-sans text-sm md:text-base font-extrabold tracking-wider uppercase shrink-0"
            >
              <span className="text-[#E8368F] text-xs">◆</span>
              <span>{logo.text}</span>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
