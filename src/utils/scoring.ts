/**
 * Authentic Filipino Videoke 100-Point Scoring Engine
 * Calibrated for party fun with genuine pitch stability analysis and classic OPM commentary
 */

export type ScoreTier = 'champion' | 'concert' | 'practice' | 'gong';

export interface VideokeScoreResult {
  score: number;
  tier: ScoreTier;
  commentary: string;
  subtext: string;
  stats: {
    totalSamples: number;
    activeSamples: number;
    singingRatio: number;
    pitchStability: number;
  };
}

export const NOTE_NAMES = [
  'C',
  'C#',
  'D',
  'D#',
  'E',
  'F',
  'F#',
  'G',
  'G#',
  'A',
  'A#',
  'B',
] as const;

/**
 * Convert fundamental frequency (Hz) to standard MIDI note number
 */
export function frequencyToMidi(freqHz: number): number {
  if (freqHz <= 0) return 0;
  return Math.round(69 + 12 * Math.log2(freqHz / 440));
}

/**
 * Convert MIDI note number to human-readable musical note name (e.g. 60 -> C4, 69 -> A4)
 */
export function midiToNoteName(midiNote: number): string {
  if (midiNote <= 0) return '---';
  const noteIndex = ((midiNote % 12) + 12) % 12;
  const octave = Math.floor(midiNote / 12) - 1;
  return `${NOTE_NAMES[noteIndex]}${octave}`;
}

/**
 * Calculate the authentic 100-point Videoke Score from captured pitch samples
 *
 * @param pitchSamples Array of detected fundamental frequencies in Hz (or null/0 when silent)
 * @param estimatedSongSeconds Expected duration of the performance in seconds
 */
export function calculateVideokeScore(
  pitchSamples: number[],
  estimatedSongSeconds = 180
): VideokeScoreResult {
  const totalSamples = pitchSamples.length;

  // Filter vocal range (Human singing range: ~70Hz (C#2) to ~1100Hz (C6))
  const validPitches = pitchSamples.filter((p) => typeof p === 'number' && p >= 70 && p <= 1100);
  const activeSamples = validPitches.length;

  // Expected samples assuming ~30-40 samples/sec
  const expectedSamples = Math.max(100, estimatedSongSeconds * 30);
  const singingRatio = Math.min(1.0, activeSamples / (expectedSamples * 0.45)); // ~45% of song has vocals

  // Calculate pitch stability (standard deviation of consecutive pitch jumps)
  let stabilityBonus = 0;
  if (validPitches.length > 10) {
    let steadyTransitions = 0;
    for (let i = 1; i < validPitches.length; i++) {
      const prevMidi = frequencyToMidi(validPitches[i - 1]);
      const currMidi = frequencyToMidi(validPitches[i]);
      // If consecutive notes are within 2 semitones or a clean musical interval
      if (Math.abs(currMidi - prevMidi) <= 2) {
        steadyTransitions++;
      }
    }
    const stabilityRatio = steadyTransitions / (validPitches.length - 1);
    stabilityBonus = Math.round(stabilityRatio * 16);
  }

  // Authentic Videoke base calculation
  let rawScore = 70; // Generous baseline for stepping up to the mic

  if (activeSamples > 15) {
    // Activity points: up to 16 points based on sustained singing effort
    const activityPoints = Math.round(singingRatio * 16);

    // Dynamic party variance (±2 points to keep guests on edge)
    const partyVariance = Math.floor(Math.random() * 5) - 2;

    rawScore = 70 + activityPoints + stabilityBonus + partyVariance;
  } else {
    // Minimal or no singing detected: 65 - 72 points
    rawScore = 65 + Math.floor(Math.random() * 8);
  }

  // Clamp strictly between 60 and 100
  const finalScore = Math.max(60, Math.min(100, Math.round(rawScore)));

  // Determine Tier and Authentic Pinoy Commentary
  let tier: ScoreTier;
  let commentary: string;
  let subtext: string;

  if (finalScore >= 98) {
    tier = 'champion';
    commentary = 'CHAMPION KA! TAWAG NG TANGHALAN NA YAN! 🏆';
    subtext = 'Wala nang makakapigil sa birit mo! Boses pang-Grand Finals!';
  } else if (finalScore >= 90) {
    tier = 'concert';
    commentary = 'PANG-CONCERT! PWEDE NANG MAG-ARANETA! 🎤';
    subtext = 'Grabe ang boses! Standing ovation ang buong barangay!';
  } else if (finalScore >= 80) {
    tier = 'practice';
    commentary = 'PWEDE NA! PERO PRACTICE PA SA BANYO! 👍';
    subtext = 'May ibubuga ka naman, kailangan lang ng konting warm-up!';
  } else {
    tier = 'gong';
    commentary = 'UWI KA NA, GONG KA NA! 🔔';
    subtext = 'Sintunado pero punong-puno ng emosyon! Inom muna ng tubig!';
  }

  return {
    score: finalScore,
    tier,
    commentary,
    subtext,
    stats: {
      totalSamples,
      activeSamples,
      singingRatio: Math.round(singingRatio * 100) / 100,
      pitchStability: Math.round((stabilityBonus / 16) * 100) / 100,
    },
  };
}
