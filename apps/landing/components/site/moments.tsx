"use client"

import { useEffect, useRef, useState } from "react"
import Image, { type StaticImageData } from "next/image"
import { cn } from "@workspace/ui/lib/utils"

import scroll from "@/public/images/moment-scroll.jpg"
import friends from "@/public/images/moment-friends.jpg"
import sidewalk from "@/public/images/moment-sidewalk.jpg"
import records from "@/public/images/moment-records.jpg"
import kitchen from "@/public/images/moment-kitchen.jpg"
import { Container, NudgeCard } from "./primitives"

type Moment = {
  title: string
  blurb: string
  time: string
  nudge: string
  actions: string[]
  img: StaticImageData
  alt: string
  pos: string
}

const MOMENTS: Moment[] = [
  {
    title: "The scroll hole",
    blurb: "It notices when an hour slips away, and offers one small, personal way out.",
    time: "11:48 pm",
    nudge: "You've been on TikTok for 52 minutes. Want to finish the chapter you started Tuesday?",
    actions: ["Open the book", "Not tonight"],
    img: scroll,
    alt: "A man lies on a sofa late at night, his face lit by his phone.",
    pos: "50% 40%",
  },
  {
    title: "Who restores you",
    blurb: "Over time it learns which people leave you lighter, and reminds you to see them.",
    time: "Sun 4:10 pm",
    nudge: "You always sound lighter after time with Maya. It's been three weeks. Coffee on Saturday?",
    actions: ["Text Maya", "Later"],
    img: friends,
    alt: "Two friends laughing together at a kitchen table.",
    pos: "50% 45%",
  },
  {
    title: "What you promised",
    blurb: "The things you say you'll do, out loud, in passing. It keeps them so you don't have to.",
    time: "Thu 9:02 am",
    nudge: "You told Priya you'd send the deck by Friday. I drafted a note to go with it.",
    actions: ["Review draft", "Remind me at 2"],
    img: sidewalk,
    alt: "A woman on a sunny sidewalk smiles down at her phone.",
    pos: "50% 30%",
  },
  {
    title: "Small adventures",
    blurb: "Sidequests drawn from what you actually talk about, sized to fit an evening.",
    time: "Wed 6:30 pm",
    nudge: "There's a jazz listening night at a record shop ten minutes away on Thursday. You've brought up jazz twice this month.",
    actions: ["Add to calendar", "Skip"],
    img: records,
    alt: "A man in headphones flips through records in a warm, small shop.",
    pos: "45% 50%",
  },
  {
    title: "Before you ask",
    blurb: "Birthdays, follow-ups, the thing someone mentioned once. Handled before it's urgent.",
    time: "Fri 7:15 pm",
    nudge: "Dad's birthday is Sunday. He mentioned that Apollo book twice this month. Want me to order it?",
    actions: ["Order it", "Remind me"],
    img: kitchen,
    alt: "A father and his adult daughter laughing while cooking together.",
    pos: "50% 45%",
  },
]

/**
 * Sticky numbered list where only the active line is full ink (TinyWins),
 * beside tall photographs that each carry a real wali nudge (Lassie's UI
 * cards over photography).
 */
export function Moments() {
  const [active, setActive] = useState(0)
  const cards = useRef<(HTMLElement | null)[]>([])

  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) setActive(Number((e.target as HTMLElement).dataset.i))
        }
      },
      { rootMargin: "-48% 0px -48% 0px" }
    )
    cards.current.forEach((c) => c && io.observe(c))
    return () => io.disconnect()
  }, [])

  return (
    <section id="moments" className="scroll-mt-20 py-24 md:py-16">
      <Container className="grid gap-10 md:grid-cols-12 md:gap-8">
        <div className="md:col-span-5">
          <div className="md:sticky md:top-0 md:flex md:h-svh md:flex-col md:justify-center">
            <h2 className="display text-h2 max-w-[12ch] md:hidden">
              Quiet, <em>until it matters.</em>
            </h2>
            <ol className="hidden md:block">
              {MOMENTS.map((m, i) => (
                <li key={m.title}>
                  <button
                    type="button"
                    onClick={() =>
                      cards.current[i]?.scrollIntoView({ behavior: "smooth", block: "center" })
                    }
                    className={cn(
                      "display flex w-full items-baseline gap-4 py-1 text-left text-[clamp(1.9rem,3.1vw,3rem)] transition-colors duration-500 [--display-leading:1.08]",
                      i === active ? "text-ink" : "text-ink/20 hover:text-ink/40"
                    )}
                  >
                    <span className="w-6 shrink-0 font-sans text-[13px] tracking-normal tabular-nums normal-case">
                      {i + 1}
                    </span>
                    {m.title}
                  </button>
                </li>
              ))}
            </ol>
            <p
              key={active}
              className="mt-10 hidden max-w-[36ch] animate-in fade-in slide-in-from-bottom-1 text-[16px] leading-[1.6] text-ink-2 duration-700 md:block"
            >
              {MOMENTS[active]?.blurb}
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-16 md:col-span-7 md:gap-[16vh] md:py-[14vh]">
          {MOMENTS.map((m, i) => (
            <article
              key={m.title}
              data-i={i}
              ref={(el) => {
                cards.current[i] = el
              }}
            >
              <header className="mb-4 md:hidden">
                <h3 className="display text-h3">{m.title}</h3>
                <p className="mt-2 text-[15px] leading-[1.6] text-ink-2">{m.blurb}</p>
              </header>
              <div className="relative aspect-[4/5] overflow-hidden rounded-[24px] md:aspect-auto md:h-[min(84vh,860px)] md:rounded-[30px]">
                <Image
                  src={m.img}
                  alt={m.alt}
                  fill
                  placeholder="blur"
                  sizes="(min-width: 768px) 55vw, 100vw"
                  className="object-cover"
                  style={{ objectPosition: m.pos }}
                />
                <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/35 to-transparent" />
                <NudgeCard
                  time={m.time}
                  actions={m.actions}
                  className="absolute bottom-4 left-4 md:bottom-7 md:left-7"
                >
                  {m.nudge}
                </NudgeCard>
              </div>
            </article>
          ))}
        </div>
      </Container>
    </section>
  )
}
