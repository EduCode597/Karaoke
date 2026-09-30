# Day 4: TV Host Video Engine & Synchronized LRC Lyrics
**Sprint:** 7-Day PinoyVideoke Implementation  
**Phase:** Phase 3 – Player Engine & Lyric Synchronization  
**Focus:** YouTube IFrame API, `react-lrc` Integration, High-Precision Timing Loops & Remote Playback  
**Referenced Skills:** `frontend-developer`, `vercel-react-best-practices`, `ui-styling`, `andrej-karpathy-skill`

---

## 1. Day 4 Objectives & Architectural Goal
Day 4 delivers the visual heart of the videoke experience on the primary TV screen:
1. Embed and control the **YouTube IFrame API** in React without triggering component re-mounts.
2. Build a high-performance **synchronization loop** that matches YouTube playback time to lyric timestamps.
3. Integrate **`react-lrc`** with custom retro Filipino videoke styling (neon yellow/cyan glow and smooth line scrolling).
4. Connect remote playback controls (`play`, `pause`, `skip`, `replay`) from mobile phones to the TV player.
5. Implement automatic queue progression: when a video ends, the next song plays seamlessly.

---

## 2. In-Depth Learning Module: Node.js & React Concepts

### 2.1 React Deep Dive: Managing Non-React Imperative APIs (YouTube IFrame)
The YouTube IFrame Player is an **imperative, non-React DOM library**. Integrating third-party imperative APIs is one of the most common challenges in advanced React development.

#### Rule 1: Never store player instances in `useState`
```typescript
// ❌ WRONG: Causes re-renders whenever the player instance updates
const [player, setPlayer] = useState<YT.Player | null>(null);

// ✅ RIGHT: Store player instance in a useRef
const playerRef = useRef<YT.Player | null>(null);
```
`useRef` holds a mutable reference across renders without triggering a re-render when mutated.

#### Rule 2: Script Injection & StrictMode Idempotence
Ensure the YouTube IFrame API script is only injected once into `<head>`:
```typescript
export function useYouTubeApi() {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (window.YT && window.YT.Player) {
      setIsLoaded(true);
      return;
    }

    // Check if script tag already exists
    if (!document.getElementById('youtube-iframe-script')) {
      const tag = document.createElement('script');
      tag.id = 'youtube-iframe-script';
      tag.src = 'https://www.youtube.com/iframe_api';
      document.body.appendChild(tag);
    }

    window.onYouTubeIframeAPIReady = () => {
      setIsLoaded(true);
    };
  }, []);

  return isLoaded;
}
```

### 2.2 React Performance: High-Precision Sync Loop (`requestAnimationFrame`)
Lyrics in videoke must illuminate exactly as the singer speaks each word. If you use `setInterval(fn, 500)`, timing will stutter, drift, and cause jagged scrolling.

- **Why `requestAnimationFrame` (rAF)?**
  `requestAnimationFrame` synchronizes directly with the monitor's refresh rate (typically 60Hz or 120Hz, ~16.6ms intervals).
- **Avoiding React Re-render Bottlenecks:**
  Instead of updating state on every single frame (which would re-render the entire component tree 60 times a second), only update state when the timestamp crosses into a new lyric line, or pass `currentMillisecond` down to an isolated lyric component:
  ```typescript
  useEffect(() => {
    let animId: number;

    const syncLoop = () => {
      if (playerRef.current && playerRef.current.getPlayerState() === YT.PlayerState.PLAYING) {
        const currentTimeSec = playerRef.current.getCurrentTime();
        setCurrentTimeMs(Math.floor(currentTimeSec * 1000));
      }
      animId = requestAnimationFrame(syncLoop);
    };

    animId = requestAnimationFrame(syncLoop);
    return () => cancelAnimationFrame(animId);
  }, []);
  ```

### 2.3 LRC Format & Parsing
The standard LRC format looks like:
```text
[00:14.25]Nang isilang ka sa mundong ito
[00:21.80]Laking tuwa ng magulang mo
[00:28.45]At ang kamay nila ang iyong ilaw
```
The `react-lrc` library automatically converts this string into timed line objects and manages active line transitions based on `currentMillisecond`.

---

## 3. Step-by-Step Implementation Tasks

### Task 1: Controlled YouTube Player (`client/src/components/player/YouTubePlayer.tsx`)
1. Create a container `div` with responsive 16:9 aspect ratio (`aspect-video w-full bg-black`).
2. Initialize `new window.YT.Player` targeting the container ID.
3. Bind player event listeners:
   - `onReady`: Autoplay and set initial volume.
   - `onStateChange`: Listen for state `0` (`YT.PlayerState.ENDED`) -> emit `player:ended` over Socket.io.
   - `onError`: Handle video restriction/embedding errors gracefully.

### Task 2: Synchronized Lyrics Overlay (`client/src/components/player/LyricsOverlay.tsx`)
1. Integrate `react-lrc` inside a floating semi-transparent glass panel at the bottom of the video.
2. Styling requirements (Authentic Videoke):
   - **Active line:** Bright Amber/Yellow (`#fde047`), bold monospace font, glowing drop shadow (`drop-shadow-[0_0_12px_rgba(253,224,71,0.8)]`), scale `1.1`.
   - **Upcoming lines:** Slate/Gray (`#94a3b8`), opacity `0.6`.
3. Support dual-line preview so singers know the next verse before it begins.

### Task 3: Remote Playback Socket Integration
1. Listen for socket event `player:control` on the TV Host view:
   ```typescript
   socket.on('player:control', ({ command }) => {
     switch (command) {
       case 'play':
         playerRef.current?.playVideo();
         break;
       case 'pause':
         playerRef.current?.pauseVideo();
         break;
       case 'skip':
         handleSkipToNextSong();
         break;
       case 'replay':
         playerRef.current?.seekTo(0, true);
         playerRef.current?.playVideo();
         break;
     }
   });
   ```

### Task 4: Queue Auto-Progression
1. When a video ends, the TV Host emits `song:completed`.
2. The server shifts the completed song from the queue and broadcasts the new active song to all room participants.
3. The TV Host automatically loads the new `youtube_id` and fetches its LRC lyrics.

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
5. `feat(server): wire player:control commands (play/pause/skip/replay) via Socket.io`
6. `feat(client): implement automatic queue progression when song playback completes`

---

## 5. Karpathy Verification & Definition of Done (DoD)

Apply the **Four Checks** (`andrej-karpathy-skill`):
1. **Assumption:** YouTube videos selected in seed data have embedding enabled without geographic blocks.
2. **Changed:** TV Host player component, lyric synchronizer, and remote playback command router.
3. **Verified:**
   - [ ] Queue "Anak" by Freddie Aguilar -> Video starts playing on the TV Host view.
   - [ ] Lyrics appear at the bottom of the screen and highlight synchronously with the singer.
   - [ ] Tap "Pause" on the mobile remote -> TV video pauses instantly.
   - [ ] Tap "Play" on mobile -> Video resumes.
   - [ ] Tap "Skip" on mobile -> Video stops, next song in queue loads automatically.
4. **Remaining Risk:** YouTube autoplay policies require at least one user interaction on the page before playing with sound (we include a "Start Session" button on the TV view).
