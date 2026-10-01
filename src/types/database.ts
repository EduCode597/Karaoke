export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      songs: {
        Row: {
          id: number;
          code: string;
          title: string;
          artist: string;
          language: string;
          youtube_id: string;
          lrc_content: string | null;
          key_offset: number;
          duration: number;
          search_tokens: string | null;
          created_at: string;
        };
        Insert: {
          id?: number;
          code: string;
          title: string;
          artist: string;
          language?: string;
          youtube_id: string;
          lrc_content?: string | null;
          key_offset?: number;
          duration?: number;
          created_at?: string;
        };
        Update: {
          id?: number;
          code?: string;
          title?: string;
          artist?: string;
          language?: string;
          youtube_id?: string;
          lrc_content?: string | null;
          key_offset?: number;
          duration?: number;
          created_at?: string;
        };
      };
      queue_items: {
        Row: {
          id: string;
          room_code: string;
          song_id: number;
          singer_name: string;
          position: number;
          status: 'queued' | 'playing' | 'completed' | 'skipped';
          created_at: string;
        };
        Insert: {
          id?: string;
          room_code: string;
          song_id: number;
          singer_name?: string;
          position?: number;
          status?: 'queued' | 'playing' | 'completed' | 'skipped';
          created_at?: string;
        };
        Update: {
          id?: string;
          room_code?: string;
          song_id?: number;
          singer_name?: string;
          position?: number;
          status?: 'queued' | 'playing' | 'completed' | 'skipped';
          created_at?: string;
        };
      };
    };
  };
}
