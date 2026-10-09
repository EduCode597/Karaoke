import { StrictMode } from 'react';
import { act, cleanup, render, screen, fireEvent } from '@testing-library/react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import ScoreModal from './ScoreModal';
import type { VideokeScoreResult } from '../../utils/scoring';

const result: VideokeScoreResult = {
  score: 87,
  tier: 'concert',
  commentary: 'Boses Pang-Concert!',
  subtext: 'Galing mo, pare!',
  stats: { totalSamples: 100, activeSamples: 80, singingRatio: 0.8, pitchStability: 0.75 },
};

beforeEach(() => {
  vi.useFakeTimers({
    toFake: [
      'setTimeout',
      'clearTimeout',
      'setInterval',
      'clearInterval',
      'requestAnimationFrame',
      'cancelAnimationFrame',
      'performance',
    ],
  });
});

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

// Mirrors HostView: StrictMode (main.tsx) + a brand-new onClose function on every render
const modal = (onClose: () => void, autoDismissSeconds = 3) => (
  <StrictMode>
    <ScoreModal
      isOpen
      result={result}
      singerName="Juan"
      songTitle="My Way"
      onClose={onClose}
      autoDismissSeconds={autoDismissSeconds}
    />
  </StrictMode>
);

it('finishes the score roll-up and auto-advances after 3 seconds', () => {
  const dismissed = vi.fn();
  const { rerender } = render(modal(() => dismissed(), 3));

  const elapse = (ms: number) => {
    for (let t = 0; t < ms; t += 200) {
      act(() => {
        vi.advanceTimersByTime(200);
      });
      rerender(modal(() => dismissed(), 3));
    }
  };

  elapse(1200); // Past 1s roll
  expect(screen.getByText('87')).toBeTruthy();
  expect(screen.getByRole('button', { name: /next song/i })).toBeTruthy();
  expect(dismissed).not.toHaveBeenCalled();

  elapse(2000); // 3.2s total, past 3s auto-advance
  expect(dismissed).toHaveBeenCalledTimes(1);
});

it('skips animation on first click and advances to next song on second click', () => {
  const dismissed = vi.fn();
  render(modal(() => dismissed(), 3));

  const actionBtn = screen.getByRole('button', { name: /skip animation|next song/i });
  expect(actionBtn.textContent).toContain('Skip Animation');

  // Skip roll animation
  fireEvent.click(actionBtn);
  expect(screen.getByText('87')).toBeTruthy();
  expect(actionBtn.textContent).toContain('Next Song');
  expect(dismissed).not.toHaveBeenCalled();

  // Click Next Song to dismiss immediately
  fireEvent.click(actionBtn);
  expect(dismissed).toHaveBeenCalledTimes(1);
});
