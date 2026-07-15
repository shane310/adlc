import { validateSettingValue, InvalidSettingValueError } from '@/lib/settings-service';
import { getSettingDefinition, SYSTEM_SETTING_DEFINITIONS } from '@/lib/settings-defaults';

describe('validateSettingValue', () => {
  it('coerces string numbers within range', () => {
    const def = getSettingDefinition('security.sessionTimeoutMinutes')!;
    expect(validateSettingValue(def, '45')).toBe(45);
  });

  it('rejects numbers below minimum', () => {
    const def = getSettingDefinition('security.sessionTimeoutMinutes')!;
    expect(() => validateSettingValue(def, 2)).toThrow(InvalidSettingValueError);
  });

  it('rejects numbers above maximum', () => {
    const def = getSettingDefinition('storage.maxUploadMb')!;
    expect(() => validateSettingValue(def, 10_000)).toThrow(InvalidSettingValueError);
  });

  it('accepts booleans and string booleans', () => {
    const def = getSettingDefinition('security.passwordComplexityEnabled')!;
    expect(validateSettingValue(def, true)).toBe(true);
    expect(validateSettingValue(def, 'false')).toBe(false);
  });

  it('rejects select values not in the option list', () => {
    const def = getSettingDefinition('security.mfaEnforcement')!;
    expect(() => validateSettingValue(def, 'nope')).toThrow(InvalidSettingValueError);
    expect(validateSettingValue(def, 'per-role')).toBe('per-role');
  });

  it('exposes every setting definition with sensible defaults', () => {
    for (const def of SYSTEM_SETTING_DEFINITIONS) {
      expect(def.key).toMatch(/^[a-z]+\.[a-zA-Z]+$/);
      expect(['security', 'notifications', 'workflow', 'storage']).toContain(def.category);
    }
  });
});
