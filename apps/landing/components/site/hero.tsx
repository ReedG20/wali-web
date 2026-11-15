"use client"

import { useRef } from "react"
import Image from "next/image"
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react"

import heroImg from "@/public/images/hero-meadow.jpg"

/**
 * Wispr Flow's hero, closely: a motion-blurred photograph of someone moving
 * through tall grass, one short centred serif line, two lines of support,
 * two pill buttons and a single quiet line under them. On scroll it settles
 * into a rounded card (TinyWins, Lassie).
 */
export function Hero() {
  const ref = useRef<HTMLElement>(null)
  const reduce = useReducedMotion()
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  })
  const imgY = useTransform(scrollYProgress, [0, 1], ["0%", reduce ? "0%" : "12%"])
  const copyY = useTransform(scrollYProgress, [0, 1], ["0%", reduce ? "0%" : "-22%"])
  const copyOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0])
  const cardScale = useTransform(scrollYProgress, [0, 1], [1, reduce ? 1 : 0.9])
  const cardRadius = useTransform(scrollYProgress, [0, 0.4], [0, reduce ? 0 : 40])

  return (
    <section id="top" ref={ref} className="relative">
      <motion.div
        style={{ scale: cardScale, borderRadius: cardRadius }}
        className="grain relative h-svh min-h-[640px] origin-top overflow-hidden bg-[#3a3424] will-change-transform"
      >
        <motion.div style={{ y: imgY }} className="absolute inset-0 scale-[1.06] will-change-transform">
          <Image
            src={heroImg}
            alt="Someone runs through tall golden grass under a blue sky, blurred with movement."
            fill
            priority
            placeholder="blur"
            sizes="100vw"
            className="object-cover object-[42%_50%]"
          />
        </motion.div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_48%,rgb(0_0_0/0.32),transparent_62%)]" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/30" />

        <motion.div
          style={{ y: copyY, opacity: copyOpacity }}
          className="relative z-10 flex h-full flex-col items-center justify-center px-6 pt-10 text-center text-white"
        >
          <h1 className="display text-hero max-w-[13ch] [text-shadow:0_2px_40px_rgb(0_0_0/0.25)]">
            A Fitbit for your <em>mind.</em>
          </h1>
          <p className="mt-6 max-w-[44ch] text-[16.5px] leading-[1.55] text-white/90 md:text-[18px]">
            A small pendant that listens through your day, then helps you notice
            what lifts you up, what wears you down, and what you said you&rsquo;d do.
          </p>
          <div className="mt-9 flex flex-wrap items-center justify-center gap-2.5">
            <a
              href="#waitlist"
              className="flex h-11 items-center rounded-full bg-[#fbf7ee] px-5 text-[14.5px] font-medium text-ink shadow-[0_8px_24px_-12px_rgba(0,0,0,0.5)] transition-transform active:translate-y-px"
            >
              Join the waitlist
            </a>
            <a
              href="#how"
              className="frost-dark flex h-11 items-center rounded-full px-5 text-[14.5px] font-medium text-white ring-1 ring-white/25 transition-transform active:translate-y-px"
            >
              See how it works
            </a>
          </div>
          <p className="mt-5 text-[13px] text-white/75">Pairs with iPhone</p>
        </motion.div>
      </motion.div>
    </section>
  )
}
