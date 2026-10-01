# Day 2: Dual-Screen Supabase Realtime Engine & Room Handshake
**Sprint:** 7-Day PinoyVideoke Implementation (Serverless Cloud Edition)  
**Phase:** Phase 2 – Real-Time Dual-Screen Infrastructure  
**Focus:** Supabase Realtime Channels, Broadcast & Presence, SVG QR Code Pairing, React Hooks Lifecycle  
**Referenced Skills:** `frontend-developer`, `security-auditor`, `best-practices`, `andrej-karpathy-skill`

---

## 1. Day 2 Objectives & Architectural Goal
The goal of Day 2 is to build zero-server, low-latency real-time communication between the primary TV screen and guest smartphones:
1. Configure **Supabase Realtime Channels** to replace traditional custom Socket.io servers.
2. Build the **TV Host View (`/host`)** that generates a unique room code (e.g., `KANTA-88`) and displays a crisp SVG QR Code.
3. Build the **Mobile Remote View (`/remote?room=...`)** that automatically connects to the room channel.
4. Use **Supabase Presence** to track and display the live count of connected guest phones on the TV screen.
5. Implement safe React 18 subscription lifecycle management without memory leaks.

---

## 2. In-Depth Learning Module: Supabase Realtime vs Socket.io

### 2.1 How Supabase Realtime Works
Under the hood, Supabase Realtime is powered by **Elixir's Phoenix Channels**, an engine capable of handling millions of concurrent WebSocket connections with sub-20ms latency.
Supabase provides three distinct real-time features:

| Feature | Best Used For | Why We Use It in PinoyVideoke |
| :--- | :--- | :--- |
| **Broadcast** | Ephemeral, low-latency client-to-client messages | Remote playback controls (`play`, `pause`, `skip`) & soundboard airhorns. No DB write needed! |
| **Presence** | Synchronizing shared state & who is online | Displaying "Connected Remotes: 4" on the TV host screen. |
| **Postgres Changes** | Listening to database row mutations | Instant queue updates whenever a song is inserted or deleted from `queue_items`. |

```
TV Host Screen ────────┐
(Listening to Broadcast)│
                        ▼
           [ Supabase Realtime Gateway ]
                        ▲
Guest Mobile Phone ─────┘
(Sending Broadcast)
```

### 2.2 React 18 Realtime Lifecycle Management
Managing WebSocket channels inside React components requires careful cleanup:

#### The React 18 StrictMode Gotcha:
During development, React 18 unmounts and remounts components immediately. If you do not clean up channel subscriptions, Supabase will keep two zombie connections alive.

#### The Correct Hook Pattern:
```typescript
// client/src/hooks/useRoomChannel.ts
import { useEffect, useState } from 'react';
import { RealtimeChannel } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

export function useRoomChannel(roomCode: string, isHost = false) {
  const [channel, setChannel] = useState<RealtimeChannel | null>(null);
  const [onlineCount, setOnlineCount] = useState(0);

  useEffect(() => {
    if (!roomCode) return;

    // 1. Create channel instance
    const roomChannel = supabase.channel(`room:${roomCode}`, {
      config: {
        broadcast: { self: false }, // Don't echo broadcasts back to the sender
        presence: { key: isHost ? 'host' : `remote-${crypto.randomUUID().slice(0, 6)}` }
      }
    });

    // 2. Track Presence (connected remotes counter)
    roomChannel
      .on('presence', { event: 'sync' }, () => {
        const state = roomChannel.presenceState();
        // Count all presence entries excluding host
        const remotes = Object.values(state).flat().filter((p: any) => p.key !== 'host');
        setOnlineCount(remotes.length);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await roomChannel.track({ onlineAt: new Date().toISOString() });
        }
      });

    setChannel(roomChannel);

    // 3. CLEANUP on component unmount
    return () => {
      supabase.removeChannel(roomChannel);
    };
  }, [roomCode, isHost]);

  return { channel, onlineCount };
}
```

### 2.3 QR Code Vector Generation (`qrcode.react`)
Raster QR codes (like PNGs) blur on large 4K displays.
By rendering as pure **SVG** via `qrcode.react`:
```tsx
import { QRCodeSVG } from 'qrcode.react';

<QRCodeSVG 
  value={mobileJoinUrl} 
  size={160} 
  bgColor="transparent" 
  fgColor="#06b6d4" // Neon cyan matching our theme
  level="M" 
/>
```
Guests can point their camera at the TV from across the living room and pair instantly.

---

## 3. Step-by-Step Implementation Tasks

### Task 1: Room Code Generator (`client/src/utils/room.ts`)
1. Create a memorable room code generator (e.g. `KANTA-` + random 2-digit number: `KANTA-88` or `PINOY-42`).
2. Store active room code in `sessionStorage` so refreshing the browser retains the active room.

### Task 2: TV Host View (`client/src/views/HostView.tsx`)
1. Generate room code on initial load.
2. Initialize `useRoomChannel(roomCode, true)`.
3. Render pairing banner with:
   - Amber LED display: `ROOM: KANTA-88`.
   - SVG QR Code pointing to `${window.location.origin}/remote?room=KANTA-88`.
   - Connected remotes counter badge: `Connected Phones: {onlineCount}`.

### Task 3: Mobile Remote View (`client/src/views/RemoteView.tsx`)
1. Extract `room` query parameter from URL using React Router (`useSearchParams`).
2. If room code is missing, show manual 6-character room code input modal.
3. Join Supabase Realtime channel and track presence as a guest remote.
4. Render connection status indicator ("Connected to KANTA-88 🟢").

### Task 4: Standardize Broadcast Protocol (`client/src/types/realtime.ts`)
```typescript
export type RealtimePayload =
  | { type: 'player:action'; action: 'play' | 'pause' | 'skip' | 'replay' }
  | { type: 'player:transpose'; semitones: number }
  | { type: 'party:sfx'; sfxType: 'airhorn' | 'cheer' | 'gong' | 'drumroll' };
```

---

## 4. Git Version Control & GitHub Workflow

### Branch Strategy
```bash
git checkout -b feat/day-2-supabase-realtime-channels
```

### Atomic Commit Plan (Conventional Commits)
1. `feat(client): install react-router-dom and qrcode.react`
2. `feat(client): implement useRoomChannel hook with Supabase Broadcast and Presence`
3. `feat(client): build TV Host view (/host) with room generator and SVG QR code`
4. `feat(client): build Mobile Remote view (/remote) with auto-room connection handshake`
5. `feat(client): implement live connected remotes counter using Supabase Presence`
6. `test: verify real-time pairing across two browser tabs with zero console errors`

---

## 5. Karpathy Verification & Definition of Done (DoD)

Apply the **Four Checks** (`andrej-karpathy-skill`):
1. **Assumption:** Supabase Realtime is enabled in the Supabase project dashboard.
2. **Changed:** React Router configuration, TV Host view, Mobile Remote view, and Supabase channel hooks.
3. **Verified:**
   - [ ] Open `http://localhost:5173/host` -> TV screen displays room code (e.g. `KANTA-99`) and sharp QR code.
   - [ ] Open second tab to `http://localhost:5173/remote?room=KANTA-99`.
   - [ ] TV Host immediately updates: "Connected Phones: 1".
   - [ ] Close second tab -> TV Host updates: "Connected Phones: 0" within 3 seconds.
4. **Remaining Risk:** User scans QR code on phone while on different network (Mitigated on Day 7 when deployed to Vercel public URL).
