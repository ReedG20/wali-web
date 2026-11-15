"use client"

import { useEffect, useRef, useState } from "react"
import { useQuery } from "convex/react"
import { HugeiconsIcon } from "@hugeicons/react"
import { PauseIcon, PlayIcon } from "@hugeicons/core-free-icons"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog"
import { cn } from "@workspace/ui/lib/utils"
import type { GenericId as Id } from "convex/values"
import { api } from "@/lib/convex-api"

export type Target = { personId?: Id<"people">; name?: string; me?: boolean }
type Person = { _id: Id<"people">; name: string; isMe: boolean }

/** Round play/pause button for a short voice clip. */
export function PlayClip({ url, className }: { url: string | null; className?: string }) {
  const ref = useRef<HTMLAudioElement | null>(null)
  const [playing, setPlaying] = useState(false)
  useEffect(() => () => ref.current?.pause(), [])
  if (!url) return null
  function toggle() {
    if (!ref.current) {
      ref.current = new Audio(url!)
      ref.current.onended = () => setPlaying(false)
      ref.current.onpause = () => setPlaying(false)
    }
    if (playing) ref.current.pause()
    else {
      ref.current.currentTime = 0
      void ref.current.play().then(() => setPlaying(true), () => setPlaying(false))
    }
  }
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={playing ? "Pause" : "Play voice"}
      className={cn(
        "flex size-9 shrink-0 items-center justify-center rounded-full bg-black/[0.06] text-ink hover:bg-black/[0.1]",
        className,
      )}
    >
      <HugeiconsIcon icon={playing ? PauseIcon : PlayIcon} size={15} strokeWidth={2} />
    </button>
  )
}

export const pill = "h-9 rounded-full px-4 text-[13.5px] font-medium disabled:opacity-60"
export const pillDark = `${pill} bg-ink text-white`
export const pillSoft = `${pill} bg-black/[0.06] text-ink hover:bg-black/[0.1]`

/**
 * "Who's this?": pick someone already known, "That's me", or type a new name.
 * Naming a voice applies to every conversation it's in, past and future.
 */
export function NameDialog({
  open,
  onOpenChange,
  title = "Who's this?",
  description,
  clipUrl,
  sampleText,
  suggestion,
  allowMe = true,
  onSubmit,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  title?: string
  description?: string
  clipUrl?: string | null
  sampleText?: string | null
  suggestion?: string | null
  allowMe?: boolean
  onSubmit: (t: Target) => Promise<unknown>
}) {
  const people = (useQuery(api.voices.people, open ? {} : "skip") ?? []) as Person[]
  const [name, setName] = useState("")
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  useEffect(() => {
    if (open) {
      setName(suggestion ?? "")
      setError(null)
    }
  }, [open, suggestion])

  const hasMe = people.some((p) => p.isMe)
  const others = people.filter((p) => !p.isMe)

  async function submit(t: Target) {
    setBusy(true)
    setError(null)
    try {
      await onSubmit(t)
      onOpenChange(false)
    } catch (e) {
      setError(e instanceof Error ? (e.message.replace(/^.*Uncaught Error: /s, "").split("\n")[0] ?? "Failed") : "Failed")
    } finally {
      setBusy(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-paper">
        <DialogHeader>
          <DialogTitle className="display text-[26px] font-normal">{title}</DialogTitle>
          <DialogDescription className="text-[14px] text-ink-2">
            {description ?? "wali will use this name in every conversation with this voice, including past ones."}
          </DialogDescription>
        </DialogHeader>

        {(clipUrl || sampleText) && (
          <div className="flex items-center gap-3 rounded-[18px] bg-black/[0.04] p-3">
            <PlayClip url={clipUrl ?? null} />
            {sampleText && <p className="line-clamp-2 text-[13.5px] leading-snug text-ink-2">“{sampleText}”</p>}
          </div>
        )}

        <form
          className="flex flex-col gap-3"
          onSubmit={(e) => {
            e.preventDefault()
            if (name.trim()) void submit({ name: name.trim() })
          }}
        >
          <input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Their name, or Mom, Dad…"
            maxLength={60}
            className="h-11 rounded-full bg-white px-4 text-[15px] text-ink ring-1 ring-black/10 outline-none placeholder:text-ink-3 focus:ring-black/25"
          />
          {(others.length > 0 || (allowMe && !hasMe)) && (
            <div className="flex flex-wrap gap-2">
              {allowMe && (
                <button type="button" disabled={busy} onClick={() => submit({ me: true })} className={pillSoft}>
                  That’s me
                </button>
              )}
              {others.map((p) => (
                <button key={p._id} type="button" disabled={busy} onClick={() => submit({ personId: p._id })} className={pillSoft}>
                  {p.name}
                </button>
              ))}
            </div>
          )}
          {error && <p className="text-[13px] text-red-700">{error}</p>}
          <div className="flex justify-end">
            <button type="submit" disabled={busy || !name.trim()} className={pillDark}>
              {busy ? "Saving…" : "Save name"}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
