import { parseChecklistContent } from './parseChecklistJson';
import { getStandardChecklist } from './standardChecklists';
import type { ChecklistPayload, ChecklistResult } from './types';

const OPENAI_URL = 'https://api.openai.com/v1/chat/completions';
const AI_TIMEOUT_MS = 10_000;
const MODEL = 'gpt-4o';

function buildUserPrompt(p: ChecklistPayload): string {
  return [
    'You are a certification consultant. Return ONLY valid JSON, no other text, matching this exact shape:',
    '{"items":[{"id":"string","title":"string","description":"string"}]}',
    'List 4–8 unique documents a company in this profile must provide for audit readiness.',
    `Certification: ${p.certificationType}. Industry: ${p.industry}. Company size: ${p.employeeCount}.`,
    p.businessDescription
      ? `Business description: ${p.businessDescription}`
      : 'No additional business description was provided.',
  ].join('\n');
}

export async function callOpenAiForChecklist(
  payload: ChecklistPayload,
  apiKey: string
): Promise<string> {
  const body = {
    model: MODEL,
    response_format: { type: 'json_object' as const },
    messages: [
      {
        role: 'system' as const,
        content:
          'You output only JSON. Never include markdown. Keys must be in English. Use concise document titles and one-line descriptions.',
      },
      { role: 'user' as const, content: buildUserPrompt(payload) },
    ],
  };

  const ac = new AbortController();
  const t = setTimeout(() => ac.abort(), AI_TIMEOUT_MS);
  let res: Response;
  try {
    res = await fetch(OPENAI_URL, {
      method: 'POST',
      signal: ac.signal,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(body),
    });
  } finally {
    clearTimeout(t);
  }

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`OpenAI error ${res.status}: ${errText.slice(0, 200)}`);
  }

  const data = (await res.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  const text = data.choices?.[0]?.message?.content;
  if (!text) {
    throw new Error('No content in OpenAI response');
  }
  return text;
}

const FALLBACK_MSG =
  'AI personalization is temporarily unavailable. A standard checklist for your selected certification is shown.';

/**
 * 调用 OpenAI 生成清单；无密钥、超时或失败时回退到标准清单（NFR-A1、AC5）。
 */
export async function generatePersonalizedChecklist(
  payload: ChecklistPayload
): Promise<ChecklistResult> {
  const key = process.env.OPENAI_API_KEY;
  const std = getStandardChecklist(String(payload.certificationType));

  if (!key) {
    return { source: 'fallback', items: std.items, message: FALLBACK_MSG };
  }

  try {
    const text = await callOpenAiForChecklist(payload, key);
    const items = parseChecklistContent(text);
    if (items.length === 0) {
      return { source: 'fallback', items: std.items, message: FALLBACK_MSG };
    }
    return { source: 'ai', items };
  } catch {
    return { source: 'fallback', items: std.items, message: FALLBACK_MSG };
  }
}
