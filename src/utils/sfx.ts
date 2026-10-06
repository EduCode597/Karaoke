/**
 * Compatibility facade for sound effects.
 * Re-exports audio synthesis functions from the consolidated soundEffects singleton module.
 * @deprecated Prefer importing directly from '../utils/soundEffects'.
 */

export {
  playScoreTick,
  playTrumpetFanfare,
  playScoreFanfare,
  playGong as playVideokeGong,
} from './soundEffects';
