/*
 * Shoe size charts – Men / Women / Kids
 * -------------------------------------
 * Indian shoe sizes (IN) follow UK sizing, so IN = UK.
 * The stored variant `size` value is the UK size (e.g. "8", "8.5"; kids "C10"… "C13", "1"… "5").
 * `gender` on the variant tells which chart to use.
 * Conversions are the common industry averages – individual brands can differ by half a size.
 */

const row = (value, uk, us, eu, cm) => ({ value, uk, in: uk, us, eu, cm })

export const SIZE_CHARTS = {
  men: [
    row("5", "5", "6", "38.5", 24.1),
    row("5.5", "5.5", "6.5", "39", 24.4),
    row("6", "6", "7", "40", 24.8),
    row("6.5", "6.5", "7.5", "40.5", 25.2),
    row("7", "7", "8", "41", 25.4),
    row("7.5", "7.5", "8.5", "42", 25.7),
    row("8", "8", "9", "42.5", 26.0),
    row("8.5", "8.5", "9.5", "43", 26.7),
    row("9", "9", "10", "44", 27.1),
    row("9.5", "9.5", "10.5", "44.5", 27.5),
    row("10", "10", "11", "45", 27.9),
    row("10.5", "10.5", "11.5", "45.5", 28.3),
    row("11", "11", "12", "46", 28.6),
    row("12", "12", "13", "47.5", 29.4),
    row("13", "13", "14", "48.5", 30.2),
  ],
  women: [
    row("2.5", "2.5", "4.5", "35", 21.6),
    row("3", "3", "5", "35.5", 22.0),
    row("3.5", "3.5", "5.5", "36", 22.4),
    row("4", "4", "6", "37", 22.9),
    row("4.5", "4.5", "6.5", "37.5", 23.3),
    row("5", "5", "7", "38", 23.7),
    row("5.5", "5.5", "7.5", "38.5", 24.1),
    row("6", "6", "8", "39", 24.5),
    row("6.5", "6.5", "8.5", "40", 25.0),
    row("7", "7", "9", "40.5", 25.4),
    row("7.5", "7.5", "9.5", "41", 25.8),
    row("8", "8", "10", "42", 26.2),
    row("9", "9", "11", "43", 27.1),
  ],
  kids: [
    // Little kids (child sizes, "C")
    row("C8", "8C", "8.5C", "25.5", 15.2),
    row("C9", "9C", "9.5C", "27", 15.9),
    row("C10", "10C", "10.5C", "28", 16.5),
    row("C11", "11C", "11.5C", "29", 17.1),
    row("C12", "12C", "12.5C", "30.5", 17.8),
    row("C13", "13C", "13.5C", "32", 18.6),
    // Big kids (youth sizes, "Y" in US)
    row("1", "1", "1.5Y", "33", 19.5),
    row("2", "2", "2.5Y", "34", 20.3),
    row("3", "3", "3.5Y", "35.5", 21.2),
    row("4", "4", "4.5Y", "36.5", 22.0),
    row("5", "5", "5.5Y", "38", 22.9),
    row("6", "6", "6.5Y", "39", 23.7),
  ],
}

export const SIZE_SYSTEMS = [
  { key: "in", label: "IN" },
  { key: "uk", label: "UK" },
  { key: "us", label: "US" },
  { key: "eu", label: "EU" },
]

export const GENDER_OPTIONS = [
  { label: "Men", value: "men" },
  { label: "Women", value: "women" },
  { label: "Kids", value: "kids" },
]

// Old data used values like "3-w" for women – normalise them
const normalise = (v) => String(v ?? "").replace(/-w$/i, "").trim()

/** Find the chart row for a stored size value. Falls back to a plain row so legacy data still renders. */
export function getSizeRow(gender, value) {
  const v = normalise(value)
  const chart = SIZE_CHARTS[gender] || []
  const found =
    chart.find((r) => r.value === v) ||
    Object.values(SIZE_CHARTS).flat().find((r) => r.value === v)
  return found || row(v, v, v, v, null)
}

/** Label for a size in a given system, e.g. sizeLabel("men", "8", "us") → "US 9" */
export function sizeLabel(gender, value, system = "uk", withPrefix = true) {
  const r = getSizeRow(gender, value)
  const sys = SIZE_SYSTEMS.find((s) => s.key === system) || SIZE_SYSTEMS[1]
  return withPrefix ? `${sys.label} ${r[system]}` : r[system]
}

/** Sort size values in chart order (smallest → largest) */
export function sortSizes(gender, values) {
  const chart = SIZE_CHARTS[gender] || Object.values(SIZE_CHARTS).flat()
  const idx = (v) => {
    const i = chart.findIndex((r) => r.value === normalise(v))
    return i === -1 ? 999 : i
  }
  return [...values].sort((a, b) => idx(a) - idx(b))
}
