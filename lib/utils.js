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


// export const sizes = [
//   { label: 'UK 7', value: '7' },
//   { label: 'UK 7.5', value: '7.5' },
//   { label: 'UK 8', value: '8' },
//   { label: 'UK 8.5', value: '8.5' },
//   { label: 'UK 9', value: '9' },
//   { label: 'UK 9.5', value: '9.5' },
//   { label: 'UK 10', value: '10' },
//   { label: 'UK 10.5', value: '10.5' },
//   { label: 'UK 11', value: '11' },
//   { label: 'UK 11.5', value: '11.5' },
//   { label: 'UK 12.5', value: '12.5' },
//   { label: 'UK 13.5', value: '13.5' },
// ]




export const sortings = [
  {label: 'Default Sorting', value: 'default_sorting'},
  {label: 'Ascending Order', value: 'asc'},
  {label: 'Descending Order', value: 'desc'},
  {label: 'Price: Low To High', value: 'price_low_high'},
  {label: 'Price: High To Low', value: 'price_high_low'},
]


export const orderstatus =  ['pending', 'processing', 'shipped', 'delivered', 'cancelled', 'unverified']

