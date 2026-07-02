import { motion } from 'motion/react';

interface Step {
  timestamp: string;
  title: string;
  description: string;
}

const PROCESS_STEPS: Step[] = [
  {
    timestamp: '[00:01]',
    title: 'RECEIVE SIGNAL',
    description: 'We process your emergency ticket. Immediate diagnostics are run on your current brand architecture, market share, and system fatigue.'
  },
  {
    timestamp: '[00:12]',
    title: 'TRIAGE',
    description: 'A dedicated team of senior creatives identifies the critical failure points. We scrap generic strategies and structure a custom combat sprint.'
  },
  {
    timestamp: '[00:48]',
    title: 'DEPLOY',
    description: 'We build. Identity, narrative, vectors, digital design, or positioning are shipped under high pressure. Full launch systems come alive.'
  },
  {
    timestamp: '[01:24]',
    title: 'RESOLVED',
    description: 'Your brand returns to active duty, slicing through competitor noise. High conversions, unified team culture, and stable operations.'
  }
];

export default function ProcessStep() {
  return (
    <div className="relative w-full max-w-6xl mx-auto px-4 select-none">
      {/* Line connecting the steps (desktop only) */}
      <div className="absolute top-[34px] left-[10%] right-[10%] h-0.5 bg-neutral-900 hidden lg:block z-0">
        <div className="h-full bg-gradient-to-r from-[#FF3B30] via-red-600 to-green-600 w-3/4" />
      </div>

      {/* Grid of Steps */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 md:gap-12 lg:gap-6 relative z-10">
        {PROCESS_STEPS.map((step, index) => (
          <motion.div
            key={step.title}
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.4, delay: index * 0.15 }}
            className="flex flex-col items-center lg:items-start text-center lg:text-left group relative"
          >
            {/* Blinking Beacon / Icon Circle */}
            <div className="relative mb-5 flex items-center justify-center">
              <div className="w-12 h-12 bg-[#0A0A0A] border-2 border-neutral-800 rounded-none flex items-center justify-center group-hover:border-[#FF3B30] transition-colors shadow-lg">
                <span className="font-mono text-xs font-extrabold text-[#FF3B30]">{index + 1}</span>
              </div>
              {/* Blinking signal dot */}
              <span className="absolute -top-1 -right-1 flex h-2 w-2">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${index === 3 ? 'bg-green-400' : 'bg-red-400'} opacity-75`}></span>
                <span className={`relative inline-flex rounded-full h-2 w-2 ${index === 3 ? 'bg-green-500' : 'bg-red-500'}`}></span>
              </span>
            </div>

            {/* Title & Timestamp */}
            <div className="mb-2">
              <span className="font-mono text-xs font-bold text-neutral-500 block mb-1">
                {step.timestamp}
              </span>
              <h4 className="font-mono text-sm md:text-base font-extrabold text-white tracking-widest group-hover:text-[#FF3B30] transition-colors">
                {step.title}
              </h4>
            </div>

            {/* Description */}
            <p className="font-mono text-xs sm:text-sm text-neutral-300 leading-relaxed max-w-xs lg:max-w-none mt-1">
              {step.description}
            </p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
