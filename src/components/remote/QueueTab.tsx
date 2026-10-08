import { useState, useEffect, useCallback } from 'react';
import { ListMusic, Trash2, ArrowUp, User, Disc, RefreshCw, Sparkles } from 'lucide-react';
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
    <div className="flex flex-col gap-4 w-full pb-24">
      {/* Queue Header */}
      <div className="p-4 rounded-3xl bg-slate-950/90 border border-slate-800 shadow-xl flex items-center justify-between backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-fuchsia-950/80 border border-fuchsia-500/40 text-fuchsia-400 shadow-neon-magenta">
            <ListMusic className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-sm text-white">Party Queue</h3>
              <span className="px-2 py-0.5 rounded-full bg-slate-900 border border-slate-700 text-fuchsia-300 font-digital font-bold text-xs">
                {queue.length} IN LINE
              </span>
            </div>
            <p className="text-[11px] font-mono text-slate-400">Live synchronized singing lineup</p>
          </div>
        </div>

        <button
          onClick={fetchQueue}
          disabled={loading}
          className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-all active:scale-95 touch-manipulation min-h-[40px] min-w-[40px] flex items-center justify-center"
          title="Refresh Queue"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-cyan-400' : ''}`} />
        </button>
      </div>

      {/* Queue Items List */}
      <div className="flex flex-col gap-3">
        {loading && queue.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3 text-slate-500 font-mono text-xs">
            <div className="w-8 h-8 border-2 border-fuchsia-400 border-t-transparent rounded-full animate-spin shadow-neon-magenta" />
            <span>Syncing room playlist from cloud...</span>
          </div>
        ) : queue.length === 0 ? (
          <div className="p-8 sm:p-12 rounded-3xl bg-slate-950/70 border border-slate-800/80 text-center flex flex-col items-center gap-3 shadow-xl">
            <div className="w-14 h-14 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500">
              <Disc className="w-7 h-7" />
            </div>
            <h4 className="text-base font-bold text-white">The Party Queue is Empty!</h4>
            <p className="text-xs text-slate-400 font-mono max-w-xs leading-relaxed">
              Step up and be the opening singer of the night! Punch 5 digits on the Keypad or search
              the Songbook.
            </p>
            <button
              onClick={onNavigateToSongbook}
              className="mt-3 py-3 px-5 rounded-2xl bg-gradient-to-r from-fuchsia-600 to-cyan-500 text-black font-mono font-black text-xs uppercase tracking-wider shadow-neon-magenta active:scale-95 transition-all touch-manipulation min-h-[44px]"
            >
              Browse Songbook Catalog
            </button>
          </div>
        ) : (
          queue.map((item, index) => {
            const isPlaying = item.status === 'playing' || index === 0;
            const isBusy = actionInProgress === item.id;

            return (
              <div
                key={item.id}
                className={`p-3.5 sm:p-4 rounded-3xl border transition-all flex items-center justify-between gap-3 shadow-md ${
                  isPlaying
                    ? 'bg-gradient-to-r from-cyan-950/60 via-slate-950 to-slate-950 border-cyan-500/60 shadow-neon-cyan/20'
                    : 'bg-slate-950/80 border-slate-800/80 hover:border-slate-700'
                }`}
              >
                {/* Index / Playing Badge */}
                <div className="flex items-center gap-3 overflow-hidden min-w-0">
                  <div
                    className={`w-9 h-9 rounded-2xl flex items-center justify-center font-mono font-bold text-xs shrink-0 ${
                      isPlaying
                        ? 'bg-gradient-to-tr from-cyan-500 to-cyan-400 text-slate-950 shadow-neon-cyan'
                        : 'bg-slate-900 border border-slate-800 text-slate-400'
                    }`}
                  >
                    {isPlaying ? (
                      <div className="flex items-end gap-0.5 h-4">
                        <span className="w-0.5 h-3 bg-slate-950 animate-pulse" />
                        <span className="w-0.5 h-4 bg-slate-950 animate-pulse" />
                        <span className="w-0.5 h-2 bg-slate-950 animate-pulse" />
                      </div>
                    ) : (
                      index + 1
                    )}
                  </div>

                  {/* Song & Singer Details */}
                  <div className="overflow-hidden min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-digital text-xs text-amber-400 font-bold tracking-wider shrink-0">
                        {item.song?.code || '-----'}
                      </span>
                      <h4 className="font-bold text-xs sm:text-sm text-white truncate">
                        {item.song?.title || 'Unknown Title'}
                      </h4>
                    </div>

                    <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5 truncate">
                      <span className="truncate">{item.song?.artist || 'Unknown Artist'}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1 text-cyan-300 font-mono font-medium truncate shrink-0">
                        <User className="w-3 h-3 text-cyan-400" />
                        {item.singer_name || 'Guest'}
                      </span>
                    </div>

                    {isPlaying && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-mono text-cyan-400 mt-1 uppercase tracking-wider font-bold">
                        <Sparkles className="w-3 h-3" />
                        Now Performing on Stage
                      </span>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2 shrink-0">
                  {/* Move to Top (only for queued items past index 1) */}
                  {index > 1 && (
                    <button
                      onClick={() => handleMoveToTop(item.id)}
                      disabled={isBusy}
                      title="Bump to top of queue"
                      className="p-2 sm:p-2.5 rounded-xl bg-slate-900 hover:bg-cyan-950 hover:text-cyan-300 text-slate-400 border border-slate-800 active:scale-95 transition-all touch-manipulation min-h-[40px] min-w-[40px] flex items-center justify-center"
                    >
                      <ArrowUp className="w-4 h-4" />
                    </button>
                  )}

                  {/* Delete button */}
                  <button
                    onClick={() => handleRemove(item.id)}
                    disabled={isBusy}
                    title="Remove from queue"
                    className="p-2 sm:p-2.5 rounded-xl bg-slate-900 hover:bg-rose-950 hover:text-rose-300 text-slate-400 border border-slate-800 active:scale-95 transition-all touch-manipulation min-h-[40px] min-w-[40px] flex items-center justify-center"
                  >
                    <Trash2 className="w-4 h-4" />
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
