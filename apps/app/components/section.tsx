import { cn } from "@workspace/ui/lib/utils"

export function PageBody({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("mx-auto w-full max-w-[880px] px-5 pt-8 pb-24 md:px-8 md:pt-12", className)}>{children}</div>
}

export function Section({
  title,
  description,
  children,
  aside,
}: {
  title: string
  description?: string
  children: React.ReactNode
  aside?: React.ReactNode
}) {
  return (
    <section className="mt-12 first:mt-0">
      <div className="mb-4 flex items-end justify-between gap-4">
        <div>
          <h2 className="display text-[26px]">{title}</h2>
          {description && <p className="mt-1.5 max-w-[60ch] text-[14.5px] leading-relaxed text-ink-2">{description}</p>}
        </div>
        {aside}
      </div>
      {children}
    </section>
  )
}

export function Panel({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("soft-card rounded-[22px] p-5", className)}>{children}</div>
}
