import { createUserSchema, updateUserSchema, usersQuerySchema, passwordSchema } from '@/lib/validation';

describe('lib/validation', () => {
  describe('passwordSchema', () => {
    it('accepts a strong password', () => {
      expect(() => passwordSchema.parse('Str0ngPassw0rd!Foo')).not.toThrow();
    });

    it.each([
      'short1!',
      'alllowercase!123456',
      'ALLUPPERCASE!123456',
      'MissingSpecial123456',
      'MissingNumber!abcdef',
    ])('rejects weak password "%s"', (pw) => {
      expect(() => passwordSchema.parse(pw)).toThrow();
    });
  });

  describe('createUserSchema', () => {
    const base = {
      email: 'User@Example.com',
      password: 'Str0ngPassw0rd!Foo',
      confirmPassword: 'Str0ngPassw0rd!Foo',
      firstName: 'Ada',
      lastName: 'Lovelace',
      roleId: 'clx0123456789012345678xyz',
    };

    it('normalises email to lowercase', () => {
      const parsed = createUserSchema.parse(base);
      expect(parsed.email).toBe('user@example.com');
    });

    it('rejects mismatched passwords', () => {
      expect(() =>
        createUserSchema.parse({ ...base, confirmPassword: 'Different1!aBcDeF' }),
      ).toThrow(/Passwords do not match/);
    });
  });

  describe('updateUserSchema', () => {
    it('allows partial updates', () => {
      const parsed = updateUserSchema.parse({ firstName: 'Nova' });
      expect(parsed.firstName).toBe('Nova');
    });

    it('rejects invalid phone numbers', () => {
      expect(() => updateUserSchema.parse({ phone: 'not-a-phone' })).toThrow();
    });
  });

  describe('usersQuerySchema', () => {
    it('defaults page/pageSize and filter values', () => {
      const parsed = usersQuerySchema.parse({});
      expect(parsed).toEqual({ page: 1, pageSize: 20, active: 'all', mfa: 'all' });
    });

    it('coerces numeric strings', () => {
      const parsed = usersQuerySchema.parse({ page: '3', pageSize: '50' });
      expect(parsed.page).toBe(3);
      expect(parsed.pageSize).toBe(50);
    });
  });
});
