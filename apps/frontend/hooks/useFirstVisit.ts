import { useState, useCallback } from 'react';

const STORAGE_KEY = 'visited';

export function useFirstVisit() {
  const [isFirstVisit, setIsFirstVisit] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return !localStorage.getItem(STORAGE_KEY);
  });

  const markVisited = useCallback(() => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEY, 'true');
    setIsFirstVisit(false);
  }, []);

  return { isFirstVisit, markVisited };
}
