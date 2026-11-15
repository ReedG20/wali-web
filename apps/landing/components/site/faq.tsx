import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@workspace/ui/components/accordion"

import { Container } from "./primitives"
import { Reveal } from "./reveal"

const FAQS = [
  {
    q: "Is it recording all the time?",
    a: "It listens all day but only keeps speech. It wakes when someone talks, keeps a second of lead-in, and stops a few seconds after the room goes quiet. Silence is never stored or sent.",
  },
  {
    q: "Do I need my phone with me?",
    a: "No. If your phone is out of range, the pendant holds on to what it hears and catches up the moment you're back together.",
  },
  {
    q: "What does wali do with what it hears?",
    a: "Conversations become private transcripts, sorted by speaker. wali reads them to learn your people, plans and patterns, then turns that into a few well-timed nudges.",
  },
  {
    q: "Will it do things without asking?",
    a: "Only small, reversible things you've allowed, like adding a reminder. Anything that sends a message, spends money or involves another person waits for your OK.",
  },
  {
    q: "How do I pause it?",
    a: "Press the pendant once. It stops listening until you press it again.",
  },
  {
    q: "When can I get one?",
    a: "We're building the first batch now. Join the waitlist and you'll hear from us first. No spam, just the news.",
  },
]

/** Centered heading over separate white question cards on paper (Lassie, Fixa). */
export function Faq() {
  return (
    <section id="faq" className="py-28 md:py-40">
      <Container className="max-w-[820px]">
        <Reveal className="text-center">
          <h2 className="display text-h2">Questions</h2>
        </Reveal>
        <Reveal delay={0.08} className="mt-12">
          <Accordion className="gap-2 overflow-visible rounded-none border-0">
            {FAQS.map((f) => (
              <AccordionItem
                key={f.q}
                value={f.q}
                className="rounded-[18px] border-0 bg-white not-last:border-b-0 data-open:bg-white"
              >
                <AccordionTrigger className="px-6 py-5 text-[15.5px] hover:no-underline">
                  {f.q}
                </AccordionTrigger>
                <AccordionContent className="px-2 pb-6 text-[15px] leading-[1.65] text-ink-2">
                  {f.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </Reveal>
      </Container>
    </section>
  )
}
