# Day 3: Mobile Remote Control, 3x4 Keypad & Supabase Queue Sync
**Sprint:** 7-Day PinoyVideoke Implementation (Serverless Cloud Edition)  
**Phase:** Phase 2 (Cont.) & Phase 3 Entry – Mobile Remote & Live Queue Sync  
**Focus:** 3x4 Matrix Keypad, 5-Digit LED Display, Mobile Haptics & Supabase Postgres Changes  
**Referenced Skills:** `frontend-developer`, `responsive-web-design`, `ui-styling`, `security-auditor`, `andrej-karpathy-skill`

---

## 1. Day 3 Objectives & Architectural Goal
Day 3 delivers the tactile nostalgia of Megapro and Platinum videoke remotes directly to the guest's mobile phone:
1. Build an authentic **5-digit LED digital readout display** with live numeric entry and instant song preview.
2. Construct a responsive **3x4 tactile keypad** (`1-9`, `Clear`, `0`, `Enter`) with mobile haptic feedback (`navigator.vibrate`).
3. Build a mobile **Songbook tab** with full-text search and category filter chips (Tagalog, English, Pop, Rock).
4. Implement the **Queue Management drawer** with real-time updates powered by **Supabase Postgres Changes** (insert, delete, reorder).
5. Ensure mobile viewport responsiveness using `h-[100dvh]` so the remote fits without vertical scrolling.

---

## 2. In-Depth Learning Module: Touch Optimization & Supabase Sync

### 2.1 Mobile Touch Latency & Physical Keypad Feel
On smartphones, tapping a virtual button can feel sluggish if not configured properly:
- **`touch-action: manipulation`**: Removes the 300ms double-tap zoom delay on mobile browsers.
- **Micro-Haptics (`navigator.vibrate`)**: Provides physical feedback when pressing keys:
  ```typescript
  export function triggerHaptic(ms = 15) {
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate(ms);
    }
  }
  ```
- **State Collocation:** Keep the 5-digit typed string (`"04521"`) local to the keypad component. Only trigger a Supabase query when the string length changes.

### 2.2 Live Queue Synchronization via Supabase Postgres Changes
Instead of polling a server, clients subscribe directly to database changes:
```typescript
// Subscribing to real-time changes on the queue_items table for this specific room
const queueSubscription = supabase
  .channel(`queue:${roomCode}`)
  .on(
    'postgres_changes',
    {
      event: '*', // Listen for INSERT, UPDATE, DELETE
      schema: 'public',
      table: 'queue_items',
      filter: `room_code=eq.${roomCode}`
    },
    (payload) => {
      console.log('Queue changed in database:', payload);
      // Fetch latest sorted queue or apply optimistic update
      refreshQueue();
    }
  )
  .subscribe();
```
When Guest A queues a song on their phone:
1. The phone inserts a row into `queue_items` in Supabase.
2. Supabase broadcasts the row change over WebSockets to the TV and all connected remotes.
3. Every screen updates in $<30\text{ms}$ with zero custom backend server code!

### 2.3 Mobile Full-Text Songbook Search
In the Songbook tab, we query Supabase using PostgreSQL full-text search:
```typescript
export async function searchSongs(searchTerm: string, language?: string) {
  let query = supabase.from('songs').select('*');

  if (searchTerm.trim()) {
    query = query.textSearch('search_tokens', searchTerm.trim(), {
      type: 'websearch',
      config: 'english'
    });
  }

  if (language && language !== 'All') {
    query = query.eq('language', language);
  }

  const { data, error } = await query.limit(50);
  if (error) throw error;
  return data;
}
```

---

## 3. Step-by-Step Implementation Tasks

### Task 1: 5-Digit LED Display Component (`client/src/components/remote/LedDisplay.tsx`)
1. Create a retro digital readout container with amber glowing text (`font-mono text-amber-400 bg-slate-950`).
2. Show placeholders for 5 digits: `[ 0 ] [ 4 ] [ 5 ] [ _ ] [ _ ]`.
3. When 5 digits are entered, query `supabase.from('songs').select('*').eq('code', code).single()`.
4. If found, display song title and artist in neon cyan below the readout.

### Task 2: 3x4 Matrix Keypad Component (`client/src/components/remote/Keypad.tsx`)
1. Render 3x4 button grid:
   - Row 1: `[1] [2] [3]`
   - Row 2: `[4] [5] [6]`
   - Row 3: `[7] [8] [9]`
   - Row 4: `[CLEAR]` (Red), `[0]`, `[ENTER]` (Cyan / Glow)
2. Add tactile button press animations: `active:scale-95 transition-transform touch-manipulation`.
3. On `Enter`: open "Singer Name" modal -> insert song into `queue_items`.

### Task 3: Mobile Songbook Tab (`client/src/components/remote/Songbook.tsx`)
1. Search input with real-time debounce (250ms).
2. Category chips: `All`, `Tagalog / OPM`, `English`, `Pop`, `Rock`.
3. Song item card: displays 5-digit code badge in yellow, song title, artist, and 1-tap "Reserve" button.

### Task 4: Queue Management Drawer (`client/src/components/remote/QueueDrawer.tsx`)
1. Real-time playlist display showing upcoming singers and track names.
2. Actions:
   - ⬆️ "Move to Top" (Priority play next).
   - 🗑️ "Delete" (`supabase.from('queue_items').delete().eq('id', queueId)`).
3. Live indicator for currently playing track.

---

## 4. Git Version Control & GitHub Workflow

### Branch Strategy
```bash
git checkout -b feat/day-3-mobile-keypad-and-queue
```

### Atomic Commit Plan (Conventional Commits)
1. `feat(client): implement LedDisplay component with glowing 5-digit placeholder`
2. `feat(client): implement 3x4 Matrix Keypad with haptic vibration and touch optimization`
3. `feat(client): add singer name reservation modal upon keypad submission`
4. `feat(client): build searchable mobile Songbook catalog with Supabase full-text search`
5. `feat(client): connect queue mutations to Supabase queue_items table with optimistic updates`
6. `feat(client): implement QueueDrawer with move-to-top and delete functionality`

---

## 5. Karpathy Verification & Definition of Done (DoD)

Apply the **Four Checks** (`andrej-karpathy-skill`):
1. **Assumption:** Keypad layout fits comfortably on smartphone screens without scrolling (`100dvh`).
2. **Changed:** Mobile Remote UI, Keypad, LED display, Songbook, and Supabase queue sync.
3. **Verified:**
   - [ ] On mobile view, type `0`, `1`, `0`, `0`, `1` on keypad -> Display renders `01001` and previews "Anak - Freddie Aguilar".
   - [ ] Tap `ENTER` -> Enter singer name "Tito Boy" -> Press Submit.
   - [ ] Check TV Host view (`/host`) -> Queue updates immediately showing "Anak (Tito Boy)".
   - [ ] Open Songbook tab -> Filter by "Tagalog" -> Click "Reserve" on "Ang Huling El Bimbo" -> Appends to queue.
4. **Remaining Risk:** Simultaneous queue additions at the exact same millisecond (Postgres `created_at` timestamp handles ordering cleanly).
