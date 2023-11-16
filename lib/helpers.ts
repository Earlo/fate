import { twMerge } from 'tailwind-merge';
import { clsx, ClassValue } from 'clsx';

export function cn(...inpit: ClassValue[]) {
  return twMerge(clsx(...inpit));
}

export function removeKey(obj: object, keyToRemove: string[]) {
  return JSON.parse(
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
}
