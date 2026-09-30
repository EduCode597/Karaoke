# Day 2: Dual-Screen Real-Time Gateway & Room Orchestration
**Sprint:** 7-Day PinoyVideoke Implementation  
**Phase:** Phase 2 – Socket.io Infrastructure & Dual View Link  
**Focus:** WebSockets, Socket.io Rooms, QR Code Pairing, React Hooks Lifecycle & Real-Time Sync  
**Referenced Skills:** `backend-architect`, `frontend-developer`, `security-auditor`, `andrej-karpathy-skill`

---

## 1. Day 2 Objectives & Architectural Goal
The goal of Day 2 is to build the real-time bridge that connects the primary TV Host screen with mobile guest phones:
1. Implement a robust **Socket.io gateway** supporting dynamic room generation (e.g., `KANTA-88`).
2. Build the **TV Host View (`/host`)** that displays a generated QR Code for frictionless mobile pairing.
3. Build the **Mobile Remote View (`/remote?room=...`)** that automatically connects and authenticates with the TV room.
4. Establish bi-directional event communication and manage socket lifecycle without memory leaks.

---

## 2. In-Depth Learning Module: Node.js & React Concepts

### 2.1 Node.js Deep Dive: WebSockets & Socket.io Room Multiplexing
- **Why WebSockets over HTTP Polling?**
  In traditional HTTP, a mobile phone would need to constantly poll `GET /api/queue` every 1-2 seconds. With 10 party guests, this creates hundreds of redundant HTTP requests, high server overhead, and an unacceptable 1-2 second delay when someone clicks "Skip" or "Play".
  WebSockets establish a persistent, bidirectional TCP connection. When a guest presses a button, the server receives the packet and broadcasts it to the TV in $<15\text{ms}$.
- **How Socket.io Rooms Work:**
  Socket.io provides an abstraction called **Rooms**. Sockets can `join()` and `leave()` rooms without creating separate server ports:
  ```typescript
  // Server-side
  socket.on('room:join', ({ roomCode, role }) => {
    socket.join(roomCode);
    console.log(`Socket ${socket.id} joined room ${roomCode} as ${role}`);
    
    // Broadcast ONLY to clients in this specific room
    io.to(roomCode).emit('room:member_joined', { role, count: getRoomMembers(roomCode) });
  });
  ```
- **Broadcasting Distinction (Critical Concept):**
  - `io.to(roomCode).emit()`: Sends to **all** sockets in that room (including the sender).
  - `socket.to(roomCode).emit()`: Sends to all sockets in that room **except** the sender.
  - `socket.emit()`: Sends **only** back to the requesting client.

### 2.2 React 18 Deep Dive: WebSocket Lifecycle in React Hooks
Managing persistent WebSocket connections inside React functional components requires extreme discipline to avoid **duplicate connections** and **stale closures**.

#### The React 18 StrictMode Duplicate Mount Trap:
In development, React 18 mounts components twice to help catch side-effect bugs. If you write:
```typescript
// ❌ ANTI-PATTERN: Creates duplicate connections on every render/mount!
useEffect(() => {
  const socket = io('http://localhost:5000');
  socket.on('queue:updated', (data) => setQueue(data));
}, []);
```
Two socket connections will be created, receiving duplicate events and causing memory leaks!

#### The Correct Pattern:
Use a singleton socket service or clean up properly in `useEffect`:
```typescript
// ✅ BEST PRACTICE: Singleton client instance with cleanup
// client/src/services/socket.ts
import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export const getSocket = (): Socket => {
  if (!socket) {
    socket = io(import.meta.env.VITE_WS_URL || 'http://localhost:5000', {
      autoConnect: false,
      transports: ['websocket'], // Avoid HTTP long-polling fallback delays
    });
  }
  return socket;
};
```
In your React component hook:
```typescript
useEffect(() => {
  const s = getSocket();
  if (!s.connected) s.connect();

  s.emit('room:join', { roomCode, role: 'host' });

  const handleQueueUpdate = (newQueue: QueueItem[]) => {
    setQueue(newQueue);
  };

  s.on('queue:updated', handleQueueUpdate);

  // CLEANUP FUNCTION: Unsubscribe listeners on unmount
  return () => {
    s.off('queue:updated', handleQueueUpdate);
  };
}, [roomCode]);
```

### 2.3 QR Code Generation in React
We use `qrcode.react` (SVG mode). Unlike raster images (PNG), SVG QR codes scale crisply to massive 4K TV resolutions without pixelation, ensuring phone cameras can scan them instantly across a living room.

---

## 3. Step-by-Step Implementation Tasks

### Task 1: Socket.io Server Setup (`server/src/socket/index.ts`)
1. Attach Socket.io to the Node HTTP server:
   ```typescript
   import { Server } from 'socket.io';
   import http from 'http';

   export function initSocketServer(httpServer: http.Server) {
     const io = new Server(httpServer, {
       cors: {
         origin: '*', // For local network access (e.g. 192.168.x.x)
         methods: ['GET', 'POST']
       }
     });

     io.on('connection', (socket) => {
       socket.on('room:create', () => {
         const roomCode = generateRoomCode(); // e.g. "KANTA-88"
         socket.join(roomCode);
         socket.emit('room:created', { roomCode });
       });

       socket.on('room:join', ({ roomCode, deviceType }) => {
         socket.join(roomCode);
         io.to(roomCode).emit('room:user_joined', { deviceType });
       });
     });
   }
   ```

### Task 2: React TV Host View (`client/src/views/HostView.tsx`)
1. Create state for `roomCode`, `connectedUsers`, and `playerState`.
2. On mount, emit `room:create` and receive the unique room identifier.
3. Render the pairing header with:
   - Amber LED room code display.
   - SVG QR Code pointing to `http://<LAN_IP>:5173/remote?room=KANTA-88`.
   - Connected remotes counter badge.

### Task 3: Mobile Remote View (`client/src/views/RemoteView.tsx`)
1. Extract `room` query parameter from URL using React Router (`useSearchParams`).
2. If room code is missing, render a manual 6-character room code entry screen.
3. On connection, emit `room:join` with `{ roomCode, deviceType: 'remote' }`.
4. Render connection status banner ("Connected to KANTA-88 🟢").

---

## 4. Git Version Control & GitHub Workflow

### Branch Strategy
```bash
git checkout -b feat/day-2-dual-screen-socket-engine
```

### Atomic Commit Plan (Conventional Commits)
1. `feat(server): setup socket.io gateway with room multiplexing and room code generator`
2. `feat(client): install socket.io-client, react-router-dom, and qrcode.react`
3. `feat(client): implement socket singleton client and useSocket hook with strict cleanup`
4. `feat(client): build TV Host view (/host) with room initialization and SVG QR code`
5. `feat(client): build Mobile Remote view (/remote) with auto-room connection handshake`
6. `test: verify real-time room connection and disconnect handling across two browser windows`

---

## 5. Karpathy Verification & Definition of Done (DoD)

Apply the **Four Checks** (`andrej-karpathy-skill`):
1. **Assumption:** Mobile phones on the same local Wi-Fi can resolve the host machine's IP address.
2. **Changed:** Socket.io server handlers, TV Host view, Mobile Remote view, and QR code integration.
3. **Verified:**
   - [ ] Open `http://localhost:5173/host` in Chrome -> TV View displays room code (e.g., `KANTA-42`) and sharp QR code.
   - [ ] Open an Incognito window to `http://localhost:5173/remote?room=KANTA-42`.
   - [ ] TV Host immediately updates: "Connected Remotes: 1".
   - [ ] Close Incognito window -> TV Host reflects disconnect within 2 seconds.
4. **Remaining Risk:** Firewall blocking inbound ports 5000/5173 on local Wi-Fi. (Documented in setup guide).
