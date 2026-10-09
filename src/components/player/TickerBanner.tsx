import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Tv,
  ArrowLeft,
  Users,
  Copy,
  Check,
  RefreshCw,
  Smartphone,
  ExternalLink,
  Clock,
  Share2,
} from 'lucide-react';
import type { QueueItem } from '../../types/song';

interface TickerBannerProps {
  roomCode: string;
  onlineCount: number;
  status: 'connected' | 'connecting' | 'disconnected' | 'offline_demo';
  queue: QueueItem[];
  onRegenerateRoom: () => void;
  onCopyLink: () => void;
  copied: boolean;
  remoteJoinUrl: string;
  onCopyScreenLink?: () => void;
  copiedScreen?: boolean;
  screenJoinUrl?: string;
}

export default function TickerBanner({
  roomCode,
  onlineCount,
  status,
  queue,
  onRegenerateRoom,
  onCopyLink,
  copied,
  remoteJoinUrl,
  onCopyScreenLink,
  copiedScreen,
}: TickerBannerProps) {
  // Live Digital Clock with blinking colon
  const [time, setTime] = useState<string>('');
  const [showColon, setShowColon] = useState(true);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      setTime(`${hours}:${minutes}`);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    const blinkInterval = setInterval(() => setShowColon((prev) => !prev), 500);

    return () => {
      clearInterval(interval);
      clearInterval(blinkInterval);
    };
  }, []);

  const currentTrack = queue[0] || null;
  const nextTrack = queue[1] || null;

  // Build authentic marquee text
  const marqueeText = currentTrack
    ? `🎵 NOW PERFORMING: "${currentTrack.song?.title || 'Unknown'}" by ${currentTrack.song?.artist || 'Unknown'} (Singer: ${currentTrack.singer_name || 'Guest'}) ★★★ ${
        nextTrack
          ? `UP NEXT: "${nextTrack.song?.title}" by ${nextTrack.song?.artist} (Singer: ${nextTrack.singer_name})`
          : 'UP NEXT: Room Queue is Open — Scan QR Code to Reserve a Song!'
      } ★★★ ROOM CODE: ${roomCode} ★★★ PINOYVIDEOKE STAGE LIVE ★★★`
    : `★ READY FOR SINGERS ★ SCAN QR CODE ON SCREEN TO CONNECT SMARTPHONE ★ ROOM CODE: ${roomCode} ★ CONNECTED REMOTES: ${onlineCount} ★ SELECT ANY 5-DIGIT CODE TO START ★★★`;

  return (
    <header className="border-b border-slate-800/90 bg-slate-950/95 backdrop-blur-xl sticky top-0 z-30 flex flex-col shadow-2xl">
      {/* Upper Control Bar */}
      <div className="max-w-[1720px] mx-auto w-full px-4 sm:px-6 lg:px-8 py-3.5 flex flex-wrap items-center justify-between gap-4">
        {/* Left: Branding & Back Button */}
        <div className="flex items-center gap-3">
          <Link
            to="/"
            className="p-2.5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white transition-all active:scale-95 touch-manipulation min-h-[44px] min-w-[44px] flex items-center justify-center shadow-sm"
            title="Back to Dashboard"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-400 shadow-neon-cyan">
                <Tv className="w-3.5 h-3.5" />
              </div>
              <h1 className="text-base sm:text-lg lg:text-xl font-black tracking-wider text-glow-cyan text-white">
                PINOY <span className="text-fuchsia-400 text-glow-magenta">VIDEOKE</span> TV
              </h1>
            </div>
            <p className="text-[11px] sm:text-xs text-slate-400 font-mono tracking-tight">
              Dual-Screen Karaoke Stage & Vocal Scoring Engine
            </p>
          </div>
        </div>

        {/* Center: Glowing Golden LED Room Badge */}
        <div className="flex items-center gap-3 px-4 sm:px-6 py-2 rounded-2xl bg-slate-950 border-2 border-amber-400/50 shadow-neon-amber">
          <span className="text-[11px] sm:text-xs uppercase font-mono text-amber-500/90 font-bold">
            ROOM:
          </span>
          <span className="text-2xl sm:text-3xl font-digital font-black text-amber-300 tracking-widest text-glow-amber">
            {roomCode}
          </span>
          <button
            onClick={onRegenerateRoom}
            className="p-1.5 rounded-lg text-slate-500 hover:text-amber-400 active:scale-95 transition-all touch-manipulation"
            title="Generate New Room Code"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {/* Right: Presence Counter, Digital Clock & Actions */}
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          {/* Live Digital LED Clock */}
          <div className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-slate-900/90 border border-slate-800 text-cyan-300 font-digital text-sm sm:text-base font-bold shadow-sm">
            <Clock className="w-4 h-4 text-slate-400" />
            <span>
              {time.split(':')[0]}
              <span className={showColon ? 'opacity-100' : 'opacity-20'}>:</span>
              {time.split(':')[1]}
            </span>
          </div>

          {/* Connected Remotes Indicator */}
          <div className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-slate-900/90 border border-slate-800">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                status === 'connected'
                  ? 'bg-emerald-400 shadow-neon-emerald animate-pulse'
                  : status === 'offline_demo'
                    ? 'bg-amber-400 shadow-neon-amber'
                    : 'bg-rose-500 shadow-neon-rose'
              }`}
            />
            <Users className="w-4 h-4 text-slate-400" />
            <span className="text-xs sm:text-sm font-mono font-bold text-slate-200">
              {onlineCount} {onlineCount === 1 ? 'Phone' : 'Phones'}
            </span>
          </div>

          {/* Share Screen Link Button */}
          {onCopyScreenLink && (
            <button
              onClick={onCopyScreenLink}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-fuchsia-950/80 border border-fuchsia-500/40 hover:bg-fuchsia-900 text-xs sm:text-sm font-mono text-fuchsia-200 font-bold transition-all touch-manipulation min-h-[44px] shadow-sm active:scale-95"
              title="Copy Screen Link to sing with distant friends"
            >
              {copiedScreen ? (
                <Check className="w-4 h-4 text-emerald-400" />
              ) : (
                <Share2 className="w-4 h-4 text-fuchsia-400" />
              )}
              <span>{copiedScreen ? 'Link Copied!' : 'Share Screen'}</span>
            </button>
          )}

          {/* Copy Remote Link Button */}
          <button
            onClick={onCopyLink}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs sm:text-sm font-mono text-slate-200 transition-all touch-manipulation min-h-[44px] active:scale-95"
            title="Copy mobile remote URL"
          >
            {copied ? (
              <Check className="w-4 h-4 text-emerald-400" />
            ) : (
              <Copy className="w-4 h-4 text-slate-400" />
            )}
            <span>{copied ? 'Remote Copied!' : 'Copy Remote'}</span>
          </button>

          {/* Open Mobile Remote Link */}
          <a
            href={remoteJoinUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-cyan-950/80 border border-cyan-500/40 hover:bg-cyan-900 text-xs sm:text-sm font-mono text-cyan-300 font-bold transition-all touch-manipulation min-h-[44px] shadow-sm active:scale-95"
            title="Open Remote Control in new tab"
          >
            <Smartphone className="w-4 h-4" />
            <span>Remote</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* Authentic Retro Videoke Continuous Marquee Ticker */}
      <div className="bg-slate-950 border-t border-slate-800/80 py-2 px-4 overflow-hidden relative shadow-inner">
        <div className="max-w-[1720px] mx-auto overflow-hidden relative w-full">
          <p className="animate-marquee whitespace-nowrap text-xs sm:text-sm font-digital tracking-wider text-amber-300 font-bold uppercase drop-shadow-[0_0_8px_rgba(251,191,36,0.4)]">
            {marqueeText}
          </p>
        </div>
      </div>
    </header>
  );
}
