"use client"

import { useEffect } from "react"
import Lenis from "lenis"

/** Gentle inertial scrolling, off for people who prefer reduced motion. */
export function SmoothScroll() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return

    const lenis = new Lenis({ lerp: 0.11, wheelMultiplier: 0.9 })
    let frame = 0
    const raf = (time: number) => {
      lenis.raf(time)
      frame = requestAnimationFrame(raf)
    }
    frame = requestAnimationFrame(raf)

    // In-page anchors glide instead of jumping.
    const onClick = (e: MouseEvent) => {
      const a = (e.target as HTMLElement).closest<HTMLAnchorElement>(
        'a[href^="#"]'
      )
      if (!a) return
      const id = a.getAttribute("href")!
      const el = id === "#" || id === "#top" ? 0 : document.querySelector(id)
      if (el === null) return
      e.preventDefault()
      lenis.scrollTo(el as HTMLElement | number, { offset: -12, duration: 1.4 })
    }
    document.addEventListener("click", onClick)

    return () => {
      cancelAnimationFrame(frame)
      document.removeEventListener("click", onClick)
      lenis.destroy()
    }
  }, [])

  return null
}
