import { twMerge } from 'tailwind-merge';
import { clsx, ClassValue } from 'clsx';

export function cn(...inpit: ClassValue[]) {
  return twMerge(clsx(...inpit));
}
