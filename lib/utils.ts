import clsxModule, { type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...input: ClassValue[]) {
  return twMerge(clsxModule(...input));
}

export function removeKey(obj: object, keyToRemove: string[]) {
  const newObj = JSON.parse(
    JSON.stringify(obj, (key, val) =>
      typeof val === 'undefined' || val === null
        ? undefined
        : keyToRemove.includes(key) ||
            val === '' ||
            (typeof val === 'object' && Object.keys(val).length === 0)
          ? undefined
          : Object.keys(val).length === 1
            ? val[Object.keys(val)[0]]
            : Array.isArray(val)
              ? val.filter((x) => !(x === null || x === false))
              : typeof val === 'string'
                ? val.trim().replace('\n', '')
                : val,
    ),
  );
  if (JSON.stringify(newObj) === JSON.stringify(obj)) {
    return newObj;
  }
  return removeKey(newObj, keyToRemove);
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

export function upsertById<T extends { _id?: string }>(items: T[], item: T) {
  const id = item?._id;
  if (!id) {
    return items;
  }
  const index = items.findIndex((existing) => existing?._id === id);
  if (index === -1) {
    return [...items, item];
  }
  return [...items.slice(0, index), item, ...items.slice(index + 1)];
}
