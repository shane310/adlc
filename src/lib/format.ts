const RELATIVE_UNITS: [string, number][] = [
  ['year', 60 * 60 * 24 * 365],
  ['month', 60 * 60 * 24 * 30],
  ['day', 60 * 60 * 24],
  ['hour', 60 * 60],
  ['minute', 60],
  ['second', 1],
];

export function formatRelativeTime(from: Date | string | null | undefined, now: Date = new Date()): string {
  if (!from) return 'never';
  const date = from instanceof Date ? from : new Date(from);
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (!Number.isFinite(seconds) || seconds < 0) return 'in the future';
  if (seconds < 45) return 'just now';

  for (const [unit, secondsIn] of RELATIVE_UNITS) {
    const amount = Math.floor(seconds / secondsIn);
    if (amount >= 1) return `${amount} ${unit}${amount === 1 ? '' : 's'} ago`;
  }
  return 'just now';
}

export function formatDate(d: Date | string | null | undefined): string {
  if (!d) return '—';
  const date = d instanceof Date ? d : new Date(d);
  return date.toISOString().slice(0, 10);
}
