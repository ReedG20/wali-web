import { cn } from "@workspace/ui/lib/utils"

/**
 * wali brand marks, from brand kit v2 (public/brand). The name is the mark: there is no symbol or
 * monogram, and the wordmark is outlined artwork, never retyped. It renders through a CSS mask so
 * it takes the text colour (ink on paper, cream on photos).
 */

const WORDMARK_RATIO = 322.04 / 143.85

/** The wordmark. 50px wide sits with 13–14px UI text; never go below 44px. */
export function Wordmark({ className, width = 50 }: { className?: string; width?: number }) {
  const w = Math.max(44, width)
  return (
    <span
      role="img"
      aria-label="wali"
      className={cn("inline-block shrink-0 bg-current text-ink", className)}
      style={{
        width: w,
        height: w / WORDMARK_RATIO,
        maskImage: "url(/brand/wali-wordmark.svg)",
        WebkitMaskImage: "url(/brand/wali-wordmark.svg)",
        maskSize: "contain",
        WebkitMaskSize: "contain",
        maskRepeat: "no-repeat",
        WebkitMaskRepeat: "no-repeat",
      }}
    />
  )
}

/**
 * The app icon: the whole word on an ink tile, used as wali's avatar. Under 40px it uses the kit's
 * small-size artwork, where the word is widened to fill more of the square.
 */
export function WaliMark({ className, size = 24 }: { className?: string; size?: number }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={size < 40 ? "/brand/wali-icon-small.svg" : "/brand/wali-icon.svg"}
      alt="wali"
      width={size}
      height={size}
      className={cn("shrink-0 select-none rounded-[22%]", className)}
      style={{ width: size, height: size }}
      draggable={false}
    />
  )
}

/** The single accent: something happening now. */
export function EmberDot({ live = true, className }: { live?: boolean; className?: string }) {
  return (
    <span
      aria-hidden
      className={cn("inline-block size-2 shrink-0 rounded-full", live ? "ember-pulse bg-ember" : "bg-ink-3/50", className)}
    />
  )
}
