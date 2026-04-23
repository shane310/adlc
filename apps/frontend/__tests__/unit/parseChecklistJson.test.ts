import { parseChecklistContent } from '../../lib/ai/parseChecklistJson';

describe('parseChecklistContent', () => {
  it('parses raw JSON with items array', () => {
    const raw = JSON.stringify({
      items: [
        { id: 'a', title: 'Doc A', description: 'Desc A' },
        { title: 'Doc B', description: 'Desc B' },
      ],
    });
    const items = parseChecklistContent(raw);
    expect(items).toHaveLength(2);
    expect(items[0].id).toBe('a');
    expect(items[1].id).toBeTruthy();
    expect(items[1].title).toBe('Doc B');
  });

  it('strips markdown code fence when model wraps JSON', () => {
    const raw = '```json\n{"items":[{"id":"1","title":"T","description":"D"}]}\n```';
    const items = parseChecklistContent(raw);
    expect(items).toHaveLength(1);
    expect(items[0].title).toBe('T');
  });

  it('returns empty array on invalid input', () => {
    expect(parseChecklistContent('not json')).toEqual([]);
    expect(parseChecklistContent('{}')).toEqual([]);
  });
});
