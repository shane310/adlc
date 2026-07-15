import { groupPermissionsByResource } from '@/lib/roles-service';

describe('groupPermissionsByResource', () => {
  it('groups permissions by resource and sorts actions', () => {
    const grouped = groupPermissionsByResource([
      { id: '1', resource: 'users', action: 'update' },
      { id: '2', resource: 'users', action: 'create' },
      { id: '3', resource: 'applications', action: 'read' },
    ]);

    expect(Object.keys(grouped).sort()).toEqual(['applications', 'users']);
    expect(grouped.users.map((p) => p.action)).toEqual(['create', 'update']);
  });

  it('returns an empty object for empty input', () => {
    expect(groupPermissionsByResource([])).toEqual({});
  });
});
