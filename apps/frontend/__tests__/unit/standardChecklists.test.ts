import { getStandardChecklist, listCertificationTypes } from '../../lib/ai/standardChecklists';

describe('getStandardChecklist', () => {
  it('returns a non-empty items list for each known certification type', () => {
    for (const t of listCertificationTypes()) {
      const result = getStandardChecklist(t);
      expect(result.items.length).toBeGreaterThan(0);
      for (const item of result.items) {
        expect(item.id).toBeTruthy();
        expect(item.title).toBeTruthy();
        expect(item.description).toBeTruthy();
      }
    }
  });

  it('returns generic fallback for unknown certification type', () => {
    const result = getStandardChecklist('unknown-type');
    expect(result.items.length).toBeGreaterThan(0);
  });
});
