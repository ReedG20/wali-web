"use client"

import { Fragment, useState } from "react"
import { useMutation } from "convex/react"
import { toast } from "sonner"
import { HugeiconsIcon } from "@hugeicons/react"
import { ThumbsDownIcon, ThumbsUpIcon } from "@hugeicons/core-free-icons"
import { Spinner } from "@workspace/ui/components/spinner"
import { cn } from "@workspace/ui/lib/utils"

import { api } from "@/lib/convex-api"
import type { Approval, BrowserTask, Message } from "@/lib/types"
import { timeLabel } from "@/lib/time"
import { WaliMark } from "@/components/brand"
import { Markdown } from "@/components/markdown"
import { actionState, approvalRequest, ApprovalRow, BrowserTaskRow } from "./action-row"

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

const FILLER = new Set(["A", "AN", "THE", "TO", "IN", "FOR", "OF", "NEW"])

/** The button says what it does: GMAIL_SEND_EMAIL -> "Send email", not "OK". */
function actionLabel(a: Approval) {
  if (a.channel === "browser") return "Go ahead"
  const words = (a.toolSlug ?? "").toUpperCase().split("_").slice(1).filter((w) => w && !FILLER.has(w))
  if (!words.length) return "Approve"
  const verb = words[0]!.replace(/([^S])S$/, "$1").toLowerCase() // SENDS -> send
  return `${verb[0]!.toUpperCase()}${verb.slice(1)}${words[1] ? ` ${words[1].toLowerCase()}` : ""}`
}

/** The few facts worth checking before saying yes, as label and value. */
function details(a: Approval): [string, string][] {
  if (a.channel === "browser") {
    const b = (a.args ?? {}) as { site?: string; task?: string }
    return [
      ["Site", b.site ?? ""],
      ["It will", b.task ?? ""],
    ].filter((r): r is [string, string] => !!r[1])
  }
  if (!a.args || typeof a.args !== "object" || Array.isArray(a.args)) return []
  return Object.entries(a.args as Record<string, unknown>)
    .map(([k, v]): [string, string] => {
      const label = k.replace(/_/g, " ")
      const flat = Array.isArray(v) && v.every((x) => typeof x !== "object") ? v.join(", ") : v
      // Flags and nested settings aren’t what anyone checks before saying yes; they stay under "Exactly what will run".
      const plain = typeof flat === "string" || typeof flat === "number"
      return [label[0]!.toUpperCase() + label.slice(1), plain ? String(flat).trim() : ""]
    })
    .filter((r) => r[1])
    .slice(0, 6)
}

type AskProps = { m: Message; watching?: boolean; onWatch?: (id: BrowserTask["_id"]) => void }

/**
 * An ask from wali. Most are a single row (ApprovalRow). Anything that reaches other people,
 * spends money, deletes or changes something through the browser gets this card instead: what it
 * is, the details worth checking, and a button named after the action. It is the one raised
 * white surface in the thread, and only while it waits: once decided it settles into the same
 * flat row as everything else, which is its receipt.
 */
export function ApprovalCard({ m, watching = false, onWatch }: AskProps) {
  const decide = useMutation(api.approvals.decide)
  const [busy, setBusy] = useState(false)
  const a = m.approval
  if (!a) return null
  if ((a.risk && a.risk !== "high") || actionState(a, m.browserTask) !== "pending")
    return <ApprovalRow m={m} watching={watching} onWatch={onWatch} />

  const rows = details(a)

  async function go(decision: "approve" | "decline") {
    setBusy(true)
    try {
      await decide({ id: a!._id, decision })
    } catch (e) {
      toast.error(e instanceof Error ? e.message.replace(/^.*Uncaught Error: /, "").split("\n")[0] : "Couldn't update that")
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
      {rows.length > 0 && (
        <dl className="mt-3 grid grid-cols-[auto_minmax(0,1fr)] gap-x-4 gap-y-1.5 rounded-2xl bg-paper px-3.5 py-3 text-[13px] leading-snug">
          {rows.map(([label, value]) => (
            <Fragment key={label}>
              <dt className="text-ink-3">{label}</dt>
              <dd className="line-clamp-4 break-words whitespace-pre-wrap text-ink">{value}</dd>
            </Fragment>
          ))}
        </dl>
      )}
      <details className="group mt-2">
        <summary className="cursor-pointer list-none text-[12.5px] text-ink-3 hover:text-ink-2">Exactly what will run</summary>
        <pre className="mt-2 max-h-56 overflow-auto rounded-2xl bg-paper p-3 font-sans text-[12.5px] leading-relaxed whitespace-pre-wrap text-ink-2">
          {approvalRequest(a)}
        </pre>
      </details>
      <div className="mt-3.5 flex items-center gap-1.5">
        <button
          disabled={busy}
          onClick={() => go("approve")}
          className="flex h-8 items-center gap-1.5 rounded-full bg-ink px-4 text-[12.5px] font-medium text-white active:translate-y-px disabled:opacity-60"
        >
          {busy && <Spinner className="size-3.5" />}
          {actionLabel(a)}
        </button>
        <button
          disabled={busy}
          onClick={() => go("decline")}
          className="h-8 rounded-full bg-black/[0.06] px-4 text-[12.5px] font-medium text-ink active:translate-y-px disabled:opacity-60"
        >
          Don&apos;t
        </button>
      </div>
    </CardShell>
  )
}

/**
 * Background work reporting back. A browser task under way is one quiet row (BrowserTaskRow);
 * what work comes back with is the answer the user was waiting for, so it reads like any other
 * reply from wali.
 */
export function UpdateRow({ m, watching = false, onWatch }: AskProps) {
  if (m.browserTask) return <BrowserTaskRow m={m} watching={watching} onWatch={onWatch} />
  return (
    <div className="flex gap-3">
      <WaliMark size={26} className="mt-px" />
      <div className="min-w-0 flex-1">
        <Markdown>{m.text}</Markdown>
        <p className="mt-1.5 text-[12px] text-ink-3">{timeLabel(m.createdAt)}</p>
      </div>
    </div>
  )
}
