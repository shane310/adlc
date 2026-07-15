import { formatRelativeTime, formatDate } from '@/lib/format';

describe('formatRelativeTime', () => {
  const now = new Date('2024-06-01T12:00:00Z');

  it('returns "never" for null/undefined', () => {
    expect(formatRelativeTime(null, now)).toBe('never');
    expect(formatRelativeTime(undefined, now)).toBe('never');
  });

  it('returns "just now" for recent times', () => {
    expect(formatRelativeTime(new Date(now.getTime() - 5_000), now)).toBe('just now');
  });

  it('formats minutes, hours, days and years', () => {
    expect(formatRelativeTime(new Date(now.getTime() - 3 * 60_000), now)).toBe('3 minutes ago');
    expect(formatRelativeTime(new Date(now.getTime() - 2 * 3_600_000), now)).toBe('2 hours ago');
    expect(formatRelativeTime(new Date(now.getTime() - 2 * 86_400_000), now)).toBe('2 days ago');
    expect(formatRelativeTime(new Date(now.getTime() - 2 * 365 * 86_400_000), now)).toBe('2 years ago');
  });

  it('handles future dates gracefully', () => {
    expect(formatRelativeTime(new Date(now.getTime() + 60_000), now)).toBe('in the future');
  });
});

describe('formatDate', () => {
  it('formats to YYYY-MM-DD', () => {
    expect(formatDate('2024-06-01T15:04:00Z')).toBe('2024-06-01');
  });

  it('returns an em-dash for null', () => {
    expect(formatDate(null)).toBe('—');
  });
});
