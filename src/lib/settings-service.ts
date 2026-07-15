import type { PrismaClient } from '@prisma/client';
import { prisma as defaultPrisma } from './db';
import { recordAudit } from './audit';
import {
  SYSTEM_SETTING_DEFINITIONS,
  getSettingDefinition,
  type SettingDefinition,
} from './settings-defaults';

export interface SettingValueRecord {
  key: string;
  value: unknown;
  category: string;
  updatedAt: Date;
  updatedBy: string | null;
}

export interface AggregatedSetting {
  definition: SettingDefinition;
  effectiveValue: unknown;
  persistedValue: unknown | null;
  updatedAt: Date | null;
  updatedBy: string | null;
}

export async function getSettings(
  client: PrismaClient = defaultPrisma,
): Promise<AggregatedSetting[]> {
  const persisted = await client.systemSetting.findMany();
  const byKey = new Map(persisted.map((s) => [s.key, s]));

  return SYSTEM_SETTING_DEFINITIONS.map((definition) => {
    const record = byKey.get(definition.key);
    return {
      definition,
      effectiveValue: record?.value ?? definition.default,
      persistedValue: record?.value ?? null,
      updatedAt: record?.updatedAt ?? null,
      updatedBy: record?.updatedBy ?? null,
    };
  });
}

export interface SettingUpdate {
  key: string;
  value: unknown;
}

export class UnknownSettingError extends Error {
  readonly status = 400;
  constructor(key: string) {
    super(`Unknown setting key "${key}"`);
    this.name = 'UnknownSettingError';
  }
}

export class InvalidSettingValueError extends Error {
  readonly status = 400;
  constructor(key: string, reason: string) {
    super(`Invalid value for "${key}": ${reason}`);
    this.name = 'InvalidSettingValueError';
  }
}

export function validateSettingValue(definition: SettingDefinition, value: unknown): unknown {
  switch (definition.type) {
    case 'number': {
      const num = typeof value === 'number' ? value : Number(value);
      if (!Number.isFinite(num)) throw new InvalidSettingValueError(definition.key, 'not a number');
      if (definition.min != null && num < definition.min) {
        throw new InvalidSettingValueError(definition.key, `< ${definition.min}`);
      }
      if (definition.max != null && num > definition.max) {
        throw new InvalidSettingValueError(definition.key, `> ${definition.max}`);
      }
      return num;
    }
    case 'boolean': {
      if (typeof value === 'boolean') return value;
      if (value === 'true') return true;
      if (value === 'false') return false;
      throw new InvalidSettingValueError(definition.key, 'not a boolean');
    }
    case 'select': {
      const opts = definition.options?.map((o) => o.value) ?? [];
      if (!opts.includes(value as string | number)) {
        throw new InvalidSettingValueError(definition.key, `must be one of ${opts.join(', ')}`);
      }
      return value;
    }
    case 'string':
    default:
      if (typeof value !== 'string') throw new InvalidSettingValueError(definition.key, 'must be a string');
      return value;
  }
}

export async function updateSettings(
  updates: SettingUpdate[],
  actor: { id: string; ipAddress?: string | null; userAgent?: string | null },
  client: PrismaClient = defaultPrisma,
): Promise<AggregatedSetting[]> {
  for (const update of updates) {
    const definition = getSettingDefinition(update.key);
    if (!definition) throw new UnknownSettingError(update.key);
    const value = validateSettingValue(definition, update.value);

    await client.systemSetting.upsert({
      where: { key: update.key },
      create: {
        key: update.key,
        value: value as never,
        category: definition.category,
        description: definition.description,
        updatedBy: actor.id,
      },
      update: {
        value: value as never,
        category: definition.category,
        updatedBy: actor.id,
      },
    });
  }

  await recordAudit(
    {
      userId: actor.id,
      action: 'settings_updated',
      resource: 'settings',
      details: { keys: updates.map((u) => u.key) },
      ipAddress: actor.ipAddress,
      userAgent: actor.userAgent,
    },
    client,
  );

  return getSettings(client);
}
