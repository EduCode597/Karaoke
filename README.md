# 🎤 PinoyVideoke — Dual-Screen Web Videoke & Party Engine

[![Live Demo](https://img.shields.io/badge/Live%20Demo-karaoke--navy--ten.vercel.app-00dfa2?style=for-the-badge&logo=vercel&logoColor=white)](https://karaoke-navy-ten.vercel.app/)
[![Build Status](https://img.shields.io/badge/build-passing-brightgreen.svg?style=flat-square)](https://karaoke-navy-ten.vercel.app/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](LICENSE)
[![React](https://img.shields.io/badge/React-18.3.1-61dafb.svg?style=flat-square&logo=react)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-5.4.6-646cff.svg?style=flat-square&logo=vite)](https://vitejs.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5.4-3178c6.svg?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4.11-38bdf8.svg?style=flat-square&logo=tailwindcss)](https://tailwindcss.com/)
[![Vitest](https://img.shields.io/badge/Vitest-3.2.7-fcc72b.svg?style=flat-square&logo=vitest)](https://vitest.dev/)

**PinoyVideoke** faithfully recreates the iconic, soul-stirring experience of classic Filipino videoke machines (Megapro, Platinum, TJ Media) inside a modern, lightning-fast, and 100% serverless web application.

Featuring dual-screen synchronized architecture: project the **TV Stage** on your television or living room monitor while guests pass around their **Smartphones** or **Tablets** to dial 5-digit song codes, search the 523-track songbook, trigger party sound effects, and get officially scored by the live pitch detection engine!

---

## 🌟 Live Demo

The application is deployed and ready for your next party:

> **🔗 Production App:** [https://karaoke-navy-ten.vercel.app/](https://karaoke-navy-ten.vercel.app/)

| Screen View               | Direct Link                                             | Purpose                                                                               |
| :------------------------ | :------------------------------------------------------ | :------------------------------------------------------------------------------------ |
| **🏠 Songbook Dashboard** | [`/`](https://karaoke-navy-ten.vercel.app/)             | Catalog browsing, multi-term song search, pagination, and room joiner                 |
| **📺 TV Host Stage**      | [`/host`](https://karaoke-navy-ten.vercel.app/host)     | Living room TV display, YouTube karaoke player, lyrics, pitch monitor & score reveals |
| **📱 Mobile Remote**      | [`/remote`](https://karaoke-navy-ten.vercel.app/remote) | 3×4 tactile keypad, remote songbook reservation, queue management & soundboard        |

---

## ✨ Core Features & System Architecture

### 🏠 1. Songbook Explorer & Command Center (`/`)

- **523 Staple Tracks:** Pre-loaded with verified karaoke backing tracks across iconic OPM classics (Eraserheads, Parokya ni Edgar, Aegis, Regine Velasquez) and English videoke staples (Air Supply, Queen, Frank Sinatra).
- **Instant Multi-Term Search:** Fast filtering matching song code, song title, artist name, and phonetic search tokens.
- **Language Filter Tabs:** Quick toggling between **All**, **Tagalog / OPM**, and **English**.
- **Responsive View Modes:** Switch seamlessly between a cyber **Grid View** and a compact **Table View**.
- **Balanced Pagination:** Divisible 24 songs per page (`Pagination.tsx`) for uniform responsive grid rows.
- **1-Click 5-Digit Code Copy:** Instant copy feedback with visual tooltip.
- **"Surprise Me" Random Song Selector:** One-click random song generator that picks a track and copies its code automatically.
- **Interactive Audio Test:** Built-in Reggae Airhorn audio test with procedural zero-download Web Audio synthesis.
- **Quick Room Navigation:** Fast room code sanitizer and direct launcher for Host or Remote views.

### 📺 2. Living Room TV Host Stage (`/host`)

- **Cinematic Stage Layout:** Optimized up to `1720px` wide for 1080p, 1440p, and 4K displays with high-contrast cyber dark aesthetics.
- **Synced Video Playback:** Embeds verified karaoke backing tracks (CoversPH, KaraokeyTV) with synchronized syllable color-wipe lyrics via YouTube IFrame API.
- **Retro Mode & Fullscreen:** Toggle between full video player or retro videoke mode with fullscreen support.
- **Auto-Fading Overlay:** Top-left glassmorphism _"Now Singing"_ banner automatically fades after 6 seconds to ensure lyrics are never blocked.
- **Authentic LED Ticker Tape (`TickerBanner.tsx`):** Real-time LED ticker tape broadcasting currently playing song, upcoming performers, room announcements, and pairing codes.
- **Real-Time Room QR Code (`QRCodeSVG`):** High-contrast neon cyan QR code for guests to scan and pair their mobile devices instantly.
- **Stage Controls & Transpose:** Play, Pause, Skip, Replay, Fullscreen, and Key Transposer (`♭ -6 to ♯ +6` semitones) with visual cheer banners.
- **Standby Quick-Add Buttons:** Instant buttons to queue staple crowd-pleasers directly from the TV during downtime.

### 📱 3. Smartphone & Tablet Remote Controller (`/remote`)

- **Authentic 3×4 Numeric Keypad:**
  - Dial classic 5-digit song codes (e.g. `01001` for _Ang Huling El Bimbo_).
  - Tactile haptic vibration feedback on mobile browsers (`navigator.vibrate`).
  - Retro glowing 7-segment LED digital display readout (`LedDisplay.tsx`).
  - Instant code verification and automatic reservation trigger.
- **Full Songbook Tab:**
  - Search 523 songs with zero typing latency.
  - Category filters and quick reservation modal (`ReservationModal.tsx`) with customizable singer name.
- **Live Queue Tab:**
  - Real-time playlist monitoring with singer tags and queue count badges.
  - Live track reordering and track cancellation.
- **Web Audio Party Soundboard:**
  - Zero-latency procedural sound synthesis (no external audio files to download):
    - 📢 **Reggae Airhorn**
    - 🔔 **Tawag ng Tanghalan Fail Gong**
    - 👏 **Standing Ovation & Crowd Cheers**
    - 🥁 **Dramatic Drumroll**
- **Remote Key Transposer:** Transpose the TV playback pitch remotely without interrupting the singer.
- **Live Score Alerts:** Receives instant broadcast notifications with haptic vibration whenever a singer finishes on stage.

### 🎯 4. YIN Acoustic Pitch Detection & Authentic 100-Point Scoring Engine

- **Browser-Native Pitch Detection:** Analyzes fundamental vocal frequencies (`~70Hz` to `~1100Hz`) directly from the TV microphone using the YIN algorithm (`pitchfinder`).
- **Live Pitch VU Meter (`PitchMonitor.tsx`):** Converts microphone Hertz to musical notes (e.g., `C4`, `G#4`) with an LED VU level meter and volume stability monitoring.
- **Official 100-Point Score Reveal Modal (`ScoreModal.tsx`):**
  - 🏆 **Champion Tier (98–100):** _"CHAMPION KA! TAWAG NG TANGHALAN NA YAN!"_
  - 🎤 **Concert Tier (90–97):** _"PANG-CONCERT! PWEDE NANG MAG-ARANETA!"_
  - 📻 **Practice Tier (75–89):** _"PWEDE NA! KONTI PANG BIRIT SA KUSINA!"_
  - 🔔 **Gong Tier (60–74):** _"UWI KA NA, GONG KA NA!"_
- **7-Segment Rolling LED Score Counter:** Authentic suspenseful rolling score reveal with sound effects, fanfare, and celebratory confetti.
- **Mid-Song Early Scoring:** Host can click _"Finish / Score"_ at any time during a song to award points and proceed to the next singer.

### ⚡ 5. 0ms Hybrid Realtime Sync & Offline Resiliency

- **Dual Broadcast Synchronization:**
  - **Browser `BroadcastChannel`:** Provides instantaneous **0ms latency** synchronization for multi-window setups or local network connections without needing external servers.
  - **Supabase Realtime Channels:** Provides global cross-device synchronization over the internet with automatic presence tracking (`useRoomChannel.ts`).
- **In-Memory Bundled Catalog:** All 523 verified songs are bundled locally in `src/data/songs.json` for immediate offline search and keypad resolution.
- **Resilient Queue Hydration (`queue-sync.ts`):** Automatically recovers and repairs missing or incomplete song metadata, ensuring 100% playback continuity even under spotty network conditions.

---

## 🛠️ Tech Stack

| Domain                 | Technology                      | Purpose                                                        |
| :--------------------- | :------------------------------ | :------------------------------------------------------------- |
| **Frontend Framework** | **React 18.3.1**                | Component-driven UI, Concurrent Mode, Hooks                    |
| **Build Tool**         | **Vite 5.4.6**                  | Instant HMR, optimized manual code splitting                   |
| **Language**           | **TypeScript 5.5.4**            | Strict type safety across songs, queue, and events             |
| **Styling**            | **Tailwind CSS 3.4.11**         | Custom dark palette, neon glows, digital LED typography        |
| **Acoustic Engine**    | **Pitchfinder 2.3.2**           | YIN vocal fundamental frequency detection                      |
| **Audio Synthesis**    | **Web Audio API**               | Zero-latency procedural sound effects (airhorn, gong, fanfare) |
| **Video Playback**     | **YouTube IFrame API**          | Karaoke track playback with synchronized lyrics                |
| **Cloud Realtime**     | **Supabase JS 2.45.4**          | Realtime broadcast channels and PostgreSQL database            |
| **Local Sync**         | **BroadcastChannel API**        | 0ms latency cross-window and offline tab sync                  |
| **Icons & QR**         | **Lucide React & QRCode.react** | Clean iconography and instant room pairing codes               |
| **Testing**            | **Vitest 3.2.7 & JSDOM**        | Unit test suite and queue hydration integration tests          |
| **Deployment**         | **Vercel**                      | Edge CDN with Single-Page Application rewrites                 |

---

## 📁 Project Structure

```text
Karaoke/
├── index.html                   # HTML entry point with Outfit & Share Tech Mono fonts
├── package.json                 # Dependencies and npm scripts
├── tsconfig.json                # TypeScript compiler configuration
├── vite.config.ts               # Vite build config with manual chunking & Vitest setup
├── vercel.json                  # SPA rewrite rules and immutable asset caching headers
├── scripts/
│   ├── seed-songs.ts            # Supabase database seeder for catalog tracks
│   ├── scrape-playlist.py       # Playlist scraper for verified CoversPH tracks
│   └── verify-embeds.py         # YouTube video embed validation script
├── src/
│   ├── App.tsx                  # Root router: Home Dashboard, HostView, and RemoteView
│   ├── main.tsx                 # React DOM mount point
│   ├── index.css                # Tailwind directives, cyber grid backdrops, and neon utilities
│   ├── components/
│   │   ├── common/
│   │   │   └── Pagination.tsx   # Responsive catalog pagination controls
│   │   ├── player/
│   │   │   ├── YouTubePlayer.tsx    # Synced video player with API handle
│   │   │   ├── LyricsOverlay.tsx    # Synchronized LRC lyrics overlay
│   │   │   ├── PitchMonitor.tsx     # Real-time Hz pitch meter & VU volume monitor
│   │   │   ├── ScoreModal.tsx       # 100-point score reveal modal with rolling counter
│   │   │   ├── ScoreModal.test.tsx  # Unit tests for score reveal calculations & render
│   │   │   └── TickerBanner.tsx     # LED marquee ticker streaming queue & announcements
│   │   └── remote/
│   │       ├── Keypad.tsx           # 3×4 numeric keypad with haptic feedback
│   │       ├── LedDisplay.tsx       # 5-digit glowing LED display
│   │       ├── SongbookTab.tsx      # Mobile searchable song catalog
│   │       ├── QueueTab.tsx         # Mobile queue manager with singer tags
│   │       ├── Soundboard.tsx       # Procedural Web Audio party soundboard
│   │       ├── KeyControls.tsx      # Pitch transpose control widget
│   │       └── ReservationModal.tsx # Song reservation dialog
│   ├── data/
│   │   └── songs.json           # Bundled catalog containing all 523 verified karaoke tracks
│   ├── hooks/
│   │   ├── useMicrophonePitch.ts# Web Audio microphone stream & YIN pitch tracker
│   │   └── useRoomChannel.ts    # Dual BroadcastChannel + Supabase realtime hook
│   ├── lib/
│   │   ├── songs.ts             # Local-first search engine & queue management
│   │   ├── supabase.ts          # Supabase client initializer & config guard
│   │   ├── queue-sync.ts        # Resilient queue item hydration & repair
│   │   └── queue-sync.test.ts   # Integration test script for queue synchronization
│   ├── types/
│   │   ├── song.ts              # Song, QueueItem, and filter definitions
│   │   └── database.ts          # Supabase database schema definitions
│   ├── utils/
│   │   ├── room.ts              # Room code generator (KANTA-XXXX) and storage
│   │   ├── scoring.ts           # YIN pitch analysis & 100-point OPM score formula
│   │   └── soundEffects.ts      # Web Audio procedural sound synthesis
│   └── views/
│       ├── HostView.tsx         # Full TV Stage view for the living room screen
│       └── RemoteView.tsx       # Multi-tab mobile controller view
```

---

## 🚀 Quick Start (Local Setup)

### Prerequisites

- [Node.js](https://nodejs.org/) v18+
- [npm](https://www.npmjs.com/) v9+

### 1. Clone & Install Dependencies

```bash
git clone https://github.com/EduCode597/Karaoke.git
cd Karaoke
npm install
```

### 2. Configure Environment Variables

Create a `.env` file in the root directory:

```env
# Optional: Supabase credentials for internet rooms (leave blank for local demo mode)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# Room Code prefix (default: KANTA)
VITE_DEFAULT_ROOM_PREFIX=KANTA
```

> [!NOTE]
> **Zero-Config Offline Mode:** If Supabase credentials are not provided, PinoyVideoke automatically operates in high-speed local offline mode using browser `BroadcastChannel` and `localStorage`. No database setup is required to run a full local party!

### 3. Run the Local Development Server

```bash
npm run dev
```

Open **`http://localhost:5173/`** in your browser.

- **🏠 Home Songbook:** `http://localhost:5173/`
- **📺 Host Stage (TV):** `http://localhost:5173/host`
- **📱 Remote Controller (Phone/Tablet):** `http://localhost:5173/remote`

---

## 🧪 Testing & Code Quality

The codebase includes automated tests and type verification:

```bash
# Type check TypeScript without emitting files
npm run typecheck

# Run unit tests with Vitest (ScoreModal, components)
npm run test:unit

# Run queue hydration & song catalog integration tests
npm test

# Build production bundle
npm run build
```

---

## 🗄️ Database Seeding (Optional Supabase Setup)

If you configure Supabase to enable internet-wide rooms, run the database seed script to populate the `songs` table with all 523 catalog items:

```bash
npm run seed
```

---

## 🌐 Deployment to Vercel

PinoyVideoke is pre-configured for zero-cost deployment on [Vercel](https://vercel.com/):

### Pre-Configured SPA Routing (`vercel.json`)

Direct navigations to deep routes like `/host` and `/remote` are handled cleanly without 404s:

```json
{
  "framework": "vite",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ],
  "headers": [
    {
      "source": "/assets/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ]
}
```

Deploy in one click by connecting your GitHub repository to Vercel or running:

```bash
npx vercel
```

---

## 📖 Party Host Guide

```text
┌─────────────────┐       Wi-Fi / LAN / QR Code       ┌──────────────────┐
│   LIVING ROOM   │ ◄───────────────────────────────► │   SMARTPHONES    │
│    TV STAGE     │   Realtime Sync (0ms Broadcast)   │  REMOTE CONTROLS │
│   (`/host`)     │                                   │   (`/remote`)    │
└─────────────────┘                                   └──────────────────┘
```

1. **Set Up the Stage (`/host`):**
   - Connect your laptop to the living room TV via HDMI or wireless screen mirror.
   - Open [`/host`](https://karaoke-navy-ten.vercel.app/host) and press **F11** (or click the Fullscreen icon) for TV Mode.
   - Click **"Enable Mic"** on the TV screen and allow microphone access for real-time vocal pitch detection and scoring.
2. **Connect Party Guests (`/remote`):**
   - Guests point their smartphone cameras at the neon QR code on the TV screen.
   - The Mobile Remote opens immediately and connects to the same room code.
3. **Queue Songs:**
   - Guests dial 5-digit song codes on the 3×4 Keypad (e.g., `01001`), or browse the categorized Songbook.
   - Enter their singer name and tap **Reserve**.
4. **Sing & Score:**
   - Queued songs play automatically in order.
   - The live Pitch Monitor tracks vocal stability throughout the song.
   - When the song finishes, the rolling 7-segment digital score reveals their official tier and classic OPM commentary!
   - Party guests can trigger the Airhorn, Gong, Ovation, or Drumroll anytime from their phones.

---

## 📄 License

This project is open-source under the [MIT License](LICENSE).
