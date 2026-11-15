"use client"

import { useState } from "react"
import { useMutation, useQuery } from "convex/react"
import { toast } from "sonner"
import { Skeleton } from "@workspace/ui/components/skeleton"
import type { GenericId as Id } from "convex/values"
import { api } from "@/lib/convex-api"
import { ago } from "@/lib/time"
import { TopBar, PageTitle } from "@/components/page-header"
import { PageBody, Panel, Section } from "@/components/section"
import { NameDialog, PlayClip, pillDark, pillSoft, type Target } from "@/components/voices"

type Voice = {
  _id: Id<"voices">
  recordingCount: number
  totalSeconds: number
  firstHeardAt: number
  lastHeardAt: number
  clipUrl: string | null
  sampleText: string | null
  nameSuggestion: { name: string; evidence: string } | null
  maybeSameAs: { voiceId: Id<"voices">; name: string | null } | null
}
type Person = {
  _id: Id<"people">
  name: string
  isMe: boolean
  recordingCount: number
  lastHeardAt: number | null
  voices: Voice[]
}
type Overview = {
  meSuggestion: Voice | null
  people: Person[]
  unnamed: Voice[]
  oneOffCount: number
  background: Voice[]
  recordingsProcessed: number
}

const errMsg = (e: unknown) =>
  e instanceof Error ? (e.message.replace(/^.*Uncaught Error: /s, "").split("\n")[0] ?? "Something went wrong") : "Something went wrong"

function heard(v: { recordingCount: number; lastHeardAt: number | null }) {
  const n = v.recordingCount
  return `${n} conversation${n === 1 ? "" : "s"}${v.lastHeardAt ? ` · last ${ago(v.lastHeardAt)}` : ""}`
}

export default function VoicesPage() {
  const data = useQuery(api.voices.overview, {}) as Overview | null | undefined
  const nameVoice = useMutation(api.voices.nameVoice)
  const unnameVoice = useMutation(api.voices.unnameVoice)
  const dismissMe = useMutation(api.voices.dismissMe)
  const setIgnored = useMutation(api.voices.setIgnored)
  const dismissName = useMutation(api.voices.dismissNameSuggestion)
  const renamePerson = useMutation(api.voices.renamePerson)

  const [naming, setNaming] = useState<Voice | null>(null)
  const [renaming, setRenaming] = useState<Person | null>(null)

  async function run(p: Promise<unknown>, ok?: string) {
    try {
      await p
      if (ok) toast.success(ok)
    } catch (e) {
      toast.error(errMsg(e))
    }
  }

  return (
    <>
      <TopBar />
      <PageBody>
        <PageTitle
          title="Voices."
          em="Who you talk to."
          lede="wali learns voices as it hears them. Name someone once and every conversation with them, past and future, uses that name."
        />

        {data === undefined && <Skeleton className="h-40 rounded-[22px]" />}
        {data === null && <Panel className="text-ink-2">Sign in to see voices.</Panel>}

        {data && (
          <>
            {data.meSuggestion && (
              <Panel className="mb-10">
                <p className="display text-[24px]">Is this you?</p>
                <p className="mt-1.5 text-[14.5px] leading-relaxed text-ink-2">
                  This voice is in {data.meSuggestion.recordingCount} of your conversations and is usually the
                  closest to the pendant.
                </p>
                <div className="mt-4 flex items-center gap-3">
                  <PlayClip url={data.meSuggestion.clipUrl} />
                  {data.meSuggestion.sampleText && (
                    <p className="line-clamp-2 text-[13.5px] text-ink-2">“{data.meSuggestion.sampleText}”</p>
                  )}
                </div>
                <div className="mt-5 flex gap-2">
                  <button className={pillDark} onClick={() => run(nameVoice({ voiceId: data.meSuggestion!._id, me: true }), "Got it. That's you.")}>
                    Yes, that’s me
                  </button>
                  <button className={pillSoft} onClick={() => run(dismissMe({ voiceId: data.meSuggestion!._id }))}>
                    No
                  </button>
                </div>
              </Panel>
            )}

            <Section
              title="People"
              description={
                data.people.length
                  ? undefined
                  : "No one named yet. Name a voice below, or tap a speaker in Transcripts."
              }
            >
              <div className="flex flex-col gap-3">
                {data.people.map((p) => (
                  <Panel key={p._id} className="flex items-center gap-4">
                    <PlayClip url={p.voices.find((v) => v.clipUrl)?.clipUrl ?? null} />
                    <div className="min-w-0 flex-1">
                      <p className="text-[16px] text-ink">
                        {p.name}
                        {p.isMe && <span className="ml-2 text-[13px] text-ink-3">you</span>}
                      </p>
                      <p className="text-[13px] text-ink-3">
                        {p.voices.length ? heard(p) : "Named in a transcript; no voiceprint yet"}
                      </p>
                    </div>
                    <button className={pillSoft} onClick={() => setRenaming(p)}>
                      Rename
                    </button>
                    {p.voices.length > 0 && (
                      <button
                        className={pillSoft}
                        onClick={() => run(Promise.all(p.voices.map((v) => unnameVoice({ voiceId: v._id }))), `${p.name}'s name was removed from their voice.`)}
                      >
                        Forget voice
                      </button>
                    )}
                  </Panel>
                ))}
              </div>
            </Section>

            <Section
              title="Voices you keep hearing"
              description={
                data.unnamed.length
                  ? "Unnamed voices that came up in more than one conversation."
                  : data.recordingsProcessed
                    ? "Nobody new is recurring right now."
                    : "Voices appear here after a few conversations."
              }
            >
              <div className="flex flex-col gap-3">
                {data.unnamed.map((v) => (
                  <Panel key={v._id}>
                    <div className="flex items-center gap-4">
                      <PlayClip url={v.clipUrl} />
                      <div className="min-w-0 flex-1">
                        <p className="text-[14.5px] text-ink">{heard(v)}</p>
                        {v.sampleText && <p className="line-clamp-1 text-[13px] text-ink-3">“{v.sampleText}”</p>}
                      </div>
                      <button className={pillDark} onClick={() => setNaming(v)}>
                        Name
                      </button>
                      <button className={pillSoft} title="TV, podcasts and other voices you don't want tracked" onClick={() => run(setIgnored({ voiceId: v._id, ignored: true }), "Marked as background.")}>
                        Background
                      </button>
                    </div>
                    {v.nameSuggestion && (
                      <div className="mt-4 flex flex-wrap items-center gap-3 rounded-[16px] bg-black/[0.04] p-3">
                        <p className="min-w-0 flex-1 text-[13.5px] text-ink-2">
                          Is this <span className="text-ink">{v.nameSuggestion.name}</span>? Someone said “{v.nameSuggestion.evidence}”
                        </p>
                        <button className={pillDark} onClick={() => run(nameVoice({ voiceId: v._id, name: v.nameSuggestion!.name }), `Named ${v.nameSuggestion!.name}.`)}>
                          Yes
                        </button>
                        <button className={pillSoft} onClick={() => run(dismissName({ voiceId: v._id }))}>
                          No
                        </button>
                      </div>
                    )}
                    {!v.nameSuggestion && v.maybeSameAs?.name && (
                      <div className="mt-4 flex flex-wrap items-center gap-3 rounded-[16px] bg-black/[0.04] p-3">
                        <p className="min-w-0 flex-1 text-[13.5px] text-ink-2">
                          Sounds a bit like <span className="text-ink">{v.maybeSameAs.name}</span>.
                        </p>
                        <button className={pillSoft} onClick={() => run(nameVoice({ voiceId: v._id, name: v.maybeSameAs!.name! }), `Named ${v.maybeSameAs!.name}.`)}>
                          It’s {v.maybeSameAs.name}
                        </button>
                      </div>
                    )}
                  </Panel>
                ))}
                {data.oneOffCount > 0 && (
                  <p className="px-1 text-[13px] text-ink-3">
                    Plus {data.oneOffCount} voice{data.oneOffCount === 1 ? "" : "s"} heard only once. You can name those from
                    Transcripts.
                  </p>
                )}
              </div>
            </Section>

            {data.background.length > 0 && (
              <Section title="Background" description="Labelled “Background” in transcripts and never asked about.">
                <div className="flex flex-col gap-3">
                  {data.background.map((v) => (
                    <Panel key={v._id} className="flex items-center gap-4">
                      <PlayClip url={v.clipUrl} />
                      <p className="min-w-0 flex-1 text-[14px] text-ink-2">{heard(v)}</p>
                      <button className={pillSoft} onClick={() => run(setIgnored({ voiceId: v._id, ignored: false }))}>
                        Not background
                      </button>
                    </Panel>
                  ))}
                </div>
              </Section>
            )}
          </>
        )}

        <NameDialog
          open={!!naming}
          onOpenChange={(o) => !o && setNaming(null)}
          clipUrl={naming?.clipUrl}
          sampleText={naming?.sampleText}
          suggestion={naming?.nameSuggestion?.name}
          onSubmit={(t: Target) => nameVoice({ voiceId: naming!._id, ...t })}
        />
        <RenameDialog person={renaming} onClose={() => setRenaming(null)} onRename={(name) => renamePerson({ personId: renaming!._id, name })} />
      </PageBody>
    </>
  )
}

function RenameDialog({
  person,
  onClose,
  onRename,
}: {
  person: Person | null
  onClose: () => void
  onRename: (name: string) => Promise<unknown>
}) {
  return (
    <NameDialog
      open={!!person}
      onOpenChange={(o) => !o && onClose()}
      title={`Rename ${person?.name ?? ""}`}
      description="Every conversation with them updates to the new name."
      suggestion={person?.name}
      allowMe={false}
      onSubmit={async (t) => {
        if (t.name) await onRename(t.name)
        else throw new Error("Type the new name")
      }}
    />
  )
}
