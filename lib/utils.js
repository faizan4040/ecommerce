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
//   { uk: 7,   eu: 40.7, us: 7.5 },
//   { uk: 7.5, eu: 41.3, us: 8 },
//   { uk: 8,   eu: 42,   us: 8.5 },
//   { uk: 8.5, eu: 42.7, us: 9 },
//   { uk: 9,   eu: 43.3, us: 9.5 },
//   { uk: 9.5, eu: 44,   us: 10 },
//   { uk: 10,  eu: 44.7, us: 10.5 },
//   { uk: 10.5, eu: 45.3, us: 11 },
//   { uk: 11,  eu: 46,   us: 11.5 },
//   { uk: 11.5, eu: 46.7, us: 12 },
//   { uk: 12.5, eu: 47.3, us: 13 },
//   { uk: 13.5, eu: 49.3, us: 14 },
// ]



export const sortings = [
  {label: 'Default Sorting', value: 'default_sorting'},
  {label: 'Ascending Order', value: 'asc'},
  {label: 'Descending Order', value: 'desc'},
  {label: 'Price: Low To High', value: 'price_low_high'},
  {label: 'Price: High To Low', value: 'price_high_low'},
]

