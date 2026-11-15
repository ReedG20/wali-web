import Image from "next/image"

import studio from "@/public/images/pendant-studio.jpg"
import { Container } from "./primitives"
import { Reveal } from "./reveal"

const SPECS = [
  {
    title: "Wakes for speech",
    body: "It listens for voices and lets silence pass. Quiet hours never leave the pendant.",
  },
  {
    title: "Fine without your phone",
    body: "Phone in another room? It keeps what it hears and catches up when you're back.",
  },
  {
    title: "Knows who's talking",
    body: "Conversations are sorted by speaker, so Mind can tell what you said from what you heard.",
  },
  {
    title: "One press to pause",
    body: "Press once and it stops listening. Press again when you're ready.",
  },
]

/**
 * One object, one photograph: the product image fills the left half and the
 * details sit beside it (Daylight DC-1 product page). Two-tone headline from
 * Fixa. No captions, no rules.
 */
export function Pendant() {
  return (
    <section id="pendant" className="scroll-mt-24 pb-28 md:pb-44">
      <Container className="grid items-center gap-12 md:grid-cols-12 md:gap-10">
        <Reveal className="relative aspect-[4/5] overflow-hidden rounded-[28px] bg-[#e4dfd6] md:col-span-7 md:rounded-[36px]">
          <Image
            src={studio}
            alt="The Mind pendant: a black anodized pebble with a small round microphone grille, hanging from a braided cord."
            fill
            placeholder="blur"
            sizes="(min-width: 768px) 58vw, 100vw"
            className="object-cover object-[50%_40%]"
          />
        </Reveal>

        <div className="md:col-span-5 md:pl-6">
          <Reveal>
            <h2 className="display text-h2">
              Meet the pendant. <em className="block">You just wear it.</em>
            </h2>
            <p className="mt-6 max-w-[40ch] text-[17px] leading-[1.6] text-ink-2">
              A pebble of black anodized aluminum on a braided cord. No screen,
              nothing to tap. It hears the day so your phone can stay in your pocket.
            </p>
          </Reveal>
          <dl className="mt-12 grid gap-8 sm:grid-cols-2 md:grid-cols-1 lg:grid-cols-2 lg:gap-x-8 lg:gap-y-9">
            {SPECS.map((s, i) => (
              <Reveal key={s.title} delay={0.06 * i}>
                <dt className="text-[15.5px] font-semibold">{s.title}</dt>
                <dd className="mt-1.5 text-[15px] leading-[1.55] text-ink-2">{s.body}</dd>
              </Reveal>
            ))}
          </dl>
        </div>
      </Container>
    </section>
  )
}
