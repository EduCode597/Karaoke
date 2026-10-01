import { useState, useEffect } from 'react';

/**
 * Idempotent hook for loading the YouTube IFrame API script tag
 */
export function useYouTubeApi(): { isLoaded: boolean; error: string | null } {
  const [isLoaded, setIsLoaded] = useState<boolean>(() => {
    return typeof window !== 'undefined' && Boolean(window.YT && window.YT.Player);
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // If already initialized
    if (typeof window !== 'undefined' && window.YT && window.YT.Player) {
      setIsLoaded(true);
      return;
    }

    // Check if script tag already exists
    const existingScript = document.querySelector('script[src*="youtube.com/iframe_api"]');

    const handleReady = () => {
      setIsLoaded(true);
    };

    if (!existingScript) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      tag.async = true;
      tag.onerror = () => setError('Failed to load YouTube IFrame API');

      const prevOnReady = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => {
        if (prevOnReady) prevOnReady();
        handleReady();
      };

      document.head.appendChild(tag);
    } else {
      // Script already injected, wait for window.YT or interval check
      if (window.YT && window.YT.Player) {
        setIsLoaded(true);
      } else {
        const interval = setInterval(() => {
          if (window.YT && window.YT.Player) {
            setIsLoaded(true);
            clearInterval(interval);
          }
        }, 100);

        return () => clearInterval(interval);
      }
    }
  }, []);

  return { isLoaded, error };
}
