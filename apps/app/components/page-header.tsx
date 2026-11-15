import { SidebarTrigger } from "@workspace/ui/components/sidebar"
import { cn } from "@workspace/ui/lib/utils"

export function TopBar({ children, className }: { children?: React.ReactNode; className?: string }) {
  return (
    <header className={cn("sticky top-0 z-10 flex h-14 shrink-0 items-center gap-2 bg-paper/85 px-3 backdrop-blur md:px-4", className)}>
      <SidebarTrigger className="rounded-full text-ink-2" />
      {children}
    </header>
  )
}

/** Page title in Fraunces with an optional italic tail, and a quiet lede. */
export function PageTitle({ title, em, lede }: { title: string; em?: string; lede?: string }) {
  return (
    <div className="mb-10">
      <h1 className="display text-[clamp(2.2rem,4vw,3.4rem)]">
        {title} {em && <em className="text-ink-2">{em}</em>}
      </h1>
      {lede && <p className="mt-3 max-w-[56ch] text-[16px] leading-relaxed text-ink-2">{lede}</p>}
    </div>
  )
}
