"use client"

import { useState } from "react"
import { useMutation, useQuery } from "convex/react"
import { toast } from "sonner"
import { Skeleton } from "@workspace/ui/components/skeleton"
import { cn } from "@workspace/ui/lib/utils"
import type { GenericId as Id } from "convex/values"
import { api } from "@/lib/convex-api"
import { duration, timeLabel } from "@/lib/time"
import { TopBar, PageTitle } from "@/components/page-header"
import { PageBody, Panel } from "@/components/section"
import { NameDialog, type Target } from "@/components/voices"

type Utterance = {
  _id: string
  startAt: number
  speaker: string
  speakerRaw: string
  named: boolean
  hasVoice: boolean
  text: string
}
type Rec = {
  _id: Id<"recordings">
  startedAt: number
  durationMs: number
  status: string
  utterances: Utterance[]
}
type Naming = { recordingId: Id<"recordings">; speakerRaw: string; label: string; sample: string; hasVoice: boolean; named: boolean }

export default function TranscriptsPage() {
  const recs = useQuery(api.transcripts.recent, { limit: 30 }) as Rec[] | undefined
  const nameSpeaker = useMutation(api.voices.nameSpeaker)
  const [naming, setNaming] = useState<Naming | null>(null)

  function openNaming(r: Rec, u: Utterance) {
    const theirs = r.utterances.filter((x) => x.speakerRaw === u.speakerRaw)
    const sample = theirs.reduce((a, b) => (b.text.length > a.text.length ? b : a), u).text
    setNaming({ recordingId: r._id, speakerRaw: u.speakerRaw, label: u.speaker, sample, hasVoice: u.hasVoice, named: u.named })
  }

  return (
    <>
      <TopBar />
      <PageBody>
        <PageTitle
          title="Transcripts."
          em="What the pendant heard."
          lede="Each finished conversation, as transcribed. Tap a speaker to say who it is; wali remembers their voice from then on."
        />
        <div className="flex flex-col gap-4">
          {!recs && [0, 1, 2].map((i) => <Skeleton key={i} className="h-32 rounded-[22px]" />)}
          {recs?.length === 0 && <Panel className="text-ink-2">Nothing yet. Connect a pendant and talk.</Panel>}
          {recs?.map((r) => (
            <Panel key={r._id}>
              <div className="flex items-center gap-2 text-[13px] text-ink-3">
                <span className="text-ink">{timeLabel(r.startedAt)}</span>
                <span>· {duration(r.durationMs)}</span>
                {r.status !== "done" && <span>· {r.status === "empty" ? "silent" : r.status}</span>}
              </div>
              {r.utterances.length > 0 && (
                <div className="mt-3 flex flex-col gap-2">
                  {r.utterances.map((u) => (
                    <p key={u._id} className="text-[14.5px] leading-relaxed text-ink">
                      <button
                        type="button"
                        onClick={() => openNaming(r, u)}
                        title={u.named ? "Change who this is" : "Who's this?"}
                        className={cn(
                          "mr-2 rounded-full text-[12.5px] underline-offset-2 hover:underline",
                          u.named ? "text-ink-2" : "text-ink-3",
                        )}
                      >
                        {u.speaker}
                      </button>
                      {u.text}
                    </p>
                  ))}
                </div>
              )}
            </Panel>
          ))}
        </div>

        <NameDialog
          open={!!naming}
          onOpenChange={(o) => !o && setNaming(null)}
          title={naming?.named ? `Not ${naming.label}?` : `Who's ${naming?.label ?? "this"}?`}
          description={
            naming?.hasVoice
              ? "wali will use this name for this voice in every conversation, including past ones."
              : "This speaker said too little for wali to learn their voice, so the name applies to this conversation only."
          }
          sampleText={naming?.sample}
          onSubmit={async (t: Target) => {
            const res = (await nameSpeaker({ recordingId: naming!.recordingId, speakerRaw: naming!.speakerRaw, ...t })) as {
              scope: "voice" | "recording"
            }
            toast.success(res.scope === "voice" ? "Saved. wali will recognize them from now on." : "Saved for this conversation.")
          }}
        />
      </PageBody>
    </>
  )
}
