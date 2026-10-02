import { useEffect, useRef, useState, useImperativeHandle, forwardRef } from 'react';
import { useYouTubeApi } from '../../hooks/useYouTubeApi';
import { Play, Volume2, AlertCircle } from 'lucide-react';

export interface YouTubePlayerHandle {
  play: () => void;
  pause: () => void;
  seekTo: (seconds: number) => void;
  replay: () => void;
  getCurrentTime: () => number;
  getPlayerState: () => number | null;
}

interface YouTubePlayerProps {
  videoId: string;
  onEnded: () => void;
  onTimeUpdate?: (ms: number) => void;
  onStateChange?: (state: number) => void;
  mode?: 'video' | 'retro';
}

const YouTubePlayer = forwardRef<YouTubePlayerHandle, YouTubePlayerProps>(
  ({ videoId, onEnded, onTimeUpdate, onStateChange, mode = 'video' }, ref) => {
    const { isLoaded, error: apiError } = useYouTubeApi();
    const playerRef = useRef<YTPlayer | null>(null);
    const containerRef = useRef<HTMLDivElement | null>(null);
    const animFrameRef = useRef<number | null>(null);
    const currentVideoIdRef = useRef<string | null>(null);

    // Keep callback refs fresh without causing effect re-runs
    const onEndedRef = useRef(onEnded);
    onEndedRef.current = onEnded;

    const onStateChangeRef = useRef(onStateChange);
    onStateChangeRef.current = onStateChange;

    const onTimeUpdateRef = useRef(onTimeUpdate);
    onTimeUpdateRef.current = onTimeUpdate;

    const [playerState, setPlayerState] = useState<number>(-1);
    const [needsUserGesture, setNeedsUserGesture] = useState(false);
    const [embedError, setEmbedError] = useState<string | null>(null);

    // Expose imperative player actions to parent
    useImperativeHandle(
      ref,
      () => ({
        play: () => {
          playerRef.current?.playVideo();
        },
        pause: () => {
          playerRef.current?.pauseVideo();
        },
        seekTo: (seconds: number) => {
          playerRef.current?.seekTo(seconds, true);
        },
        replay: () => {
          playerRef.current?.seekTo(0, true);
          playerRef.current?.playVideo();
        },
        getCurrentTime: () => {
          return playerRef.current?.getCurrentTime() || 0;
        },
        getPlayerState: () => {
          return playerRef.current ? playerRef.current.getPlayerState() : null;
        },
      }),
      []
    );

    // Optional time sync loop - only runs if onTimeUpdate listener is provided
    useEffect(() => {
      if (!onTimeUpdate) return;
      let isSubscribed = true;
      let lastUpdate = 0;

      const syncLoop = () => {
        if (!isSubscribed) return;

        const now = Date.now();
        if (now - lastUpdate >= 100) {
          lastUpdate = now;
          if (playerRef.current && typeof playerRef.current.getCurrentTime === 'function') {
            try {
              const timeSec = playerRef.current.getCurrentTime();
              if (typeof timeSec === 'number' && !isNaN(timeSec)) {
                const ms = Math.floor(timeSec * 1000);
                onTimeUpdateRef.current?.(ms);
              }
            } catch {
              // Player might be unmounting or in transition
            }
          }
        }

        animFrameRef.current = requestAnimationFrame(syncLoop);
      };

      if (playerState === 1) {
        // PLAYING
        animFrameRef.current = requestAnimationFrame(syncLoop);
      } else if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }

      return () => {
        isSubscribed = false;
        if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      };
    }, [playerState, onTimeUpdate]);

    // Initialize or re-cue player ONLY when isLoaded or videoId changes
    useEffect(() => {
      if (!isLoaded || !videoId) return;

      // Guard against re-loading the exact same video
      if (currentVideoIdRef.current === videoId && playerRef.current) {
        return;
      }

      currentVideoIdRef.current = videoId;
      setEmbedError(null);
      setNeedsUserGesture(false);

      const targetDivId = `yt-player-target-${videoId}`;

      // If player already exists, load next video
      if (playerRef.current && typeof playerRef.current.loadVideoById === 'function') {
        try {
          playerRef.current.loadVideoById(videoId);
          return;
        } catch (e) {
          console.warn('Error loading video in existing player, rebuilding...', e);
        }
      }

      // Ensure container has mounting target
      if (!containerRef.current) return;
      containerRef.current.innerHTML = `<div id="${targetDivId}"></div>`;

      try {
        const player = new window.YT.Player(targetDivId, {
          videoId,
          width: '100%',
          height: '100%',
          playerVars: {
            autoplay: 1,
            controls: 0,
            rel: 0,
            modestbranding: 1,
            disablekb: 1,
            playsinline: 1,
            enablejsapi: 1,
          },
          events: {
            onReady: (event) => {
              try {
                event.target.playVideo();
              } catch {
                setNeedsUserGesture(true);
              }

              // Autoplay check: if the browser blocks unmuted autoplay, prompt user to start
              setTimeout(() => {
                if (playerRef.current && typeof playerRef.current.getPlayerState === 'function') {
                  try {
                    const st = playerRef.current.getPlayerState();
                    if (st !== 1 && st !== 3) {
                      setNeedsUserGesture(true);
                    }
                  } catch {
                    // Ignore state errors
                  }
                }
              }, 1800);
            },
            onStateChange: (event) => {
              setPlayerState(event.data);
              onStateChangeRef.current?.(event.data);

              if (event.data === window.YT.PlayerState.PLAYING) {
                setNeedsUserGesture(false);
              }

              if (event.data === window.YT.PlayerState.ENDED) {
                onEndedRef.current?.();
              }
            },
            onError: (event) => {
              console.error('YouTube Player Error:', event.data);
              if (event.data === 150 || event.data === 101) {
                setEmbedError('Video owner disabled embedding on third-party sites.');
              } else {
                setEmbedError(`YouTube playback error (${event.data})`);
              }
            },
          },
        });

        playerRef.current = player;
      } catch (err) {
        console.error('Failed to instantiate YT.Player:', err);
      }

      return () => {
        if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
        if (playerRef.current) {
          try {
            playerRef.current.destroy();
          } catch {
            // Ignore destroy errors
          }
          playerRef.current = null;
          currentVideoIdRef.current = null;
        }
      };
    }, [isLoaded, videoId]);

    const handleManualPlay = () => {
      setNeedsUserGesture(false);
      playerRef.current?.playVideo();
    };

    const handleStageClick = () => {
      if (needsUserGesture) {
        handleManualPlay();
        return;
      }
      if (playerRef.current && typeof playerRef.current.getPlayerState === 'function') {
        try {
          const st = playerRef.current.getPlayerState();
          if (st === 1) {
            playerRef.current.pauseVideo();
          } else {
            playerRef.current.playVideo();
          }
        } catch {
          // ignore
        }
      }
    };

    return (
      <div
        onClick={handleStageClick}
        className="relative aspect-video w-full bg-black rounded-2xl overflow-hidden shadow-2xl border border-slate-800 cursor-pointer select-none"
      >
        {/* IFrame Host Container */}
        <div
          ref={containerRef}
          className={`w-full h-full pointer-events-none transition-opacity duration-700 ${
            mode === 'retro' ? 'opacity-30 blur-xs scale-105' : 'opacity-100'
          }`}
        />

        {/* Nostalgic KTV Retro Videoke Background Mode */}
        {mode === 'retro' && (
          <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent flex items-center justify-center">
            {/* Ambient retro light rays & scanlines */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-fuchsia-900/30 via-cyan-900/20 to-black pointer-events-none" />
            <div className="text-center z-10 px-6">
              <span className="text-xs font-digital tracking-widest text-amber-400 font-bold uppercase drop-shadow-[0_0_12px_rgba(251,191,36,0.6)]">
                ★ PINOY VIDEOKE RETRO KTV MODE ★
              </span>
            </div>
          </div>
        )}

        {/* Autoplay / User Gesture Prompt Overlay */}
        {needsUserGesture && (
          <div
            onClick={(e) => {
              e.stopPropagation();
              handleManualPlay();
            }}
            className="absolute inset-0 z-30 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center gap-3 p-6 text-center animate-fade-in"
          >
            <div className="p-4 rounded-full bg-cyan-500/20 border border-cyan-400/40 text-cyan-400 shadow-neon-cyan animate-pulse">
              <Volume2 className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-black text-white">Browser Audio Permission Required</h3>
            <p className="text-xs text-slate-400 font-mono max-w-sm">
              Modern browsers require a click on the screen before playing audio automatically.
            </p>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleManualPlay();
              }}
              className="py-3 px-6 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 text-black font-black uppercase text-sm tracking-wider shadow-neon-cyan active:scale-95 transition-transform flex items-center gap-2 cursor-pointer"
            >
              <Play className="w-4 h-4 fill-black" />
              <span>Start Audio Playback</span>
            </button>
          </div>
        )}

        {/* Embed Restriction Error Fallback */}
        {embedError && (
          <div
            onClick={(e) => e.stopPropagation()}
            className="absolute inset-0 z-30 bg-slate-950/90 flex flex-col items-center justify-center gap-3 p-6 text-center"
          >
            <AlertCircle className="w-10 h-10 text-rose-400" />
            <h3 className="text-lg font-bold text-white">Playback Error</h3>
            <p className="text-xs text-rose-300 font-mono max-w-md">{embedError}</p>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEnded();
              }}
              className="mt-2 py-2 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-mono text-slate-200 transition-colors cursor-pointer"
            >
              Skip to Next Song
            </button>
          </div>
        )}

        {/* Loading / Connecting Overlay */}
        {!isLoaded && !apiError && (
          <div className="absolute inset-0 z-20 bg-slate-950 flex flex-col items-center justify-center gap-3 text-slate-500 font-mono text-xs">
            <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
            <span>Initializing YouTube Engine...</span>
          </div>
        )}
      </div>
    );
  }
);

YouTubePlayer.displayName = 'YouTubePlayer';
export default YouTubePlayer;
