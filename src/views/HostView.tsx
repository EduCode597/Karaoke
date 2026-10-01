import { useState, useEffect, useCallback, useRef } from 'react';
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
import { useMicrophonePitch } from '../hooks/useMicrophonePitch';
import { calculateVideokeScore, VideokeScoreResult } from '../utils/scoring';

export default function HostView() {
  const [roomCode, setRoomCode] = useState<string>(() => {
    return getStoredRoomCode() || generateRoomCode();
  });
  const [copied, setCopied] = useState(false);
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [currentMillisecond, setCurrentMillisecond] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playerMode, setPlayerMode] = useState<'video' | 'retro'>('video');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [activeCheer, setActiveCheer] = useState<string | null>(null);

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
      setCurrentMillisecond(0);
      clearPitchHistory();
      await fetchQueue();
    } catch (err) {
      console.error('Error advancing queue:', err);
    }
  }, [currentTrack, clearPitchHistory, fetchQueue]);

  // Audio SFX generator for remote airhorn blasts
  const playAirhornSound = useCallback(() => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioCtx();
      const freqs = [311.13, 370.0, 466.16];
      freqs.forEach((freq) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, ctx.currentTime);
        gain.gain.setValueAtTime(0.12, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.45);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.45);
      });
    } catch {
      // Audio blocked or not supported
    }
  }, []);

  // Visual cheer trigger
  const triggerCheer = useCallback((text = '🎉 WOO HOO! 🎉') => {
    setActiveCheer(text);
    setTimeout(() => setActiveCheer(null), 2500);
  }, []);

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

    // Broadcast score to remote phones
    sendBroadcastRef.current?.('party:score_reveal', {
      score: scoreResult.score,
      tier: scoreResult.tier,
      commentary: scoreResult.commentary,
      singer: currentTrack.singer_name || 'Guest',
      songTitle: currentTrack.song?.title || 'Song',
    });
  }, [currentTrack, getPitchSamples]);

  // Dismiss score and advance
  const handleScoreDismissed = async () => {
    setIsScoreModalOpen(false);
    setScoreData(null);
    await handleAdvanceQueue();
  };

  // Broadcast Handler for Mobile Remote commands
  const handleBroadcast = useCallback(
    (event: string, payload: any) => {
      if (event === 'player:action') {
        const action = payload?.action;
        if (action === 'play') {
          playerRef.current?.play();
        } else if (action === 'pause') {
          playerRef.current?.pause();
        } else if (action === 'skip') {
          handleSongFinished();
        } else if (action === 'replay') {
          playerRef.current?.replay();
        }
      } else if (event === 'party:sfx') {
        playAirhornSound();
        triggerCheer('📢 AIRHORN BLAST! 📢');
      } else if (event === 'party:cheer') {
        triggerCheer('🎉 PARTY CHEERS! 🎤');
      } else if (event === 'queue:updated') {
        fetchQueue();
      }
    },
    [handleSongFinished, playAirhornSound, triggerCheer, fetchQueue]
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
              Dual-Screen Realtime Player & Scoring Engine
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
        {/* Left 2 Cols: Main Player & Stage Display */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          {/* Main Stage & Player Viewport */}
          <div ref={stageContainerRef} className="relative w-full">
            {currentTrack && currentTrack.song?.youtube_id ? (
              /* Active Playback Stage */
              <div className="relative aspect-video w-full rounded-2xl overflow-hidden shadow-2xl bg-black border border-slate-800">
                <YouTubePlayer
                  ref={playerRef}
                  videoId={currentTrack.song.youtube_id}
                  mode={playerMode}
                  onTimeUpdate={(ms) => setCurrentMillisecond(ms)}
                  onStateChange={(state) => setIsPlaying(state === 1)}
                  onEnded={handleSongFinished}
                />

                {/* Real-time Synchronized LRC Lyrics Display */}
                <LyricsOverlay
                  lrcContent={currentTrack.song.lrc_content}
                  currentMillisecond={currentMillisecond}
                  songTitle={currentTrack.song.title}
                  artist={currentTrack.song.artist}
                  singerName={currentTrack.singer_name}
                />
              </div>
            ) : (
              /* Empty Standby Stage */
              <div className="aspect-video w-full rounded-2xl bg-black border border-slate-800 relative overflow-hidden flex flex-col items-center justify-center p-8 text-center shadow-2xl">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-cyan-500 to-transparent" />

                <div className="flex flex-col items-center gap-4 max-w-md">
                  <div className="w-16 h-16 rounded-full bg-slate-900/80 border border-slate-800 flex items-center justify-center shadow-neon-cyan">
                    <Music className="w-8 h-8 text-cyan-400 animate-pulse" />
                  </div>
                  <h2 className="text-2xl font-black tracking-wide text-white text-glow-cyan">
                    READY FOR SINGER
                  </h2>
                  <p className="text-sm text-slate-400 font-mono">
                    Scan the QR code on the right with your phone to pick a song and step up to the
                    mic!
                  </p>
                </div>

                <div className="absolute bottom-4 left-4 right-4 py-3 px-6 rounded-xl bg-black/80 border border-slate-800/80 backdrop-blur-md flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Volume2 className="w-4 h-4 text-amber-400" />
                    <span className="text-xs font-mono text-slate-400">Microphone: Standby</span>
                  </div>
                  <span className="text-xs font-digital text-amber-400 tracking-wider">
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
            <div className="p-3.5 rounded-2xl bg-slate-950/90 border border-slate-800 flex flex-wrap items-center justify-between gap-3 shadow-lg">
              {/* Playback Transport Buttons */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    if (isPlaying) {
                      playerRef.current?.pause();
                    } else {
                      playerRef.current?.play();
                    }
                  }}
                  className={`py-2 px-4 rounded-xl font-mono text-xs font-bold flex items-center gap-2 active:scale-95 transition-all shadow-md ${
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
                  className="py-2 px-3.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-cyan-500/50 hover:text-cyan-400 text-slate-300 font-mono text-xs flex items-center gap-1.5 active:scale-95 transition-all"
                  title="Score and advance to next queued track"
                >
                  <SkipForward className="w-4 h-4" />
                  <span>Finish / Score</span>
                </button>

                <button
                  onClick={() => playerRef.current?.replay()}
                  className="py-2 px-3.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-fuchsia-500/50 hover:text-fuchsia-400 text-slate-300 font-mono text-xs flex items-center gap-1.5 active:scale-95 transition-all"
                  title="Replay track from beginning"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Replay</span>
                </button>
              </div>

              {/* Mode Toggle & Fullscreen Controls */}
              <div className="flex items-center gap-2">
                {/* Dual Background Mode Toggle (Video vs Retro KTV) */}
                <button
                  onClick={() => setPlayerMode((prev) => (prev === 'video' ? 'retro' : 'video'))}
                  className={`py-2 px-3 rounded-xl border text-xs font-mono flex items-center gap-1.5 active:scale-95 transition-all ${
                    playerMode === 'retro'
                      ? 'bg-fuchsia-950 border-fuchsia-500/60 text-fuchsia-300 shadow-neon-magenta'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                  title="Toggle Retro Videoke Scenery Background"
                >
                  <Film className="w-3.5 h-3.5" />
                  <span>{playerMode === 'retro' ? 'Retro KTV Mode' : 'Native Video'}</span>
                </button>

                {/* Fullscreen Button */}
                <button
                  onClick={toggleFullscreen}
                  className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white active:scale-95 transition-all"
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
          <div className="py-2.5 px-4 rounded-xl bg-slate-950 border border-slate-800/80 overflow-hidden flex items-center gap-3">
            <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-400 text-[10px] font-mono uppercase tracking-wider flex items-center gap-1 whitespace-nowrap">
              <Radio className="w-3 h-3 animate-pulse" />
              Live Room
            </span>
            <div className="overflow-hidden relative w-full">
              <p className="animate-marquee whitespace-nowrap text-xs font-mono text-slate-400">
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

        {/* Right 1 Col: QR Code & Live Party Queue */}
        <div className="flex flex-col gap-5">
          {/* Compact Prominent QR Code Card */}
          <div className="p-5 rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 shadow-xl flex items-center justify-between gap-4">
            <div className="flex flex-col gap-1 max-w-[160px]">
              <div className="flex items-center gap-1.5 text-cyan-400">
                <Smartphone className="w-4 h-4" />
                <h3 className="font-bold text-xs tracking-wider uppercase">Scan to Control</h3>
              </div>
              <p className="text-[11px] text-slate-400 font-mono leading-tight">
                Scan with your phone camera to open the 5-digit keypad
              </p>
              <span className="text-[10px] text-amber-400 font-digital font-bold mt-1">
                CODE: {roomCode}
              </span>
            </div>

            {/* QR Code Container */}
            <div className="p-2.5 rounded-xl bg-slate-950 border border-cyan-500/50 shadow-neon-cyan shrink-0">
              <QRCodeSVG
                value={remoteJoinUrl}
                size={110}
                bgColor="#030712"
                fgColor="#06b6d4"
                level="M"
                includeMargin={false}
              />
            </div>
          </div>

          {/* Live Party Queue Display */}
          <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ListMusic className="w-4 h-4 text-fuchsia-400" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  Party Playlist
                </h4>
              </div>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                {queue.length} in queue
              </span>
            </div>

            {/* Playlist Items */}
            <div className="flex flex-col gap-2 max-h-56 overflow-y-auto pr-1">
              {queue.length === 0 ? (
                <div className="py-6 text-center text-slate-600 font-mono text-xs">
                  The party queue is empty!
                  <br />
                  <span className="text-[10px] text-slate-700">
                    Use your phone remote to reserve a song.
                  </span>
                </div>
              ) : (
                queue.map((item, idx) => {
                  const isCurrent = idx === 0;

                  return (
                    <div
                      key={item.id}
                      className={`p-2.5 rounded-xl border flex items-center justify-between gap-2 text-xs transition-all ${
                        isCurrent
                          ? 'bg-gradient-to-r from-cyan-950/50 to-slate-900 border-cyan-500/50 shadow-neon-cyan/20'
                          : 'bg-slate-900/80 border-slate-800/80'
                      }`}
                    >
                      <div className="flex items-center gap-2 overflow-hidden">
                        <span
                          className={`w-5 h-5 rounded-lg font-mono font-bold flex items-center justify-center text-[10px] shrink-0 ${
                            isCurrent
                              ? 'bg-cyan-500 text-black shadow-neon-cyan'
                              : 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          {isCurrent ? <Sparkles className="w-3 h-3" /> : idx + 1}
                        </span>
                        <div className="overflow-hidden">
                          <h5 className="font-bold text-white text-xs truncate">
                            {item.song?.title || 'Unknown Title'}
                          </h5>
                          <p className="text-[10px] text-slate-400 truncate flex items-center gap-1">
                            <User className="w-2.5 h-2.5 text-cyan-400" />
                            <span>{item.singer_name || 'Guest'}</span>
                          </p>
                        </div>
                      </div>

                      <span className="font-digital text-amber-400 text-xs font-bold shrink-0">
                        {item.song?.code}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Live Realtime Activity Monitor */}
          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 flex flex-col gap-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="w-3.5 h-3.5 text-emerald-400" />
                <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-300">
                  Realtime Activity
                </h4>
              </div>
              <span className="text-[10px] font-mono text-slate-500">
                {isSupabaseConfigured ? 'Supabase Broadcast' : 'Demo Mode'}
              </span>
            </div>

            {/* Activity Stream */}
            <div className="flex flex-col gap-1.5 max-h-32 overflow-y-auto pr-1">
              {recentEvents.length === 0 ? (
                <div className="py-3 text-center text-slate-600 font-mono text-[11px]">
                  Awaiting remote control events...
                </div>
              ) : (
                recentEvents.slice(0, 5).map((evt, idx) => (
                  <div
                    key={idx}
                    className="p-1.5 px-2.5 rounded-lg bg-slate-900/60 border border-slate-800/80 text-[11px] font-mono flex items-center justify-between gap-2"
                  >
                    <span className="text-cyan-400 font-bold truncate">{evt.event}</span>
                    <span className="text-slate-500 text-[10px] shrink-0">{evt.timestamp}</span>
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
      <footer className="border-t border-slate-900/80 px-6 py-3 bg-slate-950/60 text-slate-600 text-[11px] font-mono flex items-center justify-between z-10">
        <span>PinoyVideoke Host View v1.4.0</span>
        <span>YIN Pitch Algorithm • Web Audio Engine • Realtime Scoring</span>
      </footer>
    </div>
  );
}
