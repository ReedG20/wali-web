"use client"

import { useState } from "react"
import { useMutation, useQuery } from "convex/react"
import { toast } from "sonner"
import type { GenericId as Id } from "convex/values"
import { api } from "@/lib/convex-api"
import { TopBar, PageTitle } from "@/components/page-header"
import { PageBody } from "@/components/section"
import { TranscriptsView, type Rec, type Utterance } from "@/components/transcripts/transcripts-view"
import { NameDialog, type Target } from "@/components/voices"

type Naming = { recordingId: Id<"recordings">; speakerRaw: string; label: string; sample: string; hasVoice: boolean; named: boolean }

const PAGE = 30

export default function TranscriptsPage() {
  const [limit, setLimit] = useState(PAGE)
  const latest = useQuery(api.transcripts.recent, { limit }) as Rec[] | undefined
  // Keep the list on screen while a longer one loads.
  const [recs, setRecs] = useState(latest)
  if (latest && latest !== recs) setRecs(latest)
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
        <PageTitle title="Transcripts." em="What the pendant heard." />
        <TranscriptsView
          recs={recs}
          onName={openNaming}
          onLoadMore={recs && recs.length >= limit && latest ? () => setLimit((n) => n + PAGE) : undefined}
        />

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
