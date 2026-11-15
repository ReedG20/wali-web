import Image from "next/image"

import lake from "@/public/images/closing-lake.jpg"
import { Container, MindGlyph } from "./primitives"
import { WaitlistForm } from "./waitlist-form"

/**
 * Closing frame: a photograph with the line and the email pill set along its
 * darker lower edge (Lassie, Waabi), then a dark rounded footer card that
 * tucks under an oversized fading line (Fixa) and ends on a cropped giant
 * wordmark (Waabi, TinyWins).
 */
export function Closing() {
  return (
    <>
      <section id="waitlist" className="scroll-mt-4 px-2 md:px-3">
        <div className="grain relative h-[92svh] min-h-[620px] overflow-hidden rounded-[28px] md:rounded-[36px]">
          <Image
            src={lake}
            alt="A lone figure stands at the edge of a still lake under a streaked violet dusk sky."
            fill
            placeholder="blur"
            sizes="100vw"
            className="object-cover object-[60%_50%]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent" />
          <div className="relative flex h-full flex-col justify-end gap-8 p-6 text-white pb-24 md:flex-row md:items-end md:justify-between md:p-12">
            <div>
              <h2 className="display text-h1 max-w-[10ch]">
                Start with a <em className="block">quieter day.</em>
              </h2>
            </div>
            <div className="flex w-full max-w-[420px] flex-col gap-3">
              <WaitlistForm tone="glass" id="closing-waitlist" />
              <p className="pl-5 text-[13px] text-white/75">
                The first batch goes to the waitlist. One email when it&rsquo;s ready.
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="relative mt-24 overflow-hidden md:mt-36">
        <p
          aria-hidden
          className="display pointer-events-none text-center text-[clamp(3.5rem,11vw,11rem)] text-transparent select-none"
          style={{
            lineHeight: 0.92,
            backgroundImage:
              "linear-gradient(to bottom, var(--ink) 0%, var(--ink) 45%, rgb(22 21 19 / 0) 92%)",
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
          }}
        >
          A clearer head,
          <br />
          every day.
        </p>

        <footer className="relative -mt-[clamp(2rem,5vw,5rem)] mx-2 mb-2 overflow-hidden rounded-[28px] bg-night text-white md:mx-3 md:mb-3 md:rounded-[36px]">
          <Container className="grid gap-12 pt-14 pb-10 md:grid-cols-12 md:pt-20">
            <div className="md:col-span-5">
              <p className="flex items-center gap-2 text-[15px] font-medium [--glyph-ink:var(--night)]">
                <MindGlyph className="size-6 text-white" /> Mind
              </p>
              <p className="mt-6 max-w-[34ch] text-[15px] leading-[1.6] text-white/60">
                A pendant that listens through your day and helps you understand it.
                Made by a small team who wanted one.
              </p>
            </div>
            <nav className="grid grid-cols-2 gap-8 text-[14px] md:col-span-4 md:col-start-7">
              <div className="flex flex-col gap-2.5">
                <p className="mb-1 text-white/40">Product</p>
                <a href="#pendant" className="text-white/85 hover:text-white">The pendant</a>
                <a href="#how" className="text-white/85 hover:text-white">How it works</a>
                <a href="#moments" className="text-white/85 hover:text-white">Moments</a>
              </div>
              <div className="flex flex-col gap-2.5">
                <p className="mb-1 text-white/40">Company</p>
                <a href="#privacy" className="text-white/85 hover:text-white">Privacy</a>
                <a href="#faq" className="text-white/85 hover:text-white">Questions</a>
                <a href="#waitlist" className="text-white/85 hover:text-white">Waitlist</a>
              </div>
            </nav>
            <div className="text-[13px] text-white/40 md:col-span-2 md:col-start-11 md:text-right">
              © {new Date().getFullYear()} Mind
            </div>
          </Container>
          <p
            aria-hidden
            className="display pointer-events-none -mb-[0.24em] px-3 text-center text-[clamp(7rem,30vw,30rem)] text-white/[0.07] select-none"
            style={{ lineHeight: 0.8, letterSpacing: "-0.05em", textTransform: "none" }}
          >
            mind
          </p>
        </footer>
      </div>
    </>
  )
}
