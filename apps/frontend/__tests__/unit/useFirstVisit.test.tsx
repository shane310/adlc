import { renderHook, act } from '@testing-library/react';
import { useFirstVisit } from '../../hooks/useFirstVisit';

const STORAGE_KEY = 'visited';

describe('useFirstVisit', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('returns isFirstVisit=true when localStorage has no visited flag', () => {
    const { result } = renderHook(() => useFirstVisit());
    expect(result.current.isFirstVisit).toBe(true);
  });

  it('returns isFirstVisit=false when localStorage has visited flag', () => {
    localStorage.setItem(STORAGE_KEY, 'true');
    const { result } = renderHook(() => useFirstVisit());
    expect(result.current.isFirstVisit).toBe(false);
  });

  it('markVisited sets the flag and updates state', () => {
    const { result } = renderHook(() => useFirstVisit());
    expect(result.current.isFirstVisit).toBe(true);

    act(() => {
      result.current.markVisited();
    });

    expect(result.current.isFirstVisit).toBe(false);
    expect(localStorage.getItem(STORAGE_KEY)).toBe('true');
  });

  it('persists across hook re-renders after markVisited', () => {
    const { result, rerender } = renderHook(() => useFirstVisit());

    act(() => {
      result.current.markVisited();
    });

    rerender();
    expect(result.current.isFirstVisit).toBe(false);
  });
});
