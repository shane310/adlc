import { clsx } from '@/lib/clsx';

describe('clsx', () => {
  it('joins strings and ignores falsy values', () => {
    expect(clsx('a', false, null, undefined, 0, 'b')).toBe('a b');
  });

  it('supports object shorthand', () => {
    expect(clsx('base', { active: true, hidden: false })).toBe('base active');
  });

  it('flattens nested arrays', () => {
    expect(clsx(['a', ['b', ['c', { d: true }]]])).toBe('a b c d');
  });
});
