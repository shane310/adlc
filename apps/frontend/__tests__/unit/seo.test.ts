import { generateSeoMeta } from '../../utils/seo';

describe('generateSeoMeta', () => {
  it('returns title and description', () => {
    const meta = generateSeoMeta('测试标题', '测试描述');
    expect(meta.title).toBe('测试标题');
    expect(meta.description).toBe('测试描述');
  });

  it('returns default values when not provided', () => {
    const meta = generateSeoMeta();
    expect(meta.title).toBeTruthy();
    expect(meta.description).toBeTruthy();
  });

  it('includes open graph properties', () => {
    const meta = generateSeoMeta('OG Title', 'OG Description');
    expect(meta.openGraph.title).toBe('OG Title');
    expect(meta.openGraph.description).toBe('OG Description');
  });
});
