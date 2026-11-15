"use client"

import { useRef } from "react"
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
  type MotionValue,
} from "motion/react"

import { Container } from "./primitives"

const TEXT =
  "Your body has had trackers for years. Your mind has had nothing. Meet wali, a pendant you wear on a cord. It listens through the day, to the conversations, the plans you make out loud and the small things you'd otherwise forget, and turns them into a quiet read on how you're actually doing."

/** Scroll-scrubbed reading (Waabi): each word fills from faint to ink. */
export function Statement() {
  const ref = useRef<HTMLParagraphElement>(null)
  const reduce = useReducedMotion()
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 0.85", "end 0.5"],
  })
  const words = TEXT.split(" ")

  return (
    <section className="py-32 md:py-48">
      <Container className="max-w-[1080px]">
        <p ref={ref} className="display text-lede" style={{ lineHeight: 1.2 }}>
          {words.map((w, i) => (
            <Word
              key={i}
              progress={scrollYProgress}
              range={[i / words.length, (i + 1) / words.length]}
              still={!!reduce}
            >
              {w}
            </Word>
          ))}
        </p>
      </Container>
    </section>
  )
}

function Word({
  children,
  progress,
  range,
  still,
}: {
  children: string
  progress: MotionValue<number>
  range: [number, number]
  still: boolean
}) {
  const opacity = useTransform(progress, range, [0.16, 1])
  return (
    <>
      <motion.span style={{ opacity: still ? 1 : opacity }}>{children}</motion.span>{" "}
    </>
  )
}
