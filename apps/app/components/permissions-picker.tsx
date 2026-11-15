"use client"

import { useMutation, useQuery } from "convex/react"
import { toast } from "sonner"
import { cn } from "@workspace/ui/lib/utils"

import { api } from "@/lib/convex-api"
import { PERMISSION_MODES, PERMISSIONS_NOTE, type PermissionMode } from "@/lib/permissions"
import { Section } from "@/components/section"

/** How much wali may do without asking. Same three choices as the iOS app's "What wali can do". */
export function PermissionsPicker() {
  const me = useQuery(api.users.me) as { permissions?: PermissionMode } | null | undefined
  const update = useMutation(api.users.updatePermissions).withOptimisticUpdate((store, { mode }) => {
    const cur = store.getQuery(api.users.me, {})
    if (cur) store.setQuery(api.users.me, {}, { ...cur, permissions: mode })
  })
  const mode = me ? (me.permissions ?? "balanced") : null

  async function choose(next: PermissionMode) {
    if (next === mode) return
    try {
      await update({ mode: next })
    } catch (e) {
      toast.error(e instanceof Error ? e.message.split("\n")[0] : "Couldn't save")
    }
  }

  return (
    <Section
      title="What wali can do"
      description={PERMISSIONS_NOTE}
    >
      <div role="radiogroup" aria-label="What wali can do" className="grid gap-3 md:grid-cols-3">
        {PERMISSION_MODES.map((m) => {
          const on = mode === m.id
          return (
            <button
              key={m.id}
              role="radio"
              aria-checked={on}
              disabled={!mode}
              onClick={() => void choose(m.id)}
              className={cn(
                "soft-card flex flex-col gap-2 rounded-[22px] p-5 text-left transition-shadow disabled:opacity-60",
                on ? "ring-2 ring-ink" : "ring-1 ring-transparent hover:ring-black/10"
              )}
            >
              <span className="flex items-center justify-between gap-3">
                <span className="text-[15.5px] font-medium text-ink">{m.title}</span>
                <span
                  aria-hidden
                  className={cn(
                    "flex size-[18px] shrink-0 items-center justify-center rounded-full border",
                    on ? "border-ink bg-ink" : "border-ink-3/60"
                  )}
                >
                  {on && <span className="size-1.5 rounded-full bg-paper" />}
                </span>
              </span>
              <span className="text-[13.5px] leading-relaxed text-ink-2">{m.summary}</span>
              <span className="text-[12.5px] leading-relaxed text-ink-3">{m.examples}</span>
            </button>
          )
        })}
      </div>
    </Section>
  )
}
