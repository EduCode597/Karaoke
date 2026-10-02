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

  // Show banner for 6 seconds on song change or when paused, then smoothly fade out
  useEffect(() => {
    setIsBannerVisible(true);

    if (isPlaying) {
      const timer = setTimeout(() => {
        setIsBannerVisible(false);
      }, 6000);
      return () => clearTimeout(timer);
    }
  }, [songTitle, artist, singerName, isPlaying]);

  return (
    <>
      {/* Sleek Glassmorphic "Now Singing" Top-Left Banner */}
      <div
        className={`absolute top-4 left-4 z-20 transition-all duration-700 pointer-events-none ${
          isBannerVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-3'
        }`}
      >
        <div className="flex items-center gap-3 px-4 py-2 rounded-2xl bg-black/85 backdrop-blur-md border border-cyan-500/40 shadow-neon-cyan max-w-md">
          <div className="w-8 h-8 rounded-xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center shrink-0">
            <Music className="w-4 h-4 text-cyan-400 animate-pulse" />
          </div>

          <div className="flex flex-col min-w-0 pr-1">
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-white tracking-wide truncate">
                {songTitle || 'Now Playing'}
              </span>
              {code && (
                <span className="text-[10px] font-digital font-bold px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/40 shrink-0">
                  {code}
                </span>
              )}
            </div>
            {artist && <span className="text-xs text-slate-400 font-mono truncate">{artist}</span>}
          </div>

          {singerName && (
            <div className="ml-1 pl-2.5 border-l border-slate-800 flex items-center gap-1.5 shrink-0">
              <div className="px-2 py-0.5 rounded-full bg-fuchsia-950/90 border border-fuchsia-500/50 flex items-center gap-1">
                <Mic2 className="w-3 h-3 text-fuchsia-400" />
                <span className="text-[11px] font-bold text-fuchsia-300 font-mono">
                  {singerName}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Optional Compact LRC Stream (Only displayed if track specifically has an external .lrc file) */}
      {hasLrc && (
        <div className="absolute bottom-4 left-6 right-6 z-20 pointer-events-none flex flex-col items-center">
          <div className="w-full max-w-2xl rounded-2xl bg-black/80 backdrop-blur-md border border-slate-800/90 shadow-2xl p-3">
            <div className="h-20 overflow-hidden relative flex flex-col justify-center">
              <div className="absolute top-0 left-0 right-0 h-3 bg-gradient-to-b from-black/80 to-transparent z-10 pointer-events-none" />
              <div className="absolute bottom-0 left-0 right-0 h-3 bg-gradient-to-t from-black/80 to-transparent z-10 pointer-events-none" />

              <Lrc
                lrc={lrcContent!}
                currentMillisecond={currentMillisecond}
                verticalSpace={true}
                className="h-full overflow-hidden no-scrollbar"
                lineRenderer={({ index, active, line }) => (
                  <div
                    key={index}
                    className={`transition-all duration-300 py-1 px-3 text-center select-none ${
                      active
                        ? 'text-amber-300 font-black text-base md:text-xl drop-shadow-[0_0_12px_rgba(253,224,71,0.9)] scale-105'
                        : 'text-slate-500 font-medium text-xs md:text-sm'
                    }`}
                  >
                    {active && <span className="inline-block mr-2 text-cyan-400">▶</span>}
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
