"use client"

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react"
import { useMutation, useQuery } from "convex/react"
import { toast } from "sonner"
import type { GenericId as Id } from "convex/values"
import { Skeleton } from "@workspace/ui/components/skeleton"
import { Spinner } from "@workspace/ui/components/spinner"
import { cn } from "@workspace/ui/lib/utils"

import { api } from "@/lib/convex-api"
import type { BrowserTask, Message, Thread } from "@/lib/types"
import { TopBar } from "@/components/page-header"
import { EmberDot, WaliMark } from "@/components/brand"
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowDown01Icon } from "@hugeicons/core-free-icons"
import { useSmoothText } from "@/hooks/use-smooth-text"
import { Markdown } from "@/components/markdown"
import { BrowserPanel, isBrowserTaskActive } from "./browser-panel"
import { Composer } from "./composer"
import { isToolVisible, ToolCall } from "./tool-call"
import { ApprovalCard, NudgeCard, UpdateRow } from "./cards"

const SUGGESTIONS = [
  "What did I promise people today?",
  "Who did I talk to this afternoon?",
  "What's on my calendar tomorrow?",
  "Remind me to call Mom after my 3pm",
]

export function ChatView({ threadId }: { threadId: Id<"threads"> }) {
  const thread = useQuery(api.threads.get, { id: threadId }) as Thread | null | undefined
  const messages = useQuery(api.messages.list, { threadId }) as Message[] | undefined
  const devices = (useQuery(api.devices.mine) ?? []) as { status: string }[]
  const send = useMutation(api.messages.send)
  const listening = devices.some((d) => d.status === "connected")

  const scroller = useRef<HTMLDivElement>(null)
  const stick = useRef(true)
  const busy = !!messages?.some((m) => m.status === "streaming")

  useLayoutEffect(() => {
    const el = scroller.current
    if (el && stick.current) el.scrollTop = el.scrollHeight
  }, [messages])

  // Text types out between server updates, so follow the content's height, not just new data.
  const content = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = scroller.current
    const inner = content.current
    if (!el || !inner) return
    const ro = new ResizeObserver(() => {
      if (stick.current) el.scrollTop = el.scrollHeight
    })
    ro.observe(inner)
    return () => ro.disconnect()
  }, [threadId, messages === undefined, messages?.length === 0])

  useEffect(() => {
    stick.current = true
  }, [threadId])

  // wali's browser, live, floating over the corner of the chat. It opens by itself the first time
  // a task is seen working (wide screens only; on a phone it would crowd the chat), then it's the
  // user's call.
  const [panelId, setPanelId] = useState<BrowserTask["_id"] | null>(null)
  const autoOpened = useRef(new Set<string>())
  const browserTasks = useMemo(() => (messages ?? []).flatMap((m) => (m.browserTask ? [m.browserTask] : [])), [messages])
  const workingId = browserTasks.filter(isBrowserTaskActive).at(-1)?._id
  const panelTask = browserTasks.find((t) => t._id === panelId) ?? null

  useEffect(() => {
    setPanelId(null)
  }, [threadId])

  useEffect(() => {
    if (!workingId || autoOpened.current.has(workingId)) return
    autoOpened.current.add(workingId)
    if (window.matchMedia("(min-width: 1024px)").matches) setPanelId(workingId)
  }, [workingId])

  async function onSend(text: string) {
    stick.current = true
    try {
      await send({ threadId, text })
    } catch (e) {
      toast.error(e instanceof Error ? e.message.replace(/^.*Uncaught Error: /, "").split("\n")[0] : "Couldn't send")
    }
  }

  if (thread === null) {
    return <div className="flex flex-1 items-center justify-center text-ink-3">This chat doesn&apos;t exist.</div>
  }

  const empty = messages && messages.length === 0

  return (
    <div className="relative flex h-full min-h-0 flex-col">
      <TopBar>
        <div className="flex min-w-0 items-center gap-2">
          <h1 className="truncate text-[14px] font-medium text-ink">{thread?.kind === "home" ? "Home" : (thread?.title ?? "")}</h1>
          {thread?.kind === "home" && (
            <span className="flex items-center gap-1.5 text-[12px] text-ink-3">
              <EmberDot live={listening} />
              {listening ? "Listening through your pendant" : "Pendant not connected"}
            </span>
          )}
        </div>
      </TopBar>

      {empty ? (
        <div className="flex flex-1 flex-col items-center justify-center px-5 pb-16">
          <div className="rise w-full max-w-[680px]">
            <h2 className="display text-center text-[clamp(2.2rem,4.4vw,3.6rem)]">
              What&apos;s on <em>your mind?</em>
            </h2>
            <div className="mt-9">
              <Composer onSend={onSend} autoFocus placeholder="Ask about your day, or ask wali to do something…" />
            </div>
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => onSend(s)}
                  className="h-9 rounded-full bg-black/[0.05] px-4 text-[13px] text-ink-2 transition-colors hover:bg-black/[0.08] hover:text-ink"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <>
          <div
            ref={scroller}
            onScroll={(e) => {
              const el = e.currentTarget
              stick.current = el.scrollHeight - el.scrollTop - el.clientHeight < 80
            }}
            className="min-h-0 flex-1 overflow-y-auto"
          >
            <div ref={content} className="mx-auto flex w-full max-w-[720px] flex-col gap-7 px-5 pt-6 pb-10">
              {!messages &&
                [0, 1, 2].map((i) => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="h-4 w-3/4 rounded-full" />
                    <Skeleton className="h-4 w-1/2 rounded-full" />
                  </div>
                ))}
              {messages?.map((m) => (
                <MessageRow
                  key={m._id}
                  m={m}
                  watching={!!m.browserTask && m.browserTask._id === panelId}
                  onWatch={(id) => setPanelId((open) => (open === id ? null : id))}
                />
              ))}
            </div>
          </div>
          <div className="mx-auto w-full max-w-[720px] px-5 pb-5">
            <Composer onSend={onSend} disabled={busy} />
            <p className="mt-2 text-center text-[11.5px] text-ink-3">
              wali asks before anything others would see. It can be wrong; check what matters.
            </p>
          </div>
        </>
      )}
      {panelTask && <BrowserPanel task={panelTask} onClose={() => setPanelId(null)} />}
    </div>
  )
}

function MessageRow({
  m,
  watching,
  onWatch,
}: {
  m: Message
  watching: boolean
  onWatch: (id: BrowserTask["_id"]) => void
}) {
  if (m.role === "user") {
    return (
      <div className="rise flex justify-end">
        <div className="max-w-[85%] rounded-[22px] rounded-br-[8px] bg-[#e9e5dc] px-4 py-2.5 text-[15px] leading-relaxed whitespace-pre-wrap text-ink">
          {m.text}
        </div>
      </div>
    )
  }
  if (m.kind === "nudge") return <div className="rise"><NudgeCard m={m} /></div>
  if (m.kind === "approval") return <div className="rise"><ApprovalCard m={m} watching={watching} onWatch={onWatch} /></div>
  if (m.kind === "update") return <div className="rise"><UpdateRow m={m} watching={watching} onWatch={onWatch} /></div>

  return <AssistantText m={m} />
}

function AssistantText({ m }: { m: Message }) {
  const streaming = m.status === "streaming"
  const { text, typing } = useSmoothText(m.text, streaming)
  const waiting = streaming && !m.text && !m.tools?.length
  const tools = m.tools?.filter(isToolVisible)
  // A turn whose only content was an ask: the ask's own row, right below, says it all.
  if (!streaming && !text && !tools?.length && !m.reasoning && m.status !== "error") return null
  return (
    <div className="rise flex gap-3">
      <WaliMark size={26} className="mt-px" />
      <div className="min-w-0 flex-1">
        {(m.reasoning || waiting) && (
          <Thinking reasoning={m.reasoning} ms={m.thinkingMs} active={streaming && !m.text && m.thinkingMs === undefined} />
        )}
        {tools?.map((t) => <ToolCall key={t.toolCallId} tool={t} />)}
        {text && (
          <Markdown streaming={streaming || typing} className={cn((tools?.length || m.reasoning) && "mt-2")}>
            {text}
          </Markdown>
        )}
        {m.status === "error" && (
          <p className="mt-1 rounded-2xl bg-black/[0.04] px-3.5 py-2.5 text-[13.5px] text-ink-2">
            {m.error ?? "Something went wrong."}
          </p>
        )}
      </div>
    </div>
  )
}

/** "Thinking…" while the model reasons, then "Thought for 4s"; expands to show the reasoning. */
function Thinking({ reasoning, ms, active }: { reasoning?: string; ms?: number; active: boolean }) {
  const label = active ? "Thinking" : ms ? `Thought for ${Math.max(1, Math.round(ms / 1000))}s` : "Thought it over"
  if (!reasoning)
    return (
      <span className="flex h-7 items-center gap-2 text-[14px] text-ink-3">
        <Spinner className="size-3.5" /> {label}
      </span>
    )
  return (
    <details className="group mb-1">
      <summary className="flex h-7 w-fit cursor-pointer list-none items-center gap-2 text-[14px] text-ink-3 hover:text-ink-2">
        {active && <Spinner className="size-3.5" />}
        <span className={cn(active && "animate-pulse")}>{label}</span>
        <HugeiconsIcon icon={ArrowDown01Icon} className="size-3.5 transition-transform group-open:rotate-180" />
      </summary>
      <p className="mt-1 mb-2 max-h-56 overflow-y-auto border-l-2 border-black/10 pl-3 text-[13.5px] leading-relaxed whitespace-pre-wrap text-ink-3">
        {reasoning}
      </p>
    </details>
  )
}
