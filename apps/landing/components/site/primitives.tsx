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

/** The pendant, drawn small: a vertical pebble with its grille. */
export function MindGlyph({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden
      className={cn("size-5 shrink-0", className)}
    >
      <rect width="24" height="24" rx="7" fill="currentColor" />
      <rect
        x="8.25"
        y="4.5"
        width="7.5"
        height="15"
        rx="3.75"
        fill="none"
        stroke="var(--glyph-ink, #fff)"
        strokeWidth="1.4"
      />
      <circle cx="12" cy="8.6" r="0.85" fill="var(--glyph-ink, #fff)" />
    </svg>
  )
}

export function Wordmark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "display inline-flex items-center gap-2 text-[19px] [--display-transform:none]",
        className
      )}
      style={{ letterSpacing: "-0.03em", lineHeight: 1 }}
    >
      <MindGlyph className="size-[22px]" />
      mind
    </span>
  )
}

type NudgeProps = {
  time: string
  children: React.ReactNode
  actions?: string[]
  className?: string
}

/** A Mind notification, used over photography (Lassie / Fixa pattern). */
export function NudgeCard({ time, children, actions, className }: NudgeProps) {
  return (
    <div
      className={cn(
        "frost-solid w-[min(320px,calc(100vw-56px))] rounded-[22px] p-4 text-ink shadow-[0_24px_60px_-24px_rgba(0,0,0,0.5)] ring-1 ring-black/5",
        className
      )}
    >
      <div className="flex items-center gap-2 text-[12px] text-ink-2">
        <MindGlyph className="size-[18px] text-ink" />
        <span className="font-medium text-ink">Mind</span>
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
