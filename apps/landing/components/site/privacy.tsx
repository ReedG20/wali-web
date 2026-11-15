"use client"

import { useState } from "react"
import Image from "next/image"
import { cn } from "@workspace/ui/lib/utils"

import forest from "@/public/images/bg-forest-blur.jpg"
import { Container } from "./primitives"
import { Reveal } from "./reveal"

const TABS = [
  {
    id: "you",
    label: "For you",
    big: "Yours, not ours.",
    lede: "What Mind hears is the most personal data there is. It's built so you stay in charge of it, every day.",
    points: [
      {
        title: "Silence stays silent",
        body: "The pendant only wakes for speech. Quiet hours never leave it.",
      },
      {
        title: "Nothing goes out without you",
        body: "Messages, bookings and anything that involves someone else wait for your OK.",
      },
      {
        title: "Delete a day, or all of it",
        body: "Export everything or wipe it whenever you like. Never sold, never used for ads.",
      },
    ],
  },
  {
    id: "others",
    label: "For people around you",
    big: "Worn in plain sight.",
    lede: "Mind is for understanding your own day, so it's designed to be obvious and easy to stop.",
    points: [
      {
        title: "Visible on purpose",
        body: "It hangs on a cord at your chest, not hidden in a pin or a pair of glasses.",
      },
      {
        title: "Paused with one press",
        body: "If someone would rather not be heard, press once and it stops listening.",
      },
      {
        title: "No profiles of others",
        body: "What others say only helps Mind understand your day. It never builds a file on them.",
      },
    ],
  },
]

/**
 * Motion-blurred photograph as the ground, tabs sitting on it, and a white
 * card with a heavy headline and stat-like columns with an accent rule
 * (Unify, "Purpose-built for sellers").
 */
export function Privacy() {
  const [tab, setTab] = useState(0)
  const t = TABS[tab]!

  return (
    <section id="privacy" className="scroll-mt-20 px-2 py-2 md:px-3">
      <div className="grain relative overflow-hidden rounded-[28px] bg-night py-20 md:rounded-[36px] md:py-32">
        <Image
          src={forest}
          alt=""
          fill
          placeholder="blur"
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-black/35" />
        <Container className="relative">
          <Reveal className="max-w-[640px] text-white">
            <h2 className="display text-h2">
              Built to be trusted <em className="block">by everyone in the room.</em>
            </h2>
          </Reveal>

          <div role="tablist" aria-label="Privacy" className="mt-12 flex gap-1">
            {TABS.map((x, i) => (
              <button
                key={x.id}
                role="tab"
                aria-selected={tab === i}
                onClick={() => setTab(i)}
                className={cn(
                  "rounded-t-[14px] px-4 py-2.5 text-[13.5px] transition-colors",
                  tab === i ? "bg-white text-ink" : "text-white/75 hover:text-white"
                )}
              >
                {x.label}
              </button>
            ))}
          </div>
          <div
            role="tabpanel"
            key={t.id}
            className="grid gap-10 rounded-[22px] rounded-tl-none bg-white p-7 text-ink animate-in fade-in duration-500 md:grid-cols-12 md:p-12"
          >
            <h3 className="display text-h1 md:col-span-5" style={{ lineHeight: 0.98 }}>
              {t.big}
            </h3>
            <div className="md:col-span-7">
              <p className="max-w-[52ch] text-[16px] leading-[1.6] text-ink-2">{t.lede}</p>
              <div className="mt-9 grid gap-7 sm:grid-cols-3">
                {t.points.map((p) => (
                  <div key={p.title}>
                    <p className="display text-[1.3rem] [--display-leading:1.15]">{p.title}</p>
                    <p className="mt-2 text-[14.5px] leading-[1.55] text-ink-2">{p.body}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Container>
      </div>
    </section>
  )
}
