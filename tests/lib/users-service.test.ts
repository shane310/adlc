import { buildUsersWhere } from '@/lib/users-service';
import { SystemRole } from '@prisma/client';

describe('buildUsersWhere', () => {
  it('applies default pagination', () => {
    const { take, skip, page, pageSize } = buildUsersWhere({});
    expect(page).toBe(1);
    expect(pageSize).toBe(20);
    expect(take).toBe(20);
    expect(skip).toBe(0);
  });

  it('combines search across email/firstName/lastName', () => {
    const { where } = buildUsersWhere({ search: 'ada' });
    expect(where.OR).toEqual([
      { email: { contains: 'ada' } },
      { firstName: { contains: 'ada' } },
      { lastName: { contains: 'ada' } },
    ]);
  });

  it('filters by role, active and mfa flags', () => {
    const { where } = buildUsersWhere({
      role: SystemRole.INSPECTOR,
      active: 'true',
      mfa: 'false',
    });
    expect(where).toEqual({
      role: { name: SystemRole.INSPECTOR },
      isActive: true,
      mfaEnabled: false,
    });
  });

  it('computes skip from page and pageSize', () => {
    const { skip, take } = buildUsersWhere({ page: 3, pageSize: 25 });
    expect(skip).toBe(50);
    expect(take).toBe(25);
  });
});
