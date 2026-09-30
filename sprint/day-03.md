# Day 3: Mobile Remote Control, 3x4 Keypad & Queue Management
**Sprint:** 7-Day PinoyVideoke Implementation  
**Phase:** Phase 2 (Cont.) & Phase 3 Entry – Client Keypad & Queue Sync  
**Focus:** Mobile UX, Touch Optimization, 3x4 Keypad Matrix, LED Display & Queue State Architecture  
**Referenced Skills:** `frontend-developer`, `responsive-web-design`, `ui-styling`, `security-auditor`, `andrej-karpathy-skill`

---

## 1. Day 3 Objectives & Architectural Goal
Day 3 brings the tactile nostalgia of Megapro and Platinum videoke remotes to the guest's mobile phone:
1. Build an authentic **5-digit LED readout display** with real-time numeric entry and song title preview.
2. Construct a responsive **3x4 tactile keypad** (`1-9`, `Clear`, `0`, `Enter`) with mobile haptic feedback.
3. Build a searchable **Songbook catalog tab** with category chips (Tagalog, English, Pop, Rock).
4. Implement the **Queue Management drawer** allowing guests to add tracks with their name, reorder, or delete entries.
5. Secure all input on the server against XSS and injection attacks.

---

## 2. In-Depth Learning Module: Node.js & React Concepts

### 2.1 React Deep Dive: Touch Interaction, Haptics & Mobile Latency
- **The 300ms Mobile Click Delay Problem:**
  On mobile browsers, traditional `onClick` handlers historically incurred a ~300ms delay while the browser waited to see if the user was double-tapping to zoom.
  In a videoke keypad, a 300ms delay ruins the physical button feel.
  **Solution:** We apply Tailwind's `touch-manipulation` CSS utility to all keypad buttons:
  ```html
  <button className="touch-manipulation active:scale-95 transition-transform ...">
  ```
- **Haptic Vibration API (`navigator.vibrate`):**
  When a user taps a physical remote button, their finger feels tactile feedback. We replicate this on Android/mobile browsers:
  ```typescript
  export const triggerHaptic = (durationMs = 15) => {
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate(durationMs);
    }
  };
  ```
- **State Collocation (Keypad vs Queue):**
  Keep state as close to where it's used as possible. The typed 5-digit string (`"04521"`) does NOT need to live in global state; it belongs strictly inside `KeypadView.tsx`. Only when `Enter` is confirmed is the queue payload sent over Socket.io.

### 2.2 React Deep Dive: Debounced Search & Memoization
In the Songbook tab, users search through hundreds of songs. If we trigger an API call on every single keystroke (`onChange`), we flood the server and cause UI stuttering.
- **Debouncing:** Delays execution until the user stops typing for 250ms.
- **`useMemo` for Client Filtering:** If songs are preloaded into memory, filter with zero server roundtrips:
  ```typescript
  const filteredSongs = useMemo(() => {
    if (!searchTerm) return songs;
    const lower = searchTerm.toLowerCase();
    return songs.filter(
      (s) => s.title.toLowerCase().includes(lower) || s.artist.toLowerCase().includes(lower)
    );
  }, [songs, searchTerm]);
  ```

### 2.3 Node.js Deep Dive: Queue Concurrency & Input Sanitization (Skill: `security-auditor`)
When multiple drunk party guests mash buttons simultaneously:
1. **Race Conditions in Queue Reordering:**
   If Guest A deletes song 2 while Guest B moves song 3 to top, positional indexes can desync.
   **Solution:** Identify queue items by unique UUIDs (`queueId`), not array indexes.
2. **Input Validation:**
   Never trust client input. Ensure the song code matches `^\d{5}$` and sanitize singer names to prevent XSS:
   ```typescript
   socket.on('queue:add', async ({ roomCode, songCode, singerName }) => {
     // Validate 5-digit code format
     if (!/^\d{5}$/.test(songCode)) {
       return socket.emit('error', { message: 'Invalid 5-digit song code.' });
     }
     // Sanitize singer name (prevent script injection)
     const cleanSinger = (singerName || 'Guest').trim().slice(0, 30);

     const song = await db('songs').where({ code: songCode }).first();
     if (!song) {
       return socket.emit('error', { message: 'Song code not found.' });
     }

     const newItem = {
       id: crypto.randomUUID(),
       room_code: roomCode,
       song_id: song.id,
       singer_name: cleanSinger,
       position: await getNextQueuePosition(roomCode),
     };

     await db('queue_items').insert(newItem);
     
     // Broadcast updated queue to ALL devices in the room
     const updatedQueue = await getRoomQueue(roomCode);
     io.to(roomCode).emit('queue:updated', updatedQueue);
   });
   ```

---

## 3. Step-by-Step Implementation Tasks

### Task 1: 5-Digit LED Display Component (`client/src/components/remote/LedDisplay.tsx`)
1. Create a retro digital readout container with amber glowing text (`font-mono text-amber-400`).
2. Show placeholders for 5 digits: `[ 0 ] [ 4 ] [ 5 ] [ _ ] [ _ ]`.
3. Query the song preview as soon as digits change; if code exists in the database, show title and artist in cyan below the digits.

### Task 2: 3x4 Matrix Keypad Component (`client/src/components/remote/Keypad.tsx`)
1. Render standard phone grid:
   - Row 1: `[1] [2] [3]`
   - Row 2: `[4] [5] [6]`
   - Row 3: `[7] [8] [9]`
   - Row 4: `[CLEAR]` (Red), `[0]`, `[ENTER]` (Cyan / Glow)
2. Handle numeric input: limit string length to 5 characters.
3. On `Enter`: open modal asking for "Singer Name (Optional)" -> emit `queue:add`.

### Task 3: Mobile Songbook Browser (`client/src/components/remote/Songbook.tsx`)
1. Search input with clear button.
2. Category chips: `All`, `Tagalog / OPM`, `English`, `Favorites`.
3. Song item card: displays 5-digit code badge in yellow, song title, artist, and 1-tap "Reserve" button.

### Task 4: Queue Management Drawer (`client/src/components/remote/QueueDrawer.tsx`)
1. Real-time playlist display showing upcoming singers and track names.
2. Actions:
   - ⬆️ "Move to Top" (Priority play next).
   - 🗑️ "Remove" (Removes from queue).
3. Live indicator for currently playing track.

---

## 4. Git Version Control & GitHub Workflow

### Branch Strategy
```bash
git checkout -b feat/day-3-mobile-remote-keypad
```

### Atomic Commit Plan (Conventional Commits)
1. `feat(client): implement LedDisplay component with glowing 5-digit placeholder`
2. `feat(client): implement 3x4 Matrix Keypad with haptic vibration and audio feedback`
3. `feat(client): add singer name reservation modal upon keypad submission`
4. `feat(client): build searchable mobile Songbook catalog with category filter chips`
5. `feat(server): add input validation and sanitization for queue:add and queue:reorder`
6. `feat(client): implement QueueDrawer with move-to-top and delete functionality`

---

## 5. Karpathy Verification & Definition of Done (DoD)

Apply the **Four Checks** (`andrej-karpathy-skill`):
1. **Assumption:** Users will use smartphones with touch capabilities; keypad must fit on one screen without scrolling (`100dvh`).
2. **Changed:** Mobile Remote UI, Keypad, LED display, Songbook, and Queue management.
3. **Verified:**
   - [ ] On mobile view, type `0`, `1`, `0`, `0`, `1` on keypad -> Display displays `01001` and previews "Anak - Freddie Aguilar".
   - [ ] Press `ENTER` -> Enter singer name "Tito Boy" -> Press Submit.
   - [ ] Check TV Host view (`/host`) -> Queue updates immediately showing "Anak (Tito Boy)".
   - [ ] Check Songbook tab -> Filter by "Tagalog" -> Click "Reserve" on "Ang Huling El Bimbo" -> Track appends to queue.
4. **Remaining Risk:** Queue reorder conflicts when multiple remotes reorder at once (mitigated by server-side sequence locking).
