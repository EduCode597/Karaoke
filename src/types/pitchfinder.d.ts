declare module 'pitchfinder' {
  export interface PitchDetectorConfig {
    sampleRate?: number;
    threshold?: number;
    probabilityThreshold?: number;
  }

  export type PitchDetector = (float32AudioBuffer: Float32Array) => number | null;

  export function YIN(config?: PitchDetectorConfig): PitchDetector;
  export function AMDF(config?: PitchDetectorConfig): PitchDetector;
  export function ACF2PLUS(config?: PitchDetectorConfig): PitchDetector;
  export function DynamicWavelet(config?: PitchDetectorConfig): PitchDetector;
  export function Macleod(config?: PitchDetectorConfig): PitchDetector;
}
