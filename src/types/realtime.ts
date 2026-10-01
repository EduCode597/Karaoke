export type PlayerAction = 'play' | 'pause' | 'skip' | 'replay';

export type PartySfxType = 'airhorn' | 'cheer' | 'gong' | 'drumroll';

export interface ScoreResult {
  score: number;
  tier: 'champion' | 'concert' | 'pwede_na' | 'gong';
  title: string;
  singerName: string;
  songTitle: string;
}

export type RealtimeBroadcastEvent =
  | { event: 'player:action'; payload: { action: PlayerAction } }
  | { event: 'player:transpose'; payload: { semitones: number } }
  | { event: 'party:sfx'; payload: { sfxType: PartySfxType } }
  | { event: 'score:announced'; payload: ScoreResult };
