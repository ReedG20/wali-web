import Image, { type StaticImageData } from "next/image"

import ocean from "@/public/images/how-ocean.jpg"
import birch from "@/public/images/how-birch.jpg"
import wheat from "@/public/images/how-wheat.jpg"
import stream from "@/public/images/how-stream.jpg"
import { Container, WaliIcon } from "./primitives"
import { Reveal } from "./reveal"

const STEPS: {
  title: string
  body: string
  img: StaticImageData
  ui: React.ReactNode
}[] = [
  {
    title: "It listens",
    body: "Wear it on its cord. It wakes for speech, lets the quiet pass, and keeps going when your phone is out of reach.",
    img: ocean,
    ui: <ListeningCard />,
  },
  {
    title: "It understands",
    body: "Conversations become private transcripts, sorted by who said what.",
    img: birch,
    ui: <TranscriptCard />,
  },
  {
    title: "It learns you",
    body: "Over weeks, wali builds a picture of your people, goals and habits.",
    img: wheat,
    ui: <MemoryCard />,
  },
  {
    title: "It acts, with your OK",
    body: "It can draft the message or book the table. Anything that leaves your phone waits for a yes.",
    img: stream,
    ui: <ApprovalCard />,
  },
]

/**
 * Four steps, each a long-exposure photograph carrying one small piece of the
 * real interface (Lassie, "How Lassie works", and its working card over a
 * blurred photo). Scrolls sideways on small screens.
 */
export function HowItWorks() {
  return (
    <section id="how" className="scroll-mt-20 px-2 md:px-3">
      <div className="rounded-[28px] bg-paper-2 py-24 md:rounded-[36px] md:py-32">
        <Container>
          <Reveal className="mx-auto max-w-[760px] text-center">
            <h2 className="display text-h2">
              From a passing remark <em className="block">to the right nudge.</em>
            </h2>
          </Reveal>
        </Container>

        <div className="no-scrollbar mt-14 overflow-x-auto md:mt-20 md:overflow-visible">
          <ol className="mx-auto flex w-max snap-x snap-mandatory gap-3 px-5 md:grid md:w-full md:max-w-[1360px] md:grid-cols-4 md:gap-4 md:px-10">
            {STEPS.map((s, i) => (
              <li key={s.title} className="w-[80vw] max-w-[340px] snap-start md:w-auto md:max-w-none">
                <Reveal delay={i * 0.08}>
                  <div className="relative aspect-[3/4] overflow-hidden rounded-[24px] bg-black/5">
                    <Image
                      src={s.img}
                      alt=""
                      fill
                      placeholder="blur"
                      sizes="(min-width: 768px) 25vw, 80vw"
                      className="object-cover"
                    />
                    <div className="absolute inset-0 grid place-items-center p-4">{s.ui}</div>
                  </div>
                  <h3 className="display mt-6 text-[clamp(1.45rem,1.9vw,1.75rem)] [--display-leading:1.1]">
                    {s.title}
                  </h3>
                  <p className="mt-2 max-w-[34ch] text-[15px] leading-[1.6] text-ink-2">{s.body}</p>
                </Reveal>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  )
}

/* ---- the little interface pieces ---------------------------------------- */

function UiCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="frost-solid w-full max-w-[268px] rounded-[18px] p-4 text-[13px] text-ink shadow-[0_24px_50px_-24px_rgba(0,0,0,0.55)] ring-1 ring-black/5">
      {children}
    </div>
  )
}

const BARS = [3, 6, 10, 7, 12, 16, 9, 5, 11, 18, 14, 8, 4, 9, 15, 20, 13, 7, 10, 6, 12, 8, 4, 6]

function ListeningCard() {
  return (
    <UiCard>
      <div className="flex items-center gap-2">
        <span className="relative flex size-2">
          <span className="absolute inline-flex size-full animate-ping rounded-full bg-ember/60" />
          <span className="relative size-2 rounded-full bg-ember" />
        </span>
        <span className="font-medium">Listening</span>
        <span className="ml-auto text-ink-3">2 voices</span>
      </div>
      <div className="mt-4 flex h-10 items-center gap-[3px]" aria-hidden>
        {BARS.map((h, i) => (
          <span
            key={i}
            className="w-[3px] origin-center rounded-full bg-ink/80 motion-safe:animate-[wave_1.4s_ease-in-out_infinite]"
            style={{ height: `${h * 2}px`, animationDelay: `${i * -0.09}s` }}
          />
        ))}
      </div>
    </UiCard>
  )
}

function TranscriptCard() {
  return (
    <UiCard>
      <p className="text-[12px] text-ink-3">Thursday, 4:12 pm</p>
      <div className="mt-3 space-y-3 leading-[1.45]">
        <p>
          <span className="block text-[12px] font-semibold">Maya</span>
          I keep saying I&rsquo;ll try that pottery class.
        </p>
        <p>
          <span className="block text-[12px] font-semibold">You</span>
          Let&rsquo;s just book it. Thursday?
        </p>
      </div>
    </UiCard>
  )
}

function MemoryCard() {
  const rows = [
    { k: "Maya", v: "Lifts you up" },
    { k: "10k in April", v: "3 runs this week" },
    { k: "Reading", v: "Most nights" },
  ]
  return (
    <UiCard>
      <p className="text-[12px] text-ink-3">What wali knows</p>
      <ul className="mt-3 space-y-2.5">
        {rows.map((r) => (
          <li key={r.k} className="flex items-center justify-between gap-3">
            <span className="font-medium">{r.k}</span>
            <span className="rounded-full bg-black/[0.05] px-2.5 py-1 text-[12px] text-ink-2">{r.v}</span>
          </li>
        ))}
      </ul>
    </UiCard>
  )
}

function ApprovalCard() {
  return (
    <UiCard>
      <div className="flex items-center gap-2 text-[12px] text-ink-2">
        <WaliIcon size={18} />
        <span className="font-medium text-ink">wali</span>
        <span className="ml-auto">Needs your OK</span>
      </div>
      <p className="mt-3 text-[14px] leading-[1.4] font-medium">Book pottery for two, Thursday at 6</p>
      <p className="mt-0.5 text-ink-2">Clayroom Studio · $48</p>
      <div className="mt-3.5 flex gap-1.5">
        <span className="rounded-full bg-ink px-3 py-1.5 text-[12.5px] font-medium text-white">Approve</span>
        <span className="rounded-full bg-black/[0.06] px-3 py-1.5 text-[12.5px] font-medium">Edit</span>
      </div>
    </UiCard>
  )
}
