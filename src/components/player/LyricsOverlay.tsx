import { Lrc } from 'react-lrc';
import { Mic2, Music, Sparkles } from 'lucide-react';

interface LyricsOverlayProps {
  lrcContent?: string | null;
  currentMillisecond: number;
  songTitle?: string;
  artist?: string;
  singerName?: string;
}

export default function LyricsOverlay({
  lrcContent,
  currentMillisecond,
  songTitle,
  artist,
  singerName,
}: LyricsOverlayProps) {
  const hasLrc = Boolean(lrcContent && lrcContent.trim());

  return (
    <div className="absolute bottom-4 left-4 right-4 z-20 pointer-events-none flex flex-col items-center">
      <div className="w-full max-w-3xl rounded-2xl bg-black/80 backdrop-blur-md border border-slate-800/90 shadow-2xl p-4 flex flex-col gap-2.5">
        {/* Top Info Header Bar */}
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-2 text-[11px] font-mono">
          <div className="flex items-center gap-2 overflow-hidden text-cyan-400">
            <Music className="w-3.5 h-3.5 shrink-0" />
            <span className="font-bold truncate text-white">{songTitle || 'Now Playing'}</span>
            {artist && <span className="text-slate-400 truncate">— {artist}</span>}
          </div>

          {singerName && (
            <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-fuchsia-950/80 border border-fuchsia-500/40 text-fuchsia-300 shrink-0">
              <Mic2 className="w-3 h-3 text-fuchsia-400" />
              <span className="font-bold text-[10px]">{singerName}</span>
            </div>
          )}
        </div>

        {/* LRC Synchronized Lyrics Stream */}
        {hasLrc ? (
          <div className="h-28 overflow-hidden relative flex flex-col justify-center">
            {/* Top & bottom gradient fade masks */}
            <div className="absolute top-0 left-0 right-0 h-4 bg-gradient-to-b from-black/80 to-transparent z-10 pointer-events-none" />
            <div className="absolute bottom-0 left-0 right-0 h-4 bg-gradient-to-t from-black/80 to-transparent z-10 pointer-events-none" />

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
                      ? 'text-amber-300 font-black text-lg md:text-2xl drop-shadow-[0_0_14px_rgba(253,224,71,0.9)] scale-105'
                      : 'text-slate-400/50 font-medium text-sm md:text-base'
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
        ) : (
          /* Instrumental / Lyricless Mode Placeholder */
          <div className="py-6 flex flex-col items-center justify-center gap-2 text-center">
            <div className="flex items-center gap-2 text-amber-400">
              <Sparkles className="w-4 h-4 animate-spin" />
              <span className="text-xs font-digital font-bold tracking-widest uppercase">
                ★ INSTRUMENTAL / SING ALONG ★
              </span>
              <Sparkles className="w-4 h-4 animate-spin" />
            </div>
            <p className="text-[11px] text-slate-400 font-mono">
              Feel the rhythm and sing your heart out!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
