"use client"

import { useState } from "react"
import { cn } from "@workspace/ui/lib/utils"

/**
 * Email pill with the button tucked inside (Lassie hero). Not wired to a
 * backend yet: it only confirms locally.
 */
export function WaitlistForm({
  tone = "light",
  className,
  id,
}: {
  tone?: "light" | "dark" | "glass"
  className?: string
  id?: string
}) {
  const [email, setEmail] = useState("")
  const [done, setDone] = useState(false)

  const shell = {
    light: "bg-white ring-1 ring-black/[0.07] shadow-[0_10px_30px_-18px_rgba(0,0,0,0.35)]",
    dark: "bg-white/[0.07] ring-1 ring-white/15",
    glass: "frost-dark ring-1 ring-white/20",
  }[tone]

  const input = {
    light: "text-ink placeholder:text-ink-3",
    dark: "text-white placeholder:text-white/50",
    glass: "text-white placeholder:text-white/65",
  }[tone]

  const button = {
    light: "bg-ink text-white",
    dark: "bg-white text-ink",
    glass: "bg-white text-ink",
  }[tone]

  if (done) {
    return (
      <p
        className={cn(
          "flex h-[52px] items-center justify-center rounded-full px-6 text-[14.5px]",
          shell,
          tone === "light" ? "text-ink" : "text-white",
          className
        )}
        role="status"
      >
        You&rsquo;re on the list. We&rsquo;ll write when there&rsquo;s news.
      </p>
    )
  }

  return (
    <form
      id={id}
      onSubmit={(e) => {
        e.preventDefault()
        if (email.includes("@")) setDone(true)
      }}
      className={cn(
        "flex h-[52px] w-full max-w-[420px] items-center rounded-full p-1.5 pl-5",
        shell,
        className
      )}
    >
      <label htmlFor={`${id ?? "wl"}-email`} className="sr-only">
        Email address
      </label>
      <input
        id={`${id ?? "wl"}-email`}
        type="email"
        required
        autoComplete="email"
        placeholder="Your email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className={cn(
          "h-full min-w-0 flex-1 bg-transparent text-[15px] outline-none",
          input
        )}
      />
      <button
        type="submit"
        className={cn(
          "h-full shrink-0 rounded-full px-5 text-[14px] font-medium transition-transform active:translate-y-px",
          button
        )}
      >
        Join the waitlist
      </button>
    </form>
  )
}
