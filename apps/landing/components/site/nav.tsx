"use client"

import { useEffect, useState } from "react"
import { cn } from "@workspace/ui/lib/utils"

import { Wordmark } from "./primitives"

const LINKS = [
  { id: "pendant", label: "Pendant" },
  { id: "how", label: "How it works" },
  { id: "moments", label: "Moments" },
  { id: "privacy", label: "Privacy" },
]

/**
 * Floating segmented nav (Lassie): one tinted pill, the logo and the active
 * section sit on white chips. A single dark pill on the right is the only CTA.
 */
export function Nav() {
  const [active, setActive] = useState<string | null>(null)

  useEffect(() => {
    const sections = LINKS.map((l) => document.getElementById(l.id)).filter(
      Boolean
    ) as HTMLElement[]
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) setActive(e.target.id)
        }
      },
      { rootMargin: "-45% 0px -50% 0px" }
    )
    sections.forEach((s) => io.observe(s))
    const onScroll = () => {
      if (window.scrollY < window.innerHeight * 0.5) setActive(null)
    }
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => {
      io.disconnect()
      window.removeEventListener("scroll", onScroll)
    }
  }, [])

  return (
    <header className="pointer-events-none fixed inset-x-0 top-3 z-50 flex justify-center px-3 md:top-4">
      <nav className="pointer-events-auto flex items-center gap-0.5 rounded-full bg-[#e8e5de]/80 p-1 shadow-[0_10px_30px_-14px_rgba(0,0,0,0.35)] ring-1 ring-black/[0.06] backdrop-blur-xl backdrop-saturate-150">
        <a
          href="#top"
          aria-label="Mind, back to top"
          className="flex h-9 items-center rounded-full bg-white px-3.5 text-ink shadow-[0_1px_2px_rgba(0,0,0,0.06)]"
        >
          <Wordmark className="text-[18px]" />
        </a>
        <ul className="hidden items-center gap-0.5 md:flex">
          {LINKS.map((l) => (
            <li key={l.id}>
              <a
                href={`#${l.id}`}
                className={cn(
                  "flex h-9 items-center rounded-full px-3.5 text-[13.5px] text-ink-2 transition-colors duration-300 hover:text-ink",
                  active === l.id &&
                    "bg-white text-ink shadow-[0_1px_2px_rgba(0,0,0,0.06)]"
                )}
              >
                {l.label}
              </a>
            </li>
          ))}
        </ul>
        <a
          href="#waitlist"
          className="ml-1 flex h-9 items-center rounded-full bg-ink px-4 text-[13.5px] font-medium text-white transition-transform active:translate-y-px"
        >
          Join the waitlist
        </a>
      </nav>
    </header>
  )
}
