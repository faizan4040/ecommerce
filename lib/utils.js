import { clsx } from "clsx";
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export const sizes = [
  { label: 'UK 6', value: '6' },
  { label: 'UK 7', value: '7' },
  { label: 'UK 8', value: '8' },
  { label: 'UK 9', value: '9' },
  { label: 'UK 10', value: '10' },
  { label: 'UK 11', value: '11' },
]


