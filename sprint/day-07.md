# Day 7: Multi-Device Stress Testing, Cloud Release & GitHub Tag

**Sprint:** 7-Day PinoyVideoke Implementation (Serverless Cloud Edition)  
**Phase:** Phase 5 (Final) – Hardening, Free Cloud Deployment & Release  
**Focus:** Concurrency Testing, Edge Case Fallbacks, Vercel 1-Click Deployment & GitHub Tagging  
**Referenced Skills:** `backend-architect`, `diagnosing-bugs`, `code-reviewer`, `security-auditor`, `permissioned-github`, `andrej-karpathy-skill`

---

## 1. Day 7 Objectives & Architectural Goal

The final day tests, hardens, and launches PinoyVideoke live on the cloud at **100% zero hosting cost**:

1. Conduct **multi-client concurrency and stress testing** (simulating 10+ mobile remotes queueing tracks simultaneously over Supabase Realtime).
2. Harden **edge-case failure recovery** (mobile screen lock / reconnection, mic permission denial, unplayable YouTube tracks).
3. Profile and eliminate **memory leaks and channel subscription accumulation** in React.
4. Deploy the application to **Vercel** with global edge CDN caching and connect to Supabase production.
5. Execute the final GitHub Pull Request review, merge to `main`, and tag release **v1.0.0**.

---

## 2. In-Depth Learning Module: Serverless Cloud Deployment & Diagnostics

### 2.1 Single-Page Application (SPA) Routing on Vercel

In React Router, routes like `/host` and `/remote` are handled client-side by JavaScript.
If a guest refreshes their browser on `https://pinoyvideoke.vercel.app/remote?room=KANTA-88`, Vercel's server will look for a static file named `/remote/index.html` and return a **404 Not Found** error unless configured with an SPA rewrite.

**The `vercel.json` SPA Configuration:**

```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

This tells Vercel to route all incoming HTTP requests to `index.html`, allowing React Router to resolve `/host` and `/remote` seamlessly.

### 2.2 Network Resilience & Mobile Screen Sleep Recovery

Mobile phones aggressively pause JavaScript and WebSockets when the screen locks.
When the guest unlocks their phone 20 minutes later:

1. Supabase client detects the reconnection.
2. The UI queue list is refreshed:

```typescript
supabase.realtime.on('connect', () => {
  console.log('Reconnected to Supabase Realtime! Syncing state...');
  refreshQueue();
});
```

### 2.3 Graceful Degradation: Microphone Permission Fallback

If the TV Host machine has no microphone or the user denies permission:

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

---

## 3. Step-by-Step Implementation Tasks

### Task 1: Multi-Device Realtime Stress Test

1. Connect 5+ mobile devices simultaneously to a single TV Host room.
2. Simultaneously submit 5-digit song reservations, search queries, and soundboard airhorns.
3. Verify that Supabase Realtime maintains $<50\text{ms}$ broadcast response with zero dropped packets.

### Task 2: Production Build & Asset Optimization

1. Run `npm run build` in `/client` (Vite creates minified, hashed bundles).
2. Verify total bundle size and ensure code splitting for external heavy libraries (`react-lrc`, `qrcode.react`).
3. Verify that all asset paths use relative or root references.

### Task 3: Vercel Cloud Deployment Setup

1. Create `vercel.json` in the root folder with SPA rewrites.
2. Deploy via Vercel CLI or GitHub Integration:
   ```bash
   npx vercel
   ```
3. Set Production Environment Variables in Vercel Dashboard:
   - `VITE_SUPABASE_URL` = `https://your-project.supabase.co`
   - `VITE_SUPABASE_ANON_KEY` = `your-anon-key`
4. Confirm production build succeeds: `https://pinoyvideoke.vercel.app`.

### Task 4: Complete Documentation & User Guide (`README.md`)

1. Add quick start guide for party hosts:
   - How to open TV Host view (`/host`).
   - How guests scan QR to join on mobile (`/remote`).
   - Sourcing song codes and using the songbook.

---

## 4. Git Version Control & Final Release Workflow (Skill: `permissioned-github`)

### Final Sprint Branch & Pull Request

1. Commit all final hardening improvements:
   ```bash
   git checkout -b feat/day-7-cloud-release
   git commit -m "chore: add vercel.json SPA rewrites and production build configs"
   git commit -m "feat(client): implement graceful mic permission fallback and sleep recovery"
   git commit -m "docs: update README with Vercel deployment guide and party host manual"
   ```
2. Push branch to GitHub:
   ```bash
   git push origin feat/day-7-cloud-release
   ```
3. Open and merge Pull Request to `main`:
   ```bash
   gh pr create --title "Release v1.0.0: PinoyVideoke Serverless Cloud Edition" --body "Comprehensive 7-day sprint deliverables complete with Supabase and Vercel."
   gh pr merge --squash
   ```
4. Create Release Tag:
   ```bash
   git checkout main
   git pull origin main
   git tag -a v1.0.0 -m "PinoyVideoke v1.0.0 Official Release (Serverless Cloud Edition)"
   git push origin v1.0.0
   ```

---

## 5. Karpathy Verification & Definition of Done (DoD)

Apply the **Four Checks** (`andrej-karpathy-skill`):

1. **Assumption:** The entire application runs publicly on Vercel + Supabase with zero server subscription costs.
2. **Changed:** Vercel deployment configuration, graceful degradation, and production documentation.
3. **Verified:**
   - [x] Run `npm run build` -> Builds cleanly with 0 TypeScript or lint errors.
   - [x] Visit live Vercel production URL -> Opens TV Host screen.
   - [x] Scan QR code from smartphone across the room -> Mobile remote opens and connects to the room over the internet.
   - [x] Queue a song from smartphone -> Plays on TV Host screen with synchronized lyrics and sound effects.
   - [x] Complete full singing performance -> Score reveal screen triggers with fanfare audio.
4. **Outcome Achieved:** A world-class, 100% free cloud-hosted Filipino Videoke web application ready for home parties anywhere in the world! 🎤🇵🇭🎉
