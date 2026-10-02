# PinoyVideoke: Native YouTube Karaoke Video Integration & Catalog Expansion Plan

> **Date:** October 2, 2026  
> **Status:** Approved for Implementation (Scheduled for Tomorrow)  
> **Target Scope:**
>
> 1. Replace client-side `.lrc` overlay with native YouTube Karaoke video streams (CoversPH, KaraokeyTV, Sing King, Pro Music Cover) for 100% synchronized lyrics and authentic videoke animations.
> 2. Expand song catalog from 12 to **30 iconic videoke anthems** (OPM legends, Aegis belters, 90s rock, and classic party anthems).

## 1. Executive Summary & Root Cause Analysis

### The Problem

During manual testing of "Ang Huling El Bimbo" (`ih_1qXYDXO4`):

- The visual lyrics in `<LyricsOverlay>` were appearing **5 to 11 seconds ahead** of the vocal audio.
- `<LyricsOverlay>` was hovering over the bottom of the video, obscuring the built-in animated lyrics already present in the video.

### Root Cause

1. **Intro & Bumper Timeline Drift**:
   - YouTube video streams frequently contain channel title bumpers, logo animations, or count-ins (e.g., the 11-second wireframe intro in the official lyric video).
   - Standard `.lrc` files assume an audio track starting at `00:00.00`.
   - Any variation in video intro immediately breaks synchronization.
2. **Line-Level vs. Syllable-Level Wiping**:
   - The `<LyricsOverlay>` could only highlight entire lines at a time.
   - Real videoke channels (**CoversPH**, **KaraokeyTV**) feature authentic syllable-by-syllable color-wipe text (yellow/blue wiping to bright red), countdown dots (`● ● ● ●`), and musical cues rendered natively at 60fps in the video stream.

---

## 2. Target Architecture

```
┌────────────────────────────────────────────────────────┐
│                   PinoyVideoke TV Stage                │
│                                                        │
│  ┌──────────────────────────────────────────────────┐  │
│  │  Top Ticker: Room Code • Clock • Live Queue      │  │
│  └──────────────────────────────────────────────────┘  │
│                                                        │
│  ┌──────────────────────────────────────────────────┐  │
│  │  [Now Playing Banner: Title • Artist • Singer]   │  │ <── Auto-fades after 6s
│  │                                                  │  │
│  │          FULL HD YOUTUBE KARAOKE VIDEO           │  │
│  │                                                  │  │
│  │     ● ● ● ● (3-2-1 Intro Count-in Dots)          │  │ <── Built into video
│  │   "Kamukha mo si Paraluman..." (Color Wiping)    │  │ <── Built into video
│  │                                                  │  │
│  └──────────────────────────────────────────────────┘  │
│                                                        │
│  ┌─────────────────────────┐  ┌─────────────────────┐  │
│  │  Mic Pitch Meter (YIN)  │  │ Host Control Strip  │  │
│  └─────────────────────────┘  └─────────────────────┘  │
└────────────────────────────────────────────────────────┘
```

### Key Architectural Benefits

- **Zero Drift / 100% In-Sync:** Audio and animated lyrics are stored within the exact same video stream.
- **Unobstructed View:** The video stage is 100% visible without heavy dark overlays blocking the text.
- **Effortless Song Catalog Expansion:** Adding a new song to Supabase only requires finding a YouTube Karaoke ID—no need to author or calibrate timestamped `.lrc` files.
- **Preserved Feature Matrix:** Mobile remote controls, 5-digit keypad, soundboard (Airhorn/Gong), realtime queueing, and the 100-point pitch scoring engine continue working seamlessly.

---

## 3. Step-by-Step Implementation Tasks (Tomorrow's Checklist)

### Task 1: Replace Heavy Overlay with Sleek "Now Playing" Banner

- **Files to edit:**
  - `src/components/player/LyricsOverlay.tsx` (refactored into unobtrusive `NowPlayingBanner.tsx`)
  - `src/views/HostView.tsx`
- **Behavior:**
  - When a song starts, display a sleek glassmorphic banner:
    `🎵 Now Singing: [Song Title] — [Artist] | Mic: [Singer Name]`
  - Auto-fades after 6 seconds so the singer has an unobstructed view of the karaoke lyrics.
  - Re-appears briefly when paused or resumed.

### Task 2: Remove Fragile 60fps Time Sync Loop

- **Files to edit:**
  - `src/components/player/YouTubePlayer.tsx`
  - `src/views/HostView.tsx`
- **Behavior:**
  - Remove `requestAnimationFrame` polling of `getCurrentTime()`.
  - Retain only event-based listeners: `onStateChange` (`PLAYING`, `PAUSED`, `ENDED`).
  - Eliminates unnecessary state re-renders in `HostView`, keeping CPU usage near zero.

### Task 3: Seed Expanded 30-Song Catalog

- **Files to edit:**
  - `src/lib/songs.ts` (in-memory catalog for offline/local testing)
  - `scripts/seed-songs.ts` (Supabase database seed script)
- **Target Video Sources:**
  - **CoversPH:** Gold standard for Pinoy classics (Eraserheads, Parokya ni Edgar, Aegis, Rivermaya, Rey Valera).
  - **KaraokeyTV:** High quality OPM and international karaoke backing tracks.
  - **Sing King / Pro Music Cover:** High-definition English hits (Sinatra, ABBA, Cranberries, Queen, Journey, Bon Jovi).

### Task 4: Verification & Automated Embed Check

- Run automated embed verification script (`scripts/check-candidates.ts`) to ensure all 30 video IDs allow third-party embedding.
- Run `npm run dev` and test:
  1. Queuing songs via remote keypad (`01001` - `01030`) and search filter.
  2. Confirm video plays with clear, unobstructed color-wipe lyrics.
  3. Confirm remote Pause/Play/Replay/Skip buttons respond instantly.
  4. Confirm Soundboard (Airhorn, Gong, Applause) fires over the audio.
  5. Sing into microphone and verify pitch detection & 100-point score modal upon song completion.

---

## 4. Expanded 30-Song Pinoy Videoke Catalog

The catalog is expanded from 12 to 30 songs, covering the ultimate staple videoke playlist:

### Part A: Classic & Modern OPM Anthems (18 Songs)

| Code    | Title                        | Artist             | Language | Recommended Channel Source      |
| :------ | :--------------------------- | :----------------- | :------- | :------------------------------ |
| `01001` | Anak                         | Freddie Aguilar    | Tagalog  | **KaraokeyTV** / CoversPH       |
| `01002` | Ang Huling El Bimbo          | Eraserheads        | Tagalog  | **CoversPH** / KaraokeyTV       |
| `01003` | Tala                         | Sarah Geronimo     | Tagalog  | **CoversPH** / KaraokeyTV       |
| `01004` | Bakit Pa Ba                  | Sarah Geronimo     | Tagalog  | **CoversPH**                    |
| `01006` | Harana                       | Parokya ni Edgar   | Tagalog  | **CoversPH** / KaraokeyTV       |
| `01007` | Narda                        | Kamikazee          | Tagalog  | **CoversPH** / KaraokeyTV       |
| `01009` | Kahit Maputi Na Ang Buhok Ko | Rey Valera         | Tagalog  | **CoversPH**                    |
| `01011` | Torete                       | Moira Dela Torre   | Tagalog  | **CoversPH**                    |
| `01013` | Luha                         | Aegis              | Tagalog  | **CoversPH** (High-note anthem) |
| `01014` | Halik                        | Aegis              | Tagalog  | **CoversPH**                    |
| `01015` | Basang-Basa Sa Ulan          | Aegis              | Tagalog  | **CoversPH**                    |
| `01016` | Kisapmata                    | Rivermaya          | Tagalog  | **CoversPH** / KaraokeyTV       |
| `01017` | 214                          | Rivermaya          | Tagalog  | **CoversPH**                    |
| `01018` | Bituing Walang Ningning      | Sharon Cuneta      | Tagalog  | **CoversPH** / KaraokeyTV       |
| `01019` | Sana Maulit Muli             | Gary Valenciano    | Tagalog  | **CoversPH**                    |
| `01020` | Panalangin                   | APO Hiking Society | Tagalog  | **CoversPH**                    |
| `01021` | Jeepney                      | Sponge Cola        | Tagalog  | **CoversPH**                    |
| `01022` | Beer                         | Itchyworms         | Tagalog  | **CoversPH**                    |

### Part B: English Party & Videoke Legends (12 Songs)

| Code    | Title                             | Artist                 | Language | Recommended Channel Source      |
| :------ | :-------------------------------- | :--------------------- | :------- | :------------------------------ |
| `01005` | My Way                            | Frank Sinatra          | English  | **Sing King** / Pro Music Cover |
| `01008` | Dancing Queen                     | ABBA                   | English  | **Sing King**                   |
| `01010` | Zombie                            | The Cranberries        | English  | **Sing King**                   |
| `01012` | Total Eclipse of the Heart        | Bonnie Tyler           | English  | **Sing King**                   |
| `01023` | Bohemian Rhapsody                 | Queen                  | English  | **Sing King**                   |
| `01024` | Don't Stop Believin'              | Journey                | English  | **Sing King**                   |
| `01025` | Livin' on a Prayer                | Bon Jovi               | English  | **Sing King**                   |
| `01026` | 25 Minutes                        | Michael Learns to Rock | English  | **KaraokeyTV** / Sing King      |
| `01027` | Making Love Out of Nothing at All | Air Supply             | English  | **Sing King** / KaraokeyTV      |
| `01028` | I Will Always Love You            | Whitney Houston        | English  | **Sing King**                   |
| `01029` | Careless Whisper                  | George Michael         | English  | **Sing King**                   |
| `01030` | Wonderwall                        | Oasis                  | English  | **Sing King**                   |

---

## 5. Automated Playlist Scraper Pipeline (CoversPH 526-Song Library)

Instead of manually searching for individual videos one by one, we can automatically scrape and ingest the user-provided YouTube playlist:

- **Playlist URL:** `https://www.youtube.com/watch?v=FRgHLHAPfd8&list=PLyMJQPx95_IDAJjWQOExuXvG2Aa8aLKMV`
- **Total Tracks Verified:** **526 full karaoke tracks** from CoversPH!
- **Track Format:** High quality piano and acoustic backing tracks, authentic color-wipe synchronized lyrics, and countdown cues.

### Scraper Pipeline Design (`scripts/scrape-playlist.ts`):

1. **Metadata Extraction:**
   Use `yt-dlp` to dump the JSON metadata of all 526 items in ~8 seconds without downloading any video or audio files.
2. **Title & Artist Regex Normalization:**
   CoversPH video titles follow consistent conventions, e.g.:
   - `"HULING EL BIMBO - Eraserheads (KARAOKE VERSION)"` ➔ Title: `Ang Huling El Bimbo`, Artist: `Eraserheads`
   - `"PAUBAYA - Moira Dela Torre (KARAOKE VERSION)"` ➔ Title: `Paubaya`, Artist: `Moira Dela Torre`
   - `"ARAW-ARAW - Ben & Ben (KARAOKE VERSION)"` ➔ Title: `Araw-Araw`, Artist: `Ben & Ben`
   - `"KABET - Gagong Rapper [It really Hurts! ] (KARAOKE VERSION)"` ➔ Title: `Kabet`, Artist: `Gagong Rapper`
   - `"BEAUTIFUL IN WHITE - Shane Filan (CoversPH WEDDING VERSION)"` ➔ Title: `Beautiful In White`, Artist: `Shane Filan`
3. **Automated 5-Digit Code Assignment:**
   Consecutively assign codes `01001`, `01002`, `01003` ... up to `01526` for keypad dial-in on remote phones.
4. **Language Classification:**
   Automatically tag songs as `Tagalog` or `English` based on artist/title or dictionary keywords for songbook tab filtering.
5. **Batch Ingestion into Supabase & In-Memory Catalog:**
   Save all 526 songs with their search tokens into `scripts/seed-songs.ts` and `src/lib/songs.ts`.

---

## 6. Execution Command for Tomorrow

To run the automated playlist ingestion tomorrow:

```bash
# 1. Scrape playlist and generate clean songs dataset
npx tsx scripts/scrape-playlist.ts --playlist "PLyMJQPx95_IDAJjWQOExuXvG2Aa8aLKMV"

# 2. Seed all 526 songs into Supabase cloud database
npx tsx scripts/seed-songs.ts
```

All 526 songs will immediately become searchable and playable across all mobile remotes and TV screens!
