import { clientIp } from '@/lib/http';

describe('clientIp', () => {
  it('returns the first entry of x-forwarded-for', () => {
    const headers = new Headers({ 'x-forwarded-for': '10.0.0.1, 10.0.0.2' });
    expect(clientIp(headers)).toBe('10.0.0.1');
  });

  it('falls back to x-real-ip', () => {
    const headers = new Headers({ 'x-real-ip': '203.0.113.5' });
    expect(clientIp(headers)).toBe('203.0.113.5');
  });

  it('returns null when no headers are present', () => {
    expect(clientIp(new Headers())).toBeNull();
  });
});
