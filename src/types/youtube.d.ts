export {};

declare global {
  interface Window {
    YT: {
      Player: {
        new (
          elementId: string | HTMLElement,
          options: {
            videoId?: string;
            width?: string | number;
            height?: string | number;
            host?: string;
            playerVars?: {
              autoplay?: 0 | 1;
              controls?: 0 | 1;
              rel?: 0 | 1;
              modestbranding?: 0 | 1;
              disablekb?: 0 | 1;
              fs?: 0 | 1;
              playsinline?: 0 | 1;
              origin?: string;
              enablejsapi?: 0 | 1;
              [key: string]: any;
            };
            events?: {
              onReady?: (event: { target: YTPlayer }) => void;
              onStateChange?: (event: { data: number; target: YTPlayer }) => void;
              onError?: (event: { data: number; target: YTPlayer }) => void;
            };
          }
        ): YTPlayer;
      };
      PlayerState: {
        UNSTARTED: number;
        ENDED: number;
        PLAYING: number;
        PAUSED: number;
        BUFFERING: number;
        CUED: number;
      };
    };
    onYouTubeIframeAPIReady?: () => void;
  }

  interface YTPlayer {
    playVideo: () => void;
    pauseVideo: () => void;
    stopVideo: () => void;
    seekTo: (seconds: number, allowSeekAhead?: boolean) => void;
    getCurrentTime: () => number;
    getDuration: () => number;
    getPlayerState: () => number;
    loadVideoById: (videoId: string | { videoId: string; startSeconds?: number }) => void;
    cueVideoById: (videoId: string | { videoId: string; startSeconds?: number }) => void;
    destroy: () => void;
  }
}
