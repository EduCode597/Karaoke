import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import {
  Tv,
  Smartphone,
  Copy,
  Check,
  RefreshCw,
  ExternalLink,
  Users,
  Activity,
  ArrowLeft,
  Volume2,
  Music,
  Radio,
} from 'lucide-react';
import { generateRoomCode, getStoredRoomCode, setStoredRoomCode } from '../utils/room';
import { useRoomChannel } from '../hooks/useRoomChannel';
import { isSupabaseConfigured } from '../lib/supabase';

export default function HostView() {
  const [roomCode, setRoomCode] = useState<string>(() => {
    return getStoredRoomCode() || generateRoomCode();
  });
  const [copied, setCopied] = useState(false);

  const { status, onlineCount, recentEvents } = useRoomChannel(roomCode, true);

  // Keep room code persisted in session
  useEffect(() => {
    setStoredRoomCode(roomCode);
  }, [roomCode]);

  const remoteJoinUrl = `${window.location.origin}/remote?room=${roomCode}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(remoteJoinUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRegenerateRoom = () => {
    const newCode = generateRoomCode();
    setRoomCode(newCode);
  };

  return (
    <div className="min-h-screen bg-videoke-bg text-slate-100 flex flex-col justify-between relative overflow-hidden crt-overlay">
      {/* Top TV Status Bar */}
      <header className="border-b border-slate-800 bg-slate-950/90 backdrop-blur-md px-6 py-4 flex flex-wrap items-center justify-between gap-4 z-20">
        {/* Left: Branding & Back Button */}
        <div className="flex items-center gap-4">
          <Link
            to="/"
            className="p-2 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white transition-colors"
            title="Back to Dashboard"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <Tv className="w-5 h-5 text-cyan-400" />
              <h1 className="text-lg font-black tracking-wider text-glow-cyan">TV HOST SCREEN</h1>
            </div>
            <p className="text-[11px] text-slate-400 font-mono">
              Dual-Screen Realtime Player Display
            </p>
          </div>
        </div>

        {/* Center: Glowing LED Room Badge */}
        <div className="flex items-center gap-3 px-5 py-2 rounded-xl bg-slate-950 border border-amber-400/40 shadow-neon-amber">
          <span className="text-xs uppercase font-mono text-amber-500/80">Room Code:</span>
          <span className="text-2xl font-digital font-black text-amber-400 tracking-widest text-glow-amber">
            {roomCode}
          </span>
          <button
            onClick={handleRegenerateRoom}
            className="p-1.5 rounded-lg text-slate-500 hover:text-amber-400 transition-colors"
            title="Generate New Room Code"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {/* Right: Connected Remotes & Action Buttons */}
        <div className="flex items-center gap-3">
          {/* Presence Counter */}
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-900 border border-slate-800">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                status === 'connected'
                  ? 'bg-emerald-400 shadow-[0_0_8px_#34d399] animate-pulse'
                  : status === 'offline_demo'
                    ? 'bg-amber-400 shadow-[0_0_8px_#fbbf24]'
                    : 'bg-red-500'
              }`}
            />
            <Users className="w-4 h-4 text-slate-400" />
            <span className="text-xs font-mono font-bold text-slate-200">
              {onlineCount} {onlineCount === 1 ? 'Phone' : 'Phones'} Connected
            </span>
          </div>

          {/* Copy Join Link Button */}
          <button
            onClick={handleCopyLink}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-mono text-slate-300 transition-colors"
          >
            {copied ? (
              <Check className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
            <span>{copied ? 'Copied!' : 'Copy Link'}</span>
          </button>

          {/* Open Mobile Remote in New Tab for Local Testing */}
          <a
            href={remoteJoinUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-950/80 border border-cyan-500/40 hover:bg-cyan-900 text-xs font-mono text-cyan-400 transition-colors"
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Open Remote</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </header>

      {/* Main TV Layout */}
      <main className="flex-1 max-w-7xl mx-auto w-full p-6 grid grid-cols-1 lg:grid-cols-3 gap-6 items-start z-10">
        {/* Left 2 Cols: Main Player & Lyrics Stage */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          {/* Simulated Video Player Screen (Day 4 embeds YouTube IFrame) */}
          <div className="aspect-video w-full rounded-2xl bg-black border border-slate-800 relative overflow-hidden flex flex-col items-center justify-center p-8 text-center shadow-2xl">
            {/* Top Stage Lights */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-cyan-500 to-transparent" />

            {/* Empty State / Stage Placeholder */}
            <div className="flex flex-col items-center gap-4 max-w-md">
              <div className="w-16 h-16 rounded-full bg-slate-900/80 border border-slate-800 flex items-center justify-center shadow-neon-cyan">
                <Music className="w-8 h-8 text-cyan-400 animate-pulse" />
              </div>
              <h2 className="text-2xl font-black tracking-wide text-white text-glow-cyan">
                READY FOR SINGER
              </h2>
              <p className="text-sm text-slate-400 font-mono">
                Scan the QR code on the right with your phone to choose a song and join the queue!
              </p>
            </div>

            {/* Bottom Retro Lyrics Banner Preview */}
            <div className="absolute bottom-4 left-4 right-4 py-3 px-6 rounded-xl bg-black/75 border border-slate-800/80 backdrop-blur-md flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Volume2 className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-mono text-slate-400">Microphone: Standby</span>
              </div>
              <span className="text-xs font-digital text-amber-400 tracking-wider">
                PINOYVIDEOKE AUDIO ENGINE • STANDBY
              </span>
            </div>
          </div>

          {/* Room Pairing Ticker Marquee */}
          <div className="py-2.5 px-4 rounded-xl bg-slate-950 border border-slate-800/80 overflow-hidden flex items-center gap-3">
            <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-400 text-[10px] font-mono uppercase tracking-wider flex items-center gap-1 whitespace-nowrap">
              <Radio className="w-3 h-3 animate-pulse" />
              Live Room
            </span>
            <div className="overflow-hidden relative w-full">
              <p className="animate-marquee whitespace-nowrap text-xs font-mono text-slate-400">
                ★ PAIR YOUR PHONE VIA QR CODE ★ ROOM CODE:{' '}
                <span className="text-amber-400 font-bold">{roomCode}</span> ★ CONNECTED REMOTES:{' '}
                <span className="text-cyan-400 font-bold">{onlineCount}</span> ★ SEARCH OVER 30+
                CLASSIC OPM AND POP HITS ★
              </p>
            </div>
          </div>
        </div>

        {/* Right 1 Col: Prominent QR Code & Realtime Event Stream */}
        <div className="flex flex-col gap-6">
          {/* Prominent QR Code Pairing Card */}
          <div className="p-6 rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 shadow-xl flex flex-col items-center text-center gap-4">
            <div className="flex items-center gap-2 text-cyan-400">
              <Smartphone className="w-5 h-5" />
              <h3 className="font-bold text-sm tracking-wider uppercase">Scan to Control</h3>
            </div>

            {/* QR Code Container with Neon Cyan Border */}
            <div className="p-4 rounded-2xl bg-slate-950 border-2 border-cyan-500/60 shadow-neon-cyan">
              <QRCodeSVG
                value={remoteJoinUrl}
                size={180}
                bgColor="#030712"
                fgColor="#06b6d4"
                level="M"
                includeMargin={false}
              />
            </div>

            <div className="flex flex-col gap-1">
              <p className="text-xs text-slate-300 font-mono">
                Scan with your phone camera to open the 5-digit keypad
              </p>
              <p className="text-[11px] text-slate-500 font-mono">No app download required</p>
            </div>
          </div>

          {/* Live Realtime Activity Monitor */}
          <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-400" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  Realtime Activity
                </h4>
              </div>
              <span className="text-[10px] font-mono text-slate-500">
                {isSupabaseConfigured ? 'Supabase Broadcast' : 'Demo Channel'}
              </span>
            </div>

            {/* Activity Stream */}
            <div className="flex flex-col gap-2 max-h-56 overflow-y-auto pr-1">
              {recentEvents.length === 0 ? (
                <div className="py-6 text-center text-slate-600 font-mono text-xs">
                  Awaiting remote control events...
                  <br />
                  <span className="text-[10px] text-slate-700">
                    (Open remote to send test broadcasts)
                  </span>
                </div>
              ) : (
                recentEvents.map((evt, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800/80 text-xs font-mono flex items-center justify-between gap-2"
                  >
                    <span className="text-cyan-400 font-bold">{evt.event}</span>
                    <span className="text-slate-500 text-[10px]">{evt.timestamp}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900/80 px-6 py-3 bg-slate-950/60 text-slate-600 text-[11px] font-mono flex items-center justify-between z-10">
        <span>PinoyVideoke Host View v1.1.0</span>
        <span>Supabase Realtime Engine (Phoenix Channels)</span>
      </footer>
    </div>
  );
}
