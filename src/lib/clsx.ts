export type ClassValue =
  | string
  | number
  | null
  | undefined
  | false
  | Record<string, boolean | null | undefined>
  | ClassValue[];

/**
 * Minimal `clsx` implementation - avoids an extra dependency and keeps the
 * dashboard layout free of runtime bloat.
 */
export function clsx(...inputs: ClassValue[]): string {
  const out: string[] = [];
  const walk = (v: ClassValue): void => {
    if (!v) return;
    if (typeof v === 'string' || typeof v === 'number') {
      out.push(String(v));
      return;
    }
    if (Array.isArray(v)) {
      v.forEach(walk);
      return;
    }
    if (typeof v === 'object') {
      for (const [key, val] of Object.entries(v)) {
        if (val) out.push(key);
      }
    }
  };
  inputs.forEach(walk);
  return out.join(' ');
}
