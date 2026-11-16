/*
 * Colour swatch for a variant.
 * Uses the hex picked in admin (colorCode). Older variants only have a name like
 * "green" or "Volt Green" – we map common shoe colour words to a hex so they still
 * show as a real colour dot instead of text.
 */
const NAMED = {
  black: "#111111", white: "#f5f5f5", grey: "#9ca3af", gray: "#9ca3af", silver: "#c0c0c0",
  charcoal: "#36454f", navy: "#1e3a8a", blue: "#2563eb", sky: "#38bdf8", teal: "#0d9488",
  green: "#16a34a", olive: "#65743a", mint: "#98f5c8", volt: "#c6f432", lime: "#84cc16",
  red: "#dc2626", maroon: "#7f1d1d", burgundy: "#800020", orange: "#f97316", yellow: "#facc15",
  gold: "#d4af37", brown: "#7c4a2d", tan: "#d2b48c", beige: "#d6c3a5", cream: "#f5ecd7",
  pink: "#ec4899", rose: "#f43f5e", purple: "#7c3aed", violet: "#8b5cf6", lavender: "#c4b5fd",
}

export function swatchColor(name, code) {
  if (code && /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(code)) return code
  const words = String(name || "").toLowerCase().split(/[\s/-]+/).reverse()
  for (const w of words) if (NAMED[w]) return NAMED[w]
  return "#d4d4d4"
}

/** true for very light colours – used to add a border so white swatches stay visible */
export function isLight(hex) {
  const h = hex.replace("#", "")
  const full = h.length === 3 ? h.split("").map((c) => c + c).join("") : h
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(full.slice(i, i + 2), 16))
  return (r * 299 + g * 587 + b * 114) / 1000 > 200
}
