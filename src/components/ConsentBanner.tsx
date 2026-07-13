import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldCheck, Cookie, X } from 'lucide-react';
import { playSuccessSound, playClickSound } from '../lib/audio';

export default function ConsentBanner() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if consent has already been granted or denied in this/prior sessions
    const consentChoice = localStorage.getItem('consentGranted');
    if (!consentChoice) {
      // Delay slightly to allow the app to load elegantly
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleGrantConsent = () => {
    playSuccessSound();
    localStorage.setItem('consentGranted', 'true');
    
    // Dynamically update gtag consent
    if (typeof window !== 'undefined' && (window as any).gtag) {
      try {
        (window as any).gtag('consent', 'update', {
          'ad_user_data': 'granted',
          'ad_personalization': 'granted',
          'ad_storage': 'granted',
          'analytics_storage': 'granted'
        });
      } catch (err) {
        console.error('Failed to update consent tags:', err);
      }
    }
    setIsVisible(false);
  };

  const handleDeclineConsent = () => {
    playClickSound();
    localStorage.setItem('consentGranted', 'false');
    // Keep it denied as configured by default in index.html
    setIsVisible(false);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 100, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 100, scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          className="fixed bottom-6 left-6 right-6 md:left-auto md:right-6 md:max-w-md z-50 group/consent"
        >
          {/* Forza-style sliding pink box behind the banner */}
          <div className="absolute inset-0 bg-[#E8368F] rounded-lg translate-x-2 translate-y-2 group-hover/consent:translate-x-3.5 group-hover/consent:translate-y-3.5 transition-transform duration-300 ease-out pointer-events-none z-0 shadow-[0_10px_30px_rgba(232,54,143,0.3)]" />

          {/* Actual content box with dark green background and white text */}
          <div className="relative bg-[#001c17] border border-[#0E6B58] rounded-lg p-5 md:p-6 shadow-2xl flex flex-col gap-4 group-hover/consent:-translate-x-0.5 group-hover/consent:-translate-y-0.5 transition-transform duration-300 ease-out z-10 text-[#F5F5F0]">
            
            {/* Header */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 bg-[#D4F000]/10 border border-[#D4F000]/30 rounded text-[#D4F000] animate-pulse">
                  <Cookie size={18} />
                </div>
                <h3 className="font-sans font-extrabold text-xs sm:text-sm uppercase tracking-wider text-[#F5F5F0]">
                  COOKIE & TELEMETRY PROTOCOL
                </h3>
              </div>
              <button
                onClick={handleDeclineConsent}
                className="text-neutral-400 hover:text-white transition-colors cursor-pointer"
                title="Dismiss"
              >
                <X size={16} />
              </button>
            </div>

            {/* Description */}
            <p className="font-sans text-xs text-neutral-300 leading-relaxed font-medium">
              We utilize cookies and advanced Google Analytics / Tag Manager services to diagnose critical brand health parameters and measure traffic telemetry under high-stress scenarios.
            </p>

            {/* Action buttons */}
            <div className="flex items-center gap-3 mt-1">
              {/* Accept / Grant Button */}
              <button
                id="grantButton"
                onClick={handleGrantConsent}
                className="flex-1 relative group/btn px-4 py-2.5 font-sans text-xs uppercase tracking-wider font-extrabold transition-all duration-300 bg-[#D4F000] text-[#111111] hover:bg-[#E8368F] hover:text-white rounded-[4px] shadow-[0_4px_12px_rgba(212,240,0,0.15)] active:scale-95 cursor-pointer flex items-center justify-center gap-2"
              >
                <ShieldCheck size={14} className="shrink-0" />
                GRANT CONSENT
              </button>

              {/* Decline button */}
              <button
                onClick={handleDeclineConsent}
                className="px-4 py-2.5 font-sans text-xs uppercase tracking-wider font-extrabold transition-all duration-300 bg-[#0A4A3D]/30 border border-[#0E6B58]/45 text-neutral-300 hover:text-white hover:bg-[#0A4A3D]/60 rounded-[4px] cursor-pointer"
              >
                DECLINE
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
