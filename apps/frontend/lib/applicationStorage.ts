import type { ChecklistItem } from './ai/types';

export const APPLICATION_STORAGE_KEY = 'adlc.application.v1';

export type StoredApplication = {
  certificationType: string;
  industry: string;
  employeeCount: string;
  businessDescription: string;
  /** 对应产品模型中的 `Application.aiGeneratedChecklist` */
  aiGeneratedChecklist: ChecklistItem[] | null;
  checklistSource: 'ai' | 'fallback' | null;
};

const empty: StoredApplication = {
  certificationType: '',
  industry: '',
  employeeCount: '',
  businessDescription: '',
  aiGeneratedChecklist: null,
  checklistSource: null,
};

export function readStoredApplication(): StoredApplication {
  if (typeof window === 'undefined') {
    return { ...empty };
  }
  try {
    const raw = window.localStorage.getItem(APPLICATION_STORAGE_KEY);
    if (!raw) return { ...empty };
    const p = JSON.parse(raw) as Partial<StoredApplication>;
    return {
      ...empty,
      ...p,
      aiGeneratedChecklist: Array.isArray(p.aiGeneratedChecklist)
        ? p.aiGeneratedChecklist
        : null,
    };
  } catch {
    return { ...empty };
  }
}

export function writeStoredApplication(data: Partial<StoredApplication>): void {
  if (typeof window === 'undefined') return;
  const cur = readStoredApplication();
  const next: StoredApplication = { ...cur, ...data };
  window.localStorage.setItem(APPLICATION_STORAGE_KEY, JSON.stringify(next));
}

export function setChecklistOnApplication(
  items: ChecklistItem[],
  source: 'ai' | 'fallback'
): void {
  writeStoredApplication({
    aiGeneratedChecklist: items,
    checklistSource: source,
  });
}
