import { generatePersonalizedChecklist } from '../../lib/ai/generateChecklistService';

describe('generatePersonalizedChecklist', () => {
  const oldFetch = global.fetch;
  const oldKey = process.env.OPENAI_API_KEY;

  afterEach(() => {
    global.fetch = oldFetch;
    if (oldKey === undefined) {
      delete process.env.OPENAI_API_KEY;
    } else {
      process.env.OPENAI_API_KEY = oldKey;
    }
  });

  it('uses fallback when OPENAI_API_KEY is missing', async () => {
    delete process.env.OPENAI_API_KEY;
    const result = await generatePersonalizedChecklist({
      certificationType: 'iso9001',
      industry: 'Mfg',
      employeeCount: '1-10',
    });
    expect(result.source).toBe('fallback');
    expect(result.items.length).toBeGreaterThan(0);
    expect(result.message).toBeDefined();
  });

  it('returns AI items on successful API response', async () => {
    process.env.OPENAI_API_KEY = 'test-key';
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        choices: [
          {
            message: {
              content: JSON.stringify({
                items: [
                  { id: '1', title: 'A', description: 'DA' },
                  { id: '2', title: 'B', description: 'DB' },
                ],
              }),
            },
          },
        ],
      }),
    }) as unknown as typeof fetch;

    const result = await generatePersonalizedChecklist({
      certificationType: 'iso14001',
      industry: 'Retail',
      employeeCount: '11-50',
    });
    expect(result.source).toBe('ai');
    expect(result.items).toHaveLength(2);
    expect(result.items[0].title).toBe('A');
  });

  it('uses standard checklist on API error', async () => {
    process.env.OPENAI_API_KEY = 'test-key';
    global.fetch = jest.fn().mockRejectedValue(new Error('network')) as unknown as typeof fetch;

    const result = await generatePersonalizedChecklist({
      certificationType: 'fssc22000',
      industry: 'Food',
      employeeCount: '201+',
    });
    expect(result.source).toBe('fallback');
    expect(result.message).toMatch(/unavailable|temporarily|standard/i);
    expect(result.items.length).toBeGreaterThan(0);
  });
});
