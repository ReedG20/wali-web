"use client"

import { HugeiconsIcon } from "@hugeicons/react"
import {
  AlertCircleIcon,
  ArrowDown01Icon,
  Calendar03Icon,
  Clock01Icon,
  Globe02Icon,
  Link04Icon,
  Note01Icon,
  Search01Icon,
  Wrench01Icon,
} from "@hugeicons/core-free-icons"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@workspace/ui/components/collapsible"
import { Spinner } from "@workspace/ui/components/spinner"
import { cn } from "@workspace/ui/lib/utils"
import type { ToolPart } from "@/lib/types"
import { ConnectCard } from "./connect-card"

const LABELS: Record<string, { icon: typeof Wrench01Icon; running: string; done: string }> = {
  search_memory: { icon: Search01Icon, running: "Searching your conversations", done: "Searched your conversations" },
  search_transcripts: { icon: Search01Icon, running: "Searching transcripts", done: "Searched transcripts" },
  recent_conversations: { icon: Note01Icon, running: "Reading recent conversations", done: "Read recent conversations" },
  save_note: { icon: Note01Icon, running: "Saving a note", done: "Saved a note" },
  schedule_followup: { icon: Clock01Icon, running: "Scheduling a follow-up", done: "Scheduled a follow-up" },
  find_app_actions: { icon: Search01Icon, running: "Looking through your apps", done: "Looked through your apps" },
  run_app_action: { icon: Calendar03Icon, running: "Using your apps", done: "Used your apps" },
  connect_app: { icon: Link04Icon, running: "Preparing a connect link", done: "Connect link ready" },
  browser_task: { icon: Globe02Icon, running: "Starting the browser", done: "Browser task" },
}

function asRecord(v: unknown): Record<string, unknown> | null {
  return v && typeof v === "object" && !Array.isArray(v) ? (v as Record<string, unknown>) : null
}

function detail(tool: ToolPart) {
  const args = asRecord(tool.args)
  const res = asRecord(tool.result)
  if (tool.toolName === "run_app_action") {
    const slug = String(args?.toolSlug ?? "")
    if (res?.status === "awaiting_approval") return `${slug} · waiting for your OK`
    return slug
  }
  if (tool.toolName === "search_memory") return args?.query ? `“${String(args.query)}”` : ""
  // The backend skips a note that repeats a recent one word for word.
  if (tool.toolName === "save_note" && res?.saved === false) return "already saved"
  if (tool.toolName === "schedule_followup") return res?.scheduledFor ? `for ${String(res.scheduledFor)}` : ""
  if (tool.toolName === "browser_task" && res?.status === "awaiting_approval") return "waiting for your OK"
  return ""
}

/**
 * An ask, or a browser task that has started, already has a row of its own right below the reply
 * (ApprovalRow / BrowserTaskRow). Showing the tool chip as well would say the same thing twice.
 */
export function isToolVisible(tool: ToolPart) {
  const status = asRecord(tool.result)?.status
  if (status === "awaiting_approval") return false
  return !(tool.toolName === "browser_task" && status === "running")
}

/** A quiet, collapsible row for each tool wali used (Zapier-style action rows, toned down). */
export function ToolCall({ tool }: { tool: ToolPart }) {
  const meta = LABELS[tool.toolName] ?? { icon: Wrench01Icon, running: tool.toolName, done: tool.toolName }
  const res = asRecord(tool.result)
  const connectUrl = tool.toolName === "connect_app" && typeof res?.connectUrl === "string" ? res.connectUrl : null
  const d = detail(tool)

  // A connect link is something to act on, not a log line: it gets a card of its own.
  if (connectUrl) return <ConnectCard toolkit={String(res?.toolkit ?? "")} url={connectUrl} />

  return (
    <div className="my-1.5">
      <Collapsible>
        <CollapsibleTrigger className="group flex max-w-full items-center gap-2 rounded-full bg-black/[0.04] py-1.5 pr-3 pl-2.5 text-[13px] text-ink-2 transition-colors hover:bg-black/[0.06]">
          <span className="flex size-4 items-center justify-center">
            {tool.state === "running" ? (
              <Spinner className="size-3.5" />
            ) : tool.state === "error" ? (
              <HugeiconsIcon icon={AlertCircleIcon} className="size-4 text-ink-3" />
            ) : (
              <HugeiconsIcon icon={meta.icon} className="size-4" />
            )}
          </span>
          <span className="truncate">
            {tool.state === "running" ? meta.running : meta.done}
            {d && <span className="text-ink-3"> · {d}</span>}
          </span>
          <HugeiconsIcon
            icon={ArrowDown01Icon}
            className="size-3.5 shrink-0 text-ink-3 transition-transform group-data-[panel-open]:rotate-180"
          />
        </CollapsibleTrigger>
        <CollapsibleContent>
          <pre className="mt-2 max-h-64 overflow-auto rounded-2xl bg-white/80 p-3 text-[12px] leading-relaxed whitespace-pre-wrap text-ink-2 ring-1 ring-black/5">
            {JSON.stringify({ input: tool.args, output: tool.result }, null, 2)}
          </pre>
        </CollapsibleContent>
      </Collapsible>
    </div>
  )
}
