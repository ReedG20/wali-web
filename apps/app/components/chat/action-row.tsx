"use client"

import { useState } from "react"
import { useMutation } from "convex/react"
import { toast } from "sonner"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  AlertCircleIcon,
  ArrowDown01Icon,
  Cancel01Icon,
  Globe02Icon,
  GridViewIcon,
  Tick02Icon,
} from "@hugeicons/core-free-icons"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@workspace/ui/components/collapsible"
import { Spinner } from "@workspace/ui/components/spinner"
import { cn } from "@workspace/ui/lib/utils"

import { api } from "@/lib/convex-api"
import type { Approval, BrowserTask, Message } from "@/lib/types"
import { timeLabel } from "@/lib/time"
import { EmberDot, WaliMark } from "@/components/brand"

export type ActionState = "pending" | "running" | "done" | "declined" | "failed"

/** Where an ask stands. A browser approval is only "done" when the browser itself has finished. */
export function actionState(a: Approval | null, t: BrowserTask | null): ActionState {
  if (t) {
    if (t.status === "starting" || t.status === "running") return "running"
    return t.status === "completed" ? "done" : "failed"
  }
  if (!a) return "done"
  if (a.status === "pending") return "pending"
  if (a.status === "declined") return "declined"
  if (a.status === "failed") return "failed"
  return a.status === "done" ? "done" : "running"
}

const TAIL: Partial<Record<ActionState, string>> = { declined: "Skipped", failed: "Didn't go through" }

/** A browser task the user stopped didn't fail: say "Stopped", as the browser panel does. */
const tailFor = (t: BrowserTask | null) => (t?.status === "cancelled" ? "Stopped" : undefined)

/**
 * A grant's label inside a sentence: "reading canvas.wisc.edu", but an app action keeps its
 * capitals ("Google Calendar: events list").
 */
function midSentence(scope: NonNullable<Approval["scope"]>) {
  return scope.kind === "browser" ? scope.label.charAt(0).toLowerCase() + scope.label.slice(1) : scope.label
}

/**
 * One thing wali does outside itself, as a single line that changes in place: the ask (with its
 * buttons), then the work under way, then a tick. The line opens to show exactly what runs, so
 * nothing about it has to be said a second time anywhere else in the thread.
 */
export function ActionRow({
  icon,
  label,
  state,
  request,
  note,
  tail,
  time,
  children,
}: {
  icon: typeof Globe02Icon
  label: string
  state: ActionState
  /** Replaces the usual words after the label ("Skipped", "Didn't go through"). */
  tail?: string
  /** Exactly what runs: the browser's instructions, or the app action and its arguments. */
  request?: string
  note?: string
  time: number
  /** Buttons on the right: Allow / Deny while it waits, "Watch live" while a browser works. */
  children?: React.ReactNode
}) {
  return (
    <div className="flex gap-3">
      <WaliMark size={26} className="mt-[7px]" />
      <Collapsible className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 rounded-[20px] bg-black/[0.04] py-1.5 pr-1.5 pl-3.5">
          <CollapsibleTrigger className="group flex min-w-0 flex-1 basis-60 items-center gap-2.5 py-1.5 text-left text-[14px] leading-snug text-ink">
            <span className="flex size-4 shrink-0 items-center justify-center text-ink-2">
              {state === "running" ? (
                <Spinner className="size-3.5" />
              ) : state === "done" ? (
                <HugeiconsIcon icon={Tick02Icon} className="size-4" />
              ) : state === "declined" ? (
                <HugeiconsIcon icon={Cancel01Icon} className="size-3.5 text-ink-3" />
              ) : state === "failed" ? (
                <HugeiconsIcon icon={AlertCircleIcon} className="size-4" />
              ) : (
                <HugeiconsIcon icon={icon} className="size-4" />
              )}
            </span>
            <span className="min-w-0">
              <span className={cn("line-clamp-2", state === "running" && "shimmer", state === "declined" && "text-ink-2")}>
                {label}
              </span>
            </span>
            {(tail ?? TAIL[state]) && <span className="shrink-0 text-ink-3">· {tail ?? TAIL[state]}</span>}
            <HugeiconsIcon
              icon={ArrowDown01Icon}
              className="size-3.5 shrink-0 text-ink-3 transition-transform group-data-[panel-open]:rotate-180"
            />
          </CollapsibleTrigger>
          {children && <div className="ml-auto flex shrink-0 items-center gap-1">{children}</div>}
        </div>
        <CollapsibleContent>
          <div className="px-3.5 pt-2.5 pb-1 text-[12.5px] leading-relaxed text-ink-3">
            {request && (
              <pre className="mb-2 max-h-56 overflow-auto rounded-2xl bg-white/80 p-3 font-sans text-[12.5px] leading-relaxed whitespace-pre-wrap text-ink-2 ring-1 ring-black/5">
                {request}
              </pre>
            )}
            {note && <p className="mb-1 text-ink-2">{note}</p>}
            <p>{timeLabel(time)}</p>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  )
}

const PILL = "flex h-8 items-center gap-1.5 rounded-full px-3.5 text-[12.5px] font-medium transition-colors active:translate-y-px disabled:opacity-60"

/** "Watch live" on a browser row; it toggles the floating browser. */
function WatchButton({ watching, onClick }: { watching: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} aria-pressed={watching} className={cn(PILL, "bg-black/[0.06] text-ink hover:bg-black/[0.09]")}>
      <EmberDot />
      {watching ? "Hide browser" : "Watch live"}
    </button>
  )
}

export function approvalRequest(a: Approval) {
  if (a.channel === "browser") return (a.args as { task?: string } | null)?.task
  return [a.toolSlug, JSON.stringify(a.args, null, 2)].filter(Boolean).join("\n")
}

type RowProps = { m: Message; watching?: boolean; onWatch?: (id: BrowserTask["_id"]) => void }

/**
 * An ask that isn't risky (a read, or a small private change, in "Ask every time"): the row itself
 * carries Deny / Always allow / Allow once. Risky asks get the fuller ApprovalCard instead.
 */
export function ApprovalRow({ m, watching = false, onWatch }: RowProps) {
  const decide = useMutation(api.approvals.decide)
  const [busy, setBusy] = useState(false)
  const a = m.approval
  if (!a) return null
  const t = m.browserTask
  const state = actionState(a, t)

  async function go(decision: "approve" | "decline", always = false) {
    setBusy(true)
    try {
      await decide({ id: a!._id, decision, ...(always ? { always: true } : {}) })
    } catch (e) {
      toast.error(e instanceof Error ? e.message.replace(/^.*Uncaught Error: /, "").split("\n")[0] : "Couldn't update that")
    } finally {
      setBusy(false)
    }
  }

  // What "Always allow" would cover, said before it's tapped rather than after.
  const scope = a.scope ? midSentence(a.scope) : null
  const note =
    state === "pending" && scope
      ? `Always allow covers ${scope} from now on. Anything that sends, pays, deletes or changes something still asks. You can undo it in Connections.`
      : state === "failed"
        ? (a.error ?? t?.error)
        : undefined

  return (
    <ActionRow
      icon={a.channel === "browser" ? Globe02Icon : GridViewIcon}
      label={a.summary}
      state={state}
      request={approvalRequest(a)}
      note={note}
      tail={tailFor(t)}
      time={m.createdAt}
    >
      {state === "pending" ? (
        <>
          <button disabled={busy} onClick={() => go("decline")} className={cn(PILL, "px-3 text-ink-2 hover:bg-black/[0.05] hover:text-ink")}>
            Deny
          </button>
          {a.scope && (
            <button
              disabled={busy}
              onClick={() => go("approve", true)}
              title={`Stop asking about ${scope}`}
              className={cn(PILL, "bg-black/[0.06] text-ink hover:bg-black/[0.09]")}
            >
              Always allow
            </button>
          )}
          <button disabled={busy} onClick={() => go("approve")} className={cn(PILL, "bg-ink text-white")}>
            {busy && <Spinner className="size-3.5" />}
            {a.scope ? "Allow once" : "Allow"}
          </button>
        </>
      ) : state === "running" && t && onWatch ? (
        <WatchButton watching={watching} onClick={() => onWatch(t._id)} />
      ) : null}
    </ActionRow>
  )
}

/** A browser task that started without an ask: the same row, already under way. */
export function BrowserTaskRow({ m, watching = false, onWatch }: RowProps) {
  const t = m.browserTask
  if (!t) return null
  const state = actionState(null, t)
  return (
    <ActionRow
      icon={Globe02Icon}
      // Older tasks have no one-line summary; their message was the whole prompt behind a prefix.
      label={t.summary ?? m.text.replace(/^Working on it in the browser:\s*/, "")}
      state={state}
      request={t.task}
      note={state === "failed" && t.status !== "cancelled" ? t.error : undefined}
      tail={tailFor(t)}
      time={m.createdAt}
    >
      {onWatch && (state === "running" || watching) && <WatchButton watching={watching} onClick={() => onWatch(t._id)} />}
    </ActionRow>
  )
}
