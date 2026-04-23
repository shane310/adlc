import { applySeoMeta, generateSeoMeta } from '../../utils/seo';

describe('applySeoMeta', () => {
  it('returns title and description', () => {
    const meta = applySeoMeta('测试标题', '测试描述');
    expect(meta.title).toBe('测试标题');
    expect(meta.description).toBe('测试描述');
  });

  it('returns default values when not provided', () => {
    const meta = applySeoMeta();
    expect(meta.title).toBeTruthy();
    expect(meta.description).toBeTruthy();
  });

  it('includes open graph properties', () => {
    const meta = applySeoMeta('OG Title', 'OG Description');
    expect(meta.openGraph.title).toBe('OG Title');
    expect(meta.openGraph.description).toBe('OG Description');
  });
});

describe('generateSeoMeta', () => {
  it('delegates to applySeoMeta', () => {
    expect(generateSeoMeta('A', 'B')).toEqual(applySeoMeta('A', 'B'));
  });
});
