# Day 4: TV Host Video Engine & Synchronized LRC Lyrics
**Sprint:** 7-Day PinoyVideoke Implementation (Serverless Cloud Edition)  
**Phase:** Phase 3 – Player Engine & Lyric Synchronization  
**Focus:** YouTube IFrame API, `react-lrc` Integration, High-Precision Timing Loops & Supabase Broadcast Controls  
**Referenced Skills:** `frontend-developer`, `vercel-react-best-practices`, `ui-styling`, `andrej-karpathy-skill`

---

## 1. Day 4 Objectives & Architectural Goal
Day 4 delivers the centerpiece TV display featuring smooth YouTube video playback and synchronized lyrics:
1. Embed and control the **YouTube IFrame API** in React without triggering component re-mounts.
2. Build a high-performance **synchronization loop** using `requestAnimationFrame` to match video playback to lyrics.
3. Integrate **`react-lrc`** with custom retro Filipino videoke styling (neon yellow/cyan glow and smooth line scrolling).
4. Connect remote playback controls (`play`, `pause`, `skip`, `replay`) from mobile phones to the TV player via **Supabase Realtime Broadcast**.
5. Implement automatic queue progression: when a video ends, the next song in Supabase plays seamlessly.

---

## 2. In-Depth Learning Module: YouTube API & Lyric Synchronization

### 2.1 React Deep Dive: Controlling Imperative YouTube API with `useRef`
The YouTube IFrame Player is a non-React imperative API.
- **Why `useRef` instead of `useState`?**
  Storing the `player` object in `useState` triggers component re-renders whenever internal player properties change. We store the player instance inside a mutable `useRef` object (`playerRef.current`) to keep renders decoupled from playback state.
- **Idempotent Script Loading:**
  We inject the YouTube IFrame API script tag dynamically into `<head>` only once, using a custom hook `useYouTubeApi()`.

### 2.2 60fps Lyric Sync Loop (`requestAnimationFrame`)
Lyrics in videoke must light up in exact synchronization with the vocals.
- **Why NOT `setInterval`?**
  Timers in JavaScript drift, jitter, and get throttled when the tab loses focus.
- **The `requestAnimationFrame` Solution:**
  `requestAnimationFrame` aligns with the display's 60Hz or 120Hz refresh cycle (~16.6ms intervals), polling `playerRef.current.getCurrentTime()` for sub-frame accuracy.
  ```typescript
  useEffect(() => {
    let animId: number;

    const syncLoop = () => {
      if (playerRef.current && typeof playerRef.current.getCurrentTime === 'function') {
        const timeSec = playerRef.current.getCurrentTime();
        setCurrentMillisecond(Math.floor(timeSec * 1000));
      }
      animId = requestAnimationFrame(syncLoop);
    };

    animId = requestAnimationFrame(syncLoop);
    return () => cancelAnimationFrame(animId);
  }, []);
  ```

### 2.3 Remote Control via Supabase Realtime Broadcast
When someone presses "Skip" or "Pause" on their phone:
1. Mobile Remote dispatches:
   ```typescript
   channel.send({
     type: 'broadcast',
     event: 'player:action',
     payload: { action: 'skip' }
   });
   ```
2. TV Host receives event in $<20\text{ms}$ and executes the corresponding player method:
   ```typescript
   channel.on('broadcast', { event: 'player:action' }, ({ payload }) => {
     switch (payload.action) {
       case 'play': playerRef.current?.playVideo(); break;
       case 'pause': playerRef.current?.pauseVideo(); break;
       case 'skip': handleAdvanceQueue(); break;
       case 'replay': playerRef.current?.seekTo(0, true); break;
     }
   });
   ```

---

## 3. Step-by-Step Implementation Tasks

### Task 1: Controlled YouTube Player (`client/src/components/player/YouTubePlayer.tsx`)
1. Create a 16:9 container (`aspect-video w-full bg-black relative overflow-hidden`).
2. Initialize `new window.YT.Player` with parameters:
   - `autoplay: 1`
   - `controls: 0` (Hide default YouTube controls for an authentic videoke machine feel)
   - `rel: 0` (Prevent related videos at end of playback)
3. Handle player lifecycle events:
   - `onStateChange: 0` (Video Ended) -> mark song completed in Supabase and trigger next song.

### Task 2: Synchronized Lyrics Overlay (`client/src/components/player/LyricsOverlay.tsx`)
1. Integrate `react-lrc` inside a floating semi-transparent glass panel at the bottom of the video.
2. Authentic Filipino Videoke styling:
   - **Active line:** Glowing Yellow/Amber (`#fde047`), bold monospace font, enlarged bounce scale (`scale-110`), glowing drop shadow.
   - **Upcoming lines:** Slate/Gray (`#94a3b8`), opacity `0.6`.
3. Support dual-line subtitle preview so singers can anticipate upcoming verses.

### Task 3: Dual Background Toggle
Provide a button on the TV Host screen:
- **Mode A (Default):** Native YouTube video background.
- **Mode B (Nostalgic KTV):** Muted retro videoke background loop (nature, tropical beach, 90s city lights) with lyrics displayed front and center.

### Task 4: Queue Auto-Progression in Supabase
1. When YouTube signals playback completion (`YT.PlayerState.ENDED`):
2. Update the completed song status in Supabase:
   ```typescript
   await supabase.from('queue_items').update({ status: 'completed' }).eq('id', currentQueueId);
   ```
3. Load the next queued song and fetch its synced `.lrc` lyrics.

---

## 4. Git Version Control & GitHub Workflow

### Branch Strategy
```bash
git checkout -b feat/day-4-player-and-lyrics-sync
```

### Atomic Commit Plan (Conventional Commits)
1. `feat(client): implement useYouTubeApi hook for safe external script loading`
2. `feat(client): build controlled YouTubePlayer component with lifecycle state events`
3. `feat(client): implement requestAnimationFrame sync loop for millisecond-level time tracking`
4. `feat(client): integrate react-lrc with custom neon videoke styling and dual-line layout`
5. `feat(client): wire remote player controls via Supabase Realtime Broadcast`
6. `feat(client): implement automatic queue progression when song playback completes`

---

## 5. Karpathy Verification & Definition of Done (DoD)

Apply the **Four Checks** (`andrej-karpathy-skill`):
1. **Assumption:** Seeded YouTube video IDs have embedding enabled.
2. **Changed:** TV Host player component, lyric synchronizer, and Supabase broadcast command router.
3. **Verified:**
   - [ ] Queue "Anak" by Freddie Aguilar -> Video starts playing on the TV Host view.
   - [ ] Lyrics appear at the bottom of the screen and illuminate in lockstep with the vocals.
   - [ ] Tap "Pause" on mobile remote -> Video pauses immediately on the TV.
   - [ ] Tap "Play" on mobile -> Video resumes.
   - [ ] Tap "Skip" on mobile -> Current song ends and next queued song plays.
4. **Remaining Risk:** YouTube autoplay policies require at least one user interaction on the page before playing audio. (Add "Start Videoke Session" button on the TV view).
