# Day 7: Multi-Device Stress Testing, Edge Cases, Hardening & Deployment
**Sprint:** 7-Day PinoyVideoke Implementation  
**Phase:** Phase 5 (Final) – Hardening, Concurrency Testing & Party Release  
**Focus:** Concurrency Testing, Edge Case Fallbacks, Single-Command Deployment & GitHub Release  
**Referenced Skills:** `backend-architect`, `diagnosing-bugs`, `code-reviewer`, `security-auditor`, `permissioned-github`, `andrej-karpathy-skill`

---

## 1. Day 7 Objectives & Architectural Goal
The final day tests, hardens, and packages PinoyVideoke for a flawless live party release:
1. Conduct **multi-client concurrency and stress testing** (simulating 10+ mobile remotes queueing tracks simultaneously).
2. Harden **edge-case failure recovery** (mobile screen lock / reconnection, mic permission denial, unplayable YouTube tracks).
3. Profile and eliminate **memory leaks and event listener accumulation** in Node.js and React.
4. Package the application for **single-command execution** (`npm run start:party` and Docker container).
5. Execute the final GitHub Pull Request review, merge to `main`, and tag release **v1.0.0**.

---

## 2. In-Depth Learning Module: Hardening, Diagnostics & DevOps

### 2.1 Diagnosing Memory Leaks & Event Listener Accumulation (Skill: `diagnosing-bugs`)
In long-running videoke sessions (e.g. 6-hour birthday parties), memory leaks can slowly crash the host browser or Node process:
- **Node.js MaxListenersExceededWarning:**
  If your socket handlers attach listeners to an EventEmitter without detaching them on socket disconnection:
  ```typescript
  // ❌ ANTI-PATTERN: Leaks memory every time a client reconnects!
  socket.on('disconnect', () => {
    // Forgot to clean up room listeners
  });
  ```
  Check active listeners and memory footprint:
  ```bash
  node --inspect server/dist/index.js
  ```
- **React Animation Frame & Audio Buffer Leaks:**
  Ensure that when the TV view switches between videos, previous `requestAnimationFrame` loops and `AudioContext` buffers are explicitly cancelled and closed.

### 2.2 Network Resilience & Mobile Screen Sleep Recovery
Mobile phones aggressively put Wi-Fi and WebSockets to sleep when the screen turns off.
When the guest unlocks their phone 20 minutes later:
1. The WebSocket connection may be in a zombie state.
2. The UI queue list is out of date.
- **The Reconnection State Recovery Protocol:**
  ```typescript
  // client/src/services/socket.ts
  socket.io.on('reconnect', () => {
    console.log('Reconnected to server! Resynchronizing room state...');
    const savedRoom = sessionStorage.getItem('pinoyvideoke_room');
    if (savedRoom) {
      socket.emit('room:join', { roomCode: savedRoom, deviceType: 'remote' });
    }
  });
  ```

### 2.3 Graceful Degradation: Microphone Permission Fallback
If the TV Host machine has no microphone plugged in or the user denies permission:
- **Never crash the application!**
- Catch the `NotAllowedError`:
  ```typescript
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    // Initialize Web Audio
  } catch (err) {
    console.warn('Microphone unavailable or denied. Falling back to Party Mode Simulation.');
    setMicAvailable(false);
    // When song ends, generate a playful randomized party score so the fun continues!
  }
  ```

### 2.4 Production Packaging: Single Server Serving Client & API
In development, Vite runs on port `5173` and Express runs on `5000`.
For a streamlined home party setup, we build the React app into static files (`client/dist`) and configure Express to serve both the API, WebSockets, and the frontend on a single port (`5000`):
```typescript
// server/src/index.ts
if (process.env.NODE_ENV === 'production') {
  const clientDist = path.resolve(__dirname, '../../client/dist');
  app.use(express.static(clientDist));
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(clientDist, 'index.html'));
  });
}
```

---

## 3. Step-by-Step Implementation Tasks

### Task 1: Multi-Device Concurrency & Stress Test Script (`server/scripts/stress-test.ts`)
1. Create a Node script using `socket.io-client` that spawns 10 simulated mobile clients.
2. Have each client:
   - Connect to room `KANTA-88`.
   - Submit random 5-digit song reservations simultaneously.
   - Fire random soundboard airhorn triggers.
3. Verify that the server maintains $<50\text{ms}$ event broadcast response without dropped packets.

### Task 2: Production Build & Asset Optimization
1. Run `npm run build` in `/client` (Vite creates minified, hashed bundles).
2. Configure Express static file serving for production mode.
3. Validate that gzip or Brotli compression is enabled for lightning-fast mobile loading.

### Task 3: Single-Command Party Launcher (`package.json`)
Add convenient root scripts:
```json
{
  "scripts": {
    "start:party": "concurrently \"npm run start --workspace=server\" \"npm run preview --workspace=client\"",
    "build": "npm run build --workspaces",
    "typecheck": "npm run typecheck --workspaces",
    "test": "npm run test --workspaces"
  }
}
```

### Task 4: Docker Containerization (`docker-compose.yml`)
Create a zero-dependency Docker setup for running PinoyVideoke on any home server or Raspberry Pi:
```yaml
version: '3.8'
services:
  pinoyvideoke:
    build: .
    ports:
      - "5000:5000"
    environment:
      - NODE_ENV=production
      - PORT=5000
    volumes:
      - ./data:/app/server/data
    restart: unless-stopped
```

---

## 4. Git Version Control & Final Release Workflow (Skill: `permissioned-github`)

### Final Sprint Branch & Pull Request
1. Commit all final hardening improvements:
   ```bash
   git checkout -b feat/day-7-hardening-and-deployment
   git commit -m "chore: configure production build and single-command party launcher"
   git commit -m "feat(server): implement static client serving and graceful mic fallback"
   git commit -m "test: add multi-device socket stress test script"
   ```
2. Push branch to GitHub:
   ```bash
   git push origin feat/day-7-hardening-and-deployment
   ```
3. Open and merge Pull Request to `main`:
   ```bash
   gh pr create --title "Release v1.0.0: PinoyVideoke Complete Implementation" --body "Comprehensive 7-day sprint deliverables complete."
   gh pr merge --squash
   ```
4. Create Release Tag:
   ```bash
   git checkout main
   git pull origin main
   git tag -a v1.0.0 -m "PinoyVideoke v1.0.0 Official Release"
   git push origin v1.0.0
   ```

---

## 5. Karpathy Verification & Definition of Done (DoD)

Apply the **Four Checks** (`andrej-karpathy-skill`):
1. **Assumption:** The entire application can be launched with a single terminal command on a local network.
2. **Changed:** Stress test scripts, production bundle pipeline, static file serving, and Docker config.
3. **Verified:**
   - [ ] Run `npm run typecheck` across all workspaces -> 0 errors.
   - [ ] Run `npm run test` -> All unit and integration tests pass.
   - [ ] Execute `server/scripts/stress-test.ts` with 10 simulated clients -> Server handles 100+ events smoothly.
   - [ ] Disconnect and reconnect Wi-Fi on a connected mobile phone -> Phone automatically resyncs room queue.
   - [ ] Run `npm run start:party` -> Open TV Host on `http://localhost:5000/host` and connect mobile phone -> Conduct a full 3-song singing session with scoring and sound effects.
4. **Outcome Achieved:** A complete, resilient, nostalgic Filipino Videoke web application ready for live party hosting! 🎤🇵🇭🎉
