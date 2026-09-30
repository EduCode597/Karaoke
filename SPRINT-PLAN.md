# PinoyVideoke: 7-Day Sprint Plan
**Target Project:** Filipino-Style Videoke Web Application ("PinoyVideoke")  
**Reference Document:** [PRD-Filipino-Videoke-Webapp.md](file:///c:/Users/PROVIDENCE/OneDrive/Desktop/Karaoke/PRD-Filipino-Videoke-Webapp.md)  
**Timeline:** 7 Business Days / 1 Week Sprint  
**Target Architecture:** Monorepo (Client: React 18 + Vite + Tailwind CSS | Server: Node.js + Express + Socket.io + SQLite/Knex)

---

## Sprint Overview & Milestone Trajectory

```
[Day 1] Data & Songbook Engine ────► [Day 2] Dual-Screen Room Pairing
                                              │
[Day 4] TV Player & Lyrics Sync ◄─── [Day 3] Mobile Remote & Queue UI
         │
         ▼
[Day 5] Web Audio Pitch & Scoring Engine
         │
         ▼
[Day 6] Nostalgic Neon UI, Key Controls & Soundboard
         │
         ▼
[Day 7] Multi-Device Hardening, Latency Tuning & Party Release 🚀
```

| Day | Focus Area | Key Deliverable | Deep-Dive Learning Guide | Success Criteria |
| :--- | :--- | :--- | :--- | :--- |
| **Day 1** | Scaffolding, SQLite DB & Songbook Indexer | Monorepo structure, DB migrations, seed data, REST API | [day-01.md](file:///c:/Users/PROVIDENCE/OneDrive/Desktop/Karaoke/sprint/day-01.md) | Can search & fetch 5-digit songs via REST API |
| **Day 2** | Dual-Screen Socket.io Architecture | Room orchestration, pairing protocol, QR code generation | [day-02.md](file:///c:/Users/PROVIDENCE/OneDrive/Desktop/Karaoke/sprint/day-02.md) | TV view displays QR; mobile phone scans & establishes paired session |
| **Day 3** | Mobile Remote Control & Keypad UI | 3x4 numeric keypad, 5-digit LED display, Queue manager | [day-03.md](file:///c:/Users/PROVIDENCE/OneDrive/Desktop/Karaoke/sprint/day-03.md) | Guests can type 5-digit code and queue songs with singer names |
| **Day 4** | TV Host Player & LRC Lyric Engine | YouTube IFrame Player API + `react-lrc` synchronization | [day-04.md](file:///c:/Users/PROVIDENCE/OneDrive/Desktop/Karaoke/sprint/day-04.md) | YouTube video plays with neon-highlighted, auto-scrolling lyrics |
| **Day 5** | Web Audio Pitch Detection & Scoring | Mic stream capture, YIN pitch detection, score screen | [day-05.md](file:///c:/Users/PROVIDENCE/OneDrive/Desktop/Karaoke/sprint/day-05.md) | Mic detects singing pitch; generates authentic 100-pt videoke score & fanfare |
| **Day 6** | Authentic Videoke Polish & Audio Controls | Neon theme, pitch shift (key transpose), party soundboard | [day-06.md](file:///c:/Users/PROVIDENCE/OneDrive/Desktop/Karaoke/sprint/day-06.md) | Megapro/Platinum dark neon vibe, cheer/jeer sound effects, pitch shift |
| **Day 7** | Stress Testing, Edge Cases & Deployment | Latency profiling, multi-device stress test, Docker/startup script | [day-07.md](file:///c:/Users/PROVIDENCE/OneDrive/Desktop/Karaoke/sprint/day-07.md) | Smooth multi-user party session without desync; single-command launch |

---

## Detailed Daily Sprint Breakdown

### Day 1: Foundation, Data Layer & Songbook Engine
**Objective:** Establish the development environment, configure the database, and build the song indexing/search service.

#### Tasks:
1. **Repository & Architecture Setup:**
   - Initialize monorepo structure: `/server` (Node.js, Express, TypeScript) and `/client` (Vite, React 18, Tailwind CSS v3).
   - Configure shared TypeScript types package or shared schema definitions.
   - Setup ESLint, Prettier, and environment variable configs (`.env.example`).
2. **Database Schema & Migrations:**
   - Setup SQLite3 with Knex query builder.
   - Create migrations for:
     - `songs`: `id`, `code` (5-digit unique index), `title`, `artist`, `language`, `youtube_id`, `lrc_content`, `key_offset`, `duration`.
     - `rooms`: `room_code` (unique), `host_socket_id`, `status`, `created_at`.
     - `queue_items`: `id` (UUID), `room_code`, `song_id`, `singer_name`, `position`, `status`.
3. **Song Seeding & Ingestion Pipeline:**
   - Build seed script with 30+ iconic Filipino Videoke hits (OPM staples like "Anak", "Ang Huling El Bimbo", "Tala", "Bakit Pa", "Harana", "My Way", "Zombie", etc.).
   - Create JSON/CSV ingestion CLI utility for bulk song imports with YouTube video IDs and bundled LRC files.
4. **Songbook REST API Endpoints:**
   - Implement `GET /api/songs`: Paginated search by title, artist, and language filter (`Tagalog`, `English`).
   - Implement `GET /api/songs/code/:code`: Instant lookup by 5-digit code.
   - Implement `GET /api/lyrics/sync?songId=...`: Endpoint to fetch raw LRC lyrics (with fallback to LRCLIB API proxy).

**Definition of Done (Day 1):**
- Database migrations run cleanly.
- Seeding populates verified songs with 5-digit codes, valid YouTube IDs, and synced LRC strings.
- Automated API tests verify that searching "Freddie Aguilar" or typing "01234" returns the correct track payload in <50ms.

---

### Day 2: Dual-Screen Real-Time Engine & Room Handshake
**Objective:** Implement Socket.io room orchestration to bind the TV Host View to Mobile Remote devices.

#### Tasks:
1. **Socket.io Gateway Implementation:**
   - Configure Socket.io server with room multiplexing.
   - Implement server handlers:
     - `room:create` (generates memorable room codes, e.g., `KANTA-77`).
     - `room:join` (supports `role: 'host' | 'remote'`).
     - Room disconnection and heartbeat cleanup logic.
2. **TV Host Handshake (`/host`):**
   - Build room initialization hook: requests new room code on mount.
   - Render high-contrast connection modal containing:
     - Prominent room code display in amber LED font.
     - Dynamic QR Code (`qrcode.react`) embedding direct join link (`https://<host>/remote?room=KANTA-77`).
     - Connected remotes counter badge.
3. **Mobile Remote Handshake (`/remote`):**
   - Parse `room` query parameter from URL.
   - Build manual room code entry modal fallback for users joining without QR scanning.
   - Establish bidirectional Socket.io connection and store session in React Context / Zustand.
4. **State Synchronization Protocol:**
   - Implement `room:state` broadcast payload: current playing song, player state (`playing`, `paused`, `idle`), active queue array.

**Definition of Done (Day 2):**
- Opening `/host` on a browser generates a room code and QR code.
- Scanning the QR code on a mobile phone opens `/remote?room=...` and establishes an active paired connection.
- Host screen reflects connected guest count in real-time.

---

### Day 3: Mobile Remote Control (Keypad, LED Display & Queue Management)
**Objective:** Deliver the signature Megapro/Platinum remote control experience on mobile devices.

#### Tasks:
1. **Digital 5-Digit LED Display Component:**
   - Create retro digital LED readout banner (amber monospace text on obsidian panel).
   - Display typed digits as user presses keys (e.g., `[ 0 4 5 _ _ ]`).
   - Add inline helper text showing preview of resolved song title once 5 digits are entered.
2. **Physical-Style 3x4 Matrix Keypad:**
   - Implement 12-button grid: `1-9`, `Clear` (red), `0`, `Enter` (cyan).
   - Add tactile audio/haptic feedback (`navigator.vibrate(15)` on supported mobile devices).
   - Add "Singer Name" prompt modal or drawer upon pressing `Enter`.
3. **Songbook Search & Category Browser Tab:**
   - Build mobile search view with real-time debounce for users who don't know the numeric code.
   - Filter chips: `All`, `OPM / Tagalog`, `English`, `Pop`, `Rock`, `Duets`.
   - "Reserve" button to enqueue instantly with 1 tap.
4. **Queue Management Drawer:**
   - Display real-time list of upcoming tracks with singer name tags.
   - Controls: "Move to Top" (priority queue) and "Delete" (remove track).
   - Optimistic UI updates with socket event dispatch (`queue:add`, `queue:reorder`, `queue:remove`).

**Definition of Done (Day 3):**
- Guest can input a 5-digit number on mobile keypad and press `Enter` to queue a song.
- Queue updates broadcast immediately and render on the host screen within 100ms.
- Guest can search by song title on mobile, browse categories, and queue tracks seamlessly.

---

### Day 4: TV Host Video Engine & Synchronized LRC Lyrics
**Objective:** Build the centerpiece TV display featuring smooth YouTube video playback and line-by-line animated lyrics.

#### Tasks:
1. **YouTube IFrame API Integration:**
   - Wrap YouTube Player API inside a controlled React component.
   - Support seamless track switching when the current song completes (`onStateChange: 0`).
   - Handle player lifecycle: cueing, loading buffering states, volume ducking, and auto-play workarounds.
2. **High-Precision Lyric Synchronizer:**
   - Implement high-frequency synchronization loop using `requestAnimationFrame` polling `player.getCurrentTime()`.
   - Integrate `react-lrc` with custom styling:
     - Active line: Vibrant neon yellow/cyan glow, enlarged font, bounce transition.
     - Dual-line subtitle overlay at the bottom of the video for the classic Videoke look.
     - Auto-scroll container centering upcoming verses.
3. **Playback Control Events:**
   - Wire remote control socket commands to the TV player:
     - `player:action -> 'pause'` / `'play'`
     - `player:action -> 'skip'` (advances to next queue item)
     - `player:action -> 'replay'` (restarts current video from 00:00)
4. **Dual Background Mode:**
   - Provide toggle on TV view:
     - Mode A: Native YouTube video stream.
     - Mode B: Muted retro videoke background loop (nature, city lights, tropical beaches) with lyrics prominently rendered.

**Definition of Done (Day 4):**
- TV Host automatically plays the next song in the queue.
- Lyrics scroll and illuminate in lockstep with the vocals.
- Skipping or pausing from a mobile remote instantly updates video and lyrics on the TV screen.

---

### Day 5: Web Audio Pitch Detection & Scoring System
**Objective:** Build real-time vocal pitch tracking and the iconic 100-point Filipino Videoke scoring engine.

#### Tasks:
1. **Microphone Audio Input Pipeline:**
   - Implement `navigator.mediaDevices.getUserMedia` capture on the Host machine (or external USB mic).
   - Configure audio constraints: disable browser echo cancellation and noise suppression for raw vocal harmonics.
   - Construct Web Audio pipeline: `AudioContext` -> `MediaStreamSource` -> `AnalyserNode` (FFT size 4096).
2. **YIN Pitch Detection Integration:**
   - Hook `pitchfinder.YIN({ sampleRate: 48000 })` to process `analyser.getFloatTimeDomainData()`.
   - Extract fundamental frequencies ($F_0$) between human singing range (60Hz to 1200Hz).
   - Convert frequency in Hz to musical MIDI note numbers:
     $$\text{Note} = 69 + 12 \times \log_2\left(\frac{f}{440}\right)$$
3. **Filipino Videoke Scoring Algorithm:**
   - Calculate vocal consistency and pitch stability across song duration.
   - Apply classic party algorithm bias: generous base scoring with random excitement variance (guaranteeing fun scores between 75 and 100).
   - Grade boundaries:
     - `98 - 100`: "WORLD CLASS SINGER! 🎉" (Wild applause + trumpet fanfare)
     - `90 - 97`: "PANG-CONCERT LEVEL! 👏" (Loud cheers)
     - `80 - 89`: "PWEDE NA! PRACTICE PA! 👍" (Polite claps)
     - `< 80`: "UWI KA NA! GONG! 🔔" (Playful gong/jeer sound)
4. **Score Reveal Screen & Fanfare SFX:**
   - Fullscreen celebration overlay modal triggering when song finishes.
   - Digital rolling counter animating from 0 up to final score.
   - Audio feedback stinger using Web Audio API synthesis / bundled retro audio samples.

**Definition of Done (Day 5):**
- Singing into the host microphone produces real-time pitch data.
- When a song ends, the TV screen transitions to the authentic Videoke Score modal with animated score tally and cheering sound effects.

---

### Day 6: Authentic Videoke Polish, Key Controls & Party Soundboard
**Objective:** Deliver the nostalgic retro aesthetic and essential videoke convenience features.

#### Tasks:
1. **Retro Neon Visual System Implementation:**
   - Implement complete Tailwind CSS design tokens:
     - Background: Deep obsidian/slate-950 (`#030712`).
     - Accents: Neon Cyan (`#06b6d4`), Laser Magenta (`#d946ef`), Amber LED (`#fbbf24`).
     - Glassmorphism: `backdrop-blur-md bg-slate-900/80 border border-slate-800`.
   - Add subtle scanline overlay and glowing LED box-shadow utilities.
2. **TV Host Top Ticker Marquee:**
   - Top status banner: Room Code badge, QR toggle, live clock.
   - Animated marquee ticker: `"UP NEXT: [Singer] - [Song Title]"` scrolling continuously.
3. **Key Transpose / Pitch Offset Controls:**
   - Remote control buttons for Key: `b` (Flat / -1) and `#` (Sharp / +1).
   - Audio pitch modulation or YouTube playback speed / Web Audio pitch detune integration.
4. **Interactive Party Soundboard:**
   - Soundboard tab on Mobile Remote with buttons for instant crowd reactions:
     - 👏 Clapping & Cheers
     - 📢 Airhorn / Reggae Siren
     - 🥁 Drum Roll
     - 🔔 "Gong" Stinger
   - Tapping broadcasts audio trigger to the TV Host screen via WebSockets for room-wide sound playback.

**Definition of Done (Day 6):**
- The UI looks and feels like a legitimate Philippine commercial KTV / videoke machine.
- Guests can send airhorns and applause sound effects directly to the TV audio during performances.
- Key transpose buttons allow adjustments before and during songs.

---

### Day 7: Multi-Device Stress Testing, Edge Cases & Deployment
**Objective:** Harden the system for real-world party environments, optimize latency, and prepare one-command launch.

#### Tasks:
1. **Multi-Device Concurrency & Stress Testing:**
   - Connect 5+ mobile devices simultaneously to a single TV Host room.
   - Test simultaneous 5-digit queue submissions, queue re-ordering, and soundboard spam.
   - Ensure WebSocket messages maintain sub-50ms latency over local Wi-Fi.
2. **Robust Edge Case & Failure Recovery:**
   - Handle YouTube playback errors (e.g., blocked embedding fallback to secondary video or warning toast).
   - Handle microphone permission denied: graceful fallback to simulated party score without crashing.
   - Handle mobile device sleep / screen lock: automatic socket reconnection and state resynchronization.
3. **Cross-Browser & Responsive Optimization:**
   - Validate TV view on 1080p and 4K displays.
   - Validate Mobile Remote on iOS Safari and Android Chrome viewport heights (`dvh` support).
4. **Packaging & Deployment:**
   - Create single startup command: `npm run start:party` (concurrently boots backend and builds/serves frontend).
   - Build a `docker-compose.yml` for self-hosted home server or Raspberry Pi deployment.
   - Write complete User Guide and setup documentation.

**Definition of Done (Day 7):**
- Flawless 30-minute end-to-end singing session conducted with multiple connected phones.
- All acceptance criteria from the PRD validated.
- Deployment script launches the entire system with zero manual configuration.

---

## Technical Risk Management Matrix

| Risk | Impact | Probability | Mitigation Strategy |
| :--- | :--- | :--- | :--- |
| **YouTube Autoplay Restrictions** | High | High | TV Host UI will include a prominent "Start Party / Click to Enable Audio" initial button to unlock the browser `AudioContext` and YouTube iframe autoplay policy. |
| **Video Embedding Restrictions** | Med | Med | Seed list will use vetted karaoke backing tracks with embedding enabled. A fallback search or alternative YouTube ID field will be supported in the DB schema. |
| **Web Audio Pitch Drift / Noise** | Med | High | Configure `getUserMedia` with `echoCancellation: false`, `noiseSuppression: false` to avoid clipping vocal frequencies; use high-confidence thresholding in the YIN algorithm. |
| **Mobile Wi-Fi Sleep Disconnects** | Med | Med | Socket.io automatic reconnection with room re-join handshake stored in client session storage. |
| **LRC Lyric Timing Mismatch** | Med | Med | Provide a fine-tuning sync slider (`±0.5s` offset) on the host control panel to easily calibrate lyric timing on the fly. |

---

## Recommended Team Role Allocation (Or Single-Developer Focus Hours)

If executing as a multi-person team or solo developer, allocate effort according to:

| Area | Primary Responsibility | Daily Allocation |
| :--- | :--- | :--- |
| **Backend & Real-Time Engine** | SQLite DB, Express REST APIs, Socket.io gateway, queue sync | ~2.5 hrs/day |
| **Frontend TV View & Audio** | YouTube IFrame API, `react-lrc`, Web Audio API, YIN pitch detection | ~3.0 hrs/day |
| **Frontend Mobile Remote & UI** | 3x4 Matrix Keypad, 5-digit display, songbook search, Tailwind design | ~2.5 hrs/day |
| **QA, Assets & Testing** | Song seeding, audio SFX curation, multi-device testing, Docker | ~1.5 hrs/day |

---
*Created from PRD-Filipino-Videoke-Webapp.md v1.0.0*
