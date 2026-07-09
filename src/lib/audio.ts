/**
 * Interactive Web Audio Synthesizer for SOS Agency
 * Programmatically generates high-fidelity retro & tactical sound effects
 * requiring zero audio assets to load.
 */

// Safe global reference for reuse to prevent garbage collection hiccups
let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return null;
    
    if (!audioCtx) {
      audioCtx = new AudioContextClass();
    }
    
    // Resume context if suspended (browser security autoplays)
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    return audioCtx;
  } catch (error) {
    console.warn('Web Audio API not supported or blocked:', error);
    return null;
  }
}

/**
 * Standard tactical mechanical click / blip sound
 */
export function playClickSound() {
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    osc.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    // Quick transient pitch sweep (mechanical feel)
    osc.type = 'sine';
    const now = ctx.currentTime;
    
    osc.frequency.setValueAtTime(1400, now);
    osc.frequency.exponentialRampToValueAtTime(400, now + 0.06);
    
    // Snappy envelope
    gainNode.gain.setValueAtTime(0.04, now);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.06);
    
    osc.start(now);
    osc.stop(now + 0.07);
  } catch (err) {
    // Fail silently to prevent interrupting user actions
  }
}

/**
 * Higher pitched keystroke/tap sound for keyboard / chips
 */
export function playTapSound() {
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    osc.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    osc.type = 'triangle';
    const now = ctx.currentTime;
    
    osc.frequency.setValueAtTime(1800, now);
    osc.frequency.exponentialRampToValueAtTime(800, now + 0.03);
    
    gainNode.gain.setValueAtTime(0.02, now);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.03);
    
    osc.start(now);
    osc.stop(now + 0.04);
  } catch (err) {}
}

/**
 * Upward arpeggio chime for successful transmissions & system boots
 */
export function playSuccessSound() {
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const now = ctx.currentTime;
    const playNote = (freq: number, startDelay: number, duration: number, volume: number) => {
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      osc.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + startDelay);
      
      gainNode.gain.setValueAtTime(volume, now + startDelay);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + startDelay + duration);
      
      osc.start(now + startDelay);
      osc.stop(now + startDelay + duration + 0.01);
    };

    // Staggered three-tone chord: C6 -> E6 -> G6 (optimistic & tactical)
    playNote(1046.50, 0.0, 0.15, 0.03);
    playNote(1318.51, 0.06, 0.18, 0.03);
    playNote(1567.98, 0.12, 0.25, 0.04);
  } catch (err) {}
}

/**
 * Gentle alert warning sound (retro buzzer/chirp)
 */
export function playWarningSound() {
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    osc.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    osc.type = 'sawtooth';
    const now = ctx.currentTime;
    
    osc.frequency.setValueAtTime(180, now);
    osc.frequency.linearRampToValueAtTime(120, now + 0.15);
    
    gainNode.gain.setValueAtTime(0.02, now);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
    
    osc.start(now);
    osc.stop(now + 0.16);
  } catch (err) {}
}
