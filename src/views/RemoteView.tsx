import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  Tv,
  ArrowLeft,
  Grid3X3 as KeypadIcon,
  BookOpen,
  ListMusic,
  Volume2,
  Bell,
  Sparkles,
  CheckCircle,
} from 'lucide-react';
import { useRoomChannel } from '../hooks/useRoomChannel';
import { setStoredRoomCode, getStoredRoomCode, sanitizeRoomCode } from '../utils/room';
import { getSongByCode, addSongToQueue, getRoomQueue } from '../lib/songs';
import type { Song } from '../types/song';

import LedDisplay from '../components/remote/LedDisplay';
import Keypad from '../components/remote/Keypad';
import SongbookTab from '../components/remote/SongbookTab';
import QueueTab from '../components/remote/QueueTab';
import ReservationModal from '../components/remote/ReservationModal';
import KeyControls from '../components/remote/KeyControls';
import Soundboard from '../components/remote/Soundboard';

export default function RemoteView() {
  const [searchParams, setSearchParams] = useSearchParams();
  const roomParam = searchParams.get('room') || getStoredRoomCode() || '';

  const [inputRoom, setInputRoom] = useState(roomParam);
  const [activeRoom, setActiveRoom] = useState(roomParam);
  const [activeTab, setActiveTab] = useState<'keypad' | 'songbook' | 'queue' | 'soundboard'>(
    'keypad'
  );
  const [keyOffset, setKeyOffset] = useState<number>(0);

  // Keypad State
  const [digits, setDigits] = useState('');
  const [matchedSong, setMatchedSong] = useState<Song | null>(null);
  const [resolving, setResolving] = useState(false);

  // Reservation Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSong, setSelectedSong] = useState<Song | null>(null);
  const [reserving, setReserving] = useState(false);

  // Queue Count badge
  const [queueCount, setQueueCount] = useState(0);

  // Notification Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Sync Queue Count
  const refreshQueueCount = useCallback(async () => {
    if (!activeRoom) return;
    try {
      const items = await getRoomQueue(activeRoom);
      setQueueCount(items.length);
    } catch {
      // Ignore count fetch errors
    }
  }, [activeRoom]);

  // Haptic feedback trigger
  const triggerHaptic = useCallback((ms: number | number[] = 15) => {
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate(ms);
    }
  }, []);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  }, []);

  const handleRemoteBroadcast = useCallback(
    (event: string, payload: any) => {
      if (event === 'party:score_reveal') {
        triggerHaptic([60, 80, 60, 80]);
        showToast(`🏆 ${payload.singer} scored ${payload.score} pts! "${payload.commentary}"`);
      } else if (event === 'player:transpose') {
        if (typeof payload?.key === 'number') {
          setKeyOffset(payload.key);
        }
      } else if (event === 'queue:updated') {
        refreshQueueCount();
      }
    },
    [triggerHaptic, showToast, refreshQueueCount]
  );

  const { status, onlineCount, sendBroadcast } = useRoomChannel(
    activeRoom,
    false,
    handleRemoteBroadcast
  );

  // Sync active room to session and URL
  useEffect(() => {
    if (activeRoom) {
      setStoredRoomCode(activeRoom);
      setSearchParams({ room: activeRoom });
    }
  }, [activeRoom, setSearchParams]);

  useEffect(() => {
    refreshQueueCount();
  }, [activeRoom, refreshQueueCount]);

  // Resolve 5-digit song code on numeric keypad entry
  useEffect(() => {
    if (digits.length === 5) {
      let isCancelled = false;
      setResolving(true);

      getSongByCode(digits)
        .then((song) => {
          if (!isCancelled) {
            setMatchedSong(song);
            setResolving(false);
            if (song) {
              triggerHaptic(30);
            }
          }
        })
        .catch(() => {
          if (!isCancelled) {
            setMatchedSong(null);
            setResolving(false);
          }
        });

      return () => {
        isCancelled = true;
      };
    } else {
      setMatchedSong(null);
      setResolving(false);
    }
  }, [digits]);

  const handleDigitPress = (digit: string) => {
    triggerHaptic(12);
    if (digits.length < 5) {
      setDigits((prev) => prev + digit);
    }
  };

  const handleClear = () => {
    triggerHaptic(20);
    setDigits('');
    setMatchedSong(null);
  };

  const handleBackspace = () => {
    triggerHaptic(15);
    setDigits((prev) => prev.slice(0, -1));
  };

  const handleOpenReserveModal = (song: Song) => {
    triggerHaptic(25);
    setSelectedSong(song);
    setIsModalOpen(true);
  };

  const handleConfirmReservation = async (singerName: string) => {
    if (!selectedSong || !activeRoom) return;
    setReserving(true);
    try {
      const queuedItem = await addSongToQueue(activeRoom, selectedSong.id, singerName);
      const currentQueue = await getRoomQueue(activeRoom);
      await sendBroadcast('queue:updated', {
        room: activeRoom,
        songTitle: selectedSong.title,
        singer: singerName,
        item: queuedItem,
        queue: currentQueue,
      });

      triggerHaptic([30, 50, 30]);
      showToast(`Reserved "${selectedSong.title}" for ${singerName}! 🎤`);
      setIsModalOpen(false);
      setSelectedSong(null);
      setDigits('');
      setMatchedSong(null);
      refreshQueueCount();
    } catch (err) {
      console.error('Reservation error:', err);
      showToast('Failed to reserve song. Please try again.');
    } finally {
      setReserving(false);
    }
  };

  const handleBroadcastAction = async (actionName: string, payload: any = {}) => {
    triggerHaptic(25);
    await sendBroadcast(actionName, {
      ...payload,
      sentFrom: 'Mobile Remote',
    });
    if (actionName === 'party:sfx') {
      showToast('📢 Airhorn sound sent to TV!');
    } else if (actionName === 'party:cheer') {
      showToast('🎉 Cheers sent to TV!');
    }
  };

  const handleKeyChange = async (newKey: number) => {
    setKeyOffset(newKey);
    triggerHaptic(20);
    await sendBroadcast('player:transpose', {
      key: newKey,
      room: activeRoom,
    });
    showToast(`Transposed Key: ${newKey > 0 ? `+${newKey}` : newKey === 0 ? 'Original' : newKey}`);
  };

  const handleSoundboardTrigger = async (sfxType: string, label: string) => {
    await sendBroadcast('party:sfx', {
      sfxType,
      room: activeRoom,
    });
    showToast(`Blasted ${label} on TV! 🔊`);
  };

  // If no room is active, render Room Code Entry Screen
  if (!activeRoom) {
    return (
      <div className="min-h-[100dvh] bg-videoke-bg text-slate-100 flex flex-col justify-between p-6">
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

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const clean = sanitizeRoomCode(inputRoom);
                if (clean) setActiveRoom(clean);
              }}
              className="flex flex-col gap-4 mt-2"
            >
              <input
                type="text"
                value={inputRoom}
                onChange={(e) => setInputRoom(sanitizeRoomCode(e.target.value))}
                placeholder="e.g. KANTA-88"
                maxLength={10}
                aria-label="Room code"
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
    <div className="min-h-[100dvh] bg-videoke-bg text-slate-100 flex flex-col justify-between selection:bg-fuchsia-500 selection:text-black">
      {/* Top Header Bar */}
      <header className="border-b border-slate-800 bg-slate-950/95 backdrop-blur-md px-4 sm:px-6 py-3 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
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
                  {status === 'connected' ? `Paired (${onlineCount} in room)` : 'Connecting...'}
                </span>
              </div>
              <p className="text-sm font-digital font-black text-amber-400 tracking-wider">
                {activeRoom}
              </p>
            </div>
          </div>

          {/* Header Right Actions */}
          <div className="flex items-center gap-2">
            {/* Quick Cheer / SFX Button */}
            <button
              onClick={() => handleBroadcastAction('party:sfx', { sfxType: 'airhorn' })}
              className="p-2 rounded-xl bg-fuchsia-950/80 border border-fuchsia-500/40 text-fuchsia-400 hover:bg-fuchsia-900 active:scale-90 transition-transform shadow-neon-magenta"
              title="Send Airhorn Sound Effect"
            >
              <Volume2 className="w-4 h-4" />
            </button>

            <button
              onClick={() => {
                setActiveRoom('');
                setStoredRoomCode('');
              }}
              className="text-[11px] font-mono px-2.5 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors"
            >
              Change
            </button>
          </div>
        </div>
      </header>

      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed top-16 left-4 right-4 z-40 max-w-sm mx-auto p-3 rounded-xl bg-emerald-950/90 border border-emerald-500/60 text-emerald-300 shadow-2xl backdrop-blur-md flex items-center gap-2.5 text-xs font-mono animate-bounce">
          <CheckCircle className="w-4 h-4 shrink-0 text-emerald-400" />
          <span className="truncate">{toastMessage}</span>
        </div>
      )}

      {/* Main Tab Screen Area */}
      <main
        className={`mx-auto w-full px-4 sm:px-6 lg:px-8 py-4 flex-1 flex flex-col justify-start transition-all duration-300 ${
          activeTab === 'songbook'
            ? 'max-w-7xl'
            : activeTab === 'queue'
              ? 'max-w-4xl'
              : activeTab === 'soundboard'
                ? 'max-w-3xl'
                : 'max-w-md'
        }`}
      >
        {/* TAB 1: 3x4 KEYPAD */}
        {activeTab === 'keypad' && (
          <div className="flex flex-col gap-4 w-full">
            {/* 5-Digit LED Display Readout */}
            <LedDisplay
              digits={digits}
              matchedSong={matchedSong}
              loading={resolving}
              onClear={handleClear}
            />

            {/* Tactile 3x4 Matrix Keypad */}
            <Keypad
              onDigitPress={handleDigitPress}
              onClear={handleClear}
              onBackspace={handleBackspace}
              onEnter={() => matchedSong && handleOpenReserveModal(matchedSong)}
              canEnter={Boolean(matchedSong)}
            />

            {/* Quick Live SFX Bar */}
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800/80">
              <button
                onClick={() =>
                  handleBroadcastAction('party:ping', { message: 'Cheering from mobile!' })
                }
                className="py-2.5 px-3 rounded-xl bg-slate-900/90 border border-cyan-500/30 text-cyan-400 text-xs font-mono font-bold flex items-center justify-center gap-1.5 active:scale-95 transition-all shadow-sm"
              >
                <Bell className="w-3.5 h-3.5" />
                <span>Ping TV Screen</span>
              </button>

              <button
                onClick={() => handleBroadcastAction('party:cheer', { cheerType: 'woohoo' })}
                className="py-2.5 px-3 rounded-xl bg-slate-900/90 border border-fuchsia-500/30 text-fuchsia-400 text-xs font-mono font-bold flex items-center justify-center gap-1.5 active:scale-95 transition-all shadow-sm"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Send Cheers 🎉</span>
              </button>
            </div>
          </div>
        )}

        {/* TAB 2: SONGBOOK */}
        {activeTab === 'songbook' && (
          <SongbookTab
            onSelectSong={handleOpenReserveModal}
            onLoadIntoKeypad={(code) => {
              setDigits(code);
              setActiveTab('keypad');
              showToast(`Loaded code ${code} into Keypad!`);
            }}
          />
        )}

        {/* TAB 3: QUEUE */}
        {activeTab === 'queue' && (
          <QueueTab
            roomCode={activeRoom}
            onNavigateToSongbook={() => setActiveTab('songbook')}
            broadcastQueueUpdated={(updatedQueue) => {
              sendBroadcast('queue:updated', { room: activeRoom, queue: updatedQueue });
              refreshQueueCount();
            }}
          />
        )}

        {/* TAB 4: SOUNDBOARD & KEY CONTROLS */}
        {activeTab === 'soundboard' && (
          <div className="flex flex-col gap-4 w-full">
            {/* Vocal Range Key Transposer */}
            <KeyControls currentKey={keyOffset} onChangeKey={handleKeyChange} />

            {/* Interactive Soundboard */}
            <Soundboard onTriggerSfx={handleSoundboardTrigger} />
          </div>
        )}
      </main>

      {/* Reservation Modal */}
      <ReservationModal
        isOpen={isModalOpen}
        song={selectedSong}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleConfirmReservation}
        loading={reserving}
      />

      {/* Bottom Sticky Mobile Tab Navigation */}
      <nav className="border-t border-slate-800 bg-slate-950/95 backdrop-blur-md px-4 py-2 sticky bottom-0 z-30">
        <div className="max-w-md mx-auto w-full flex items-center justify-around">
          <button
            onClick={() => setActiveTab('keypad')}
            className={`flex flex-col items-center gap-1 py-1.5 px-3 rounded-lg text-xs font-mono transition-colors touch-manipulation ${
              activeTab === 'keypad' ? 'text-amber-400 font-bold' : 'text-slate-500'
            }`}
          >
            <KeypadIcon className="w-5 h-5" />
            <span>Keypad</span>
          </button>

          <button
            onClick={() => setActiveTab('songbook')}
            className={`flex flex-col items-center gap-1 py-1.5 px-3 rounded-lg text-xs font-mono transition-colors touch-manipulation ${
              activeTab === 'songbook' ? 'text-cyan-400 font-bold' : 'text-slate-500'
            }`}
          >
            <BookOpen className="w-5 h-5" />
            <span>Songbook</span>
          </button>

          <button
            onClick={() => setActiveTab('queue')}
            className={`relative flex flex-col items-center gap-1 py-1.5 px-3 rounded-lg text-xs font-mono transition-colors touch-manipulation ${
              activeTab === 'queue' ? 'text-fuchsia-400 font-bold' : 'text-slate-500'
            }`}
          >
            <ListMusic className="w-5 h-5" />
            <span>Queue</span>
            {queueCount > 0 && (
              <span className="absolute -top-1 right-2 px-1.5 py-0.2 rounded-full bg-fuchsia-500 text-black font-bold text-[9px]">
                {queueCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('soundboard')}
            className={`relative flex flex-col items-center gap-1 py-1.5 px-3 rounded-lg text-xs font-mono transition-colors touch-manipulation ${
              activeTab === 'soundboard' ? 'text-amber-400 font-bold' : 'text-slate-500'
            }`}
          >
            <Volume2 className="w-5 h-5" />
            <span>Soundboard</span>
          </button>
        </div>
      </nav>
    </div>
  );
}
