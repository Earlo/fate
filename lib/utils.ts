import { ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...input: ClassValue[]) {
  return twMerge(clsx(...input));
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
