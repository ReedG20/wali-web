"use client"

import { useMemo } from "react"
import { Streamdown } from "streamdown"
import { math } from "@streamdown/math"
import "katex/dist/katex.min.css"
import { cn } from "@workspace/ui/lib/utils"

import { normalizeMath } from "@/lib/math"

const plugins = { math }

/**
 * Anything wali writes: markdown (lists, tables, code, links) plus LaTeX math through KaTeX.
 * `streaming` keeps half-arrived markdown and formulas from breaking while text is still landing.
 */
export function Markdown({
  children,
  streaming = false,
  className,
}: {
  children: string
  streaming?: boolean
  className?: string
}) {
  const text = useMemo(
    () => normalizeMath(children, streaming),
    [children, streaming]
  )
  return (
    <div className={cn("prose-mind", className)}>
      <Streamdown
        plugins={plugins}
        parseIncompleteMarkdown={streaming}
        isAnimating={streaming}
      >
        {text}
      </Streamdown>
    </div>
  )
}
