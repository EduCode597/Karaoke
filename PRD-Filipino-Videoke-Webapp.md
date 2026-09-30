# Product Requirement Document (PRD)
## Filipino-Style Videoke Web Application ("PinoyVideoke")

**Document Version:** 1.0.0  
**Status:** Draft / Technical Blueprint  
**Target Stack:** React, Node.js (Express), Socket.io, Tailwind CSS, Web Audio API, YouTube IFrame API, LRCLIB API  

---

## 1. Executive Summary & Vision

### 1.1 Vision
The goal of **PinoyVideoke** is to replicate the iconic experience of Filipino Videoke machines (such as Megapro, Platinum, and TJ Media) in a modern, lightweight web application. The application enables users to host home karaoke sessions using a **dual-screen architecture**: a primary display (TV / Host Screen) renders video playback and synchronized lyrics, while guest smartphones serve as wireless 5-digit keypads and remote controls.

### 1.2 Core Pillars
1. **5-Digit Songbook Navigation**: Traditional numeric code input alongside modern search by artist and title.
2. **Dual-Screen Real-Time Synchronization**: Room-based WebSockets connecting the main TV view to mobile remote controls without requiring native mobile app downloads.
3. **Synchronized LRC Lyrics & YouTube Integration**: Seamless playback powered by the YouTube IFrame API and line-by-line lyric animation.
4. **Authentic Videoke Scoring**: Real-time microphone audio processing using the Web Audio API and pitch detection algorithms to compute singing accuracy scores.
5. **Nostalgic Neon Aesthetic**: A high-contrast dark theme built with Tailwind CSS, featured glowing text, digital LED displays, and party UI overlays.

---

## 2. System Architecture & Tech Stack

```
+-----------------------------------------------------------------------+
|                             CLIENT LAYER                              |
|                                                                       |
|  +-------------------------------+   +-----------------------------+  |
|  |       TV HOST VIEW (React)    |   |    MOBILE REMOTE VIEW (React)|  |
|  | - YouTube IFrame Player       |   | - 5-Digit Numeric Keypad    |  |
|  | - react-lrc Lyric Renderer    |   | - Digital LED Display       |  |
|  | - Web Audio Pitch Detector    |   | - Song Search & Filter      |  |
|  | - Score Overlay & Cheer SFX   |   | - Queue Manager & Re-order  |  |
|  +---------------+---------------+   +--------------+--------------+  |
|                  |                                  |                 |
+------------------|----------------------------------|-----------------+
                   | WebSockets / HTTP                | WebSockets / HTTP
                   v                                  v
+-----------------------------------------------------------------------+
|                             SERVER LAYER                              |
|                                                                       |
|   +----------------------------------------------------------------+  |
|   |                   Node.js + Express Server                     |  |
|   |  - Socket.io Event Gateway (Room Multiplexing & Queue Sync)    |  |
|   |  - REST API Routes (/api/songs, /api/lyrics, /api/queue)       |  |
|   |  - LRCLIB API Proxy & YouTube Metadata Parser                  |  |
|   +-------------------------------+--------------------------------+  |
|                                   |                                   |
|                                   v                                   |
|   +----------------------------------------------------------------+  |
|   |                   Database (SQLite / PostgreSQL)               |  |
|   |  - Songs Table (5-digit code, title, artist, youtubeId, lrcId) |  |
|   |  - Rooms & Active Queue Sessions                               |  |
|   +----------------------------------------------------------------+  |
+-----------------------------------------------------------------------+
```

### 2.1 Technology Matrix
- **Frontend**: React 18, React Router v6, Tailwind CSS v3, `react-lrc`
- **Backend**: Node.js v20+, Express.js v4, Socket.io v4
- **Database**: SQLite3 (with `knex` or `prisma` ORM) for lightweight local hosting
- **Audio & Media**: Web Audio API (`AudioContext`, `AnalyserNode`), `pitchfinder` library (YIN pitch detection algorithm), YouTube IFrame Player API
- **Lyrics Service**: LRCLIB API client (`lrclib-api`) for automated fetching of synchronized lyrics

---

## 3. Detailed Functional Specifications

### 3.1 Module 1: 5-Digit Songbook & Indexing Engine
The system assigns every track a unique 5-digit numeric code (e.g., `12345` for "Anak" by Freddie Aguilar).

#### Key Requirements:
- **Numeric Lookup**: Entering a 5-digit code immediately fetches song details.
- **Search Capabilities**: Fuzzy text search across track titles, artist names, and language tags (e.g., Tagalog, OPM, English, Ilocano).
- **Song Data Ingestion**: Admin CLI script to bulk-import songs from JSON or CSV files into the SQLite database.

```typescript
interface Song {
  id: number;
  code: string;            // 5-digit code (e.g., "04521")
  title: string;
  artist: string;
  language: 'Tagalog' | 'English' | 'Other';
  youtubeId: string;       // YouTube Video ID (e.g., "dQw4w9WgXcQ")
  lrcContent?: string;     // Raw LRC text format
  keyOffset: number;       // Default pitch transpose (-6 to +6)
  duration: number;        // Duration in seconds
}
```

---

### 3.2 Module 2: Dual-Screen Socket.io Real-Time Engine
The system uses Socket.io room multiplexing to pair mobile remotes with a specific TV screen room.

#### Room Connection Flow:
1. The **TV Host View** initializes and requests a new room session (e.g., Room Code: `Kanta-88`).
2. The TV screen renders a prominent **QR Code** containing the mobile URL (`https://app.domain/remote?room=Kanta-88`).
3. Guests scan the QR code to open the **Mobile Remote Control** interface.
4. All queue updates, pause/play events, and skip requests broadcast instantly to all connected devices in the room.

```typescript
// Socket.io Client-Server Event Protocol
interface ServerToClientEvents {
  'room:state': (data: RoomState) => void;
  'queue:updated': (queue: QueueItem[]) => void;
  'player:action': (action: 'play' | 'pause' | 'skip' | 'replay' | 'transpose', payload?: any) => void;
  'score:announced': (result: ScoreResult) => void;
}

interface ClientToServerEvents {
  'room:join': (roomCode: string, deviceType: 'host' | 'remote') => void;
  'queue:add': (songCode: string, singerName?: string) => void;
  'queue:remove': (queueId: string) => void;
  'queue:reorder': (queueIds: string[]) => void;
  'player:control': (command: string, value?: any) => void;
  'mic:pitch_sample': (pitchData: { pitch: number; clarity: number }) => void;
}
```

---

### 3.3 Module 3: YouTube Playback & Lyric Synchronization

#### Player Component Specifications:
- **YouTube IFrame Embed**: Embedded inside the TV Host view. Video background can be toggled between the official video or generic background visuals.
- **`react-lrc` Component Integration**: Uses the `react-lrc` component to parse LRC strings (`[mm:ss.xx] lyric text`) and align the active line with `player.getCurrentTime()`.
- **Auto-Scrolling & Highlighting**:
  - Highlights active lyric lines with a vibrant neon yellow/cyan glow.
  - Smoothly scrolls upcoming lines into the middle of the lyrics viewport.
  - Supports dual-line subtitle overlay at the bottom of the video player for traditional Videoke look.

```jsx
import { Lrc } from 'react-lrc';

export function VideokeLyricsOverlay({ lrcString, currentMillisecond }) {
  return (
    <div className="absolute bottom-10 left-0 right-0 z-20 px-8 text-center bg-black/60 backdrop-blur-md py-4">
      <Lrc
        lrc={lrcString}
        currentMillisecond={currentMillisecond}
        lineRenderer={({ active, line }) => (
          <p className={`text-2xl font-bold transition-all duration-150 ${
            active 
              ? 'text-yellow-300 scale-110 drop-shadow-[0_0_12px_rgba(253,224,71,0.8)] font-mono' 
              : 'text-gray-400 opacity-60 font-sans'
          }`}>
            {line.text}
          </p>
        )}
      />
    </div>
  );
}
```

---

### 3.4 Module 4: Web Audio Pitch Detection & Scoring System

#### Audio Pipeline Architecture:
1. Request user microphone via `navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false } })`.
2. Direct audio stream to a Web Audio `AnalyserNode` with `fftSize = 4096`.
3. Periodically sample audio frames and run the **YIN Pitch Detection algorithm** (`pitchfinder.YIN()`) to extract fundamental frequency ($F_0$ in Hz).
4. Map detected $F_0$ to musical note numbers:  
   $$\text{Note} = 69 + 12 \times \log_2\left(\frac{f}{440}\right)$$
5. Compare user note against expected target pitches extracted from timed LRC notes, calculating accuracy percentages and assigning an authentic 100-point Videoke score accompanied by festive fanfare sound effects.

```javascript
import { YIN } from 'pitchfinder';

const detectPitch = YIN({ sampleRate: 48000 });

export function sampleMicrophonePitch(analyserNode, audioBuffer) {
  analyserNode.getFloatTimeDomainData(audioBuffer);
  const pitchHz = detectPitch(audioBuffer);
  
  if (pitchHz && pitchHz > 50 && pitchHz < 1500) {
    const midiNote = Math.round(69 + 12 * Math.log2(pitchHz / 440));
    return { pitchHz, midiNote, confidence: 1.0 };
  }
  return null;
}
```

---

## 4. UI/UX Design System & Tailwind CSS Hierarchy

### 4.1 Theme Palette
- **Background**: `bg-slate-950` (`#030712`)
- **Accent Neon Cyan**: `text-cyan-400` (`#06b6d4`), `shadow-[0_0_15px_#06b6d4]`
- **Accent Neon Magenta**: `text-fuchsia-500` (`#d946ef`)
- **Videoke Yellow LED**: `text-amber-400` (`#fbbf24`), `font-mono`
- **Surface Panels**: `bg-slate-900/80 border border-slate-800 backdrop-blur-lg`

### 4.2 Key Interfaces

#### 1. TV Host View (`/host`)
- **Top Ticker Banner**: Displays room QR Code, current room code, and "Up Next: [Singer Name] - [Song Title]".
- **Main Area**: Split layout or full-screen video player with bottom lyric banner overlay.
- **Side Panel**: Real-time playlist queue drawer with drag-and-drop / skip buttons.

#### 2. Mobile Remote Control (`/remote`)
- **Digital LED Display**: Header showing currently typed 5-digit code or current playing track.
- **Keypad Matrix**: 3x4 grid of buttons (`1-9`, `Clear`, `0`, `Enter`).
- **Tab Navigation**:
  - 🔢 **Keypad**: Direct numeric entry.
  - 🔍 **Songbook**: Search by title/artist with category chips (Tagalog, English, Pop, Rock).
  - 📋 **Queue**: List of upcoming songs with "Move to Top" and "Delete" controls.

---

## 5. API Endpoints & Data Schemas

### 5.1 Database Models

```sql
-- Songs Table
CREATE TABLE songs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  code VARCHAR(5) UNIQUE NOT NULL,
  title VARCHAR(255) NOT NULL,
  artist VARCHAR(255) NOT NULL,
  language VARCHAR(50) DEFAULT 'English',
  youtube_id VARCHAR(50) NOT NULL,
  lrc_id INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Active Queue Table
CREATE TABLE queue_items (
  id VARCHAR(36) PRIMARY KEY,
  room_code VARCHAR(10) NOT NULL,
  song_id INT NOT NULL,
  singer_name VARCHAR(100) DEFAULT 'Guest',
  position INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (song_id) REFERENCES songs(id)
);
```

### 5.2 REST Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/songs` | List songs with pagination and filtering (`?search=`, `?lang=`) |
| `GET` | `/api/songs/code/:code` | Retrieve song by 5-digit numeric code |
| `GET` | `/api/lyrics/sync` | Fetch synced LRC lyrics from database or LRCLIB proxy |
| `POST` | `/api/songs` | Admin endpoint to add new track entries |

---

## 6. Implementation Roadmap

### Phase 1: Core Backend & Database Setup
- [ ] Initialize Express.js application with TypeScript and SQLite (`knex`).
- [ ] Implement database migrations for `songs` and `queue_items`.
- [ ] Seed database with initial OPM and English karaoke song entries.
- [ ] Build REST API routes for song lookup and lyrics fetching.

### Phase 2: Socket.io Infrastructure & Dual View Link
- [ ] Configure Socket.io server with room creation and room joining handlers.
- [ ] Build React TV Host View with room creation and QR code generator (`qrcode.react`).
- [ ] Build Mobile Remote Keypad View with numeric button handlers and Socket emit calls.
- [ ] Test real-time queue synchronization between mobile keypad and TV screen.

### Phase 3: Player Engine & Lyric Synchronization
- [ ] Embed YouTube IFrame Player in TV Host View.
- [ ] Integrate `react-lrc` component with YouTube playback time polling loop (`requestAnimationFrame`).
- [ ] Add pitch shift controls (`keyOffset`) using Web Audio API or YouTube playback rate options.

### Phase 4: Pitch Detection & Scoring System
- [ ] Implement `getUserMedia()` microphone stream capture on TV or Mobile device.
- [ ] Hook `pitchfinder` YIN algorithm to process `AnalyserNode` float buffers.
- [ ] Develop 100-point Videoke scoring algorithm and celebratory sound effects overlay.

### Phase 5: Tailwind Styling & Final Testing
- [ ] Apply dark neon Videoke styling across TV and Mobile Remote components.
- [ ] Verify low-latency real-time performance across multiple connected mobile devices.
- [ ] Package app with Docker container or local startup script for home party deployment.

---

*End of Product Requirement Document.*
