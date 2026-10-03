import { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import {
  Smartphone,
  Activity,
  Volume2,
  Music,
  Radio,
  ListMusic,
  User,
  Sparkles,
  Play,
  Pause,
  SkipForward,
  RotateCcw,
  Film,
  Maximize,
  Minimize,
  Share2,
} from 'lucide-react';
import { generateRoomCode, getStoredRoomCode, setStoredRoomCode } from '../utils/room';
import { useRoomChannel } from '../hooks/useRoomChannel';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { getRoomQueue, completeSongInQueue } from '../lib/songs';
import type { QueueItem } from '../types/song';

import YouTubePlayer, { YouTubePlayerHandle } from '../components/player/YouTubePlayer';
import LyricsOverlay from '../components/player/LyricsOverlay';
import PitchMonitor from '../components/player/PitchMonitor';
import ScoreModal from '../components/player/ScoreModal';
import TickerBanner from '../components/player/TickerBanner';
import { useMicrophonePitch } from '../hooks/useMicrophonePitch';
import { calculateVideokeScore, VideokeScoreResult } from '../utils/scoring';
import { playSoundEffect } from '../utils/soundEffects';

export default function HostView() {
  const [searchParams, setSearchParams] = useSearchParams();
  const roomParam = searchParams.get('room')?.toUpperCase().trim();

  const [roomCode, setRoomCode] = useState<string>(() => {
    return roomParam || getStoredRoomCode() || generateRoomCode();
  });
  const [copied, setCopied] = useState(false);
  const [copiedScreen, setCopiedScreen] = useState(false);
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playerMode, setPlayerMode] = useState<'video' | 'retro'>('video');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [activeCheer, setActiveCheer] = useState<string | null>(null);
  const [keyOffset, setKeyOffset] = useState<number>(0);

  // Scoring Modal State
  const [isScoreModalOpen, setIsScoreModalOpen] = useState(false);
  const [scoreData, setScoreData] = useState<{
    result: VideokeScoreResult;
    singer: string;
    songTitle: string;
  } | null>(null);

  const playerRef = useRef<YouTubePlayerHandle | null>(null);
  const stageContainerRef = useRef<HTMLDivElement | null>(null);

  // Real-time Microphone Pitch Detection Engine
  const {
    isListening,
    micPermission,
    currentPitch,
    rmsVolume,
    startListening,
    stopListening,
    clearPitchHistory,
    getPitchSamples,
  } = useMicrophonePitch();

  // Keep room code persisted in session & URL
  useEffect(() => {
    setStoredRoomCode(roomCode);
    if (searchParams.get('room')?.toUpperCase() !== roomCode) {
      setSearchParams({ room: roomCode }, { replace: true });
    }
  }, [roomCode, searchParams, setSearchParams]);

  const remoteJoinUrl = `${window.location.origin}/remote?room=${roomCode}`;
  const screenJoinUrl = `${window.location.origin}/host?room=${roomCode}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(remoteJoinUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyScreenLink = () => {
    navigator.clipboard.writeText(screenJoinUrl);
    setCopiedScreen(true);
    setTimeout(() => setCopiedScreen(false), 2000);
  };

  const handleRegenerateRoom = () => {
    const newCode = generateRoomCode();
    setRoomCode(newCode);
    setSearchParams({ room: newCode });
  };

  // Sync Queue from Supabase
  const fetchQueue = useCallback(async () => {
    if (!roomCode) return;
    try {
      const items = await getRoomQueue(roomCode);
      setQueue(items);
    } catch (err) {
      console.error('Failed to fetch queue in HostView:', err);
    }
  }, [roomCode]);

  const currentTrack = queue[0] || null;

  // Advance to next song
  const handleAdvanceQueue = useCallback(async () => {
    if (!currentTrack) return;
    try {
      await completeSongInQueue(currentTrack.id);
      setKeyOffset(0);
      clearPitchHistory();
      await fetchQueue();
    } catch (err) {
      console.error('Error advancing queue:', err);
    }
  }, [currentTrack, clearPitchHistory, fetchQueue]);

  // Visual cheer trigger
  const triggerCheer = useCallback((text = '🎉 WOO HOO! 🎉') => {
    setActiveCheer(text);
    setTimeout(() => setActiveCheer(null), 2500);
  }, []);

  const handleKeyChange = useCallback(
    (newKey: number) => {
      const clamped = Math.max(-6, Math.min(6, newKey));
      setKeyOffset(clamped);
      sendBroadcastRef.current?.('player:transpose', { key: clamped });
      triggerCheer(`🎵 KEY: ${clamped > 0 ? `+${clamped}` : clamped === 0 ? 'ORIGINAL' : clamped}`);
    },
    [triggerCheer]
  );

  // Trigger Videoke Score Reveal upon song completion
  const handleSongFinished = useCallback(async () => {
    if (!currentTrack) return;

    const samples = getPitchSamples();
    const duration = currentTrack.song?.duration || 180;
    const scoreResult = calculateVideokeScore(samples, duration);

    setScoreData({
      result: scoreResult,
      singer: currentTrack.singer_name || 'Guest',
      songTitle: currentTrack.song?.title || 'Song',
    });
    setIsScoreModalOpen(true);

    // Broadcast score to remote phones and connected screens
    sendBroadcastRef.current?.('party:score_reveal', {
      result: scoreResult,
      singer: currentTrack.singer_name || 'Guest',
      songTitle: currentTrack.song?.title || 'Song',
    });
  }, [currentTrack, getPitchSamples]);

  // Dismiss score and advance
  const handleScoreDismissed = async () => {
    setIsScoreModalOpen(false);
    setScoreData(null);
    sendBroadcastRef.current?.('party:score_dismiss', {});
    await handleAdvanceQueue();
  };

  // Broadcast Handler for Mobile Remote & Synced Host Screens
  const handleBroadcast = useCallback(
    (event: string, payload: any) => {
      if (event === 'player:action') {
        const action = payload?.action;
        if (action === 'play') {
          playerRef.current?.play();
          if (typeof payload?.time === 'number') {
            const local = playerRef.current?.getCurrentTime() || 0;
            if (Math.abs(local - payload.time) > 1.5) {
              playerRef.current?.seekTo(payload.time);
            }
          }
        } else if (action === 'pause') {
          playerRef.current?.pause();
          if (typeof payload?.time === 'number') {
            playerRef.current?.seekTo(payload.time);
          }
        } else if (action === 'skip') {
          handleSongFinished();
        } else if (action === 'replay') {
          playerRef.current?.replay();
        }
      } else if (event === 'player:sync') {
        if (typeof payload?.time === 'number') {
          const local = playerRef.current?.getCurrentTime() || 0;
          if (Math.abs(local - payload.time) > 2.0) {
            playerRef.current?.seekTo(payload.time);
          }
        }
      } else if (event === 'party:score_reveal') {
        const result: VideokeScoreResult = payload?.result || {
          score: payload?.score || 88,
          tier: payload?.tier || 'concert',
          commentary: payload?.commentary || 'Awesome singing!',
          subtext: 'Boses Pang-Concert!',
          stats: {
            totalSamples: 100,
            activeSamples: 85,
            singingRatio: 0.85,
            pitchStability: 85,
          },
        };
        setScoreData({
          result,
          singer: payload?.singer || 'Guest',
          songTitle: payload?.songTitle || 'Song',
        });
        setIsScoreModalOpen(true);
      } else if (event === 'party:score_dismiss') {
        setIsScoreModalOpen(false);
        setScoreData(null);
        fetchQueue();
      } else if (event === 'party:sfx') {
        const sfxType = payload?.sfxType || 'airhorn';
        playSoundEffect(sfxType);
        if (sfxType === 'airhorn') triggerCheer('📢 REGGAE AIRHORN BLAST! 📢');
        else if (sfxType === 'applause') triggerCheer('👏 STANDING OVATION & CHEERS! 👏');
        else if (sfxType === 'drumroll') triggerCheer('🥁 DRAMATIC DRUMROLL! 🥁');
        else if (sfxType === 'gong') triggerCheer('🔔 TAWAG NG TANGHALAN FAIL GONG! 🔔');
        else triggerCheer('🎉 PARTY SOUND EFFECT! 🎉');
      } else if (event === 'party:cheer') {
        playSoundEffect('applause');
        triggerCheer('🎉 PARTY CHEERS! 🎤');
      } else if (event === 'player:transpose') {
        const newKey = typeof payload?.key === 'number' ? payload.key : 0;
        const clamped = Math.max(-6, Math.min(6, newKey));
        setKeyOffset(clamped);
        triggerCheer(
          `🎵 KEY TRANSPOSE: ${clamped > 0 ? `+${clamped}` : clamped === 0 ? 'ORIGINAL' : clamped}`
        );
      } else if (event === 'queue:updated') {
        fetchQueue();
      }
    },
    [handleSongFinished, triggerCheer, fetchQueue]
  );

  const { status, onlineCount, recentEvents, sendBroadcast } = useRoomChannel(
    roomCode,
    true,
    handleBroadcast
  );

  const sendBroadcastRef = useRef(sendBroadcast);
  sendBroadcastRef.current = sendBroadcast;

  useEffect(() => {
    fetchQueue();

    if (!isSupabaseConfigured || !roomCode) return;

    // Realtime Postgres Changes Subscription for TV Queue
    const channel = supabase
      .channel(`host-queue:${roomCode}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'queue_items',
          filter: `room_code=eq.${roomCode}`,
        },
        () => {
          fetchQueue();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [roomCode, fetchQueue]);

  const handleStateChange = useCallback((state: number) => {
    setIsPlaying(state === 1);
  }, []);

  // Periodic playback sync broadcast across connected screens (every 4s while playing)
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      const time = playerRef.current?.getCurrentTime?.();
      if (typeof time === 'number' && time > 0) {
        sendBroadcastRef.current?.('player:sync', { time });
      }
    }, 4000);
    return () => clearInterval(interval);
  }, [isPlaying]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      stageContainerRef.current?.requestFullscreen?.();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.();
      setIsFullscreen(false);
    }
  };

  const handleToggleMic = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  return (
    <div className="min-h-screen bg-videoke-bg text-slate-100 flex flex-col justify-between relative overflow-hidden crt-overlay">
      {/* Top Authentic Marquee Ticker & Control Bar */}
      <TickerBanner
        roomCode={roomCode}
        onlineCount={onlineCount}
        status={status}
        queue={queue}
        onRegenerateRoom={handleRegenerateRoom}
        onCopyLink={handleCopyLink}
        copied={copied}
        remoteJoinUrl={remoteJoinUrl}
        onCopyScreenLink={handleCopyScreenLink}
        copiedScreen={copiedScreen}
        screenJoinUrl={screenJoinUrl}
      />

      {/* Main TV Layout */}
      <main className="flex-1 max-w-[1720px] mx-auto w-full p-4 sm:p-6 lg:p-8 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start z-10">
        {/* Left 7-8 Cols: Main Player & Stage Display */}
        <div className="lg:col-span-7 xl:col-span-8 flex flex-col gap-5">
          {/* Main Stage & Player Viewport */}
          <div ref={stageContainerRef} className="relative w-full">
            {currentTrack && currentTrack.song?.youtube_id ? (
              /* Active Playback Stage */
              <div className="relative aspect-video w-full rounded-2xl overflow-hidden shadow-2xl bg-black border border-slate-800">
                <YouTubePlayer
                  ref={playerRef}
                  videoId={currentTrack.song.youtube_id}
                  mode={playerMode}
                  onStateChange={handleStateChange}
                  onEnded={handleSongFinished}
                />

                {/* Sleek Auto-Fading Stage Banner */}
                <LyricsOverlay
                  songTitle={currentTrack.song.title}
                  artist={currentTrack.song.artist}
                  singerName={currentTrack.singer_name}
                  code={currentTrack.song.code}
                  isPlaying={isPlaying}
                  lrcContent={currentTrack.song.lrc_content}
                />
              </div>
            ) : (
              /* Empty Standby Stage */
              <div className="aspect-video w-full rounded-2xl bg-black border border-slate-800 relative overflow-hidden flex flex-col items-center justify-center p-6 sm:p-10 lg:p-14 text-center shadow-2xl">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-cyan-500 to-transparent" />

                <div className="flex flex-col items-center gap-4 sm:gap-5 max-w-xl">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 rounded-3xl bg-slate-900/90 border border-slate-800 flex items-center justify-center shadow-neon-cyan transition-transform hover:scale-105">
                    <Music className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 text-cyan-400 animate-pulse" />
                  </div>
                  <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black tracking-wide text-white text-glow-cyan">
                    READY FOR SINGER
                  </h2>
                  <p className="text-xs sm:text-sm md:text-base text-slate-400 font-mono leading-relaxed">
                    Scan the QR code on the right with your phone to pick a song and step up to the
                    mic!
                  </p>
                </div>

                <div className="absolute bottom-3 sm:bottom-4 left-3 sm:left-4 right-3 sm:right-4 py-2.5 sm:py-3 px-4 sm:px-6 rounded-xl sm:rounded-2xl bg-black/85 border border-slate-800/80 backdrop-blur-md flex items-center justify-between text-xs sm:text-sm">
                  <div className="flex items-center gap-2">
                    <Volume2 className="w-4 h-4 text-amber-400" />
                    <span className="font-mono text-slate-300">Microphone: Standby</span>
                  </div>
                  <span className="font-digital text-amber-400 tracking-wider font-bold">
                    PINOYVIDEOKE ENGINE • STANDBY
                  </span>
                </div>
              </div>
            )}

            {/* Floating Visual Cheer Reaction Banner */}
            {activeCheer && (
              <div className="absolute top-8 left-1/2 -translate-x-1/2 z-40 px-6 py-3 rounded-2xl bg-fuchsia-950/90 border border-fuchsia-500/60 text-fuchsia-200 font-black text-sm uppercase tracking-widest shadow-2xl backdrop-blur-md animate-bounce">
                {activeCheer}
              </div>
            )}
          </div>

          {/* Real-time Microphone Pitch & Volume Level Monitor */}
          <PitchMonitor
            isListening={isListening}
            currentPitch={currentPitch}
            rmsVolume={rmsVolume}
            micPermission={micPermission}
            onToggleMic={handleToggleMic}
          />

          {/* Interactive Player Stage Control Toolbar */}
          {currentTrack && (
            <div className="p-3 sm:p-4 rounded-2xl bg-slate-950/90 border border-slate-800 flex flex-wrap items-center justify-between gap-3 shadow-lg">
              {/* Playback Transport Buttons */}
              <div className="flex items-center gap-2 sm:gap-2.5">
                <button
                  onClick={() => {
                    const time = playerRef.current?.getCurrentTime?.() || 0;
                    if (isPlaying) {
                      playerRef.current?.pause();
                      sendBroadcastRef.current?.('player:action', { action: 'pause', time });
                    } else {
                      playerRef.current?.play();
                      sendBroadcastRef.current?.('player:action', { action: 'play', time });
                    }
                  }}
                  className={`py-2.5 px-4 sm:px-5 rounded-xl font-mono text-xs sm:text-sm font-bold flex items-center gap-2 active:scale-95 transition-all shadow-md touch-manipulation min-h-[44px] ${
                    isPlaying
                      ? 'bg-amber-400 hover:bg-amber-300 text-black shadow-neon-amber'
                      : 'bg-emerald-500 hover:bg-emerald-400 text-black shadow-[0_0_12px_#10b981]'
                  }`}
                >
                  {isPlaying ? (
                    <>
                      <Pause className="w-4 h-4 fill-black" />
                      <span>Pause</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 fill-black" />
                      <span>Play</span>
                    </>
                  )}
                </button>

                <button
                  onClick={handleSongFinished}
                  className="py-2.5 px-3.5 sm:px-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-cyan-500/50 hover:text-cyan-400 text-slate-300 font-mono text-xs sm:text-sm flex items-center gap-1.5 active:scale-95 transition-all touch-manipulation min-h-[44px]"
                  title="Score and advance to next queued track"
                >
                  <SkipForward className="w-4 h-4" />
                  <span>Finish / Score</span>
                </button>

                <button
                  onClick={() => {
                    playerRef.current?.replay();
                    sendBroadcastRef.current?.('player:action', { action: 'replay' });
                  }}
                  className="py-2.5 px-3.5 sm:px-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-fuchsia-500/50 hover:text-fuchsia-400 text-slate-300 font-mono text-xs sm:text-sm flex items-center gap-1.5 active:scale-95 transition-all touch-manipulation min-h-[44px]"
                  title="Replay track from beginning"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Replay</span>
                </button>
              </div>

              {/* Key Transpose Pitch Offset Control Pill */}
              <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-900 border border-slate-800 shadow-inner min-h-[44px]">
                <span className="text-xs font-mono text-slate-400 font-bold uppercase">Key:</span>
                <button
                  onClick={() => handleKeyChange(keyOffset - 1)}
                  disabled={keyOffset <= -6}
                  className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-slate-950 hover:bg-slate-800 text-fuchsia-400 font-digital font-bold text-sm sm:text-base flex items-center justify-center active:scale-95 transition-all disabled:opacity-40 touch-manipulation"
                  title="Lower key (-1 semitone)"
                >
                  ♭
                </button>
                <span
                  className={`font-digital text-xs sm:text-sm font-bold px-1.5 tracking-wider ${
                    keyOffset === 0
                      ? 'text-slate-400'
                      : keyOffset > 0
                        ? 'text-cyan-400 text-glow-cyan'
                        : 'text-fuchsia-400 text-glow-magenta'
                  }`}
                >
                  {keyOffset > 0 ? `+${keyOffset}` : keyOffset === 0 ? 'ORIG' : keyOffset}
                </span>
                <button
                  onClick={() => handleKeyChange(keyOffset + 1)}
                  disabled={keyOffset >= 6}
                  className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-slate-950 hover:bg-slate-800 text-cyan-400 font-digital font-bold text-sm sm:text-base flex items-center justify-center active:scale-95 transition-all disabled:opacity-40 touch-manipulation"
                  title="Raise key (+1 semitone)"
                >
                  ♯
                </button>
              </div>

              {/* Mode Toggle & Fullscreen Controls */}
              <div className="flex items-center gap-2">
                {/* Dual Background Mode Toggle (Video vs Retro KTV) */}
                <button
                  onClick={() => setPlayerMode((prev) => (prev === 'video' ? 'retro' : 'video'))}
                  className={`py-2 px-3 sm:px-3.5 rounded-xl border text-xs sm:text-sm font-mono flex items-center gap-1.5 active:scale-95 transition-all touch-manipulation min-h-[44px] ${
                    playerMode === 'retro'
                      ? 'bg-fuchsia-950 border-fuchsia-500/60 text-fuchsia-300 shadow-neon-magenta'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                  title="Toggle Retro Videoke Scenery Background"
                >
                  <Film className="w-4 h-4" />
                  <span>{playerMode === 'retro' ? 'Retro KTV Mode' : 'Native Video'}</span>
                </button>

                {/* Fullscreen Button */}
                <button
                  onClick={toggleFullscreen}
                  className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white active:scale-95 transition-all touch-manipulation min-h-[44px] min-w-[44px] flex items-center justify-center"
                  title="Toggle Fullscreen Stage"
                >
                  {isFullscreen ? (
                    <Minimize className="w-4 h-4" />
                  ) : (
                    <Maximize className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Room Pairing Ticker Marquee */}
          <div className="py-3 px-4 sm:px-5 rounded-2xl bg-slate-950 border border-slate-800/80 overflow-hidden flex items-center gap-3 shadow-md">
            <span className="px-2.5 py-1 rounded-lg bg-cyan-500/20 text-cyan-400 text-xs font-mono uppercase tracking-wider flex items-center gap-1.5 whitespace-nowrap font-bold">
              <Radio className="w-3.5 h-3.5 animate-pulse" />
              Live Room
            </span>
            <div className="overflow-hidden relative w-full">
              <p className="animate-marquee whitespace-nowrap text-xs sm:text-sm font-mono text-slate-400">
                ★ PAIR YOUR PHONE VIA QR CODE ★ ROOM CODE:{' '}
                <span className="text-amber-400 font-bold">{roomCode}</span> ★ CONNECTED REMOTES:{' '}
                <span className="text-cyan-400 font-bold">{onlineCount}</span> ★{' '}
                {currentTrack
                  ? `NOW PERFORMING: ${currentTrack.singer_name} singing "${currentTrack.song?.title}" ★ `
                  : 'READY FOR SINGERS ★ '}
                MIC PITCH DETECTION & VIDEOKE SCORING ACTIVE ★
              </p>
            </div>
          </div>
        </div>

        {/* Right 4-5 Cols: QR Code & Live Party Queue (Wraps into 2-cols on iPad portrait) */}
        <div className="lg:col-span-5 xl:col-span-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-5">
          {/* Prominent QR Code Card */}
          <div className="md:col-span-1 lg:col-span-1 p-5 sm:p-6 rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 shadow-xl flex items-center justify-between gap-4">
            <div className="flex flex-col gap-1.5 flex-1 min-w-0">
              <div className="flex items-center gap-2 text-cyan-400">
                <Smartphone className="w-4 h-4 sm:w-5 sm:h-5" />
                <h3 className="font-bold text-xs sm:text-sm tracking-wider uppercase">
                  Scan to Control
                </h3>
              </div>
              <p className="text-xs sm:text-sm text-slate-400 font-mono leading-snug">
                Scan with your phone to open the 5-digit keypad
              </p>
              <span className="text-xs sm:text-sm text-amber-400 font-digital font-bold mt-1 text-glow-amber">
                CODE: {roomCode}
              </span>
            </div>

            {/* QR Code Container */}
            <div className="p-3 sm:p-3.5 rounded-2xl bg-slate-950 border border-cyan-500/50 shadow-neon-cyan shrink-0">
              <QRCodeSVG
                value={remoteJoinUrl}
                size={132}
                bgColor="#030712"
                fgColor="#06b6d4"
                level="M"
                includeMargin={false}
              />
            </div>
          </div>

          {/* Share Screen Link Card for Distant Friends */}
          <div className="md:col-span-1 lg:col-span-1 p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-fuchsia-950/60 to-slate-950 border border-fuchsia-500/40 shadow-xl flex items-center justify-between gap-4">
            <div className="flex flex-col gap-1 min-w-0">
              <div className="flex items-center gap-2 text-fuchsia-400">
                <Share2 className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
                <h4 className="font-bold text-xs sm:text-sm tracking-wider uppercase">
                  Singing with Distant Friends?
                </h4>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-400 font-mono leading-tight">
                Send your friend this screen link so you watch & sing to the same screen together!
              </p>
            </div>
            <button
              onClick={handleCopyScreenLink}
              className="px-3.5 py-2 rounded-xl bg-fuchsia-600 hover:bg-fuchsia-500 text-white font-mono font-bold text-xs flex items-center gap-1.5 transition-all shrink-0 active:scale-95 shadow-neon-magenta touch-manipulation min-h-[44px]"
            >
              {copiedScreen ? 'Link Copied!' : 'Copy Screen Link'}
            </button>
          </div>

          {/* Live Party Queue Display */}
          <div className="md:col-span-1 lg:col-span-1 p-5 sm:p-6 rounded-2xl bg-slate-950/80 border border-slate-800 flex flex-col gap-3.5 shadow-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ListMusic className="w-4 h-4 text-fuchsia-400" />
                <h4 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-200">
                  Party Playlist
                </h4>
              </div>
              <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 font-bold">
                {queue.length} in queue
              </span>
            </div>

            {/* Playlist Items */}
            <div className="flex flex-col gap-2 max-h-72 sm:max-h-80 lg:max-h-[360px] overflow-y-auto pr-1">
              {queue.length === 0 ? (
                <div className="py-8 text-center text-slate-500 font-mono text-xs sm:text-sm">
                  The party queue is empty!
                  <br />
                  <span className="text-xs text-slate-600">
                    Use your phone remote to reserve a song.
                  </span>
                </div>
              ) : (
                queue.map((item, idx) => {
                  const isCurrent = idx === 0;

                  return (
                    <div
                      key={item.id}
                      className={`p-3 rounded-xl border flex items-center justify-between gap-2.5 text-xs sm:text-sm transition-all ${
                        isCurrent
                          ? 'bg-gradient-to-r from-cyan-950/60 to-slate-900 border-cyan-500/50 shadow-neon-cyan/20'
                          : 'bg-slate-900/80 border-slate-800/80'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 overflow-hidden">
                        <span
                          className={`w-5 h-5 sm:w-6 sm:h-6 rounded-lg font-mono font-bold flex items-center justify-center text-xs shrink-0 ${
                            isCurrent
                              ? 'bg-cyan-500 text-black shadow-neon-cyan'
                              : 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          {isCurrent ? <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> : idx + 1}
                        </span>
                        <div className="overflow-hidden">
                          <h5 className="font-bold text-white text-xs sm:text-sm truncate">
                            {item.song?.title || 'Unknown Title'}
                          </h5>
                          <p className="text-[11px] sm:text-xs text-slate-400 truncate flex items-center gap-1 mt-0.5">
                            <User className="w-3 h-3 text-cyan-400" />
                            <span>{item.singer_name || 'Guest'}</span>
                          </p>
                        </div>
                      </div>

                      <span className="font-digital text-amber-400 text-xs sm:text-sm font-bold shrink-0">
                        {item.song?.code}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Live Realtime Activity Monitor */}
          <div className="md:col-span-2 lg:col-span-1 p-4 sm:p-5 rounded-2xl bg-slate-950/80 border border-slate-800 flex flex-col gap-3 shadow-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-400" />
                <h4 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-200">
                  Realtime Activity
                </h4>
              </div>
              <span className="text-[11px] font-mono text-slate-400">
                {isSupabaseConfigured ? 'Supabase Broadcast' : 'Demo Mode'}
              </span>
            </div>

            {/* Activity Stream */}
            <div className="flex flex-col gap-2 max-h-36 sm:max-h-44 overflow-y-auto pr-1">
              {recentEvents.length === 0 ? (
                <div className="py-4 text-center text-slate-500 font-mono text-xs">
                  Awaiting remote control events...
                </div>
              ) : (
                recentEvents.slice(0, 5).map((evt, idx) => (
                  <div
                    key={idx}
                    className="p-2 px-3 rounded-xl bg-slate-900/60 border border-slate-800/80 text-xs font-mono flex items-center justify-between gap-2"
                  >
                    <span className="text-cyan-400 font-bold truncate">{evt.event}</span>
                    <span className="text-slate-500 text-[11px] shrink-0">{evt.timestamp}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Dramatic Fullscreen Videoke Score Reveal Modal */}
      <ScoreModal
        isOpen={isScoreModalOpen}
        result={scoreData?.result || null}
        singerName={scoreData?.singer}
        songTitle={scoreData?.songTitle}
        onClose={handleScoreDismissed}
        autoDismissSeconds={9}
      />

      {/* Footer */}
      <footer className="border-t border-slate-900/80 px-4 sm:px-6 lg:px-8 py-3.5 bg-slate-950/60 text-slate-500 text-xs sm:text-sm font-mono z-10">
        <div className="max-w-[1720px] mx-auto w-full flex flex-wrap items-center justify-between gap-2">
          <span>PinoyVideoke Host View v1.4.0</span>
          <span>YIN Pitch Algorithm • Web Audio Engine • Realtime Scoring</span>
        </div>
      </footer>
    </div>
  );
}
