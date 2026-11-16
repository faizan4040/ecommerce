/*
 * Price helpers – used by the admin forms AND the API, so the numbers always match.
 *
 *   discount %   = (MRP − Selling price) ÷ MRP × 100   (rounded to a whole number)
 *   selling price = MRP × (1 − discount ÷ 100)          (rounded to whole rupees)
 *   you save     = MRP − Selling price
 */

export const toNumber = (v) => {
  const n = typeof v === "string" ? parseFloat(v) : v
  return Number.isFinite(n) ? n : 0
}

export function calcDiscount(mrp, sellingPrice) {
  const m = toNumber(mrp)
  const s = toNumber(sellingPrice)
  if (m <= 0 || s <= 0 || s >= m) return 0
  return Math.round(((m - s) / m) * 100)
}

export function calcSellingPrice(mrp, discount) {
  const m = toNumber(mrp)
  const d = Math.min(Math.max(toNumber(discount), 0), 99)
  if (m <= 0) return 0
  return Math.round(m * (1 - d / 100))
}

export function calcSavings(mrp, sellingPrice) {
  const m = toNumber(mrp)
  const s = toNumber(sellingPrice)
  return m > s && s > 0 ? Math.round(m - s) : 0
}

/** Returns an error message, or null when the prices are valid */
export function validatePrices(mrp, sellingPrice) {
  const m = toNumber(mrp)
  const s = toNumber(sellingPrice)
  if (m <= 0) return "MRP must be greater than 0."
  if (s <= 0) return "Selling price must be greater than 0."
  if (s > m) return "Selling price cannot be more than MRP."
  return null
}

export const formatINR = (n) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(
    toNumber(n)
  )
