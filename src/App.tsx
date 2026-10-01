import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { Search, Mic2, Tv, Smartphone, Music, CheckCircle2, AlertCircle } from 'lucide-react';
import { searchSongs } from './lib/songs';
import { isSupabaseConfigured } from './lib/supabase';
import type { Song } from './types/song';

function HomeDashboard() {
  const [searchTerm, setSearchTerm] = useState('');
  const [language, setLanguage] = useState<'All' | 'Tagalog' | 'English'>('All');
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);
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

  return (
    <div className="min-h-screen bg-videoke-bg text-slate-100 flex flex-col justify-between selection:bg-cyan-500 selection:text-black">
      {/* Top Banner */}
      <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-md sticky top-0 z-30 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-tr from-cyan-500 to-fuchsia-500 flex items-center justify-center shadow-neon-cyan">
            <Mic2 className="w-6 h-6 text-black" />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-wider text-glow-cyan">
              PINOY<span className="text-fuchsia-400 text-glow-magenta">VIDEOKE</span>
            </h1>
            <p className="text-xs text-slate-400 font-mono">
              5-Digit Cloud Videoke Web Application
            </p>
          </div>
        </div>

        {/* Supabase Status Badge */}
        <div className="flex items-center gap-2">
          {isSupabaseConfigured ? (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/60 border border-emerald-500/40 text-emerald-400 text-xs font-mono">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Supabase Cloud Connected</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-950/60 border border-amber-500/40 text-amber-400 text-xs font-mono">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>Offline Catalog Active</span>
            </div>
          )}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-5xl mx-auto w-full px-6 py-8 flex-1 flex flex-col gap-8">
        {/* Navigation Quick Links */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link
            to="/host"
            className="group p-6 rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 hover:border-cyan-500 transition-all shadow-lg hover:shadow-neon-cyan flex items-center justify-between"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-cyan-950/80 border border-cyan-500/40 text-cyan-400">
                <Tv className="w-8 h-8" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white group-hover:text-cyan-400 transition-colors">
                  TV Host Screen
                </h2>
                <p className="text-xs text-slate-400">
                  Displays video player, synced lyrics, and room QR code
                </p>
              </div>
            </div>
            <span className="px-3 py-1 rounded bg-slate-800 text-xs font-mono text-cyan-400 group-hover:bg-cyan-500 group-hover:text-black transition-colors">
              /host
            </span>
          </Link>

          <Link
            to="/remote"
            className="group p-6 rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 hover:border-fuchsia-500 transition-all shadow-lg hover:shadow-neon-magenta flex items-center justify-between"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-fuchsia-950/80 border border-fuchsia-500/40 text-fuchsia-400">
                <Smartphone className="w-8 h-8" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white group-hover:text-fuchsia-400 transition-colors">
                  Mobile Remote Control
                </h2>
                <p className="text-xs text-slate-400">
                  Wireless 5-digit keypad, songbook, and queue manager
                </p>
              </div>
            </div>
            <span className="px-3 py-1 rounded bg-slate-800 text-xs font-mono text-fuchsia-400 group-hover:bg-fuchsia-500 group-hover:text-black transition-colors">
              /remote
            </span>
          </Link>
        </div>

        {/* Songbook Catalog Section */}
        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-md flex flex-col gap-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Music className="w-5 h-5 text-amber-400" />
                <span>5-Digit Songbook Catalog</span>
              </h2>
              <p className="text-xs text-slate-400 font-mono">
                Search by 5-digit numeric code, track title, or artist name
              </p>
            </div>

            {/* Language Category Chips */}
            <div className="flex items-center gap-2">
              {(['All', 'Tagalog', 'English'] as const).map((lang) => (
                <button
                  key={lang}
                  onClick={() => setLanguage(lang)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    language === lang
                      ? 'bg-amber-400 text-black shadow-neon-amber'
                      : 'bg-slate-800/80 text-slate-400 hover:text-white'
                  }`}
                >
                  {lang}
                </button>
              ))}
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by 5-digit code (e.g. 01001) or title (e.g. Anak, El Bimbo)..."
              className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400 text-slate-100 placeholder:text-slate-600 font-mono text-sm transition-all"
            />
          </div>

          {/* Song Grid */}
          {loading ? (
            <div className="py-12 text-center text-slate-500 font-mono text-sm">
              Loading song catalog...
            </div>
          ) : songs.length === 0 ? (
            <div className="py-12 text-center text-slate-500 font-mono text-sm">
              No songs found matching "{searchTerm}".
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {songs.map((song) => (
                <div
                  key={song.id}
                  className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-slate-700 transition-all flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="px-2.5 py-1 rounded bg-amber-400/10 border border-amber-400/30 text-amber-400 font-digital font-bold text-sm tracking-wider">
                      {song.code}
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-white">{song.title}</h3>
                      <p className="text-xs text-slate-400">{song.artist}</p>
                    </div>
                  </div>
                  <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                    {song.language}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 py-4 px-6 text-center text-xs text-slate-600 font-mono">
        PinoyVideoke v1.1.0 • Serverless Cloud Edition • Powered by Supabase & React
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomeDashboard />} />
        <Route
          path="/host"
          element={
            <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center">
              <h1 className="text-3xl font-black text-cyan-400 mb-2">TV Host Screen</h1>
              <p className="text-slate-400 font-mono text-sm mb-6">
                Coming on Day 2 & Day 4: YouTube IFrame + Synced LRC Overlay + QR Pairing!
              </p>
              <Link
                to="/"
                className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-sm font-mono"
              >
                ← Back to Dashboard
              </Link>
            </div>
          }
        />
        <Route
          path="/remote"
          element={
            <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center">
              <h1 className="text-3xl font-black text-fuchsia-400 mb-2">Mobile Remote Control</h1>
              <p className="text-slate-400 font-mono text-sm mb-6">
                Coming on Day 3: Megapro 3x4 Matrix Keypad + LED Readout + Queue Drawer!
              </p>
              <Link
                to="/"
                className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-sm font-mono"
              >
                ← Back to Dashboard
              </Link>
            </div>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
