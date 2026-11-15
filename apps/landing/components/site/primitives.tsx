import { cn } from "@workspace/ui/lib/utils"

export function Container({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("mx-auto w-full max-w-[1360px] px-5 md:px-10", className)}
      {...props}
    />
  )
}

/**
 * The wali app icon: the whole word on ink, rounded like an iOS icon (brand kit v2 has no symbol or
 * monogram). Under 40px it uses the kit's small-size artwork, where the word is widened.
 */
export function WaliIcon({ className, size = 18 }: { className?: string; size?: number }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={size < 40 ? "/brand/wali-icon-small.svg" : "/brand/wali-app-icon.svg"}
      alt=""
      aria-hidden
      width={size}
      height={size}
      style={{ width: size, height: size }}
      className={cn("shrink-0 rounded-[22%]", className)}
    />
  )
}

const WORDMARK = {
  ink: "/brand/wali-wordmark-ink.svg",
  paper: "/brand/wali-wordmark-paper.svg",
  white: "/brand/wali-wordmark-white.svg",
}

/**
 * The wali wordmark (brand kit v2, Averia Gruesa Libre converted to outlines): always placed from
 * the kit, never retyped, always one line. Keep it at least 64px wide.
 */
export function Wordmark({
  tone = "ink",
  alt = "wali",
  className,
}: {
  tone?: keyof typeof WORDMARK
  alt?: string
  className?: string
}) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={WORDMARK[tone]}
      alt={alt}
      width={322}
      height={144}
      className={cn("h-auto w-[72px]", className)}
    />
  )
}

type NudgeProps = {
  time: string
  children: React.ReactNode
  actions?: string[]
  className?: string
}

/** A wali notification, used over photography (Lassie / Fixa pattern). */
export function NudgeCard({ time, children, actions, className }: NudgeProps) {
  return (
    <div
      className={cn(
        "frost-solid w-[min(320px,calc(100vw-56px))] rounded-[22px] p-4 text-ink shadow-[0_24px_60px_-24px_rgba(0,0,0,0.5)] ring-1 ring-black/5",
        className
      )}
    >
      <div className="flex items-center gap-2 text-[12px] text-ink-2">
        <WaliIcon size={18} />
        <span className="font-medium text-ink">wali</span>
        <span className="ml-auto tabular-nums">{time}</span>
      </div>
      <p className="mt-2.5 text-[14.5px] leading-[1.45] text-ink">{children}</p>
      {actions && actions.length > 0 && (
        <div className="mt-3.5 flex flex-wrap gap-1.5">
          {actions.map((a, i) => (
            <span
              key={a}
              className={cn(
                "rounded-full px-3 py-1.5 text-[12.5px] font-medium",
                i === 0 ? "bg-ink text-white" : "bg-black/[0.06] text-ink"
              )}
            >
              {a}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
