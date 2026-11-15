"use client"

import { useRef } from "react"
import Image from "next/image"
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react"

import station from "@/public/images/still-station.jpg"

/**
 * A single still frame that opens up as it scrolls in: the inset photo grows
 * to the page edge and its corners soften (Framer/Webflow "expanding image").
 * Caption with a hairline rule bottom-left (Joby Aviation).
 */
export function Interstitial() {
  const ref = useRef<HTMLElement>(null)
  const reduce = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "start start"] })
  const inset = useTransform(scrollYProgress, [0, 1], reduce ? ["0%", "0%"] : ["7%", "0%"])
  const radius = useTransform(scrollYProgress, [0, 1], reduce ? [32, 32] : [48, 28])
  const imgScale = useTransform(scrollYProgress, [0, 1], reduce ? [1, 1] : [1.18, 1])

  return (
    <section ref={ref} className="px-2 py-2 md:px-3">
      <motion.div
        style={{ marginInline: inset, borderRadius: radius }}
        className="grain relative h-[88svh] min-h-[560px] overflow-hidden bg-night"
      >
        <motion.div style={{ scale: imgScale }} className="absolute inset-0">
          <Image
            src={station}
            alt="A woman stands still with her eyes closed while commuters blur past her in a busy station."
            fill
            placeholder="blur"
            sizes="100vw"
            className="object-cover object-[50%_40%]"
          />
        </motion.div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/5 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 grid gap-6 p-6 text-white md:grid-cols-12 md:p-12">
          <h2 className="display text-h2 md:col-span-7">
            The day won&rsquo;t slow down. <em className="block">You can still notice it.</em>
          </h2>
          <p className="max-w-[34ch] self-end text-[15px] leading-[1.6] text-white/80 md:col-span-4 md:col-start-9">
            wali won&rsquo;t make life quieter. It keeps the parts that mattered,
            and hands them back when they&rsquo;re useful.
          </p>
        </div>
      </motion.div>
    </section>
  )
}
