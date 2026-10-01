import { Database } from './database';

export type Song = Database['public']['Tables']['songs']['Row'];
export type QueueItem = Database['public']['Tables']['queue_items']['Row'] & {
  song?: Song;
};

export interface SongbookFilter {
  search?: string;
  language?: 'All' | 'Tagalog' | 'English';
}
