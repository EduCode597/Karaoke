import { useState, useEffect, useCallback } from 'react';
import { ListMusic, Trash2, ArrowUp, Music2, User, Disc, RefreshCw, Sparkles } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { getRoomQueue, removeSongFromQueue, moveSongToTop } from '../../lib/songs';
import type { QueueItem } from '../../types/song';

interface QueueTabProps {
  roomCode: string;
  onNavigateToSongbook: () => void;
  broadcastQueueUpdated?: (updatedQueue?: QueueItem[]) => void;
}

export default function QueueTab({
  roomCode,
  onNavigateToSongbook,
  broadcastQueueUpdated,
}: QueueTabProps) {
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);

  const fetchQueue = useCallback(async () => {
    if (!roomCode) return;
    try {
      const items = await getRoomQueue(roomCode);
      setQueue(items);
    } catch (err) {
      console.error('Failed to load queue:', err);
    } finally {
      setLoading(false);
    }
  }, [roomCode]);

  useEffect(() => {
    fetchQueue();

    if (!isSupabaseConfigured || !roomCode) return;

    // Realtime Postgres Changes Subscription
    const channel = supabase
      .channel(`queue-changes:${roomCode}`)
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

  const handleRemove = async (id: string) => {
    setActionInProgress(id);
    try {
      await removeSongFromQueue(id);
      const updated = queue.filter((item) => item.id !== id);
      setQueue(updated);
      if (broadcastQueueUpdated) broadcastQueueUpdated(updated);
      await fetchQueue();
    } finally {
      setActionInProgress(null);
    }
  };

  const handleMoveToTop = async (id: string) => {
    setActionInProgress(id);
    try {
      await moveSongToTop(roomCode, id);
      const items = await getRoomQueue(roomCode);
      setQueue(items);
      if (broadcastQueueUpdated) broadcastQueueUpdated(items);
    } finally {
      setActionInProgress(null);
    }
  };

  return (
    <div className="flex flex-col gap-4 w-full pb-20">
      {/* Queue Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-fuchsia-950/80 border border-fuchsia-500/40 text-fuchsia-400">
            <ListMusic className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-white">Party Queue</h3>
            <p className="text-[11px] font-mono text-slate-400">
              {queue.length} {queue.length === 1 ? 'song' : 'songs'} in line
            </p>
          </div>
        </div>

        <button
          onClick={fetchQueue}
          disabled={loading}
          className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors"
          title="Refresh Queue"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Queue Items List */}
      <div className="flex flex-col gap-3">
        {loading && queue.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 gap-3 text-slate-500 font-mono text-xs">
            <div className="w-6 h-6 border-2 border-fuchsia-400 border-t-transparent rounded-full animate-spin" />
            <span>Syncing room playlist...</span>
          </div>
        ) : queue.length === 0 ? (
          <div className="p-8 rounded-2xl bg-slate-900/50 border border-slate-800/80 text-center flex flex-col items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-slate-800/80 flex items-center justify-center text-slate-500">
              <Disc className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-white">The Queue is Empty!</h4>
            <p className="text-xs text-slate-400 font-mono max-w-xs">
              Be the first singer of the night! Use the Keypad or search the Songbook.
            </p>
            <button
              onClick={onNavigateToSongbook}
              className="mt-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-fuchsia-600 to-cyan-600 text-black font-mono font-bold text-xs uppercase tracking-wider shadow-neon-magenta active:scale-95 transition-all"
            >
              Browse Songbook
            </button>
          </div>
        ) : (
          queue.map((item, index) => {
            const isPlaying = item.status === 'playing' || index === 0;
            const isBusy = actionInProgress === item.id;

            return (
              <div
                key={item.id}
                className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 shadow-md ${
                  isPlaying
                    ? 'bg-gradient-to-r from-cyan-950/40 via-slate-900 to-slate-950 border-cyan-500/50 shadow-neon-cyan/20'
                    : 'bg-slate-900/90 border-slate-800/90'
                }`}
              >
                {/* Index / Playing Badge */}
                <div className="flex items-center gap-3">
                  <div
                    className={`w-7 h-7 rounded-xl flex items-center justify-center font-mono font-bold text-xs ${
                      isPlaying
                        ? 'bg-cyan-500 text-black shadow-neon-cyan animate-pulse'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {isPlaying ? <Music2 className="w-3.5 h-3.5" /> : index + 1}
                  </div>

                  {/* Song & Singer Details */}
                  <div className="overflow-hidden">
                    <div className="flex items-center gap-2">
                      <span className="font-digital text-xs text-amber-400 font-bold tracking-wider">
                        {item.song?.code || '-----'}
                      </span>
                      <h4 className="font-bold text-xs text-white truncate">
                        {item.song?.title || 'Unknown Title'}
                      </h4>
                    </div>

                    <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                      <span className="truncate">{item.song?.artist || 'Unknown Artist'}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1 text-cyan-400 font-mono font-medium truncate">
                        <User className="w-3 h-3" />
                        {item.singer_name || 'Guest'}
                      </span>
                    </div>

                    {isPlaying && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-mono text-cyan-400 mt-1 uppercase tracking-wider">
                        <Sparkles className="w-2.5 h-2.5" />
                        Now Performing
                      </span>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-1.5 shrink-0">
                  {/* Move to Top (only for queued items past index 1) */}
                  {index > 1 && (
                    <button
                      onClick={() => handleMoveToTop(item.id)}
                      disabled={isBusy}
                      title="Move to top of queue"
                      className="p-2 rounded-xl bg-slate-800 hover:bg-cyan-950 hover:text-cyan-400 text-slate-400 border border-slate-700 active:scale-95 transition-all"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                  )}

                  {/* Delete button */}
                  <button
                    onClick={() => handleRemove(item.id)}
                    disabled={isBusy}
                    title="Remove from queue"
                    className="p-2 rounded-xl bg-slate-800 hover:bg-rose-950 hover:text-rose-400 text-slate-400 border border-slate-700 active:scale-95 transition-all"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
