import type { ChecklistItem } from './types';

type OpenAiItem = {
  id?: string;
  title?: string;
  description?: string;
};

type OpenAiDocument = {
  items?: OpenAiItem[];
};

function stripCodeFences(s: string): string {
  const t = s.trim();
  if (t.startsWith('```')) {
    const withoutStart = t.replace(/^```(?:json)?\s*/i, '');
    return withoutStart.replace(/```\s*$/g, '').trim();
  }
  return t;
}

function normalizeItem(raw: OpenAiItem, index: number): ChecklistItem | null {
  const title = (raw.title ?? '').trim();
  const description = (raw.description ?? '').trim();
  if (!title) return null;
  return {
    id: (raw.id && String(raw.id).trim()) || `item-${index + 1}`,
    title,
    description: description || '—',
  };
}

/**
 * 解析来自 OpenAI 的文本（或 JSON 对象字符串），得到清单条目；失败时返回空数组。
 */
export function parseChecklistContent(content: string): ChecklistItem[] {
  const inner = stripCodeFences(content);
  let parsed: unknown;
  try {
    parsed = JSON.parse(inner) as OpenAiDocument;
  } catch {
    return [];
  }
  if (!parsed || typeof parsed !== 'object' || !('items' in parsed)) {
    return [];
  }
  const { items } = parsed as OpenAiDocument;
  if (!Array.isArray(items)) {
    return [];
  }
  const out: ChecklistItem[] = [];
  items.forEach((raw, i) => {
    if (!raw || typeof raw !== 'object') return;
    const item = normalizeItem(raw as OpenAiItem, out.length);
    if (item) out.push(item);
  });
  return out;
}
