import { decode } from "entities"

/*
 * Product descriptions may be stored as HTML (new editor) or as Markdown
 * (older ones were saved by the CKEditor Markdown plugin, e.g. "## **PRODUCT STORY**").
 * toHtml() always returns clean HTML so the website shows real headings, lists and tables.
 */

const escapeHtml = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")

// **bold**, *italic*, `code`, [link](url)
function inline(text) {
  return escapeHtml(text)
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/\*\*\*([^*]+)\*\*\*/g, "<strong><em>$1</em></strong>")
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/__([^_]+)__/g, "<strong>$1</strong>")
    .replace(/(^|[^*])\*([^*\s][^*]*)\*/g, "$1<em>$2</em>")
    .replace(/\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
}

const isTableSep = (line) => /^\s*\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)*\|?\s*$/.test(line)
const splitRow = (line) =>
  line
    .trim()
    .replace(/^\|/, "")
    .replace(/\|$/, "")
    .split("|")
    .map((c) => c.trim())

export function markdownToHtml(md) {
  const lines = md.replace(/\r\n?/g, "\n").split("\n")
  const out = []
  let i = 0

  while (i < lines.length) {
    const line = lines[i]
    const trimmed = line.trim()

    if (!trimmed) {
      i++
      continue
    }

    // Heading
    const h = trimmed.match(/^(#{1,6})\s+(.*)$/)
    if (h) {
      const level = h[1].length
      out.push(`<h${level}>${inline(h[2].replace(/\s*#+\s*$/, ""))}</h${level}>`)
      i++
      continue
    }

    // Horizontal rule
    if (/^(-{3,}|\*{3,}|_{3,})$/.test(trimmed)) {
      out.push("<hr />")
      i++
      continue
    }

    // Table
    if (trimmed.includes("|") && i + 1 < lines.length && isTableSep(lines[i + 1])) {
      const head = splitRow(trimmed)
      i += 2
      const rows = []
      while (i < lines.length && lines[i].trim().includes("|")) {
        rows.push(splitRow(lines[i]))
        i++
      }
      out.push(
        `<div class="table-wrap"><table><thead><tr>${head.map((c) => `<th>${inline(c)}</th>`).join("")}</tr></thead><tbody>${rows
          .map((r) => `<tr>${r.map((c) => `<td>${inline(c)}</td>`).join("")}</tr>`)
          .join("")}</tbody></table></div>`
      )
      continue
    }

    // Blockquote
    if (trimmed.startsWith(">")) {
      const buf = []
      while (i < lines.length && lines[i].trim().startsWith(">")) {
        buf.push(lines[i].trim().replace(/^>\s?/, ""))
        i++
      }
      out.push(`<blockquote>${inline(buf.join(" "))}</blockquote>`)
      continue
    }

    // Lists
    if (/^([-*+]|\d+[.)])\s+/.test(trimmed)) {
      const ordered = /^\d+[.)]/.test(trimmed)
      const items = []
      while (i < lines.length && /^([-*+]|\d+[.)])\s+/.test(lines[i].trim())) {
        items.push(lines[i].trim().replace(/^([-*+]|\d+[.)])\s+/, ""))
        i++
      }
      const tag = ordered ? "ol" : "ul"
      out.push(`<${tag}>${items.map((it) => `<li>${inline(it)}</li>`).join("")}</${tag}>`)
      continue
    }

    // Paragraph (until blank line or another block)
    const buf = []
    while (
      i < lines.length &&
      lines[i].trim() &&
      !/^(#{1,6}\s|>|([-*+]|\d+[.)])\s)/.test(lines[i].trim()) &&
      !(lines[i].includes("|") && i + 1 < lines.length && isTableSep(lines[i + 1]))
    ) {
      buf.push(lines[i].trim())
      i++
    }
    out.push(`<p>${buf.map(inline).join("<br />")}</p>`)
  }

  return out.join("\n")
}

const looksLikeHtml = (s) => /<\/?(p|h[1-6]|ul|ol|li|table|div|br|strong|em|figure|blockquote)\b/i.test(s)

/** Stored description (encoded HTML or Markdown) → HTML string */
export function toHtml(stored) {
  // stored descriptions are HTML-entity encoded (sometimes twice)
  let text = decode(decode(stored || ""))
  if (!text.trim()) return ""
  if (looksLikeHtml(text)) {
    // HTML that still contains markdown inside paragraphs (e.g. "<p>## Title</p>")
    if (/<p>\s*#{1,6}\s/.test(text) || /<p>[^<]*\*\*[^<]+\*\*/.test(text)) {
      text = text
        .replace(/<\/p>\s*<p>/g, "\n\n")
        .replace(/<br\s*\/?>/g, "\n")
        .replace(/<\/?p>/g, "")
      return markdownToHtml(text)
    }
    return text
  }
  return markdownToHtml(text)
}

/** Plain text (for meta descriptions, card snippets) */
export const toPlainText = (stored) =>
  toHtml(stored)
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim()
