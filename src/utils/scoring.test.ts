import { frequencyToMidi, midiToNoteName, calculateVideokeScore } from './scoring';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
}

console.log('--- Testing PinoyVideoke Scoring Engine ---');

// 1. Test MIDI note conversions
assert(frequencyToMidi(440) === 69, '440 Hz must be MIDI 69 (Concert A)');
assert(frequencyToMidi(261.63) === 60, '261.63 Hz must be MIDI 60 (Middle C)');
assert(midiToNoteName(69) === 'A4', 'MIDI 69 must map to A4');
assert(midiToNoteName(60) === 'C4', 'MIDI 60 must map to C4');
console.log('✓ Pitch and MIDI conversion tests passed.');

// 2. Test Minimal / Silent Singing
const silentSamples: number[] = new Array(500).fill(0);
const silentScore = calculateVideokeScore(silentSamples, 120);
assert(silentScore.score >= 60 && silentScore.score <= 75, 'Silent singing should be below 75');
assert(silentScore.tier === 'gong', 'Silent singing should trigger gong tier');
console.log(`✓ Silent score test passed: ${silentScore.score} (${silentScore.commentary})`);

// 3. Test Active Steady Singing
// Simulate sustained C4 (261Hz) and G4 (392Hz) for 2000 samples
const goodSingingSamples: number[] = [];
for (let i = 0; i < 2500; i++) {
  // Alternate between sustained notes
  const freq = i < 1250 ? 261.63 + (Math.random() * 2 - 1) : 392.0 + (Math.random() * 2 - 1);
  goodSingingSamples.push(freq);
}

const goodScore = calculateVideokeScore(goodSingingSamples, 120);
assert(goodScore.score >= 88, 'Steady active singing should score at least 88');
assert(
  goodScore.tier === 'concert' || goodScore.tier === 'champion',
  'Should be concert or champion tier'
);
console.log(`✓ High-performance score test passed: ${goodScore.score} (${goodScore.commentary})`);

// 4. Test Score Boundaries
for (let trial = 0; trial < 20; trial++) {
  const randomSamples = Array.from({ length: 1000 }, () =>
    Math.random() > 0.5 ? 100 + Math.random() * 500 : 0
  );
  const result = calculateVideokeScore(randomSamples, 60);
  assert(
    result.score >= 60 && result.score <= 100,
    'Score must be clamped strictly within [60, 100]'
  );
}
console.log('✓ Score boundary clamps verified across randomized trials.');

console.log('All Videoke Scoring tests PASSED successfully! 🏆');
