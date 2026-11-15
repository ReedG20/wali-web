"use client"

import { useDeferredValue, useEffect, useMemo, useRef, useState } from "react"
import Link from "next/link"
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowDown01Icon, Cancel01Icon, Search01Icon } from "@hugeicons/core-free-icons"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu"
import { Skeleton } from "@workspace/ui/components/skeleton"
import { cn } from "@workspace/ui/lib/utils"
import type { GenericId as Id } from "convex/values"
import { clock, dayLabel, duration } from "@/lib/time"

export type Utterance = {
  _id: string
  startAt: number
  speaker: string
  speakerRaw: string
  named: boolean
  hasVoice: boolean
  text: string
}
export type Rec = {
  _id: Id<"recordings">
  startedAt: number
  durationMs: number
  status: string
  utterances: Utterance[]
}

type When = "all" | "today" | "week" | "month"
const WHEN: { value: When; label: string }[] = [
  { value: "all", label: "Any time" },
  { value: "today", label: "Today" },
  { value: "week", label: "Past 7 days" },
  { value: "month", label: "Past 30 days" },
]
const UNNAMED = "\u0000unnamed"
const DAY = 24 * 60 * 60 * 1000

function since(when: When) {
  if (when === "all") return 0
  const midnight = new Date()
  midnight.setHours(0, 0, 0, 0)
  if (when === "today") return midnight.getTime()
  return midnight.getTime() - (when === "week" ? 6 : 29) * DAY
}

const chip = "flex h-9 shrink-0 items-center gap-1.5 rounded-full px-3.5 text-[13.5px] transition-colors"
const chipOff = `${chip} bg-black/[0.06] text-ink-2 hover:bg-black/[0.1] hover:text-ink`
const chipOn = `${chip} bg-ink text-white`

/** Conversations the pendant heard: search, filter by person and date, open one to read it. */
export function TranscriptsView({
  recs,
  onName,
  onLoadMore,
}: {
  recs: Rec[] | undefined
  onName: (rec: Rec, utterance: Utterance) => void
  /** Present while older conversations may exist. */
  onLoadMore?: () => void
}) {
  const [query, setQuery] = useState("")
  const [when, setWhen] = useState<When>("all")
  const [people, setPeople] = useState<Set<string>>(new Set())
  const [showSilent, setShowSilent] = useState(false)
  const [open, setOpen] = useState<Set<string>>(new Set())
  const inputRef = useRef<HTMLInputElement>(null)

  // "/" jumps to search from anywhere on the page.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const t = e.target as HTMLElement | null
      if (e.key !== "/" || e.metaKey || e.ctrlKey || e.altKey) return
      if (t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))) return
      e.preventDefault()
      inputRef.current?.focus()
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [])

  const tokens = useMemo(() => tokenize(query), [query])
  const deferredTokens = useDeferredValue(tokens)
  const matcher = useMemo(
    () => (deferredTokens.length ? new RegExp(`(${deferredTokens.map(escapeRe).join("|")})`, "gi") : null),
    [deferredTokens],
  )

  const index = useMemo(
    () =>
      (recs ?? []).map((rec) => {
        const names = new Set<string>()
        let unnamed = false
        for (const u of rec.utterances) {
          if (u.named) names.add(u.speaker)
          else unnamed = true
        }
        const haystack = rec.utterances.map((u) => `${u.speaker} ${u.text}`).join("\n").toLowerCase()
        return { rec, names, unnamed, haystack }
      }),
    [recs],
  )

  // People to filter by, most-heard first.
  const speakers = useMemo(() => {
    const counts = new Map<string, number>()
    let unnamed = 0
    let silent = 0
    for (const c of index) {
      for (const n of c.names) counts.set(n, (counts.get(n) ?? 0) + 1)
      if (c.unnamed) unnamed++
      if (c.rec.utterances.length === 0) silent++
    }
    return { named: [...counts].sort((a, b) => b[1] - a[1]).map(([name]) => name), unnamed, silent }
  }, [index])

  const visible = useMemo(() => {
    const from = since(when)
    return index.filter((c) => {
      if (c.rec.utterances.length === 0 && (!showSilent || deferredTokens.length > 0 || people.size > 0)) return false
      if (c.rec.startedAt < from) return false
      for (const p of people) if (p === UNNAMED ? !c.unnamed : !c.names.has(p)) return false
      return deferredTokens.every((t) => c.haystack.includes(t))
    })
  }, [index, when, people, showSilent, deferredTokens])

  const days = useMemo(() => {
    const out: { label: string; items: typeof visible }[] = []
    for (const c of visible) {
      const label = dayLabel(c.rec.startedAt)
      const last = out[out.length - 1]
      if (last?.label === label) last.items.push(c)
      else out.push({ label, items: [c] })
    }
    return out
  }, [visible])

  const filtering = tokens.length > 0 || when !== "all" || people.size > 0
  function clear() {
    setQuery("")
    setWhen("all")
    setPeople(new Set())
  }
  const toggle = <T,>(set: Set<T>, v: T) => {
    const next = new Set(set)
    if (!next.delete(v)) next.add(v)
    return next
  }

  if (recs && recs.length === 0)
    return (
      <div className="soft-card rounded-[22px] p-6 text-[15px] text-ink-2">
        Nothing yet.{" "}
        <Link href="/pendant" className="text-ink underline underline-offset-4">
          Connect a pendant
        </Link>{" "}
        and talk.
      </div>
    )

  return (
    <div>
      <div className="sticky top-14 z-[5] -mx-2 bg-paper/90 px-2 pt-1 pb-3 backdrop-blur">
        <label className="soft-card flex h-12 items-center gap-3 rounded-full pr-2 pl-5">
          <HugeiconsIcon icon={Search01Icon} className="size-[18px] shrink-0 text-ink-3" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key !== "Escape") return
              if (query) setQuery("")
              else e.currentTarget.blur()
            }}
            placeholder="Search what was said"
            aria-label="Search transcripts"
            className="h-full min-w-0 flex-1 bg-transparent text-[15px] text-ink outline-none placeholder:text-ink-3"
          />
          {query ? (
            <button
              type="button"
              onClick={() => {
                setQuery("")
                inputRef.current?.focus()
              }}
              aria-label="Clear search"
              className="flex size-8 items-center justify-center rounded-full text-ink-2 hover:bg-black/[0.06] hover:text-ink"
            >
              <HugeiconsIcon icon={Cancel01Icon} className="size-4" />
            </button>
          ) : (
            <kbd className="mr-2 hidden rounded-md bg-black/[0.05] px-1.5 py-0.5 font-sans text-[12px] text-ink-3 md:block">/</kbd>
          )}
        </label>

        <div className="mt-2.5 flex gap-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <DropdownMenu>
            <DropdownMenuTrigger render={<button type="button" className={when === "all" ? chipOff : chipOn} />}>
              {WHEN.find((w) => w.value === when)!.label}
              <HugeiconsIcon icon={ArrowDown01Icon} className="size-3.5" />
            </DropdownMenuTrigger>
            <DropdownMenuContent className="rounded-2xl">
              <DropdownMenuRadioGroup value={when} onValueChange={(v) => setWhen(v as When)}>
                {WHEN.map((w) => (
                  <DropdownMenuRadioItem key={w.value} value={w.value}>
                    {w.label}
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
          {speakers.named.map((name) => (
            <button
              key={name}
              type="button"
              aria-pressed={people.has(name)}
              onClick={() => setPeople((s) => toggle(s, name))}
              className={people.has(name) ? chipOn : chipOff}
            >
              {name}
            </button>
          ))}
          {speakers.unnamed > 0 && (
            <button
              type="button"
              aria-pressed={people.has(UNNAMED)}
              onClick={() => setPeople((s) => toggle(s, UNNAMED))}
              className={people.has(UNNAMED) ? chipOn : chipOff}
            >
              Unnamed voices
            </button>
          )}
          {speakers.silent > 0 && (
            <button
              type="button"
              aria-pressed={showSilent}
              onClick={() => setShowSilent((v) => !v)}
              className={showSilent ? chipOn : chipOff}
            >
              Silent
            </button>
          )}
        </div>
      </div>

      {!recs && (
        <div className="mt-6 flex flex-col gap-3">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-[88px] rounded-[22px]" />
          ))}
        </div>
      )}

      {recs && filtering && (
        <p className="mt-4 flex items-center gap-3 px-1 text-[13.5px] text-ink-3" aria-live="polite">
          {visible.length === 0 ? "Nothing matches." : `${visible.length} conversation${visible.length === 1 ? "" : "s"}`}
          <button type="button" onClick={clear} className="text-ink-2 underline underline-offset-4 hover:text-ink">
            Clear
          </button>
        </p>
      )}

      {days.map((day) => (
        <section key={day.label} className="mt-8 first:mt-6">
          <h2 className="display mb-3 px-1 text-[22px]">{day.label}</h2>
          <div className="flex flex-col gap-3">
            {day.items.map(({ rec, names, unnamed }) => (
              <Conversation
                key={rec._id}
                rec={rec}
                who={[...names, ...(unnamed ? [names.size ? "others" : "Unnamed voices"] : [])].join(", ")}
                matcher={matcher}
                open={open.has(rec._id)}
                onToggle={() => setOpen((s) => toggle(s, rec._id as string))}
                onName={onName}
              />
            ))}
          </div>
        </section>
      ))}

      {recs && onLoadMore && when === "all" && (
        <div className="mt-8 flex justify-center">
          <button type="button" onClick={onLoadMore} className={chipOff}>
            {filtering ? "Search earlier conversations" : "Show earlier"}
          </button>
        </div>
      )}
    </div>
  )
}

function Conversation({
  rec,
  who,
  matcher,
  open,
  onToggle,
  onName,
}: {
  rec: Rec
  who: string
  matcher: RegExp | null
  open: boolean
  onToggle: () => void
  onName: (rec: Rec, utterance: Utterance) => void
}) {
  const silent = rec.utterances.length === 0
  const hits = useMemo(
    () => (matcher ? rec.utterances.filter((u) => hasMatch(matcher, u.text)) : []),
    [matcher, rec.utterances],
  )
  const turns = useMemo(() => (open ? groupTurns(rec.utterances) : []), [open, rec.utterances])
  const shown = hits.slice(0, 3)

  const head = (
    <>
      <div className="flex items-baseline gap-2 text-[13.5px]">
        <span className="text-ink tabular-nums">{clock(rec.startedAt)}</span>
        <span className="text-ink-3">{duration(rec.durationMs)}</span>
        <span className="ml-auto truncate pl-4 text-ink-2">
          {silent ? (rec.status === "empty" || rec.status === "done" ? "Silent" : cap(rec.status)) : who}
        </span>
        {!silent && (
          <HugeiconsIcon
            icon={ArrowDown01Icon}
            className={cn("size-4 shrink-0 self-center text-ink-3 transition-transform duration-300", open && "rotate-180")}
          />
        )}
      </div>
      {!open && !silent && shown.length === 0 && (
        <p className="mt-2 line-clamp-2 text-[14.5px] leading-relaxed text-ink-2">{preview(rec.utterances)}</p>
      )}
      {!open && shown.length > 0 && (
        <div className="mt-2.5 flex flex-col gap-1.5">
          {shown.map((u) => (
            <p key={u._id} className="line-clamp-2 text-[14.5px] leading-relaxed text-ink-2">
              <span className="mr-2 text-[12.5px] text-ink-3">{u.speaker}</span>
              <Marked text={excerpt(u.text, matcher!)} matcher={matcher} />
            </p>
          ))}
          {hits.length > shown.length && <p className="text-[13px] text-ink-3">{hits.length - shown.length} more</p>}
        </div>
      )}
    </>
  )

  if (silent) return <div className="rounded-[22px] bg-black/[0.03] px-5 py-4">{head}</div>

  return (
    <article className="soft-card rounded-[22px]">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className="block w-full rounded-[22px] px-5 py-4 text-left outline-none focus-visible:ring-2 focus-visible:ring-black/20"
      >
        {head}
      </button>
      {open && (
        <div className="rise flex flex-col gap-3.5 px-5 pt-1 pb-5">
          {turns.map((t) => (
            <div key={t.first._id} className="sm:grid sm:grid-cols-[6rem_1fr] sm:gap-3">
              <div className="mb-0.5 sm:mb-0 sm:pt-[3px]">
                <button
                  type="button"
                  onClick={() => onName(rec, t.first)}
                  title={t.first.named ? "Change who this is" : "Who's this?"}
                  className={cn(
                    "max-w-full truncate rounded-full text-left text-[12.5px]",
                    t.first.named
                      ? "text-ink-2 underline-offset-2 hover:underline"
                      : "bg-black/[0.06] px-2 py-0.5 text-ink-2 hover:bg-black/[0.1] hover:text-ink",
                  )}
                >
                  {t.first.speaker}
                </button>
              </div>
              <p className="text-[15px] leading-relaxed text-ink">
                <Marked text={t.text} matcher={matcher} />
              </p>
            </div>
          ))}
        </div>
      )}
    </article>
  )
}

/** Text with search matches set on a warm tint. */
function Marked({ text, matcher }: { text: string; matcher: RegExp | null }) {
  if (!matcher) return text
  return text.split(matcher).map((part, i) =>
    i % 2 ? (
      <mark key={i} className="rounded-[5px] bg-ember/25 px-0.5 text-ink">
        {part}
      </mark>
    ) : (
      part
    ),
  )
}

function tokenize(q: string) {
  return [...new Set(q.toLowerCase().split(/\s+/).filter(Boolean))]
}
function escapeRe(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
}
function hasMatch(re: RegExp, text: string) {
  re.lastIndex = 0
  return re.test(text)
}
function cap(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1)
}

/** Start a long line shortly before its first match, so the match survives the two-line clamp. */
function excerpt(text: string, re: RegExp) {
  re.lastIndex = 0
  const at = re.exec(text)?.index ?? 0
  if (at < 90) return text
  const cut = text.lastIndexOf(" ", at - 50)
  return `…${text.slice(cut < 0 ? at - 50 : cut + 1)}`
}

function preview(utterances: Utterance[]) {
  let out = ""
  for (const u of utterances) {
    out += (out ? " " : "") + u.text
    if (out.length > 220) break
  }
  return out
}

/** Consecutive lines from one speaker read as a single turn. */
function groupTurns(utterances: Utterance[]) {
  const turns: { first: Utterance; text: string }[] = []
  for (const u of utterances) {
    const last = turns[turns.length - 1]
    if (last && last.first.speakerRaw === u.speakerRaw) last.text += ` ${u.text}`
    else turns.push({ first: u, text: u.text })
  }
  return turns
}
