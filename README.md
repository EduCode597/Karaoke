# 🎤 PinoyVideoke — Dual-Screen Web Videoke & Party Engine

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen.svg)](<>)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](<>)
[![React](https://img.shields.io/badge/React-18.3.1-blue.svg)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-5.4-purple.svg)](https://vitejs.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-blue.svg)](https://www.typescriptlang.org/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-38bdf8.svg)](https://tailwindcss.com/)

**PinoyVideoke** faithfully recreates the iconic, soul-stirring experience of classic Filipino videoke machines (Megapro, Platinum, TJ Media) inside a modern, lightning-fast, and 100% serverless web application.

Featuring dual-screen synchronized architecture: project the **TV Stage** on your television or living room monitor while guests pass around their **Smartphones** or **iPads** to dial 5-digit song codes, search the 523-track songbook, trigger party sound effects, and get officially scored by the live pitch detection engine!

---

## ✨ Core Features

### 📺 1. TV Host View (`/host`)

- **Cinematic Stage Display:** Optimized up to `1720px` wide for 1080p, 1440p, and 4K TVs.
- **Native Karaoke Synchronization:** Direct embedded playback of verified karaoke videos (CoversPH, KaraokeyTV) with synchronized syllable color-wipe lyrics.
- **Sleek Auto-Fading Overlay:** Top-left glassmorphism _"Now Singing"_ badge that automatically fades after 6 seconds, keeping video lyrics 100% visible.
- **Authentic Marquee Ticker:** Retro LED ticker tape streaming live song queues, room codes, and performer announcements.
- **Live Room QR Code:** High-contrast neon cyan QR code for guests to scan and connect instantly.
- **Interactive Stage Controls:** Play/Pause, Key Transpose (`♭` / `♯` semitones), Skip/Finish, Replay, and Fullscreen.

### 📱 2. Mobile & Tablet Remote Controller (`/remote`)

- **Authentic 3×4 Numeric Keypad:** Dial 5-digit song codes (e.g. `01001`) with tactile haptic vibration and retro glowing digital LED readouts.
- **Responsive Multi-Column Songbook:** Fluid 4-column desktop, 3-column laptop, 2-column tablet, and 1-column mobile songbook catalog with real-time multi-term search across Tagalog & English songs.
- **Party Playlist Management:** Live queue reordering, cancellation, and guest singer names.
- **Party Soundboard:** Zero-latency Web Audio synthesized sound effects:
  - 📢 Reggae Airhorn
  - 🔔 Tawag ng Tanghalan Fail Gong
  - 👏 Standing Ovation & Cheers
  - 🥁 Dramatic Drumroll
- **Vocal Range Key Transposer:** Real-time key shift commands sent directly to the TV screen.

### 🎯 3. YIN Acoustic Pitch Detection & 100-Point Scoring Engine

- **Browser-Native Pitch Detection:** Analyzes fundamental vocal frequencies (~70Hz to ~1100Hz) directly via Web Audio API.
- **Real-Time Pitch Readout:** Converts microphone Hertz to musical notes (e.g. `C4`, `G4`, `A4`) with an LED VU level meter.
- **Official 100-Point Score Reveal Modal:**
  - 🏆 **Champion Tier (98–100):** _"CHAMPION KA! TAWAG NG TANGHALAN NA YAN!"_
  - 🎤 **Concert Tier (90–97):** _"PANG-CONCERT! PWEDE NANG MAG-ARANETA!"_
  - 📻 **Practice Tier (75–89):** _"PWEDE NA! KONTI PANG BIRIT SA KUSINA!"_
  - 🔔 **Gong Tier (60–74):** _"UWI KA NA, GONG KA NA!"_
- **7-Segment Rolling LED Font:** Authentic suspenseful rolling score counter with sound effects and fanfare.
- **Microphone Standby Detection:** Helpful guidance banner informing singers to enable mic before their turn.

### ⚡ 4. 0ms Offline-First & Resilient Realtime Architecture

- **In-Memory Bundled Catalog:** All 523 CoversPH songs are bundled offline in `src/data/songs.json` for 0ms instantaneous keypad response.
- **Cross-Tab & LAN Sync:** Uses standard browser `BroadcastChannel` in parallel with Supabase Realtime so host and remotes on `localhost` or LAN communicate with zero latency even without an active internet connection.

---

## 🚀 Quick Start (Local Setup)

### Prerequisites

- [Node.js](https://nodejs.org/) v18+
- npm v9+

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

_(Note: If Supabase is offline or unconfigured, PinoyVideoke automatically operates in high-speed local offline mode using `BroadcastChannel` and `localStorage`!)_

### 3. Run the Local Development Server

```bash
npm run dev
```

Open **`http://localhost:5173/`** in your browser.

- **Host View (TV):** `http://localhost:5173/host`
- **Remote View (Phone/Tablet):** `http://localhost:5173/remote`

---

## 🌐 Deploying to Vercel (1-Click & Zero Cost)

PinoyVideoke is architected to deploy directly to [Vercel](https://vercel.com/) at zero hosting cost.

### 1. Automated SPA Routing (`vercel.json`)

The project includes a pre-configured `vercel.json` with Single-Page Application (SPA) rewrites so direct navigation to `/host` or `/remote` never yields 404s:

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

### 2. Deploy via Vercel CLI

```bash
npx vercel
```

Or connect your GitHub repository directly in the [Vercel Dashboard](https://vercel.com/new).

---

## 📖 Party Host Guide

1. **Setup the Stage:**
   - Connect your laptop to your living room TV via HDMI or Chromecast / AirPlay.
   - Open `/host` and press **F11** (or tap the Fullscreen button) to enter TV Mode.
   - Click **"Enable Mic"** on the TV screen and allow microphone access for live vocal pitch scoring.
2. **Invite Party Guests:**
   - Guests point their smartphone cameras at the neon QR code on the TV.
   - The Mobile Remote will automatically open and pair with the room.
3. **Queue Tracks:**
   - Guests can dial 5-digit song codes directly on the 3×4 Keypad (e.g., `01001` for _Ang Huling El Bimbo_), or browse the categorized Songbook.
   - Enter their singer name and tap **Reserve**.
4. **Sing & Score:**
   - Songs play automatically in queued order.
   - The singer steps up to the mic. Upon song completion, the dramatic 100-point score reveal announces their tier!

---

## 🛠️ Tech Stack & Architecture

- **Frontend Framework:** React 18.3 (Hooks, Concurrent Mode)
- **Language:** TypeScript 5.5
- **Styling:** Tailwind CSS 3.4 (with customized digital LED typography and neon glow effects)
- **Acoustic Audio:** `pitchfinder` (YIN Pitch Detection Algorithm), Web Audio API Synthesizer
- **Video Playback:** YouTube IFrame API with native synced karaoke tracks
- **Icons:** `lucide-react`
- **QR Code:** `qrcode.react`
- **State & Realtime Sync:** Browser `BroadcastChannel` + Supabase Realtime Channels

---

## 📜 7-Day Sprint Roadmap

- [x] **Day 1:** Project Initialization, Tailwind Theme & Supabase Schema
- [x] **Day 2:** 523-Track Song Catalog, Fast Search & Queue System
- [x] **Day 3:** Dual-Screen Room Pairing & Realtime Broadcast Channels
- [x] **Day 4:** TV Host View & Synced YouTube Karaoke Playback
- [x] **Day 5:** YIN Acoustic Pitch Detection & Authentic 100-Point Scoring
- [x] **Day 6:** 3×4 Mobile Keypad, Responsive Songbook & Web Audio Soundboard
- [x] **Day 7:** Multi-Device Concurrency Testing, Vercel SPA Config & v1.0.0 Release

---

## 📄 License

This project is open-source under the [MIT License](LICENSE).
