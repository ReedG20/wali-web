"use client"

import { useMutation, useQuery } from "convex/react"
import Link from "next/link"
import { Skeleton } from "@workspace/ui/components/skeleton"
import { cn } from "@workspace/ui/lib/utils"
import type { GenericId as Id } from "convex/values"

import { api } from "@/lib/convex-api"
import type { GateEvent } from "@/lib/types"
import { timeLabel } from "@/lib/time"
import { TopBar, PageTitle } from "@/components/page-header"
import { PageBody, Panel, Section } from "@/components/section"

const TRIGGER: Record<string, string> = {
  transcript: "Conversation ended",
  schedule: "Hourly check-in",
  followup: "Follow-up",
  manual: "You asked",
  simulated: "Simulated",
}

type Followup = { _id: Id<"followups">; note: string; runAt: number; status: string }

export default function ActivityPage() {
  const events = useQuery(api.activity.gateEvents, { limit: 60 }) as GateEvent[] | undefined
  const followups = (useQuery(api.activity.followups) ?? []) as Followup[]
  const cancel = useMutation(api.activity.cancelFollowup)
  const upcoming = followups.filter((f) => f.status === "scheduled")

  return (
    <>
      <TopBar />
      <PageBody>
        <PageTitle
          title="Activity."
          em="Every time wali considered speaking."
          lede="Jev scores each moment; rules and the agent make the final call. Use this to tune thresholds."
        />

        <Section title="Gate log">
          <div className="flex flex-col gap-3">
            {!events && [0, 1].map((i) => <Skeleton key={i} className="h-28 rounded-[22px]" />)}
            {events?.length === 0 && (
              <Panel className="text-[14.5px] text-ink-2">
                Nothing yet. <Link href="/pendant" className="underline underline-offset-4">Run a sample conversation</Link> to see the pipeline work.
              </Panel>
            )}
            {events?.map((e) => (
              <Panel key={e._id} className="p-4">
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[13px]">
                  <span className={cn("rounded-full px-2.5 py-0.5", e.passed ? "bg-ink text-white" : "bg-black/[0.06] text-ink-2")}>
                    {e.passed ? "Passed" : "Held"}
                  </span>
                  <span className="text-ink">{e.reason}</span>
                  <span className="text-ink-3">· {TRIGGER[e.trigger.kind] ?? e.trigger.kind}</span>
                  <span className="ml-auto tabular-nums text-ink-3">{timeLabel(e.createdAt)}</span>
                </div>
                {e.excerpt && <p className="mt-2.5 line-clamp-2 text-[13.5px] leading-relaxed text-ink-2">{e.excerpt}</p>}
                {e.scores && (
                  <div className="mt-3 grid grid-cols-2 gap-x-6 gap-y-2 sm:grid-cols-3">
                    <Score label="Worth acting" v={e.scores.worthActing} />
                    <Score label="User asked" v={e.scores.userAsked} />
                    {e.scores.canHelp !== undefined && <Score label="wali can help" v={e.scores.canHelp} />}
                    <Score label="Distress" v={e.scores.distress} />
                    <Score label="Bad time" v={e.scores.badTime} />
                    <Score label="Urgency" v={e.scores.urgency / 3} text={e.scores.urgency.toFixed(1) + " / 3"} />
                    <div className="text-[12.5px] text-ink-3">
                      Kind <span className="ml-1 text-ink">{e.scores.kind}</span>
                    </div>
                  </div>
                )}
                {e.decision && (
                  <p className="mt-3 rounded-2xl bg-paper px-3.5 py-2.5 text-[13.5px] text-ink-2">
                    <span className="text-ink">Agent:</span> {e.decision}
                  </p>
                )}
              </Panel>
            ))}
          </div>
        </Section>

        <Section title="Follow-ups" description="Wake-ups wali scheduled for itself.">
          {upcoming.length === 0 ? (
            <Panel className="text-[14px] text-ink-3">None scheduled.</Panel>
          ) : (
            <Panel className="divide-y divide-black/5 p-0">
              {upcoming.map((f) => (
                <div key={f._id} className="flex items-center gap-4 px-5 py-3.5">
                  <div className="min-w-0 flex-1">
                    <p className="text-[14.5px] text-ink">{f.note}</p>
                    <p className="text-[12.5px] text-ink-3">{timeLabel(f.runAt)}</p>
                  </div>
                  <button onClick={() => cancel({ id: f._id })} className="h-8 rounded-full bg-black/[0.06] px-3.5 text-[12.5px] text-ink">
                    Cancel
                  </button>
                </div>
              ))}
            </Panel>
          )}
        </Section>

      </PageBody>
    </>
  )
}

function Score({ label, v, text }: { label: string; v: number; text?: string }) {
  return (
    <div className="text-[12.5px]">
      <div className="flex justify-between text-ink-3">
        <span>{label}</span>
        <span className="tabular-nums text-ink">{text ?? `${Math.round(v * 100)}%`}</span>
      </div>
      <div className="mt-1 h-1 overflow-hidden rounded-full bg-black/[0.06]">
        <div className="h-full rounded-full bg-ink/70" style={{ width: `${Math.max(2, Math.min(100, v * 100))}%` }} />
      </div>
    </div>
  )
}
