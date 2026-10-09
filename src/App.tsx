import { useState, useEffect, useMemo, useRef } from 'react';
import { BrowserRouter, Routes, Route, Link, useNavigate } from 'react-router-dom';
import {
  Search,
  Mic2,
  Tv,
  Smartphone,
  Music,
  Users,
  Copy,
  Check,
  Sparkles,
  ArrowRight,
  Shuffle,
  Volume2,
  LayoutGrid,
  List,
  QrCode,
  Award,
  Flame,
  Zap,
  X,
} from 'lucide-react';
import { searchSongs, FALLBACK_SONGS } from './lib/songs';
import { isSupabaseConfigured } from './lib/supabase';
import { sanitizeRoomCode } from './utils/room';
import { playAirhorn } from './utils/soundEffects';
import Pagination from './components/common/Pagination';
import type { Song } from './types/song';
import HostView from './views/HostView';
import RemoteView from './views/RemoteView';

// Divisible by 1, 2, 3, and 4 for perfectly filled responsive grid rows
const SONGS_PER_PAGE = 24;

function HomeDashboard() {
  const navigate = useNavigate();
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Search and filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [joinRoomCode, setJoinRoomCode] = useState('');
  const [language, setLanguage] = useState<'All' | 'Tagalog' | 'English'>('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);

  // Interactive feedback states
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [soundFeedback, setSoundFeedback] = useState(false);
  const [randomPick, setRandomPick] = useState<Song | null>(null);

  // Search catalog with debounce / cancellation
  useEffect(() => {
    let active = true;
    setLoading(true);
    setCurrentPage(1);

    searchSongs(searchTerm, language).then((results) => {
      if (active) {
        setSongs(results);
        setLoading(false);
      }
    });

    return () => {
      active = false;
    };
  }, [searchTerm, language]);

  // Keyboard shortcut: Press '/' to focus search bar
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === '/' &&
        document.activeElement?.tagName !== 'INPUT' &&
        document.activeElement?.tagName !== 'TEXTAREA'
      ) {
        e.preventDefault();
        searchInputRef.current?.focus();
        document.getElementById('songbook')?.scrollIntoView({ behavior: 'smooth' });
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Handle copying a song's 5-digit code
  const handleCopyCode = (code: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(code).catch(() => {});
    }
    setCopiedCode(code);
    setTimeout(() => {
      setCopiedCode((prev) => (prev === code ? null : prev));
    }, 2200);
  };

  // Sound test button (procedural Web Audio Airhorn)
  const handleTriggerAirhorn = () => {
    playAirhorn();
    setSoundFeedback(true);
    setTimeout(() => setSoundFeedback(false), 800);
  };

  // Surprise Me / Random song picker
  const handleSurpriseMe = () => {
    const pool = songs.length > 0 ? songs : FALLBACK_SONGS;
    if (pool.length > 0) {
      const picked = pool[Math.floor(Math.random() * pool.length)];
      setRandomPick(picked);
      handleCopyCode(picked.code);
    }
  };

  // Room navigation handler
  const handleJoinRoom = (targetView: 'host' | 'remote') => {
    const clean = sanitizeRoomCode(joinRoomCode);
    if (clean) {
      navigate(`/${targetView}?room=${encodeURIComponent(clean)}`);
    }
  };

  // Paginated slice
  const paginatedSongs = useMemo(() => {
    const start = (currentPage - 1) * SONGS_PER_PAGE;
    return songs.slice(start, start + SONGS_PER_PAGE);
  }, [songs, currentPage]);

  const totalPages = Math.max(1, Math.ceil(songs.length / SONGS_PER_PAGE));

  return (
    <div className="min-h-screen bg-videoke-bg text-slate-100 flex flex-col justify-between selection:bg-cyan-500 selection:text-black relative overflow-x-hidden">
      {/* Ambient Cyber Lighting Backdrops (Non-blocking visual atmosphere) */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-96 sm:w-[620px] h-96 sm:h-[620px] rounded-full bg-cyan-500/10 blur-[130px]" />
        <div className="absolute top-1/4 -right-40 w-96 sm:w-[580px] h-96 sm:h-[580px] rounded-full bg-fuchsia-600/10 blur-[140px]" />
        <div className="absolute bottom-10 left-1/3 w-96 sm:w-[520px] h-96 sm:h-[520px] rounded-full bg-amber-500/5 blur-[120px]" />
        <div className="absolute inset-0 bg-grid-cyber opacity-35" />
      </div>

      {/* Top Sticky Command Navbar */}
      <header className="border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl sticky top-0 z-40 px-4 sm:px-6 lg:px-8 py-3.5 transition-all">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          {/* Brand Logo & Tagline */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-fuchsia-500 flex items-center justify-center shadow-neon-cyan group-hover:scale-105 transition-transform shrink-0">
              <Mic2 className="w-5 h-5 text-black" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg sm:text-xl font-black tracking-wider text-glow-cyan">
                  PINOY<span className="text-fuchsia-400 text-glow-magenta">VIDEOKE</span>
                </span>
                <span className="hidden sm:inline-flex px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-cyan-950/80 border border-cyan-500/40 text-cyan-400 font-semibold tracking-wider">
                  v1.2
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-mono hidden sm:block">
                Authentic Megapro &amp; Platinum Dual-Screen Experience
              </p>
            </div>
          </Link>

          {/* Center Navigation Links (Desktop) */}
          <nav className="hidden md:flex items-center gap-1.5 text-xs font-mono">
            <a
              href="#hero"
              className="px-3 py-1.5 rounded-lg text-slate-300 hover:text-cyan-400 hover:bg-slate-900 transition-colors"
            >
              Dual Stage
            </a>
            <a
              href="#songbook"
              className="px-3 py-1.5 rounded-lg text-slate-300 hover:text-amber-400 hover:bg-slate-900 transition-colors flex items-center gap-1.5"
            >
              <span>Songbook</span>
              <span className="px-1.5 py-0.2 rounded bg-amber-400/20 text-amber-300 text-[10px] font-bold">
                523
              </span>
            </a>
            <a
              href="#how-it-works"
              className="px-3 py-1.5 rounded-lg text-slate-300 hover:text-fuchsia-400 hover:bg-slate-900 transition-colors"
            >
              Setup Guide
            </a>
            <a
              href="#features"
              className="px-3 py-1.5 rounded-lg text-slate-300 hover:text-emerald-400 hover:bg-slate-900 transition-colors"
            >
              Videoke Engine
            </a>
          </nav>

          {/* Right Status & Quick Launcher */}
          <div className="flex items-center gap-2.5">
            {isSupabaseConfigured ? (
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/70 border border-emerald-500/40 text-emerald-400 text-xs font-mono shadow-sm">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="hidden sm:inline">Supabase Cloud Sync</span>
                <span className="sm:hidden">Online</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-950/70 border border-amber-500/40 text-amber-400 text-xs font-mono shadow-sm">
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                <span className="hidden sm:inline">Offline Catalog Ready</span>
                <span className="sm:hidden">Offline</span>
              </div>
            )}

            <button
              onClick={handleTriggerAirhorn}
              title="Test Videoke Reggae Airhorn Blast"
              aria-label="Test Videoke Reggae Airhorn Blast"
              className={`p-2 rounded-xl border transition-all ${
                soundFeedback
                  ? 'bg-amber-400 text-black border-amber-300 shadow-neon-amber scale-105'
                  : 'bg-slate-900/90 text-amber-400 border-slate-800 hover:border-amber-400/60'
              }`}
            >
              <Volume2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area: Spacious Widescreen Layout */}
      <main className="relative z-10 w-full flex-1 flex flex-col">
        {/* =========================================================================
            SECTION 1: HERO & DUAL-SCREEN SHOWCASE (Asymmetric Widescreen Split)
           ========================================================================= */}
        <section
          id="hero"
          className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 pt-8 sm:pt-14 pb-12 sm:pb-16"
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left Column: Mission, Pitch & Direct Launch Controls (7 Cols on LG) */}
            <div className="lg:col-span-7 flex flex-col gap-6">
              {/* Eyebrow Badge */}
              <div className="inline-flex items-center gap-2 self-start px-3.5 py-1.5 rounded-full bg-slate-900/90 border border-cyan-500/40 text-cyan-300 text-xs font-mono shadow-sm">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                <span className="font-semibold tracking-wide">
                  Ang Pambansang Videoke Experience Reborn
                </span>
              </div>

              {/* Punchy Headline */}
              <div className="space-y-3">
                <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-[1.08]">
                  Turn Any TV &amp; Phone Into an{' '}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-300 to-fuchsia-400 text-glow-cyan">
                    Authentic Megapro Videoke
                  </span>
                </h1>
                <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl font-normal">
                  Dial 5-digit songbook codes, sing along with syllable-synchronized lyrics on the
                  big screen, track live vocal pitch scoring, and pass your phone around as the
                  wireless remote with party sound effects.
                </p>
              </div>

              {/* Value Proposition Pills */}
              <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
                <div className="px-3 py-1.5 rounded-lg bg-slate-900/90 border border-slate-800 text-amber-300 flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5 text-amber-400" />
                  <span>523 OPM &amp; Global Hits</span>
                </div>
                <div className="px-3 py-1.5 rounded-lg bg-slate-900/90 border border-slate-800 text-cyan-300 flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Real-Time Vocal Scoring</span>
                </div>
                <div className="px-3 py-1.5 rounded-lg bg-slate-900/90 border border-slate-800 text-fuchsia-300 flex items-center gap-1.5">
                  <Smartphone className="w-3.5 h-3.5 text-fuchsia-400" />
                  <span>Zero-Install Phone Pairing</span>
                </div>
                <div className="px-3 py-1.5 rounded-lg bg-slate-900/90 border border-slate-800 text-emerald-300 flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-emerald-400" />
                  <span>0ms LAN &amp; Cloud Sync</span>
                </div>
              </div>

              {/* Dual Primary Screen Launchers */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                {/* Launcher 1: TV Host Screen */}
                <Link
                  to="/host"
                  className="group relative p-5 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-950 to-cyan-950/30 border border-slate-800 hover:border-cyan-500/80 transition-all duration-300 shadow-lg hover:shadow-neon-cyan flex flex-col justify-between gap-4"
                >
                  <div className="flex items-start justify-between">
                    <div className="p-3 rounded-xl bg-cyan-950/90 border border-cyan-500/50 text-cyan-400 group-hover:scale-105 transition-transform shadow-inner">
                      <Tv className="w-6 h-6" />
                    </div>
                    <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold">
                      Primary Screen
                    </span>
                  </div>
                  <div>
                    <h2 className="text-base sm:text-lg font-bold text-white group-hover:text-cyan-400 transition-colors flex items-center gap-2">
                      <span>TV Host Stage Screen</span>
                      <ArrowRight className="w-4 h-4 text-cyan-400 group-hover:translate-x-1 transition-transform" />
                    </h2>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                      Connect your laptop or smart TV for video lyrics, live QR code, and vocal
                      scoring.
                    </p>
                  </div>
                  <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono text-cyan-400">
                    <span className="font-bold">Launch Big Screen</span>
                    <span className="px-2 py-0.5 rounded bg-slate-800/80 text-[11px] text-slate-300">
                      /host
                    </span>
                  </div>
                </Link>

                {/* Launcher 2: Mobile Remote Control */}
                <Link
                  to="/remote"
                  className="group relative p-5 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-950 to-fuchsia-950/30 border border-slate-800 hover:border-fuchsia-500/80 transition-all duration-300 shadow-lg hover:shadow-neon-magenta flex flex-col justify-between gap-4"
                >
                  <div className="flex items-start justify-between">
                    <div className="p-3 rounded-xl bg-fuchsia-950/90 border border-fuchsia-500/50 text-fuchsia-400 group-hover:scale-105 transition-transform shadow-inner">
                      <Smartphone className="w-6 h-6" />
                    </div>
                    <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-fuchsia-500/20 text-fuchsia-300 border border-fuchsia-500/40 font-bold">
                      Wireless Controller
                    </span>
                  </div>
                  <div>
                    <h2 className="text-base sm:text-lg font-bold text-white group-hover:text-fuchsia-400 transition-colors flex items-center gap-2">
                      <span>Mobile Remote Control</span>
                      <ArrowRight className="w-4 h-4 text-fuchsia-400 group-hover:translate-x-1 transition-transform" />
                    </h2>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                      Pass your phone around to dial 5-digit codes, queue songs, and trigger sound
                      effects.
                    </p>
                  </div>
                  <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono text-fuchsia-400">
                    <span className="font-bold">Open Mobile Keypad</span>
                    <span className="px-2 py-0.5 rounded bg-slate-800/80 text-[11px] text-slate-300">
                      /remote
                    </span>
                  </div>
                </Link>
              </div>

              {/* Seamless Join Room Command Bar */}
              <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 backdrop-blur-md">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-amber-400/10 border border-amber-400/30 text-amber-400 flex items-center justify-center shrink-0">
                    <Users className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm font-bold text-white tracking-wide">
                      Join a Live Videoke Room
                    </h3>
                    <p className="text-[11px] text-slate-400 font-mono">
                      Enter the 5-character room code shown on TV
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={joinRoomCode}
                    onChange={(e) => setJoinRoomCode(sanitizeRoomCode(e.target.value))}
                    placeholder="ROOM CODE"
                    maxLength={10}
                    aria-label="Room code"
                    className="px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-amber-400 font-digital font-bold tracking-widest text-sm focus:border-amber-400 focus:outline-none w-32 sm:w-36 text-center uppercase shadow-inner"
                  />
                  <button
                    onClick={() => handleJoinRoom('host')}
                    disabled={!joinRoomCode.trim()}
                    className="px-3.5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 active:scale-95 text-black font-bold text-xs flex items-center gap-1.5 transition-all disabled:opacity-40 disabled:hover:bg-cyan-500 shadow-neon-cyan whitespace-nowrap min-h-[40px]"
                  >
                    <Tv className="w-3.5 h-3.5" />
                    <span>TV Stage</span>
                  </button>
                  <button
                    onClick={() => handleJoinRoom('remote')}
                    disabled={!joinRoomCode.trim()}
                    className="px-3.5 py-2.5 rounded-xl bg-fuchsia-600 hover:bg-fuchsia-500 active:scale-95 text-white font-bold text-xs flex items-center gap-1.5 transition-all disabled:opacity-40 disabled:hover:bg-fuchsia-600 shadow-neon-magenta whitespace-nowrap min-h-[40px]"
                  >
                    <Smartphone className="w-3.5 h-3.5" />
                    <span>Remote</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Right Column: Holographic Dual-Screen Living Room Preview (5 Cols on LG) */}
            <div className="lg:col-span-5 relative flex justify-center py-4">
              <div className="w-full max-w-md sm:max-w-lg lg:max-w-none relative">
                {/* Background Glow Aura */}
                <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/20 via-transparent to-fuchsia-500/20 rounded-3xl blur-2xl pointer-events-none" />

                {/* TV Stage Screen Mockup (16:9 Display) */}
                <div className="double-bezel rounded-2xl p-2.5 sm:p-3 bg-slate-900/90 shadow-glow-stage border border-slate-700/60 relative overflow-hidden">
                  {/* Monitor Header Bar */}
                  <div className="px-3 py-1.5 rounded-t-lg bg-slate-950 border-b border-slate-800 flex items-center justify-between text-[11px] font-mono">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      <span className="text-slate-300 font-bold">STAGE: #KANTA-88</span>
                    </div>
                    <span className="text-cyan-400">1080P • LIVE SCORE READY</span>
                  </div>

                  {/* Monitor Display Glass */}
                  <div className="relative aspect-video rounded-b-lg bg-slate-950 overflow-hidden flex flex-col justify-between p-3.5 crt-overlay border border-slate-800">
                    {/* Top Stage Badges */}
                    <div className="flex items-start justify-between z-20">
                      <div className="px-2.5 py-1 rounded-lg bg-slate-900/80 backdrop-blur-md border border-cyan-500/40 text-[11px] font-mono flex items-center gap-1.5">
                        <Mic2 className="w-3 h-3 text-cyan-400" />
                        <span className="text-white font-bold truncate max-w-[140px] sm:max-w-[180px]">
                          Ang Huling El Bimbo
                        </span>
                        <span className="text-slate-400">Eraserheads</span>
                      </div>
                      <div className="px-2 py-0.5 rounded bg-amber-400/20 border border-amber-400/40 text-amber-300 text-[10px] font-digital font-bold">
                        CODE 01002
                      </div>
                    </div>

                    {/* Active Karaoke Syllable Wipe Lyrics Preview */}
                    <div className="text-center my-auto z-20 space-y-1.5 py-2">
                      <p className="text-xs sm:text-sm font-black tracking-wide text-white/70">
                        Kamukha mo si Paraluman...
                      </p>
                      <p className="text-base sm:text-xl font-black tracking-wider text-glow-yellow text-amber-300 drop-shadow-md">
                        NUNG TAYO AY BATA PA...
                      </p>
                      <p className="text-[11px] sm:text-xs text-cyan-300/80 font-mono italic">
                        ♪ Magkahawak ang ating kamay at walang kamalay-malay... ♪
                      </p>
                    </div>

                    {/* Stage Bottom Bar: Pitch Graph & Score Meter */}
                    <div className="flex items-center justify-between z-20 pt-2 border-t border-slate-800/80 text-[10px] font-mono">
                      <div className="flex items-center gap-1.5 text-cyan-400">
                        <div className="flex items-end gap-0.5 h-3">
                          <span className="w-1 bg-cyan-400 h-2 rounded-full animate-pulse" />
                          <span className="w-1 bg-cyan-400 h-3 rounded-full animate-pulse" />
                          <span className="w-1 bg-cyan-400 h-1.5 rounded-full animate-pulse" />
                        </div>
                        <span>PITCH: A4 (440Hz)</span>
                      </div>
                      <div className="px-2 py-0.5 rounded bg-emerald-950/80 border border-emerald-500/40 text-emerald-400 font-bold flex items-center gap-1">
                        <Award className="w-3 h-3" />
                        <span>SCORE: 98 PTS</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Overlapping Floating Phone Remote Mockup */}
                <div className="absolute -bottom-6 -right-2 sm:-right-4 w-44 sm:w-52 rounded-2xl double-bezel p-2 bg-slate-950/95 shadow-2xl border border-fuchsia-500/40 z-30 animate-float-subtle">
                  {/* Phone Speaker Notch */}
                  <div className="w-12 h-1 bg-slate-800 rounded-full mx-auto mb-2" />

                  {/* Remote Dialed Code Screen */}
                  <div className="px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-center mb-2">
                    <span className="text-[10px] text-slate-400 font-mono block">DIAL CODE</span>
                    <span className="text-base font-digital font-bold text-amber-400 tracking-widest text-glow-amber">
                      0 1 0 0 2
                    </span>
                  </div>

                  {/* Tactile Keypad Matrix Grid */}
                  <div className="grid grid-cols-3 gap-1 text-[11px] font-digital font-bold text-center">
                    {['1', '2', '3', '4', '5', '6', '7', '8', '9', 'C', '0', '↵'].map((key) => (
                      <div
                        key={key}
                        className={`py-1 rounded bg-slate-900/90 border border-slate-800 ${
                          key === '↵'
                            ? 'bg-fuchsia-600/80 text-white border-fuchsia-400/50'
                            : key === 'C'
                              ? 'text-rose-400'
                              : 'text-slate-300'
                        }`}
                      >
                        {key}
                      </div>
                    ))}
                  </div>

                  {/* Quick Sound FX Button */}
                  <button
                    onClick={handleTriggerAirhorn}
                    className="w-full mt-2 py-1 rounded-lg bg-fuchsia-600/20 hover:bg-fuchsia-600/40 border border-fuchsia-500/40 text-fuchsia-300 text-[10px] font-mono font-bold flex items-center justify-center gap-1 transition-all"
                  >
                    <span>📢 AIRHORN FX</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================================
            SECTION 2: 3-STEP SETUP GUIDE (Horizontal Spacious Architecture)
           ========================================================================= */}
        <section
          id="how-it-works"
          className="border-y border-slate-800/80 bg-slate-950/50 py-12 sm:py-16"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
              <span className="text-xs font-mono uppercase tracking-wider text-cyan-400 font-bold">
                Living Room Party Setup
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-white">
                How It Works in 3 Simple Steps
              </h2>
              <p className="text-xs sm:text-sm text-slate-400">
                No apps, no USB dongles, and no sign-ups. Your browser handles everything.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
              {/* Step 1 */}
              <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 relative flex flex-col justify-between gap-4 group hover:border-cyan-500/50 transition-all">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-cyan-950/80 border border-cyan-500/40 text-cyan-400 flex items-center justify-center font-bold text-sm">
                    01
                  </div>
                  <Tv className="w-5 h-5 text-slate-500 group-hover:text-cyan-400 transition-colors" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white group-hover:text-cyan-400 transition-colors">
                    1. Open Stage on TV
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    Open <code className="text-cyan-300 font-mono">/host</code> on your Smart TV,
                    laptop, or living room projector. It displays YouTube karaoke videos and
                    synchronized lyrics.
                  </p>
                </div>
                <Link
                  to="/host"
                  className="text-xs text-cyan-400 font-mono font-bold flex items-center gap-1 group-hover:underline"
                >
                  <span>Launch Host View</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {/* Step 2 */}
              <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 relative flex flex-col justify-between gap-4 group hover:border-fuchsia-500/50 transition-all">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-fuchsia-950/80 border border-fuchsia-500/40 text-fuchsia-400 flex items-center justify-center font-bold text-sm">
                    02
                  </div>
                  <QrCode className="w-5 h-5 text-slate-500 group-hover:text-fuchsia-400 transition-colors" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white group-hover:text-fuchsia-400 transition-colors">
                    2. Scan QR with Phone
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    Party guests scan the on-screen QR code with their mobile cameras. Instantly
                    paired in Safari or Chrome without installing any mobile app.
                  </p>
                </div>
                <Link
                  to="/remote"
                  className="text-xs text-fuchsia-400 font-mono font-bold flex items-center gap-1 group-hover:underline"
                >
                  <span>Open Remote View</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {/* Step 3 */}
              <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 relative flex flex-col justify-between gap-4 group hover:border-amber-500/50 transition-all">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-amber-950/80 border border-amber-500/40 text-amber-400 flex items-center justify-center font-bold text-sm">
                    03
                  </div>
                  <Award className="w-5 h-5 text-slate-500 group-hover:text-amber-400 transition-colors" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white group-hover:text-amber-400 transition-colors">
                    3. Punch Code &amp; Sing!
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    Punch 5-digit codes on the tactile keypad, queue favorite hits, trigger live
                    applause or airhorns, and get officially graded by the scoring engine!
                  </p>
                </div>
                <a
                  href="#songbook"
                  className="text-xs text-amber-400 font-mono font-bold flex items-center gap-1 group-hover:underline"
                >
                  <span>Browse Songbook Codes</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================================
            SECTION 3: EXPANDED 5-DIGIT SONGBOOK STUDIO (Widescreen 4-Col Grid)
           ========================================================================= */}
        <section
          id="songbook"
          className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12 sm:py-16 flex flex-col gap-6"
        >
          {/* Section Header & Language Tabs */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-2">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <Music className="w-5 h-5 text-amber-400" />
                <h2 className="text-xl sm:text-2xl font-black tracking-wide text-white">
                  5-Digit Songbook Catalog
                </h2>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-800 text-amber-400 font-mono font-bold">
                  {songs.length} Tracks
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono">
                Browse official CoversPH 5-digit machine codes. Press{' '}
                <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-amber-300 font-mono text-[10px]">
                  /
                </kbd>{' '}
                to search instantly.
              </p>
            </div>

            {/* Category / Language Filter Chips */}
            <div className="flex items-center gap-1.5 flex-wrap">
              {[
                { id: 'All', label: '⭐ All Songs (523)' },
                { id: 'Tagalog', label: '🇵🇭 Tagalog / OPM (106)' },
                { id: 'English', label: '🌐 English Hits (417)' },
              ].map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setLanguage(cat.id as any)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    language === cat.id
                      ? 'bg-amber-400 text-black shadow-neon-amber'
                      : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Search Bar & Action Utility Ribbon */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {/* Live Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by 5-digit code (e.g. 01001), song title (El Bimbo), or artist..."
                aria-label="Search catalog by 5-digit code, title, or artist"
                className="w-full pl-11 pr-10 py-3 rounded-xl bg-slate-950 border border-slate-800 focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400 text-slate-100 placeholder:text-slate-600 font-mono text-xs sm:text-sm transition-all"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  aria-label="Clear search"
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-200"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* View Mode & Utility Buttons */}
            <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
              {/* Random / Surprise Me Button */}
              <button
                onClick={handleSurpriseMe}
                title="Pick a random song code"
                className="px-3.5 py-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-amber-400/60 text-amber-300 text-xs font-mono flex items-center gap-1.5 transition-all active:scale-95 whitespace-nowrap"
              >
                <Shuffle className="w-3.5 h-3.5 text-amber-400" />
                <span>Surprise Me</span>
              </button>

              {/* View Switcher: Grid vs Table */}
              <div className="flex items-center bg-slate-950 border border-slate-800 rounded-xl p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  title="Card Grid View"
                  className={`p-2 rounded-lg transition-all ${
                    viewMode === 'grid'
                      ? 'bg-slate-800 text-cyan-400 shadow-sm'
                      : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('table')}
                  title="Compact Table View"
                  className={`p-2 rounded-lg transition-all ${
                    viewMode === 'table'
                      ? 'bg-slate-800 text-cyan-400 shadow-sm'
                      : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Random Pick Notification Banner */}
          {randomPick && (
            <div className="p-3 rounded-xl bg-amber-400/10 border border-amber-400/30 text-amber-300 text-xs font-mono flex items-center justify-between gap-4 animate-in fade-in duration-300">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>
                  Random Pick: <strong>{randomPick.title}</strong> by {randomPick.artist} (Code{' '}
                  <span className="font-digital text-amber-200 font-bold">{randomPick.code}</span>)
                </span>
              </div>
              <button
                onClick={() => setRandomPick(null)}
                className="text-amber-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Quick Search Chips */}
          <div className="flex items-center gap-1.5 flex-wrap text-[11px] font-mono text-slate-400">
            <span className="text-slate-500">Popular Searches:</span>
            {['Eraserheads', '01001', 'Torete', 'Parokya', 'Queen', 'Taylor Swift'].map((term) => (
              <button
                key={term}
                onClick={() => setSearchTerm(term)}
                className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-cyan-300 transition-colors"
              >
                {term}
              </button>
            ))}
          </div>

          {/* Song Catalog Presentation: Grid or Table */}
          {loading ? (
            <div className="py-20 text-center text-slate-500 font-mono text-sm flex flex-col items-center justify-center gap-3">
              <div className="w-6 h-6 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
              <span>Loading song catalog...</span>
            </div>
          ) : songs.length === 0 ? (
            <div className="py-20 text-center text-slate-500 font-mono text-sm border border-dashed border-slate-800 rounded-2xl">
              No tracks found matching "{searchTerm}". Try another title, artist, or 5-digit code.
            </div>
          ) : viewMode === 'grid' ? (
            /* RESPONSIVE 4-COLUMN CARDS GRID (1 col mobile, 2 col tablet, 3 col laptop, 4 col desktop) */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5">
              {paginatedSongs.map((song) => {
                const isCopied = copiedCode === song.code;
                return (
                  <div
                    key={song.id}
                    className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800/80 hover:border-slate-700 hover:bg-slate-900 transition-all flex flex-col justify-between gap-3 group relative shadow-sm"
                  >
                    {/* Top Row: 5-Digit Code & Copy Button */}
                    <div className="flex items-center justify-between">
                      <div className="px-2.5 py-1 rounded bg-amber-400/10 border border-amber-400/30 text-amber-400 font-digital font-bold text-sm tracking-wider">
                        {song.code}
                      </div>

                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-slate-800/80 text-slate-400">
                          {song.language}
                        </span>
                        <button
                          onClick={() => handleCopyCode(song.code)}
                          title={`Copy Code ${song.code}`}
                          aria-label={`Copy Code ${song.code}`}
                          className={`p-1.5 rounded-lg border transition-all ${
                            isCopied
                              ? 'bg-emerald-950 border-emerald-500 text-emerald-400'
                              : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                          }`}
                        >
                          {isCopied ? (
                            <Check className="w-3.5 h-3.5" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Middle: Title & Artist */}
                    <div className="min-w-0">
                      <h3 className="font-bold text-sm text-white group-hover:text-cyan-300 transition-colors truncate">
                        {song.title}
                      </h3>
                      <p className="text-xs text-slate-400 truncate mt-0.5">{song.artist}</p>
                    </div>

                    {/* Bottom: Quick Copy Status or Micro Action */}
                    <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-[11px] font-mono text-slate-500">
                      <span>{isCopied ? 'Code Copied!' : 'CoversPH Audio'}</span>
                      <button
                        onClick={() => handleCopyCode(song.code)}
                        className="text-cyan-400 hover:underline flex items-center gap-1"
                      >
                        <span>Punch {song.code}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* COMPACT TABLE VIEW */
            <div className="rounded-xl border border-slate-800 bg-slate-950/60 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-slate-900 border-b border-slate-800 text-slate-400 uppercase text-[10px]">
                    <tr>
                      <th className="px-4 py-3">Code</th>
                      <th className="px-4 py-3">Song Title</th>
                      <th className="px-4 py-3">Artist</th>
                      <th className="px-4 py-3">Language</th>
                      <th className="px-4 py-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {paginatedSongs.map((song) => {
                      const isCopied = copiedCode === song.code;
                      return (
                        <tr key={song.id} className="hover:bg-slate-900/40 transition-colors">
                          <td className="px-4 py-2.5 font-digital font-bold text-amber-400 text-sm">
                            {song.code}
                          </td>
                          <td className="px-4 py-2.5 font-sans font-bold text-white">
                            {song.title}
                          </td>
                          <td className="px-4 py-2.5 text-slate-400">{song.artist}</td>
                          <td className="px-4 py-2.5">
                            <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px] uppercase">
                              {song.language}
                            </span>
                          </td>
                          <td className="px-4 py-2.5 text-right">
                            <button
                              onClick={() => handleCopyCode(song.code)}
                              className={`px-2.5 py-1 rounded-lg border text-xs font-mono transition-all ${
                                isCopied
                                  ? 'bg-emerald-950 border-emerald-500 text-emerald-400'
                                  : 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white hover:border-slate-700'
                              }`}
                            >
                              {isCopied ? 'Copied!' : 'Copy Code'}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Flowbite Pagination Component */}
          {songs.length > 0 && (
            <div className="pt-4 border-t border-slate-800/80">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={songs.length}
                itemsPerPage={SONGS_PER_PAGE}
                onPageChange={(p) => {
                  setCurrentPage(p);
                  document.getElementById('songbook')?.scrollIntoView({ behavior: 'smooth' });
                }}
              />
            </div>
          )}
        </section>

        {/* =========================================================================
            SECTION 4: ASYMMETRIC BENTO GRID (The Authentic Videoke Engine)
           ========================================================================= */}
        <section
          id="features"
          className="border-t border-slate-800/80 bg-slate-950/40 py-12 sm:py-16"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col gap-8">
            <div className="max-w-2xl">
              <span className="text-xs font-mono uppercase tracking-wider text-fuchsia-400 font-bold">
                Hardware Architecture &amp; Sound Engine
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-white mt-1">
                Engineered for Authentic Videoke Nostalgia
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 mt-2">
                We recreated the signature features of physical Megapro, Platinum, and TJ Media
                karaoke machines into a lightweight browser system.
              </p>
            </div>

            {/* Asymmetric 4-Tile Bento Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {/* Tile 1 (Span 2 on lg): TV Stage Engine */}
              <div className="lg:col-span-2 p-6 rounded-2xl bg-gradient-to-br from-slate-900/90 to-slate-950 border border-slate-800 flex flex-col justify-between gap-6 hover:border-cyan-500/50 transition-all shadow-lg">
                <div className="flex items-start justify-between">
                  <div className="p-3 rounded-xl bg-cyan-950/80 border border-cyan-500/40 text-cyan-400">
                    <Tv className="w-6 h-6" />
                  </div>
                  <span className="text-[10px] font-mono uppercase px-2.5 py-0.5 rounded-full bg-cyan-950 border border-cyan-500/30 text-cyan-400 font-bold">
                    Big Screen Display
                  </span>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">
                    Cinematic TV Stage &amp; Marquee Ticker
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    Designed for 1080p and 4K displays up to 1720px wide. Features auto-fading
                    lyrics badges, continuous karaoke queue playback, live pairing QR codes, and a
                    retro LED marquee ticker tape.
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 font-mono text-[11px] text-cyan-300 flex items-center justify-between">
                  <span>• AUTO-FADE OVERLAY (6s)</span>
                  <span>• KEY TRANSPOSER (♭ / ♯)</span>
                  <span>• YOUTUBE DIRECT SYNC</span>
                </div>
              </div>

              {/* Tile 2: 3x4 Tactile Mobile Matrix */}
              <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-900/90 to-slate-950 border border-slate-800 flex flex-col justify-between gap-6 hover:border-fuchsia-500/50 transition-all shadow-lg">
                <div className="flex items-start justify-between">
                  <div className="p-3 rounded-xl bg-fuchsia-950/80 border border-fuchsia-500/40 text-fuchsia-400">
                    <Smartphone className="w-6 h-6" />
                  </div>
                  <span className="text-[10px] font-mono uppercase px-2.5 py-0.5 rounded-full bg-fuchsia-950 border border-fuchsia-500/30 text-fuchsia-400 font-bold">
                    Tactile Remote
                  </span>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">3×4 Matrix Keypad Controller</h3>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    Dial 5-digit codes just like on a classic physical Megapro remote. Includes
                    tactile vibration feedback and glowing digital LED readouts.
                  </p>
                </div>
                <div className="flex items-center gap-1 font-digital text-amber-400 text-xs font-bold">
                  <span>HAPTIC VIBRATION SUPPORTED</span>
                </div>
              </div>

              {/* Tile 3: YIN Acoustic Pitch Detection */}
              <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-900/90 to-slate-950 border border-slate-800 flex flex-col justify-between gap-6 hover:border-emerald-500/50 transition-all shadow-lg">
                <div className="flex items-start justify-between">
                  <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-400">
                    <Award className="w-6 h-6" />
                  </div>
                  <span className="text-[10px] font-mono uppercase px-2.5 py-0.5 rounded-full bg-emerald-950 border border-emerald-500/30 text-emerald-400 font-bold">
                    Vocal Scoring
                  </span>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">YIN Acoustic 100-Point Scoring</h3>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    Browser-native pitch detection analyzes vocal fundamental frequencies (70Hz to
                    1100Hz) with 4-tier authentic feedback from "Champion Ka!" to "Uwi Ka Na!".
                  </p>
                </div>
                <div className="flex items-center gap-1 text-[11px] font-mono text-emerald-400">
                  <span>🏆 98–100: TAWAG NG TANGHALAN TIER</span>
                </div>
              </div>

              {/* Tile 4 (Span 2 on lg): Soundboard & 0ms Sync */}
              <div className="lg:col-span-2 p-6 rounded-2xl bg-gradient-to-br from-slate-900/90 to-slate-950 border border-slate-800 flex flex-col justify-between gap-6 hover:border-amber-500/50 transition-all shadow-lg">
                <div className="flex items-start justify-between">
                  <div className="p-3 rounded-xl bg-amber-950/80 border border-amber-500/40 text-amber-400">
                    <Volume2 className="w-6 h-6" />
                  </div>
                  <span className="text-[10px] font-mono uppercase px-2.5 py-0.5 rounded-full bg-amber-950 border border-amber-500/30 text-amber-400 font-bold">
                    Web Audio FX
                  </span>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">
                    Live Party Soundboard &amp; Resilient Sync
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    Zero-latency procedural sound effects: Reggae Airhorn, Gong, Ovation Cheers, and
                    Drumroll. Uses browser BroadcastChannel for zero-lag LAN parties with automatic
                    Supabase cloud fallback.
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    onClick={handleTriggerAirhorn}
                    className="px-3 py-1.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-black text-xs font-bold font-mono flex items-center gap-1.5 transition-all active:scale-95 shadow-sm"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                    <span>Test Reggae Airhorn</span>
                  </button>
                  <span className="text-[11px] text-slate-400 font-mono">
                    Works offline with zero audio file downloads.
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Cyber-Videoke Modern Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 px-4 sm:px-6 lg:px-8 py-8 text-xs text-slate-500 font-mono relative z-10">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400" />
            <span className="text-slate-300 font-bold">PINOY VIDEOKE</span>
            <span>• Serverless Cloud &amp; Offline Edition</span>
          </div>

          <div className="flex items-center gap-4 text-slate-400">
            <Link to="/host" className="hover:text-cyan-400 transition-colors">
              TV Host Stage
            </Link>
            <Link to="/remote" className="hover:text-fuchsia-400 transition-colors">
              Mobile Remote
            </Link>
            <a href="#songbook" className="hover:text-amber-400 transition-colors">
              523 Songbook
            </a>
          </div>

          <div className="text-[11px] text-slate-600">
            Built with React, Vite, Tailwind CSS &amp; Web Audio API
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomeDashboard />} />
        <Route path="/host" element={<HostView />} />
        <Route path="/remote" element={<RemoteView />} />
      </Routes>
    </BrowserRouter>
  );
}
