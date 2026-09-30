# Day 6: Authentic Videoke UI Polish, Key Controls & Party Soundboard
**Sprint:** 7-Day PinoyVideoke Implementation  
**Phase:** Phase 5 – Tailwind Styling, Visual FX & Party Interactivity  
**Focus:** Nostalgic Dark Neon Theme, Top Ticker Marquee, Key Transposition & Live Soundboard  
**Referenced Skills:** `ui-styling`, `responsive-web-design`, `web-design-guidelines`, `security-auditor`, `andrej-karpathy-skill`

---

## 1. Day 6 Objectives & Architectural Goal
Day 6 elevates the application from a functional utility to an authentic, visually stunning **Philippine Videoke Experience**:
1. Apply the complete **Nostalgic Neon Design System** using Tailwind CSS (Obsidian dark background, neon cyan, laser magenta, and glowing amber LED displays).
2. Build the classic **TV Top Ticker Marquee** displaying room pairing status and continuous "UP NEXT: [Singer] - [Song Title]" scrolling text.
3. Implement **Key Transpose / Pitch Offset Controls** (`-6` to `+6` semitones) so singers can adjust tracks to their vocal range.
4. Build the interactive **Mobile Party Soundboard** (Airhorn, Clapping, Drumroll, Gong) broadcasting live audio triggers to the TV.
5. Implement socket rate-limiting to prevent soundboard audio spam.

---

## 2. In-Depth Learning Module: Styling & Interactive Audio

### 2.1 Tailwind CSS Design Architecture for TV Displays (Skill: `ui-styling`)
Designing for a 1080p/4K TV viewed from 10 feet away is fundamentally different from designing a desktop website:
- **Visual Hierarchy & Contrast:** Small body text (14px) is illegible on a TV. Typography must use high contrast ratios, large scale (`text-2xl` to `text-6xl`), and bold fonts (`font-black`, `font-mono`).
- **Nostalgic CRT & Neon Glow Shadows:**
  We define custom Tailwind utilities for that distinctive 90s karaoke bar aesthetic:
  ```javascript
  // tailwind.config.js
  module.exports = {
    theme: {
      extend: {
        colors: {
          videoke: {
            bg: '#030712',       // Slate-950 obsidian
            panel: '#0f172a',    // Slate-900 surface
            cyan: '#06b6d4',     // Neon Cyan
            magenta: '#d946ef',  // Neon Laser Magenta
            amber: '#fbbf24',    // 7-segment LED Amber
          }
        },
        boxShadow: {
          'neon-cyan': '0 0 15px rgba(6, 182, 212, 0.6), 0 0 30px rgba(6, 182, 212, 0.3)',
          'neon-amber': '0 0 15px rgba(251, 191, 36, 0.7), 0 0 30px rgba(251, 191, 36, 0.4)',
        }
      }
    }
  }
  ```

### 2.2 Top Ticker Marquee (CSS Animations vs JS)
In vintage videoke bars, a scrolling text marquee at the top of the TV alerts partygoers who is singing next.
- **Why pure CSS keyframes over JavaScript?**
  Running JavaScript `setInterval` for text animation causes layout thrashing and CPU load. A pure CSS `transform: translateX()` animation is offloaded directly to the GPU compositor thread:
  ```css
  @keyframes marquee {
    0% { transform: translateX(100%); }
    100% { transform: translateX(-100%); }
  }

  .animate-marquee {
    display: inline-block;
    white-space: nowrap;
    animation: marquee 20s linear infinite;
  }
  ```

### 2.3 Pitch Transposition: Musical Mechanics & Web Audio
Singers often need to lower or raise the key of a song to match their natural vocal tessitura:
- Each semitone step represents a frequency ratio of $2^{1/12} \approx 1.05946$.
- On Web Audio playback, pitch shifting is achieved via `AudioBufferSourceNode.playbackRate` or a phase vocoder worklet.
- For YouTube embeds, we provide an intuitive on-screen Transpose indicator (`-6` to `+6`) with playback rate detune or vocal key recommendation.

### 2.4 Party Soundboard & Socket Rate-Limiting (Skill: `security-auditor`)
When you give party guests an **Airhorn button**, someone will inevitably tap it 20 times per second!
Without rate-limiting:
- The server crashes from event flooding.
- The TV host browser audio buffer clips and distorts into painful buzzing noise.

**The Token Bucket / Cooldown Pattern on Server:**
```typescript
const lastSfxTime = new Map<string, number>();

socket.on('party:sfx', ({ roomCode, sfxType }) => {
  const now = Date.now();
  const lastTime = lastSfxTime.get(socket.id) || 0;

  // Enforce 1-second cooldown per client
  if (now - lastTime < 1000) {
    return; // Silently drop spam
  }

  lastSfxTime.set(socket.id, now);
  // Broadcast audio trigger to the TV Host
  io.to(roomCode).emit('party:play_sfx', { sfxType });
});
```

---

## 3. Step-by-Step Implementation Tasks

### Task 1: Complete Tailwind Theme & Global Scanline Overlay (`client/src/index.css`)
1. Add custom color tokens to Tailwind configuration.
2. Build glassmorphism utility classes (`backdrop-blur-lg bg-slate-900/80 border border-slate-800`).
3. Add subtle CRT scanline effect across TV Host background for maximum 90s nostalgia.

### Task 2: TV Host Top Ticker Bar (`client/src/components/player/TickerBanner.tsx`)
1. Create fixed header banner on TV Host view.
2. Left: Glowing LED Room Badge (`KANTA-88`) and connected device count.
3. Center: Continuous marquee ticker reading:
   `"🎵 NOW PLAYING: [Title] - [Artist] (Singer: [Name]) ★★★ UP NEXT: [Next Song] ★★★"`.
4. Right: Live digital clock with blinking seconds separator (`HH:MM`).

### Task 3: Key Transposition Controller (`client/src/components/remote/KeyControls.tsx`)
1. Add Pitch Key buttons to Mobile Remote:
   - `[ b ]` Flat / Transpose Down (-1)
   - `[ # ]` Sharp / Transpose Up (+1)
   - `[ 0 ]` Reset Key
2. Display current key offset badge (`Key: +2` or `Key: 0 (Original)`).
3. Emit `player:transpose` over Socket.io.

### Task 4: Interactive Soundboard Drawer (`client/src/components/remote/Soundboard.tsx`)
1. Mobile bottom sheet or tab with vibrant sound effect buttons:
   - 📢 **AIRHORN** (Reggae party siren)
   - 👏 **APPLAUSE** (Crowd cheering)
   - 🥁 **DRUMROLL** (Dramatic tension)
   - 🔔 **GONG** (Comedic fail sound)
2. Add quick haptic response on mobile tap.
3. TV Host receives `party:play_sfx` and plays high-fidelity audio clip through party speakers.

---

## 4. Git Version Control & GitHub Workflow

### Branch Strategy
```bash
git checkout -b feat/day-6-videoke-ui-and-soundboard
```

### Atomic Commit Plan (Conventional Commits)
1. `style(client): configure custom Tailwind neon color palette, glows, and scanlines`
2. `feat(client): build animated TickerBanner component with continuous marquee for TV view`
3. `feat(client): implement KeyControls component for pitch transpose adjustment`
4. `feat(server): add rate-limiting cooldown middleware for party soundboard socket events`
5. `feat(client): build mobile Soundboard drawer with Airhorn, Cheer, and Gong triggers`
6. `feat(client): integrate audio sound effects synthesizer on TV Host view`

---

## 5. Karpathy Verification & Definition of Done (DoD)

Apply the **Four Checks** (`andrej-karpathy-skill`):
1. **Assumption:** Soundboard triggers must not interrupt or pause ongoing YouTube karaoke music.
2. **Changed:** Design system tokens, top ticker marquee, key transpose UI, and party soundboard.
3. **Verified:**
   - [ ] TV Host top banner displays smooth scrolling marquee without stuttering or CPU spikes.
   - [ ] Tap "Airhorn" on mobile remote -> Iconic reggae siren sounds through TV speakers over the music.
   - [ ] Rapidly spam "Airhorn" 10 times -> Server allows 1 sound per second, blocking ear-shattering distortion.
   - [ ] Adjust Key transpose to `+2` -> Key indicator reflects on both mobile remote and TV host screen.
4. **Remaining Risk:** Audio clipping if soundboard volume is too loud relative to music. (Set SFX volume gain node to 0.7 max).
