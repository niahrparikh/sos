import { useEffect, useRef, useState } from 'react';

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
      id={id || `stat-${target}`}
      ref={elementRef}
      className="bg-[#0A0A0A] border-l-4 border-[#FF3B30] p-5 hover:bg-neutral-900 transition-all select-none text-left"
    >
      <div className="font-mono text-3xl md:text-4xl font-black text-white tracking-tight mb-1">
        {count}
        {suffix}
      </div>
      <div className="font-mono text-[9px] text-[#FF3B30] uppercase tracking-[0.15em] font-bold">
        {label}
      </div>
    </div>
  );
}
