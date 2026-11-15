"use client"

import { useEffect, useRef, useState } from "react"

/**
 * Reveal streamed text at a steady typing pace. Models (and our Convex writes) deliver text in
 * uneven bursts; this eases the visible text toward the latest target every animation frame:
 * slow and even when it's close behind, faster when a big burst lands, so it never lags far.
 *
 * Only animates messages that were streaming while on screen. History renders instantly.
 */
export function useSmoothText(target: string, streaming: boolean) {
  const animate = useRef(streaming)
  if (streaming) animate.current = true
  const [shown, setShown] = useState(() => (streaming ? 0 : target.length))
  const shownRef = useRef(shown)

  useEffect(() => {
    if (!animate.current) {
      shownRef.current = target.length
      setShown(target.length)
      return
    }
    if (typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      shownRef.current = target.length
      setShown(target.length)
      return
    }
    let raf = 0
    let last = performance.now()
    const tick = (now: number) => {
      const dt = Math.min(64, now - last)
      last = now
      const backlog = target.length - shownRef.current
      if (backlog <= 0) return
      // ~90 chars/s baseline, speeding up to clear larger bursts within about half a second.
      const perMs = Math.max(0.09, backlog / 450)
      const next = Math.min(target.length, shownRef.current + Math.max(1, Math.round(perMs * dt)))
      shownRef.current = next
      setShown(next)
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [target])

  const visible = target.slice(0, shown)
  return { text: visible, typing: shown < target.length }
}
