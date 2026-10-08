import { useState, useEffect } from 'react';
import { Mic2, Music } from 'lucide-react';
import { Lrc } from 'react-lrc';

interface LyricsOverlayProps {
  lrcContent?: string | null;
  currentMillisecond?: number;
  songTitle?: string;
  artist?: string;
  singerName?: string;
  code?: string;
  isPlaying?: boolean;
}

export default function LyricsOverlay({
  lrcContent,
  currentMillisecond = 0,
  songTitle,
  artist,
  singerName,
  code,
  isPlaying = false,
}: LyricsOverlayProps) {
  const [isBannerVisible, setIsBannerVisible] = useState(true);
  const hasLrc = Boolean(lrcContent && lrcContent.trim());

  // Show banner for 7 seconds on song change or when paused, then smoothly fade out
  useEffect(() => {
    setIsBannerVisible(true);

    if (isPlaying) {
      const timer = setTimeout(() => {
        setIsBannerVisible(false);
      }, 7000);
      return () => clearTimeout(timer);
    }
  }, [songTitle, artist, singerName, isPlaying]);

  return (
    <>
      {/* Sleek Glassmorphic "Now Singing" Top-Left Banner */}
      <div
        className={`absolute top-4 left-4 z-20 transition-all duration-700 pointer-events-none ${
          isBannerVisible
            ? 'opacity-100 translate-y-0 scale-100'
            : 'opacity-0 -translate-y-3 scale-95'
        }`}
      >
        <div className="flex items-center gap-3 px-4 py-2.5 rounded-3xl bg-black/85 backdrop-blur-xl border border-cyan-500/40 shadow-neon-cyan max-w-md">
          <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 border border-cyan-400/50 flex items-center justify-center shrink-0 shadow-neon-cyan">
            <Music className="w-5 h-5 text-cyan-300 animate-pulse" />
          </div>

          <div className="flex flex-col min-w-0 pr-1">
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-white tracking-wide truncate">
                {songTitle || 'Now Playing'}
              </span>
              {code && (
                <span className="text-[10px] font-digital font-bold px-2 py-0.5 rounded-lg bg-cyan-950 text-cyan-300 border border-cyan-500/50 shrink-0">
                  {code}
                </span>
              )}
            </div>
            {artist && <span className="text-xs text-slate-300 font-mono truncate">{artist}</span>}
          </div>

          {singerName && (
            <div className="ml-1 pl-2.5 border-l border-slate-800 flex items-center gap-1.5 shrink-0">
              <div className="px-2.5 py-1 rounded-full bg-fuchsia-950/90 border border-fuchsia-500/50 flex items-center gap-1.5 shadow-neon-magenta">
                <Mic2 className="w-3.5 h-3.5 text-fuchsia-400" />
                <span className="text-xs font-bold text-fuchsia-200 font-mono">{singerName}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Optional Compact LRC Stream */}
      {hasLrc && (
        <div className="absolute bottom-5 left-6 right-6 z-20 pointer-events-none flex flex-col items-center">
          <div className="w-full max-w-3xl rounded-3xl bg-black/85 backdrop-blur-xl border border-slate-800/90 shadow-[0_10px_40px_rgba(0,0,0,0.9)] p-3.5">
            <div className="h-24 overflow-hidden relative flex flex-col justify-center">
              <div className="absolute top-0 left-0 right-0 h-4 bg-gradient-to-b from-black/90 to-transparent z-10 pointer-events-none" />
              <div className="absolute bottom-0 left-0 right-0 h-4 bg-gradient-to-t from-black/90 to-transparent z-10 pointer-events-none" />

              <Lrc
                lrc={lrcContent!}
                currentMillisecond={currentMillisecond}
                verticalSpace={true}
                className="h-full overflow-hidden no-scrollbar"
                lineRenderer={({ index, active, line }) => (
                  <div
                    key={index}
                    className={`transition-all duration-300 py-1.5 px-4 text-center select-none ${
                      active
                        ? 'text-amber-300 font-black text-lg md:text-2xl drop-shadow-[0_0_15px_rgba(253,224,71,0.95)] scale-105'
                        : 'text-slate-500 font-medium text-xs md:text-sm'
                    }`}
                  >
                    {active && (
                      <span className="inline-block mr-2 text-cyan-400 animate-pulse">▶</span>
                    )}
                    {line.content}
                  </div>
                )}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
