import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Equivalente ao `cn` do shadcn, exigido pelos componentes oficiais (import '@/lib/utils').
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
