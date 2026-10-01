/**
 * Web Audio procedural synthesizer for authentic Philippine Videoke party sound effects.
 * Synthesizes sound directly in browser without relying on external MP3 assets.
 */

// Shared AudioContext instance (lazily initialized on first user interaction)
let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioCtx) {
      audioCtx = new AudioCtx();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

/**
 * 📢 AIRHORN: Iconic reggae party siren blast
 */
export function playAirhorn() {
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const masterGain = ctx.createGain();
  masterGain.gain.setValueAtTime(0.45, now);
  masterGain.gain.linearRampToValueAtTime(0.01, now + 0.65);
  masterGain.connect(ctx.destination);

  // Triple-tone chord: Eb4, F#4, Bb4 (dissonant dancehall blast)
  const freqs = [311.13, 369.99, 466.16];
  freqs.forEach((baseFreq) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sawtooth';
    // Slight initial pitch jump then quick slide
    osc.frequency.setValueAtTime(baseFreq * 0.96, now);
    osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.04, now + 0.08);
    osc.frequency.setValueAtTime(baseFreq, now + 0.12);

    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.65);

    osc.connect(gain);
    gain.connect(masterGain);

    osc.start(now);
    osc.stop(now + 0.65);
  });
}

/**
 * 👏 APPLAUSE: Crowd cheers & rhythmic clapping bursts
 */
export function playApplause() {
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const duration = 1.8;

  // Generate white noise buffer
  const bufferSize = ctx.sampleRate * duration;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = Math.random() * 2 - 1;
  }

  const noise = ctx.createBufferSource();
  noise.buffer = buffer;

  // Bandpass filter to sound like hands clapping
  const filter = ctx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.setValueAtTime(1400, now);
  filter.Q.setValueAtTime(1.8, now);

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.05, now);
  // Swell up then gradual fade
  gain.gain.linearRampToValueAtTime(0.4, now + 0.3);
  gain.gain.exponentialRampToValueAtTime(0.01, now + duration);

  noise.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);

  noise.start(now);
  noise.stop(now + duration);
}

/**
 * 🥁 DRUMROLL: Dramatic tension snare roll into cymbal crash
 */
export function playDrumroll() {
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const rollDuration = 1.2;

  // Series of rapid snare taps
  const tapCount = 28;
  for (let i = 0; i < tapCount; i++) {
    const tapTime = now + (i / tapCount) * rollDuration;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(180, tapTime);

    // Crescendo volume
    const volume = 0.05 + (i / tapCount) * 0.25;
    gain.gain.setValueAtTime(volume, tapTime);
    gain.gain.exponentialRampToValueAtTime(0.001, tapTime + 0.04);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(tapTime);
    osc.stop(tapTime + 0.04);
  }

  // Crash cymbal at the climax (t = now + rollDuration)
  const crashTime = now + rollDuration;
  const crashLength = 0.8;
  const bufferSize = ctx.sampleRate * crashLength;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = Math.random() * 2 - 1;
  }

  const crashSource = ctx.createBufferSource();
  crashSource.buffer = buffer;

  const highpass = ctx.createBiquadFilter();
  highpass.type = 'highpass';
  highpass.frequency.setValueAtTime(4500, crashTime);

  const crashGain = ctx.createGain();
  crashGain.gain.setValueAtTime(0.45, crashTime);
  crashGain.gain.exponentialRampToValueAtTime(0.01, crashTime + crashLength);

  crashSource.connect(highpass);
  highpass.connect(crashGain);
  crashGain.connect(ctx.destination);

  crashSource.start(crashTime);
  crashSource.stop(crashTime + crashLength);
}

/**
 * 🔔 GONG: Dramatic Tawag ng Tanghalan comedic fail gong
 */
export function playGong() {
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const duration = 2.4;

  const masterGain = ctx.createGain();
  masterGain.gain.setValueAtTime(0.6, now);
  masterGain.gain.exponentialRampToValueAtTime(0.001, now + duration);
  masterGain.connect(ctx.destination);

  // Inharmonic metallic frequencies typical of a heavy bronze gong
  const gongFreqs = [120, 194, 276, 388, 510, 680];
  gongFreqs.forEach((freq, idx) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = idx % 2 === 0 ? 'sine' : 'triangle';
    osc.frequency.setValueAtTime(freq, now);

    const relativeVol = 0.3 / (idx + 1);
    gain.gain.setValueAtTime(relativeVol, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    osc.connect(gain);
    gain.connect(masterGain);

    osc.start(now);
    osc.stop(now + duration);
  });
}

/**
 * Trigger sound by string identifier
 */
export function playSoundEffect(type: 'airhorn' | 'applause' | 'drumroll' | 'gong' | string) {
  switch (type.toLowerCase()) {
    case 'airhorn':
      playAirhorn();
      break;
    case 'applause':
    case 'cheer':
      playApplause();
      break;
    case 'drumroll':
      playDrumroll();
      break;
    case 'gong':
    case 'jeer':
      playGong();
      break;
    default:
      playAirhorn();
      break;
  }
}
