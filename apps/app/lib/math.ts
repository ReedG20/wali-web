/**
 * Models write math as \( … \) and \[ … \] as often as with dollar signs, but the markdown math
 * parser only reads dollars (and we keep single `$` off so "$5" stays money). This rewrites the
 * LaTeX-style delimiters to `$$`, leaving code and existing `$$ … $$` untouched.
 *
 * While a message is still streaming, a formula that has opened but not closed yet is held back
 * so half-typed LaTeX never flashes on screen; it appears whole once its closing delimiter lands.
 */

// Fenced code, inline code, and math that already uses dollars: never rewritten.
const PROTECTED =
  /(```[\s\S]*?(?:```|$)|~~~[\s\S]*?(?:~~~|$)|`[^`\n]*`|\$\$[\s\S]*?(?:\$\$|$))/g

// \[ … \] — the (?<!\\) keeps LaTeX line breaks like `\\[4pt]` from reading as an opener.
const DISPLAY = /(?<!\\)\\\[([\s\S]+?)(?<!\\)\\\]/g
// \( … \) — never across a blank line, so a stray escaped paren can't swallow paragraphs.
const INLINE = /(?<!\\)\\\(((?:(?!\n[ \t]*\n)[\s\S])+?)(?<!\\)\\\)/g
const UNCLOSED = /(?<!\\)\\[[(](?![\s\S]*(?<!\\)\\[\])])[\s\S]*$/

function rewrite(part: string) {
  return part
    .replace(DISPLAY, (_, body: string, at: number) => {
      // Opening at the start of a line it becomes a display block; mid-sentence it stays inline.
      const indent = part.slice(part.lastIndexOf("\n", at - 1) + 1, at)
      return /^[ \t]*$/.test(indent)
        ? `$$\n${indent}${body.trim()}\n${indent}$$`
        : `$$${body.trim()}$$`
    })
    .replace(INLINE, (_, body: string) => `$$${body.trim()}$$`)
}

export function normalizeMath(text: string, streaming = false) {
  if (!text.includes("\\(") && !text.includes("\\[")) return text
  const parts = text.split(PROTECTED)
  // split() with one capture group alternates plain text (even) and protected spans (odd).
  const out = parts.map((part, i) => (i % 2 ? part : rewrite(part)))
  if (streaming && parts.length % 2) {
    const last = out.length - 1
    // Past a few hundred characters it isn't a formula mid-flight, just a stray backslash-bracket.
    out[last] = out[last]!.replace(UNCLOSED, (tail) =>
      tail.length > 400 ? tail : ""
    )
  }
  return out.join("")
}
