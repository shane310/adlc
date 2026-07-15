'use client';

import { useEffect, useState, useCallback } from 'react';

interface AutoRefreshProps {
  intervalMs?: number;
  children: (state: { lastUpdatedAt: Date; refresh: () => void }) => React.ReactNode;
  onTick?: () => Promise<void> | void;
}

/**
 * Handles the 30 second polling requirement (AC1) while keeping the page a
 * server component. Consumers implement the actual fetch inside `onTick`.
 */
export function AutoRefresh({ intervalMs = 30_000, children, onTick }: AutoRefreshProps) {
  const [lastUpdatedAt, setLastUpdatedAt] = useState<Date>(() => new Date());

  const refresh = useCallback(async () => {
    if (onTick) await onTick();
    setLastUpdatedAt(new Date());
  }, [onTick]);

  useEffect(() => {
    const id = setInterval(refresh, intervalMs);
    return () => clearInterval(id);
  }, [refresh, intervalMs]);

  return <>{children({ lastUpdatedAt, refresh })}</>;
}
