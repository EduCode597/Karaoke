/**
 * Web Audio Sound Effects Synthesizer for PinoyVideoke
 * Authentic 90s Videoke Fanfare, Gongs, Ticks, and Crowds using Web Audio Oscillators
 */

function getAudioContext(): AudioContext | null {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    return new AudioCtx();
  } catch {
    return null;
  }
}

/**
 * Play a fast digital click tone for rolling score counters
 */
export function playScoreTick() {
  const ctx = getAudioContext();
  if (!ctx) return;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'triangle';
  osc.frequency.setValueAtTime(880, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.03);

  gain.gain.setValueAtTime(0.08, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.03);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start();
  osc.stop(ctx.currentTime + 0.03);
}

/**
 * Play Grand Brass Fanfare for high videoke scores (90 - 100)
 */
export function playTrumpetFanfare() {
  const ctx = getAudioContext();
  if (!ctx) return;

  // Notes: C4 (261.63), E4 (329.63), G4 (392.0), C5 (523.25)
  const notes = [
    { freq: 261.63, start: 0.0, dur: 0.18 },
    { freq: 329.63, start: 0.18, dur: 0.18 },
    { freq: 392.0, start: 0.36, dur: 0.22 },
    { freq: 523.25, start: 0.58, dur: 0.8 },
  ];

  notes.forEach(({ freq, start, dur }) => {
    // Sawtooth + square for brassy trumpet timbre
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();

    osc1.type = 'sawtooth';
    osc1.frequency.setValueAtTime(freq, ctx.currentTime + start);

    osc2.type = 'square';
    osc2.frequency.setValueAtTime(freq * 1.002, ctx.currentTime + start); // slight chorus detune

    gain.gain.setValueAtTime(0, ctx.currentTime + start);
    gain.gain.linearRampToValueAtTime(0.18, ctx.currentTime + start + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + start + dur);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(ctx.destination);

    osc1.start(ctx.currentTime + start);
    osc2.start(ctx.currentTime + start);
    osc1.stop(ctx.currentTime + start + dur);
    osc2.stop(ctx.currentTime + start + dur);
  });
}

/**
 * Play classic metallic Videoke Gong for scores < 80 ("Uwi ka na!")
 */
export function playVideokeGong() {
  const ctx = getAudioContext();
  if (!ctx) return;

  const baseFreq = 110; // Low A
  const harmonics = [1.0, 1.414, 1.732, 2.3, 3.1]; // Inharmonic bell ratios

  harmonics.forEach((mult, index) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = index % 2 === 0 ? 'sine' : 'triangle';
    osc.frequency.setValueAtTime(baseFreq * mult, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(baseFreq * mult * 0.95, ctx.currentTime + 1.8);

    const initVol = 0.25 / (index + 1);
    gain.gain.setValueAtTime(initVol, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.8);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 1.8);
  });
}

/**
 * Play celebratory sound effect based on score tier
 */
export function playScoreFanfare(tier: 'champion' | 'concert' | 'practice' | 'gong') {
  if (tier === 'champion' || tier === 'concert') {
    playTrumpetFanfare();
  } else if (tier === 'gong') {
    playVideokeGong();
  } else {
    // Practice tier: mild cheerful 2-tone stinger
    const ctx = getAudioContext();
    if (!ctx) return;

    [392.0, 523.25].forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.2);
      gain.gain.setValueAtTime(0.15, ctx.currentTime + idx * 0.2);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.2 + 0.4);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime + idx * 0.2);
      osc.stop(ctx.currentTime + idx * 0.2 + 0.4);
    });
  }
}
