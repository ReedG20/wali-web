"use client"

import { useCallback, useEffect, useState } from "react"
import { useAction, useQuery } from "convex/react"
import { toast } from "sonner"
import { HugeiconsIcon } from "@hugeicons/react"
import { Refresh01Icon, Search01Icon } from "@hugeicons/core-free-icons"
import { Skeleton } from "@workspace/ui/components/skeleton"
import { Spinner } from "@workspace/ui/components/spinner"

import { api } from "@/lib/convex-api"
import { ago, timeLabel } from "@/lib/time"
import { TopBar, PageTitle } from "@/components/page-header"
import { PageBody, Panel, Section } from "@/components/section"

type Overview = {
  enabled: boolean
  profile: { static: string[]; dynamic: string[] } | null
  backfilledAt: number | null
  documents: number | null
  error: string | null
}
type Hit = { text: string; similarity: number; date: string | null; kind: string | null }
type Note = { _id: string; text: string; createdAt: number }

export default function MemoryPage() {
  const loadOverview = useAction(api.agentNode.memoryOverview)
  const searchMemory = useAction(api.agentNode.memorySearch)
  const syncNow = useAction(api.agentNode.syncMemoryNow)
  const notes = useQuery(api.activity.notes) as Note[] | undefined

  const [overview, setOverview] = useState<Overview | null>(null)
  const [query, setQuery] = useState("")
  const [hits, setHits] = useState<Hit[] | null>(null)
  const [searching, setSearching] = useState(false)

  const refresh = useCallback(async () => {
    try {
      setOverview((await loadOverview({})) as Overview)
    } catch (e) {
      toast.error(e instanceof Error ? e.message.split("\n")[0] : "Couldn't load memory")
    }
  }, [loadOverview])

  useEffect(() => {
    void refresh()
  }, [refresh])

  async function search(e: React.FormEvent) {
    e.preventDefault()
    if (!query.trim()) return
    setSearching(true)
    try {
      setHits((await searchMemory({ query })) as Hit[])
    } finally {
      setSearching(false)
    }
  }

  const p = overview?.profile

  return (
    <>
      <TopBar />
      <PageBody>
        <PageTitle
          title="Memory."
          em="What wali knows about you."
          lede="Every conversation the pendant hears goes into Supermemory, which keeps a profile of lasting facts and recent context. wali reads it before every reply and every nudge."
        />

        {overview && !overview.enabled ? (
          <Panel className="text-[14.5px] text-ink-2">Add SUPERMEMORY_API_KEY in Convex to turn on long-term memory.</Panel>
        ) : (
          <>
            <Section
              title="About you"
              description="Lasting facts, learned from your conversations."
              aside={
                <button
                  onClick={() => void refresh()}
                  className="flex size-9 items-center justify-center rounded-full bg-black/[0.05] text-ink-2 hover:text-ink"
                  aria-label="Refresh"
                >
                  <HugeiconsIcon icon={Refresh01Icon} className="size-4" />
                </button>
              }
            >
              <FactList items={p?.static} loading={!overview} empty="Nothing yet. Supermemory is still reading your conversations; check back in a minute." />
            </Section>

            <Section title="Lately" description="Recent context, dated. Older items fade out on their own.">
              <FactList items={p?.dynamic} loading={!overview} empty="No recent context yet." />
            </Section>

            <Section title="Ask your memory" description="The same search wali uses.">
              <form onSubmit={search} className="soft-card flex items-center gap-2 rounded-full p-1.5 pl-5">
                <HugeiconsIcon icon={Search01Icon} className="size-4 text-ink-3" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Who is Sam? What did I promise this week?"
                  className="h-9 flex-1 bg-transparent text-[15px] text-ink outline-none placeholder:text-ink-3"
                />
                <button
                  disabled={!query.trim() || searching}
                  className="flex h-9 items-center gap-2 rounded-full bg-ink px-4 text-[13px] font-medium text-white disabled:opacity-40"
                >
                  {searching && <Spinner className="size-3.5" />}
                  Search
                </button>
              </form>
              {hits && (
                <div className="mt-3 flex flex-col gap-2">
                  {hits.length === 0 && <p className="px-2 text-[14px] text-ink-3">Nothing relevant found.</p>}
                  {hits.map((h, i) => (
                    <div key={i} className="rounded-[18px] bg-white/70 px-4 py-3 ring-1 ring-black/5">
                      <p className="text-[14.5px] leading-relaxed whitespace-pre-wrap text-ink">{h.text}</p>
                      <p className="mt-1 text-[12px] text-ink-3">
                        {Math.round(h.similarity * 100)}% match
                        {h.date && ` · ${new Date(h.date).toLocaleDateString([], { month: "short", day: "numeric" })}`}
                        {h.kind && ` · ${h.kind}`}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </Section>
          </>
        )}

        <Section title="Notes wali saved" description="Things wali chose to remember. They go into memory too.">
          {!notes ? (
            <Skeleton className="h-20 rounded-[22px]" />
          ) : notes.length === 0 ? (
            <Panel className="text-[14px] text-ink-3">No notes yet.</Panel>
          ) : (
            <Panel className="divide-y divide-black/5 p-0">
              {notes.map((n) => (
                <div key={n._id} className="px-5 py-3.5">
                  <p className="text-[14.5px] text-ink">{n.text}</p>
                  <p className="text-[12.5px] text-ink-3">{timeLabel(n.createdAt)}</p>
                </div>
              ))}
            </Panel>
          )}
        </Section>

        {overview?.enabled && (
          <p className="mt-10 flex flex-wrap items-center gap-2 text-[13px] text-ink-3">
            {overview.backfilledAt
              ? `Pendant history synced ${ago(overview.backfilledAt)}${overview.documents ? ` (${overview.documents} items)` : ""}. New conversations sync as they're transcribed.`
              : "Pendant history hasn't been synced yet."}
            <button
              onClick={async () => {
                await syncNow({})
                toast.success("Syncing your pendant history to memory.")
              }}
              className="underline underline-offset-4 hover:text-ink"
            >
              Sync again
            </button>
            {overview.error && <span>· {overview.error}</span>}
          </p>
        )}
      </PageBody>
    </>
  )
}

function FactList({ items, loading, empty }: { items?: string[]; loading: boolean; empty: string }) {
  if (loading)
    return (
      <Panel className="space-y-3">
        <Skeleton className="h-4 w-2/3 rounded-full" />
        <Skeleton className="h-4 w-1/2 rounded-full" />
        <Skeleton className="h-4 w-3/5 rounded-full" />
      </Panel>
    )
  if (!items?.length) return <Panel className="text-[14px] text-ink-3">{empty}</Panel>
  return (
    <Panel className="divide-y divide-black/5 p-0">
      {items.map((m, i) => (
        <p key={i} className="px-5 py-3 text-[14.5px] leading-relaxed text-ink">
          {m}
        </p>
      ))}
    </Panel>
  )
}
