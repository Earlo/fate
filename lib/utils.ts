import clsxModule, { type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...input: ClassValue[]) {
  return twMerge(clsxModule(...input));
}

export function removeKey<T>(value: T, keysToRemove: readonly string[]): T {
  const blockedKeys = new Set(keysToRemove);
  const seen = new WeakMap<object, unknown>();

  const visit = (current: unknown): unknown => {
    if (current === null || typeof current !== 'object') {
      return current;
    }
    if (current instanceof Date) {
      return current;
    }
    const cached = seen.get(current);
    if (cached) {
      return cached;
    }
    if (Array.isArray(current)) {
      const next: unknown[] = [];
      seen.set(current, next);
      current.forEach((item) => {
        next.push(visit(item));
      });
      return next;
    }
    const next: Record<string, unknown> = {};
    seen.set(current, next);
    Object.entries(current).forEach(([key, item]) => {
      if (!blockedKeys.has(key)) {
        next[key] = visit(item);
      }
    });
    return next;
  };

  return visit(value) as T;
}

export function updateVisibilityList(
  visible: boolean,
  visibleIn: string[],
  campaignId?: string,
) {
  if (!campaignId) {
    return visibleIn;
  }
  return visible
    ? Array.from(new Set([...visibleIn, campaignId]))
    : visibleIn.filter((id) => id !== campaignId);
}

export function upsertById<T extends { id?: string }>(items: T[], item: T) {
  const id = item?.id;
  if (!id) {
    return items;
  }
  const index = items.findIndex((existing) => existing?.id === id);
  if (index === -1) {
    return [...items, item];
  }
  return [...items.slice(0, index), item, ...items.slice(index + 1)];
}

export function replaceAtIndex<T>(items: T[], index: number, value: T) {
  if (index < 0 || index >= items.length) {
    return items;
  }
  return [...items.slice(0, index), value, ...items.slice(index + 1)];
}

export function removeAtIndex<T>(items: T[], index: number) {
  if (index < 0 || index >= items.length) {
    return items;
  }
  return [...items.slice(0, index), ...items.slice(index + 1)];
}

export function appendItem<T>(items: T[], item: T) {
  return [...items, item];
}
