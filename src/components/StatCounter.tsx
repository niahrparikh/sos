import { useEffect, useRef, useState } from 'react';
import { playTapSound } from '../lib/audio';

interface StatCounterProps {
  id?: string;
  target: number;
  suffix?: string;
  label: string;
}

export default function StatCounter({ id, target, suffix = '', label }: StatCounterProps) {
  const [count, setCount] = useState(0);
  const elementRef = useRef<HTMLDivElement>(null);
  const [hasStarted, setHasStarted] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting) {
          setHasStarted(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!hasStarted) return;

    let start = 0;
    const duration = 1500; // ms
    const stepTime = Math.max(Math.floor(duration / target), 15);
    
    const timer = setInterval(() => {
      start += Math.ceil(target / 40); // larger increments for high numbers
      if (start >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(start);
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, [hasStarted, target]);

  return (
    <div 
      className="relative group/stat select-none cursor-pointer"
      onClick={() => playTapSound()}
    >
      {/* Pink sliding underlay */}
      <div className="absolute inset-0 bg-[#E8368F] rounded-[4px] translate-x-1.5 translate-y-1.5 group-hover/stat:translate-x-2.5 group-hover/stat:translate-y-2.5 transition-transform duration-200 pointer-events-none z-0" />
      
      {/* Main card box */}
      <div
        id={id || `stat-${target}`}
        ref={elementRef}
        className="relative bg-[#0A4A3D] border border-[#0E6B58]/35 border-l-4 border-l-[#D4F000] p-6 hover:bg-[#0A4A3D]/80 group-hover/stat:-translate-x-0.5 group-hover/stat:-translate-y-0.5 transition-all duration-200 text-left z-10 rounded-[4px]"
      >
        <div className="font-sans text-3xl md:text-5xl font-black text-white tracking-tight mb-2.5 tabular-nums">
          {count}
          {suffix}
        </div>
        <div className="font-sans text-[10px] text-[#D4F000] uppercase tracking-wider font-extrabold">
          {label}
        </div>
      </div>
    </div>
  );
}

