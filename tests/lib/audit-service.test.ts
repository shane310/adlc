import { auditLogsToCsv, buildAuditWhere } from '@/lib/audit-service';

describe('buildAuditWhere', () => {
  it('applies default pagination', () => {
    const { page, pageSize, skip, take } = buildAuditWhere({});
    expect(page).toBe(1);
    expect(pageSize).toBe(50);
    expect(take).toBe(50);
    expect(skip).toBe(0);
  });

  it('filters by action, resource and userId', () => {
    const { where } = buildAuditWhere({
      action: 'user_updated',
      resource: 'user',
      userId: 'clx0123456789012345678xyz',
    });
    expect(where).toEqual({
      action: 'user_updated',
      resource: 'user',
      userId: 'clx0123456789012345678xyz',
    });
  });

  it('applies a createdAt range', () => {
    const from = '2024-01-01T00:00:00.000Z';
    const to = '2024-02-01T00:00:00.000Z';
    const { where } = buildAuditWhere({ from, to });
    expect(where.createdAt).toEqual({
      gte: new Date(from),
      lte: new Date(to),
    });
  });
});

describe('auditLogsToCsv', () => {
  it('serialises entries with CSV escaping', () => {
    const csv = auditLogsToCsv([
      {
        createdAt: new Date('2024-01-15T10:30:00Z'),
        action: 'user_updated',
        resource: 'user',
        resourceId: 'u_1',
        userId: 'admin_1',
        ipAddress: '10.0.0.1',
        details: { note: 'has "quotes", and,commas' },
      },
    ]);
    expect(csv.split('\n')).toHaveLength(2);
    expect(csv).toContain('user_updated');
    expect(csv).toMatch(/"\{""note"":""has \\"quotes\\", and,commas""\}"|\{""note""/);
  });
});
