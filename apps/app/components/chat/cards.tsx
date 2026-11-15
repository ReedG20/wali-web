"use client"

import { useState } from "react"
import { useMutation } from "convex/react"
import { toast } from "sonner"
import { HugeiconsIcon } from "@hugeicons/react"
import { Globe02Icon, ThumbsDownIcon, ThumbsUpIcon } from "@hugeicons/core-free-icons"
import { Spinner } from "@workspace/ui/components/spinner"
import { cn } from "@workspace/ui/lib/utils"

import { api } from "@/lib/convex-api"
import type { Message } from "@/lib/types"
import { timeLabel } from "@/lib/time"
import { WaliMark } from "@/components/brand"

const TRIGGER_LABEL: Record<string, string> = {
  transcript: "After a conversation",
  schedule: "Check-in",
  followup: "Follow-up",
  manual: "You asked",
  simulated: "Simulated",
}

function CardShell({
  header,
  time,
  children,
  className,
}: {
  header: React.ReactNode
  time: number
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn("soft-card w-full max-w-[460px] rounded-[22px] p-4", className)}>
      <div className="flex min-w-0 items-center gap-2 text-[12px] whitespace-nowrap text-ink-2">
        <WaliMark size={22} />
        <span className="flex min-w-0 items-center gap-1 truncate">{header}</span>
        <span className="ml-auto shrink-0 tabular-nums text-ink-3">{timeLabel(time)}</span>
      </div>
      {children}
    </div>
  )
}

/** How wali speaks first: header, one or two specific sentences, up to two pill actions. */
export function NudgeCard({ m }: { m: Message }) {
  const respond = useMutation(api.messages.respond)
  const act = useMutation(api.messages.act)
  const [sending, setSending] = useState<string | null>(null)
  const chosen = m.chosenAction ?? sending

  // The label goes back to wali as your reply (it lands right under this card).
  async function choose(action: string) {
    setSending(action)
    try {
      await act({ id: m._id, action })
    } catch (e) {
      toast.error(e instanceof Error ? e.message.replace(/^.*Uncaught Error: /, "").split("\n")[0] : "Couldn't send that")
    } finally {
      setSending(null)
    }
  }

  return (
    <CardShell
      time={m.createdAt}
      header={
        <>
          <span className="font-medium text-ink">wali</span>
          {m.trigger && <span className="text-ink-3"> · {TRIGGER_LABEL[m.trigger.kind] ?? m.trigger.kind}</span>}
        </>
      }
    >
      <p className="mt-2.5 text-[15px] leading-[1.5] text-ink">{m.text}</p>
      <div className="mt-3.5 flex flex-wrap items-center gap-1.5">
        {chosen ? (
          <span className="flex h-8 items-center gap-1.5 rounded-full bg-black/[0.06] px-3.5 text-[12.5px] font-medium text-ink">
            {m.chosenAction ? <span aria-hidden>✓</span> : <Spinner className="size-3.5" />}
            {chosen}
          </span>
        ) : (
          (m.actions ?? []).map((a, i) => (
            <button
              key={a}
              onClick={() => void choose(a)}
              className={cn(
                "h-8 rounded-full px-3.5 text-[12.5px] font-medium transition-transform active:translate-y-px",
                i === 0 ? "bg-ink text-white" : "bg-black/[0.06] text-ink"
              )}
            >
              {a}
            </button>
          ))
        )}
        <span className="ml-auto flex items-center gap-0.5">
          {(["helpful", "dismissed"] as const).map((r) => (
            <button
              key={r}
              aria-label={r === "helpful" ? "Helpful" : "Not helpful"}
              onClick={() => void respond({ id: m._id, response: r })}
              className={cn(
                "flex size-8 items-center justify-center rounded-full text-ink-3 transition-colors hover:bg-black/[0.05] hover:text-ink",
                m.response === r && "bg-black/[0.06] text-ink"
              )}
            >
              <HugeiconsIcon icon={r === "helpful" ? ThumbsUpIcon : ThumbsDownIcon} className="size-4" />
            </button>
          ))}
        </span>
      </div>
    </CardShell>
  )
}

/** GOOGLECALENDAR_CREATE_EVENT -> "Googlecalendar: create event" */
function humanSlug(slug?: string) {
  if (!slug) return ""
  const [app, ...rest] = slug.toLowerCase().split("_")
  return `${app![0]!.toUpperCase()}${app!.slice(1)}: ${rest.join(" ")}`
}

const STATUS_TEXT: Record<string, string> = {
  approved: "Approved, starting…",
  declined: "Skipped",
  running: "Running…",
  done: "Done",
  failed: "Didn't go through",
}

/** Same anatomy as a nudge, with "Needs your OK" and Approve / Skip. Approval runs exactly this. */
export function ApprovalCard({ m }: { m: Message }) {
  const decide = useMutation(api.approvals.decide)
  const [busy, setBusy] = useState(false)
  const a = m.approval
  if (!a) return null
  const pending = a.status === "pending"
  const args = a.channel === "browser" ? (a.args as { task?: string })?.task : JSON.stringify(a.args, null, 2)

  async function go(decision: "approve" | "decline") {
    setBusy(true)
    try {
      await decide({ id: a!._id, decision })
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Couldn't update that")
    } finally {
      setBusy(false)
    }
  }

  return (
    <CardShell
      time={m.createdAt}
      header={
        <>
          <span className="font-medium text-ink">Needs your OK</span>
          <span className="truncate text-ink-3">· {a.channel === "browser" ? "Browser" : humanSlug(a.toolSlug)}</span>
        </>
      }
    >
      <p className="mt-2.5 text-[15px] leading-[1.5] text-ink">{a.summary}</p>
      {args && (
        <details className="group mt-2">
          <summary className="cursor-pointer list-none text-[12.5px] text-ink-3 hover:text-ink-2">Exactly what will run</summary>
          <pre className="mt-2 max-h-56 overflow-auto rounded-2xl bg-paper p-3 text-[12px] leading-relaxed whitespace-pre-wrap text-ink-2">
            {args}
          </pre>
        </details>
      )}
      <div className="mt-3.5 flex items-center gap-1.5">
        {pending ? (
          <>
            <button
              disabled={busy}
              onClick={() => go("approve")}
              className="h-8 rounded-full bg-ink px-4 text-[12.5px] font-medium text-white active:translate-y-px disabled:opacity-60"
            >
              Approve
            </button>
            <button
              disabled={busy}
              onClick={() => go("decline")}
              className="h-8 rounded-full bg-black/[0.06] px-4 text-[12.5px] font-medium text-ink active:translate-y-px disabled:opacity-60"
            >
              Skip
            </button>
            {busy && <Spinner className="ml-1 size-4 text-ink-3" />}
          </>
        ) : (
          <span className="flex items-center gap-2 text-[13px] text-ink-2">
            {(a.status === "approved" || a.status === "running") && <Spinner className="size-3.5" />}
            {STATUS_TEXT[a.status] ?? a.status}
            {a.error && <span className="text-ink-3">· {a.error}</span>}
          </span>
        )}
      </div>
    </CardShell>
  )
}

/** Background work reporting back (browser tasks, approved actions). */
export function UpdateRow({ m }: { m: Message }) {
  const t = m.browserTask
  const running = t && (t.status === "starting" || t.status === "running")
  return (
    <div className="flex items-start gap-2.5 text-[14px] leading-relaxed text-ink-2">
      <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-black/[0.05]">
        {running ? <Spinner className="size-3.5" /> : <HugeiconsIcon icon={Globe02Icon} className="size-3.5" />}
      </span>
      <div className="min-w-0">
        <p className="whitespace-pre-wrap">{m.text}</p>
        {t && !running && t.status !== "completed" && t.error && <p className="mt-1 text-ink-3">{t.error}</p>}
        <p className="mt-0.5 text-[12px] text-ink-3">{timeLabel(m.createdAt)}</p>
      </div>
    </div>
  )
}
