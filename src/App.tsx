import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link, useNavigate } from 'react-router-dom';
import {
  Search,
  Mic2,
  Tv,
  Smartphone,
  Music,
  CheckCircle2,
  AlertCircle,
  Users,
  Copy,
  Check,
  Sparkles,
  Radio,
  Trophy,
  Flame,
  X,
} from 'lucide-react';
import { searchSongs } from './lib/songs';
import { isSupabaseConfigured } from './lib/supabase';
import { sanitizeRoomCode } from './utils/room';
import Pagination from './components/common/Pagination';
import type { Song } from './types/song';
import HostView from './views/HostView';
import RemoteView from './views/RemoteView';

const SONGS_PER_PAGE = 16;

function HomeDashboard() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [joinRoomCode, setJoinRoomCode] = useState('');
  const [language, setLanguage] = useState<'All' | 'Tagalog' | 'English'>('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

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

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div className="min-h-screen bg-videoke-bg bg-grid-cyber text-slate-100 flex flex-col justify-between selection:bg-cyan-500 selection:text-black">
      {/* Top Floating Glass Header */}
      <header className="border-b border-slate-800/80 bg-slate-950/85 backdrop-blur-xl sticky top-0 z-40 px-4 sm:px-8 py-3.5 flex items-center justify-between shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-500 to-fuchsia-500 p-[1px] shadow-neon-cyan">
            <div className="w-full h-full rounded-[15px] bg-slate-950 flex items-center justify-center">
              <Mic2 className="w-5 h-5 text-cyan-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black tracking-wider text-glow-cyan">
                PINOY<span className="text-fuchsia-400 text-glow-magenta">VIDEOKE</span>
              </h1>
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-cyan-950 border border-cyan-500/40 text-cyan-300 font-bold hidden sm:inline">
                v1.4 Cloud
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-mono tracking-tight hidden sm:block">
              5-Digit Machine Code • Dual-Screen Cloud Videoke
            </p>
          </div>
        </div>

        {/* Header Right Status Badges */}
        <div className="flex items-center gap-2.5">
          {isSupabaseConfigured ? (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 text-xs font-mono shadow-sm">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
              <span className="hidden md:inline">Supabase Realtime Cloud Connected</span>
              <span className="md:hidden">Cloud Live</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-950/80 border border-amber-500/50 text-amber-300 text-xs font-mono shadow-sm">
              <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
              <span>Offline Catalog (Demo Mode)</span>
            </div>
          )}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 md:py-12 flex-1 flex flex-col gap-10">
        {/* Hero Section: The Soul of Pinoy Videoke */}
        <section className="relative text-center flex flex-col items-center gap-5 pt-4 pb-2">
          {/* Eyebrow badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-cyan-950/80 to-fuchsia-950/80 border border-cyan-500/40 text-cyan-300 text-xs font-mono font-bold tracking-widest uppercase shadow-neon-cyan">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            <span>The Pambansang Videoke Experience Reborn</span>
            <Sparkles className="w-3.5 h-3.5 text-fuchsia-400 animate-pulse" />
          </div>

          <h2 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight text-white max-w-4xl leading-[1.1]">
            Turn Any TV & Phone Into an{' '}
            <span className="bg-gradient-to-r from-cyan-400 via-fuchsia-400 to-amber-300 bg-clip-text text-transparent">
              Authentic Megapro Videoke
            </span>
          </h2>

          <p className="text-sm sm:text-base md:text-lg text-slate-300 max-w-2xl font-normal leading-relaxed">
            Enter 5-digit songbook codes, sing along with synchronized lyrics, track live vocal
            pitch, and blast party sound effects from your phone in real time.
          </p>

          {/* Core Feature Badges Strip */}
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 pt-2 text-xs font-mono text-slate-300">
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-800 shadow-sm">
              <Flame className="w-3.5 h-3.5 text-amber-400" />
              523 OPM & Global Hits
            </span>
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-800 shadow-sm">
              <Trophy className="w-3.5 h-3.5 text-cyan-400" />
              Real-Time Vocal Scoring
            </span>
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-800 shadow-sm">
              <Radio className="w-3.5 h-3.5 text-emerald-400" />
              Zero-Install Phone Pairing
            </span>
          </div>
        </section>

        {/* Dual Mode Launch Cards (Double-Bezel Hardware Architecture) */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
          {/* 1. TV Host Screen Card */}
          <Link
            to="/host"
            className="group relative p-6 sm:p-8 rounded-3xl bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950 border border-slate-800/90 hover:border-cyan-500/60 transition-all duration-300 shadow-2xl hover:shadow-neon-cyan flex flex-col justify-between gap-6 overflow-hidden"
          >
            {/* Top Cyan Ambient Gradient */}
            <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-cyan-500/10 to-transparent pointer-events-none" />

            <div className="flex items-start justify-between gap-4 relative z-10">
              <div className="w-14 h-14 rounded-2xl bg-cyan-950/80 border border-cyan-500/50 text-cyan-300 flex items-center justify-center shadow-neon-cyan group-hover:scale-105 transition-transform">
                <Tv className="w-7 h-7" />
              </div>
              <span className="px-3 py-1 rounded-full bg-slate-900 border border-cyan-500/40 text-cyan-300 text-xs font-mono font-bold tracking-wider group-hover:bg-cyan-500 group-hover:text-black transition-colors">
                PRIMARY SCREEN
              </span>
            </div>

            <div className="relative z-10">
              <h3 className="text-xl sm:text-2xl font-black text-white group-hover:text-cyan-300 transition-colors">
                TV Host Stage Screen
              </h3>
              <p className="text-xs sm:text-sm text-slate-400 font-mono mt-1.5 leading-relaxed">
                Connect your laptop or smart TV to display full-screen video, synchronized lyrics,
                pairable QR code, and live microphone vocal pitch scoring.
              </p>
            </div>

            <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono text-cyan-400 relative z-10">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-4 h-4" />
                Launch Big Screen (/host)
              </span>
              <span className="w-8 h-8 rounded-full bg-slate-900 border border-slate-800 group-hover:border-cyan-500 flex items-center justify-center text-white group-hover:text-cyan-400 transition-colors">
                →
              </span>
            </div>
          </Link>

          {/* 2. Mobile Remote Control Card */}
          <Link
            to="/remote"
            className="group relative p-6 sm:p-8 rounded-3xl bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950 border border-slate-800/90 hover:border-fuchsia-500/60 transition-all duration-300 shadow-2xl hover:shadow-neon-magenta flex flex-col justify-between gap-6 overflow-hidden"
          >
            {/* Top Magenta Ambient Gradient */}
            <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-fuchsia-500/10 to-transparent pointer-events-none" />

            <div className="flex items-start justify-between gap-4 relative z-10">
              <div className="w-14 h-14 rounded-2xl bg-fuchsia-950/80 border border-fuchsia-500/50 text-fuchsia-300 flex items-center justify-center shadow-neon-magenta group-hover:scale-105 transition-transform">
                <Smartphone className="w-7 h-7" />
              </div>
              <span className="px-3 py-1 rounded-full bg-slate-900 border border-fuchsia-500/40 text-fuchsia-300 text-xs font-mono font-bold tracking-wider group-hover:bg-fuchsia-500 group-hover:text-black transition-colors">
                WIRELESS CONTROLLER
              </span>
            </div>

            <div className="relative z-10">
              <h3 className="text-xl sm:text-2xl font-black text-white group-hover:text-fuchsia-300 transition-colors">
                Mobile Remote Control
              </h3>
              <p className="text-xs sm:text-sm text-slate-400 font-mono mt-1.5 leading-relaxed">
                Open on your smartphone to browse the 523-song catalog, punch 5-digit codes on a
                tactile matrix keypad, manage the queue, and trigger live party sound effects.
              </p>
            </div>

            <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono text-fuchsia-400 relative z-10">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-4 h-4" />
                Open Mobile Keypad (/remote)
              </span>
              <span className="w-8 h-8 rounded-full bg-slate-900 border border-slate-800 group-hover:border-fuchsia-500 flex items-center justify-center text-white group-hover:text-fuchsia-400 transition-colors">
                →
              </span>
            </div>
          </Link>
        </section>

        {/* Global Multi-Screen Pairing Station */}
        <section className="p-6 sm:p-7 rounded-3xl bg-slate-950/95 border border-slate-800 shadow-2xl flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative overflow-hidden backdrop-blur-xl">
          {/* Left Room Info */}
          <div className="flex items-center gap-4 min-w-0">
            <div className="w-12 h-12 rounded-2xl bg-amber-400/10 border border-amber-400/40 text-amber-300 flex items-center justify-center shrink-0 shadow-neon-amber">
              <Users className="w-6 h-6" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base sm:text-lg font-bold text-white tracking-wide">
                  Join a Live Videoke Room
                </h3>
                <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-cyan-950 border border-cyan-500/40 text-cyan-300 font-mono font-bold">
                  Global WebSocket Sync
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                Connect your device to an existing room using the 6-character room code on the
                screen
              </p>
            </div>
          </div>

          {/* Right Room Action Controls */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full lg:w-auto shrink-0">
            <input
              type="text"
              value={joinRoomCode}
              onChange={(e) => setJoinRoomCode(sanitizeRoomCode(e.target.value))}
              placeholder="ROOM CODE"
              maxLength={10}
              aria-label="Room code"
              className="px-4 py-3 rounded-2xl bg-slate-900 border border-slate-700 text-amber-300 font-digital font-bold tracking-widest text-base focus:border-amber-400 focus:outline-none w-full sm:w-40 text-center uppercase shadow-inner min-h-[44px]"
            />
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                onClick={() => {
                  const clean = sanitizeRoomCode(joinRoomCode);
                  if (clean) navigate(`/host?room=${encodeURIComponent(clean)}`);
                }}
                disabled={!joinRoomCode.trim()}
                className="flex-1 sm:flex-initial px-4 py-3 rounded-2xl bg-cyan-500 hover:bg-cyan-400 active:scale-95 text-slate-950 font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all disabled:opacity-40 shadow-neon-cyan touch-manipulation min-h-[44px] whitespace-nowrap"
              >
                <Tv className="w-4 h-4 shrink-0" />
                <span>Join TV Stage</span>
              </button>
              <button
                onClick={() => {
                  const clean = sanitizeRoomCode(joinRoomCode);
                  if (clean) navigate(`/remote?room=${encodeURIComponent(clean)}`);
                }}
                disabled={!joinRoomCode.trim()}
                className="flex-1 sm:flex-initial px-4 py-3 rounded-2xl bg-fuchsia-600 hover:bg-fuchsia-500 active:scale-95 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all disabled:opacity-40 shadow-neon-magenta touch-manipulation min-h-[44px] whitespace-nowrap"
              >
                <Smartphone className="w-4 h-4 shrink-0" />
                <span>Join Remote</span>
              </button>
            </div>
          </div>
        </section>

        {/* 5-Digit Songbook Catalog Section */}
        <section className="p-6 sm:p-8 rounded-3xl bg-slate-950/90 border border-slate-800 shadow-2xl backdrop-blur-xl flex flex-col gap-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-amber-400/10 border border-amber-400/30 text-amber-400">
                  <Music className="w-5 h-5" />
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
                  <span>5-Digit Songbook Catalog</span>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-900 border border-slate-700 text-amber-400 font-digital font-bold">
                    {songs.length} Tracks
                  </span>
                </h3>
              </div>
              <p className="text-xs text-slate-400 font-mono mt-1">
                Lookup tracks by 5-digit machine code, song title, or original artist
              </p>
            </div>

            {/* Language Category Chips */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 no-scrollbar">
              {[
                { id: 'All', label: '⭐ All Songs (523)' },
                { id: 'Tagalog', label: '🇵🇭 Tagalog / OPM (106)' },
                { id: 'English', label: '🌐 English (417)' },
              ].map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setLanguage(cat.id as any)}
                  className={`px-4 py-2 rounded-xl text-xs font-mono font-bold whitespace-nowrap transition-all touch-manipulation min-h-[40px] ${
                    language === cat.id
                      ? 'bg-amber-400 text-slate-950 shadow-neon-amber scale-[1.02]'
                      : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-cyan-400 pointer-events-none" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by 5-digit code (e.g. 01001) or title (e.g. El Bimbo, Torete, Anak)..."
              aria-label="Search catalog by 5-digit code, title, or artist"
              className="w-full pl-12 pr-10 py-4 rounded-2xl bg-slate-900 border border-slate-800 focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400 text-slate-100 placeholder:text-slate-500 font-mono text-sm transition-all shadow-inner"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1"
                aria-label="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Song Grid */}
          {loading ? (
            <div className="py-16 text-center text-slate-400 font-mono text-sm flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin shadow-neon-cyan" />
              <span>Scanning catalog database...</span>
            </div>
          ) : songs.length === 0 ? (
            <div className="py-16 text-center text-slate-500 font-mono text-sm flex flex-col items-center gap-2">
              <Music className="w-8 h-8 text-slate-600" />
              <span>No songs found matching "{searchTerm}".</span>
              <button
                onClick={() => setSearchTerm('')}
                className="text-xs text-cyan-400 hover:underline mt-2"
              >
                Clear search query
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {songs
                  .slice((currentPage - 1) * SONGS_PER_PAGE, currentPage * SONGS_PER_PAGE)
                  .map((song) => (
                    <div
                      key={song.id}
                      className="group p-4 rounded-2xl bg-slate-900/80 hover:bg-slate-900 border border-slate-800/80 hover:border-slate-700 transition-all flex items-center justify-between gap-4 shadow-sm hover:shadow-md"
                    >
                      <div className="flex items-center gap-3.5 overflow-hidden min-w-0">
                        {/* 5-Digit Code Pill */}
                        <div className="px-3 py-1.5 rounded-xl bg-slate-950 border border-amber-400/40 text-amber-300 font-digital font-bold text-sm tracking-wider shrink-0 shadow-[0_0_8px_rgba(251,191,36,0.15)]">
                          {song.code}
                        </div>
                        <div className="overflow-hidden min-w-0">
                          <h4 className="font-bold text-sm text-white truncate group-hover:text-cyan-300 transition-colors">
                            {song.title}
                          </h4>
                          <p className="text-xs text-slate-400 truncate mt-0.5">{song.artist}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-md bg-slate-800 text-slate-300">
                          {song.language}
                        </span>

                        <button
                          onClick={() => handleCopyCode(song.code)}
                          title="Copy 5-digit code to clipboard"
                          className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all active:scale-95 touch-manipulation min-h-[36px] min-w-[36px] flex items-center justify-center"
                        >
                          {copiedCode === song.code ? (
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </div>
                  ))}
              </div>

              {/* Elevated Pagination Component */}
              <Pagination
                currentPage={currentPage}
                totalPages={Math.max(1, Math.ceil(songs.length / SONGS_PER_PAGE))}
                totalItems={songs.length}
                itemsPerPage={SONGS_PER_PAGE}
                onPageChange={(p) => {
                  setCurrentPage(p);
                  window.scrollTo({ top: 500, behavior: 'smooth' });
                }}
                className="pt-4 border-t border-slate-800/80"
              />
            </div>
          )}
        </section>

        {/* How It Works Bento Grid */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="p-6 rounded-3xl bg-slate-950/70 border border-slate-800 flex flex-col gap-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-950 border border-cyan-500/40 text-cyan-300 flex items-center justify-center font-digital font-bold text-lg">
              01
            </div>
            <h4 className="text-base font-bold text-white">1. Open Stage on TV</h4>
            <p className="text-xs text-slate-400 font-mono leading-relaxed">
              Launch <strong>/host</strong> on your big screen TV or projector. It loads YouTube
              instrumentals, synchronized lyrics, and live microphone vocal pitch detection.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-slate-950/70 border border-slate-800 flex flex-col gap-3">
            <div className="w-10 h-10 rounded-2xl bg-fuchsia-950 border border-fuchsia-500/40 text-fuchsia-300 flex items-center justify-center font-digital font-bold text-lg">
              02
            </div>
            <h4 className="text-base font-bold text-white">2. Scan QR with Phone</h4>
            <p className="text-xs text-slate-400 font-mono leading-relaxed">
              Guests scan the QR code on the TV screen to open <strong>/remote</strong> instantly.
              No app downloads required — works on iOS Safari and Android Chrome.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-slate-950/70 border border-slate-800 flex flex-col gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-950 border border-amber-500/40 text-amber-300 flex items-center justify-center font-digital font-bold text-lg">
              03
            </div>
            <h4 className="text-base font-bold text-white">3. Punch Code & Sing!</h4>
            <p className="text-xs text-slate-400 font-mono leading-relaxed">
              Punch any 5-digit code on the tactile phone keypad, queue songs, adjust pitch
              transpose, blast live airhorns, and earn your score at the end of every song.
            </p>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/80 py-6 px-6 text-center text-xs text-slate-500 font-mono flex flex-col sm:flex-row items-center justify-between gap-3 max-w-6xl mx-auto w-full">
        <span>PinoyVideoke v1.4.0 • Serverless Cloud Edition</span>
        <span>Built with React 18, Supabase Realtime, Web Audio API & Tailwind CSS</span>
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
