"use client"

import { useMutation, useQuery } from "convex/react"
import { toast } from "sonner"
import { HugeiconsIcon } from "@hugeicons/react"
import { Cancel01Icon } from "@hugeicons/core-free-icons"
import { cn } from "@workspace/ui/lib/utils"

import { api } from "@/lib/convex-api"
import { PERMISSION_MODES, PERMISSIONS_NOTE, type PermissionMode } from "@/lib/permissions"
import { Section } from "@/components/section"

/** An "Always allow" picked on an ask in chat: one site wali may read, or one app action. */
type Grant = { kind: "browser" | "app"; key: string; label: string }

/** How much wali may do without asking. Same three choices as the iOS app's "What wali can do". */
export function PermissionsPicker() {
  const me = useQuery(api.users.me) as { permissions?: PermissionMode; alwaysAllow?: Grant[] } | null | undefined
  const forget = useMutation(api.users.removeAlwaysAllow)
  const grants = me?.alwaysAllow ?? []
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

      {grants.length > 0 && (
        <div className="soft-card mt-3 rounded-[22px] p-5">
          <div className="text-[15.5px] font-medium text-ink">Always allowed</div>
          <p className="mt-1 text-[13.5px] leading-relaxed text-ink-2">
            You told wali to stop asking about these. They run on their own whichever choice is selected above.
          </p>
          <ul className="mt-3.5 flex flex-wrap gap-2">
            {grants.map((g) => (
              <li
                key={`${g.kind}:${g.key}`}
                className="flex h-9 items-center gap-1 rounded-full bg-black/[0.05] pr-1 pl-3.5 text-[13px] text-ink"
              >
                {g.label}
                <button
                  onClick={() => void forget({ kind: g.kind, key: g.key }).catch(() => toast.error("Couldn't remove that"))}
                  aria-label={`Ask again about ${g.label}`}
                  title="Ask again from now on"
                  className="flex size-7 items-center justify-center rounded-full text-ink-3 transition-colors hover:bg-black/[0.07] hover:text-ink"
                >
                  <HugeiconsIcon icon={Cancel01Icon} className="size-3.5" />
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </Section>
  )
}
