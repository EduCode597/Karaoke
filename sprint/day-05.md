# Day 5: Web Audio API, YIN Pitch Detection & Scoring System
**Sprint:** 7-Day PinoyVideoke Implementation (Serverless Cloud Edition)  
**Phase:** Phase 4 – Pitch Detection & Scoring System  
**Focus:** Web Audio API, Microphone Input, YIN Pitch Algorithm, 100-Point Videoke Scoring & Fanfare SFX  
**Referenced Skills:** `frontend-developer`, `tdd`, `best-practices`, `andrej-karpathy-skill`

---

## 1. Day 5 Objectives & Architectural Goal
Day 5 implements the most iconic feature of Filipino videoke: **The Videoke Score & Fanfare**:
1. Capture real-time microphone audio using `navigator.mediaDevices.getUserMedia`.
2. Construct a **Web Audio processing graph** with an `AnalyserNode` without creating audio feedback loops.
3. Integrate the **YIN Pitch Detection algorithm** (`pitchfinder`) to extract fundamental frequencies ($F_0$) in Hz and map them to musical notes.
4. Build the authentic **100-Point Videoke Scoring Engine** that evaluates the singer upon song completion.
5. Create the dramatic fullscreen **Score Reveal Screen** with animated rolling scores, trumpet fanfare / applause, and broadcast the final score to guest mobile phones via Supabase Realtime.

---

## 2. In-Depth Learning Module: Web Audio & Signal Processing

### 2.1 The Web Audio API Architecture
The Web Audio API operates as a modular **Audio Graph**, where audio nodes connect like patch cables on an analog synthesizer:
```
Microphone (getUserMedia) 
     │
     ▼
[MediaStreamAudioSourceNode]
     │
     ▼
[AnalyserNode (fftSize=4096)] ──► [Float32Array Buffer] ──► YIN Pitch Algorithm
     │
     ❌ (DO NOT CONNECT TO audioContext.destination!)
```
- **CRITICAL SAFETY NOTE (Acoustic Feedback):**
  Never connect the microphone's `AnalyserNode` to `audioContext.destination` (the speakers)! If you do, the microphone will pick up its own amplified sound and cause a deafening, ear-piercing feedback screech. The `AnalyserNode` extracts data passively without outputting sound to the speakers.
- **Browser Audio Context Autoplay Policy:**
  Modern browsers block `AudioContext` from running until the user clicks or interacts with the page. You must call `await audioContext.resume()` upon a user button click (e.g. "Start Party" / "Enable Mic").

### 2.2 Signal Processing: Why the YIN Algorithm?
Human singing does not produce pure sine waves; it produces rich harmonic overtones (formants). If you simply pick the highest peak on an FFT frequency spectrum, you will frequently detect the second or third harmonic instead of the true vocal pitch (known as an **Octave Error**).

- **The YIN Algorithm** solves this using:
  1. **Difference Function:** Compares the audio buffer against delayed copies of itself (autocorrelation).
  2. **Cumulative Mean Normalized Difference:** Suppresses zero-lag correlation dips.
  3. **Parabolic Interpolation:** Estimates fractional sample peaks for sub-Hertz accuracy.
- **Converting Frequency ($f$) to MIDI Note Number:**
  Equal-tempered Western pitch is logarithmic:
  $$\text{MIDI Note} = \text{round}\left(69 + 12 \times \log_2\left(\frac{f}{440}\right)\right)$$
  - Middle C ($C_4$) = $261.63\text{ Hz}$ -> MIDI Note 60.
  - Concert A ($A_4$) = $440\text{ Hz}$ -> MIDI Note 69.

### 2.3 The Authentic Filipino Videoke Scoring Psychology
In commercial videoke machines (Megapro, TJ Media, Platinum), nobody wants a mathematical, ruthless vocal grading system that gives a party guest a 25 out of 100!
The scoring algorithm must be **festive and engaging**:
1. **Activity-Weighted Base:** If the user sings continuously and energetically, give a solid baseline (~75-80 pts).
2. **Pitch Accuracy Multiplier:** Add 0-20 points based on pitch stability and in-tune intervals.
3. **Party Variance:** Inject small randomized celebration variance (±3 pts) to maintain suspense.
4. **Grading Tiers & Filipino Commentary:**
   - `98 - 100`: "CHAMPION KA! TAWAG NG TANGHALAN NA YAN! 🏆" (Grand fanfare + wild cheering)
   - `90 - 97`: "PANG-CONCERT! PWEDE NANG MAG-CONCERT SA ARANETA! 🎤" (Loud applause)
   - `80 - 89`: "PWEDE NA! PERO PRACTICE PA SA BANYO! 👍" (Polite claps)
   - `< 80`: "UWI KA NA, GONG KA NA! 🔔" (Playful gong sound effect)

---

## 3. Step-by-Step Implementation Tasks

### Task 1: Microphone Stream Hook (`client/src/hooks/useMicrophonePitch.ts`)
1. Implement microphone initialization with raw vocal settings:
   ```typescript
   const stream = await navigator.mediaDevices.getUserMedia({
     audio: {
       echoCancellation: false,
       noiseSuppression: false,
       autoGainControl: false,
     }
   });
   ```
2. Create `AudioContext` with `sampleRate: 48000` and `AnalyserNode` with `fftSize = 4096`.
3. Hook `pitchfinder.YIN`:
   ```typescript
   import { YIN } from 'pitchfinder';

   const detectPitch = YIN({ sampleRate: 48000 });
   const audioBuffer = new Float32Array(4096);

   export function samplePitch(analyser: AnalyserNode) {
     analyser.getFloatTimeDomainData(audioBuffer);
     const pitchHz = detectPitch(audioBuffer);
     
     if (pitchHz && pitchHz > 65 && pitchHz < 1200) {
       const midiNote = Math.round(69 + 12 * Math.log2(pitchHz / 440));
       return { pitchHz, midiNote };
     }
     return null;
   }
   ```

### Task 2: Scoring Engine (`client/src/utils/scoring.ts`) (Skill: `tdd`)
1. Create unit tests in `scoring.test.ts` to verify score calculations.
2. Track pitch samples accumulated throughout the song.
3. Compute calibrated 0-100 integer score and title tier.
4. Broadcast score result over Supabase Realtime channel so guest phones celebrate simultaneously!

### Task 3: Score Reveal Modal (`client/src/components/player/ScoreModal.tsx`)
1. Render full-screen party overlay when `showScore` triggers.
2. Animated counter: Rolls rapidly from `00` up to final score (e.g. `96`) over 3 seconds.
3. Display humorous Filipino commentary badge.
4. Auto-dismiss modal after 8 seconds and proceed to next song in queue.

### Task 4: Fanfare & Sound Effects Generator (`client/src/utils/sfx.ts`)
1. Use Web Audio oscillator synthesis or bundled audio files for:
   - Cheering and whistling crowd loop.
   - Grand brass trumpet fanfare stinger.
   - Traditional brass videoke gong stinger.

---

## 4. Git Version Control & GitHub Workflow

### Branch Strategy
```bash
git checkout -b feat/day-5-pitch-detection-and-scoring
```

### Atomic Commit Plan (Conventional Commits)
1. `feat(client): install pitchfinder and setup Web Audio AnalyserNode pipeline`
2. `feat(client): implement useMicrophonePitch hook with raw audio constraints`
3. `test(client): write unit tests for videoke scoring algorithm and grade tiers`
4. `feat(client): implement authentic 100-point party scoring engine`
5. `feat(client): build animated ScoreModal with rolling digital score counter`
6. `feat(client): add fanfare and crowd cheer sound effects via Web Audio API`

---

## 5. Karpathy Verification & Definition of Done (DoD)

Apply the **Four Checks** (`andrej-karpathy-skill`):
1. **Assumption:** User gives microphone permission to the host browser tab.
2. **Changed:** Web Audio pitch detection pipeline, scoring calculation logic, and ScoreModal.
3. **Verified:**
   - [ ] Sing a steady sustained note into the microphone -> Pitch monitor reflects active frequency (e.g. `440 Hz -> Note 69 (A4)`).
   - [ ] Let song play to the end -> Song finishes -> Screen transitions to `ScoreModal`.
   - [ ] Score rolls from 00 to 95 -> Trumpet fanfare and cheering audio plays through speakers.
   - [ ] Score modal closes after 8 seconds and next song starts automatically.
4. **Remaining Risk:** Mic picking up background karaoke speakers if TV volume is very high. (Mitigated by gate thresholding: ignore audio below -35dB).
