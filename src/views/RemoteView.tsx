import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  Smartphone,
  Tv,
  Radio,
  Bell,
  Play,
  Pause,
  SkipForward,
  RotateCcw,
  Volume2,
  ArrowLeft,
  Grid3X3 as KeypadIcon,
  BookOpen,
  ListMusic,
} from 'lucide-react';
import { useRoomChannel } from '../hooks/useRoomChannel';
import { setStoredRoomCode, getStoredRoomCode } from '../utils/room';

export default function RemoteView() {
  const [searchParams, setSearchParams] = useSearchParams();
  const roomParam = searchParams.get('room') || getStoredRoomCode() || '';

  const [inputRoom, setInputRoom] = useState(roomParam);
  const [activeRoom, setActiveRoom] = useState(roomParam);
  const [activeTab, setActiveTab] = useState<'keypad' | 'songbook' | 'queue'>('keypad');

  const { status, onlineCount, sendBroadcast } = useRoomChannel(activeRoom, false);

  // Sync active room to session and URL
  useEffect(() => {
    if (activeRoom) {
      setStoredRoomCode(activeRoom);
      setSearchParams({ room: activeRoom });
    }
  }, [activeRoom, setSearchParams]);

  // Haptic feedback trigger
  const triggerHaptic = (ms = 15) => {
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate(ms);
    }
  };

  const handleConnect = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputRoom.trim()) {
      setActiveRoom(inputRoom.trim().toUpperCase());
    }
  };

  const handleBroadcastAction = async (actionName: string, payload: any = {}) => {
    triggerHaptic(25);
    await sendBroadcast(actionName, {
      ...payload,
      sentFrom: 'Mobile Remote',
    });
  };

  // If no room is active, render the Room Code Entry Screen
  if (!activeRoom) {
    return (
      <div className="min-h-screen bg-videoke-bg text-slate-100 flex flex-col justify-between p-6">
        <header className="flex items-center gap-3">
          <Link
            to="/"
            className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-lg font-bold text-glow-magenta text-fuchsia-400">
            CONNECT TO TV ROOM
          </h1>
        </header>

        <main className="max-w-md mx-auto w-full flex flex-col gap-6 my-auto">
          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl flex flex-col gap-4 text-center">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-fuchsia-950/80 border border-fuchsia-500/40 flex items-center justify-center text-fuchsia-400 shadow-neon-magenta">
              <Tv className="w-8 h-8" />
            </div>

            <div className="flex flex-col gap-1">
              <h2 className="text-xl font-black text-white">Enter Room Code</h2>
              <p className="text-xs text-slate-400 font-mono">
                Look at the TV screen for the 6-character room code (e.g. KANTA-88)
              </p>
            </div>

            <form onSubmit={handleConnect} className="flex flex-col gap-4 mt-2">
              <input
                type="text"
                value={inputRoom}
                onChange={(e) => setInputRoom(e.target.value.toUpperCase())}
                placeholder="e.g. KANTA-88"
                maxLength={10}
                className="w-full text-center py-4 px-4 rounded-xl bg-slate-950 border-2 border-slate-800 focus:border-fuchsia-500 focus:outline-none text-2xl font-digital font-bold tracking-widest text-amber-400 placeholder:text-slate-700"
                autoFocus
              />

              <button
                type="submit"
                className="w-full py-4 rounded-xl bg-gradient-to-r from-fuchsia-600 to-cyan-600 text-black font-black tracking-wider text-sm uppercase active:scale-95 transition-transform shadow-neon-magenta"
              >
                Connect to TV
              </button>
            </form>
          </div>
        </main>

        <footer className="text-center text-xs text-slate-600 font-mono">
          Tip: You can also scan the QR code on the TV screen to connect automatically
        </footer>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-videoke-bg text-slate-100 flex flex-col justify-between selection:bg-fuchsia-500 selection:text-black">
      {/* Top Header Banner */}
      <header className="border-b border-slate-800 bg-slate-950/90 backdrop-blur-md px-4 py-3 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <Link
            to="/"
            className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-1.5">
              <span
                className={`w-2 h-2 rounded-full ${
                  status === 'connected'
                    ? 'bg-emerald-400 shadow-[0_0_8px_#34d399]'
                    : status === 'offline_demo'
                      ? 'bg-amber-400'
                      : 'bg-red-500 animate-pulse'
                }`}
              />
              <span className="text-[10px] uppercase font-mono text-slate-400">
                {status === 'connected' ? `Paired to TV (${onlineCount} in room)` : 'Connecting...'}
              </span>
            </div>
            <p className="text-sm font-digital font-black text-amber-400 tracking-wider">
              {activeRoom}
            </p>
          </div>
        </div>

        {/* Change Room Button */}
        <button
          onClick={() => {
            setActiveRoom('');
            setStoredRoomCode('');
          }}
          className="text-[11px] font-mono px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors"
        >
          Change Room
        </button>
      </header>

      {/* Main Remote Controls Area */}
      <main className="max-w-md mx-auto w-full px-4 py-5 flex-1 flex flex-col gap-5">
        {/* Real-Time Handshake Tester Card */}
        <div className="p-4 rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 shadow-lg flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold font-mono uppercase text-cyan-400 flex items-center gap-1.5">
              <Radio className="w-3.5 h-3.5" />
              Live TV Handshake Test
            </span>
            <span className="text-[10px] font-mono text-slate-500">Sub-20ms Broadcast</span>
          </div>

          <p className="text-xs text-slate-400">
            Tap below to send instant real-time events to the TV Host screen:
          </p>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() =>
                handleBroadcastAction('party:ping', { message: 'Hello from Mobile Remote! 👋' })
              }
              className="py-3 px-4 rounded-xl bg-slate-900 border border-cyan-500/40 hover:bg-cyan-950 text-cyan-400 font-mono text-xs font-bold flex items-center justify-center gap-2 active:scale-95 transition-all shadow-neon-cyan"
            >
              <Bell className="w-4 h-4" />
              <span>Ping TV Screen</span>
            </button>

            <button
              onClick={() => handleBroadcastAction('party:sfx', { sfxType: 'airhorn' })}
              className="py-3 px-4 rounded-xl bg-slate-900 border border-fuchsia-500/40 hover:bg-fuchsia-950 text-fuchsia-400 font-mono text-xs font-bold flex items-center justify-center gap-2 active:scale-95 transition-all shadow-neon-magenta"
            >
              <Volume2 className="w-4 h-4" />
              <span>📢 Airhorn SFX</span>
            </button>
          </div>

          {/* Media Player Controls */}
          <div className="grid grid-cols-4 gap-2 pt-2 border-t border-slate-800/80">
            <button
              onClick={() => handleBroadcastAction('player:action', { action: 'play' })}
              className="py-2.5 rounded-lg bg-slate-950 border border-slate-800 hover:border-slate-700 text-xs font-mono text-slate-200 flex flex-col items-center gap-1 active:scale-90 transition-transform"
              title="Play"
            >
              <Play className="w-4 h-4 text-emerald-400" />
              <span className="text-[10px]">Play</span>
            </button>

            <button
              onClick={() => handleBroadcastAction('player:action', { action: 'pause' })}
              className="py-2.5 rounded-lg bg-slate-950 border border-slate-800 hover:border-slate-700 text-xs font-mono text-slate-200 flex flex-col items-center gap-1 active:scale-90 transition-transform"
              title="Pause"
            >
              <Pause className="w-4 h-4 text-amber-400" />
              <span className="text-[10px]">Pause</span>
            </button>

            <button
              onClick={() => handleBroadcastAction('player:action', { action: 'skip' })}
              className="py-2.5 rounded-lg bg-slate-950 border border-slate-800 hover:border-slate-700 text-xs font-mono text-slate-200 flex flex-col items-center gap-1 active:scale-90 transition-transform"
              title="Skip Song"
            >
              <SkipForward className="w-4 h-4 text-cyan-400" />
              <span className="text-[10px]">Skip</span>
            </button>

            <button
              onClick={() => handleBroadcastAction('player:action', { action: 'replay' })}
              className="py-2.5 rounded-lg bg-slate-950 border border-slate-800 hover:border-slate-700 text-xs font-mono text-slate-200 flex flex-col items-center gap-1 active:scale-90 transition-transform"
              title="Replay from Beginning"
            >
              <RotateCcw className="w-4 h-4 text-fuchsia-400" />
              <span className="text-[10px]">Replay</span>
            </button>
          </div>
        </div>

        {/* Day 3 Preview Card */}
        <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 text-center flex flex-col items-center gap-2">
          <div className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-amber-400">
            <Smartphone className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-sm text-white">Dual-Screen Connection Verified</h3>
          <p className="text-xs text-slate-400 font-mono max-w-xs">
            TV Host and Mobile Phone are now paired over Supabase Realtime Channels. Day 3 will
            unlock the full 3x4 tactile keypad!
          </p>
        </div>
      </main>

      {/* Bottom Mobile Tab Bar */}
      <nav className="border-t border-slate-800 bg-slate-950/95 backdrop-blur-md px-6 py-2 flex items-center justify-around sticky bottom-0 z-30">
        <button
          onClick={() => setActiveTab('keypad')}
          className={`flex flex-col items-center gap-1 py-1.5 px-3 rounded-lg text-xs font-mono transition-colors ${
            activeTab === 'keypad' ? 'text-amber-400 font-bold' : 'text-slate-500'
          }`}
        >
          <KeypadIcon className="w-5 h-5" />
          <span>Keypad</span>
        </button>

        <button
          onClick={() => setActiveTab('songbook')}
          className={`flex flex-col items-center gap-1 py-1.5 px-3 rounded-lg text-xs font-mono transition-colors ${
            activeTab === 'songbook' ? 'text-cyan-400 font-bold' : 'text-slate-500'
          }`}
        >
          <BookOpen className="w-5 h-5" />
          <span>Songbook</span>
        </button>

        <button
          onClick={() => setActiveTab('queue')}
          className={`flex flex-col items-center gap-1 py-1.5 px-3 rounded-lg text-xs font-mono transition-colors ${
            activeTab === 'queue' ? 'text-fuchsia-400 font-bold' : 'text-slate-500'
          }`}
        >
          <ListMusic className="w-5 h-5" />
          <span>Queue</span>
        </button>
      </nav>
    </div>
  );
}
