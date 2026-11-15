"use client"

import { useEffect, useState } from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  ArrowExpand01Icon,
  ArrowShrink01Icon,
  Cancel01Icon,
  CursorPointer02Icon,
  LinkSquare02Icon,
  ViewIcon,
} from "@hugeicons/core-free-icons"
import { Spinner } from "@workspace/ui/components/spinner"
import { cn } from "@workspace/ui/lib/utils"

import type { BrowserTask } from "@/lib/types"
import { EmberDot } from "@/components/brand"
import { Markdown } from "@/components/markdown"

export function isBrowserTaskActive(t: BrowserTask) {
  return t.status === "starting" || t.status === "running"
}

const ENDED: Record<string, string> = {
  completed: "Finished",
  failed: "Didn't finish",
  cancelled: "Stopped",
}

const ICON_BUTTON =
  "flex size-8 shrink-0 items-center justify-center rounded-full text-ink-2 transition-colors hover:bg-black/[0.05] hover:text-ink"

/*
 * The frame is sized to what Browser Use's live viewer actually draws, so there is no dead band
 * under the page: about 88px of tabs and address bar, then a page roughly 2.39 times as wide as it
 * is tall (measured on a live run). The small view renders at half scale, hence 44px. If the
 * viewer ever changes shape it letterboxes inside the frame rather than breaking.
 */
const FRAME_BIG = "h-[calc(88px+100cqw/2.39)] rounded-[18px]"
const FRAME_SMALL = "h-[calc(44px+100cqw/2.39)] rounded-[14px]"

/**
 * wali's cloud browser, live, floating over the corner of the chat like a picture-in-picture
 * window. It is small and watch-only by default; expanding it gives a larger overlay where
 * "Take control" hands you the mouse and keyboard.
 */
export function BrowserPanel({
  task,
  onClose,
}: {
  task: BrowserTask
  onClose: () => void
}) {
  const active = isBrowserTaskActive(task)
  const live = active && !!task.liveUrl
  const [expanded, setExpanded] = useState(false)
  const [control, setControl] = useState(false)
  const driving = expanded && control

  // A new task starts small; a new task, or going back to the small view, is watch-only again.
  useEffect(() => setExpanded(false), [task._id])
  useEffect(() => setControl(false), [task._id, expanded])

  // The live view normally shows up a few seconds in. If it hasn't after a while, say so plainly
  // instead of spinning for the whole run: the task itself is still going.
  const waiting = active && !live
  const [gaveUp, setGaveUp] = useState(false)
  useEffect(() => {
    setGaveUp(false)
    if (!waiting) return
    const t = setTimeout(() => setGaveUp(true), 25_000)
    return () => clearTimeout(t)
  }, [task._id, waiting])

  return (
    <aside
      aria-label="wali's browser"
      className={cn(
        "panel-in absolute z-20 flex flex-col overflow-hidden bg-white shadow-[0_1px_2px_rgb(0_0_0/0.04),0_18px_44px_-30px_rgb(0_0_0/0.32)] outline outline-1 outline-[rgb(22_21_19/0.07)]",
        expanded
          ? "top-2 right-2 max-h-[calc(100%-1rem)] w-[min(780px,calc(100%-1rem))] rounded-[24px]"
          : "top-16 right-3 w-[min(380px,calc(100%-1.5rem))] rounded-[20px]"
      )}
    >
      <header
        className={cn(
          "flex shrink-0 items-center gap-2",
          expanded ? "h-14 pr-3 pl-5" : "h-11 pr-1.5 pl-4"
        )}
      >
        <div
          className="flex min-w-0 flex-1 items-center gap-2 text-[13.5px]"
          aria-live="polite"
        >
          {active && <EmberDot />}
          <h2 className="text-ink truncate font-medium">wali&apos;s browser</h2>
          <span className="text-ink-3 shrink-0">
            {live
              ? "Live"
              : active
                ? gaveUp
                  ? "Working"
                  : "Starting"
                : (ENDED[task.status] ?? task.status)}
          </span>
        </div>

        {expanded && live && (
          <button
            onClick={() => setControl((c) => !c)}
            aria-pressed={control}
            className={cn(
              "flex h-8 shrink-0 items-center gap-1.5 rounded-full px-3 text-[12.5px] font-medium transition-colors active:translate-y-px",
              control
                ? "bg-ink text-white"
                : "text-ink bg-black/[0.06] hover:bg-black/[0.09]"
            )}
          >
            <HugeiconsIcon
              icon={control ? ViewIcon : CursorPointer02Icon}
              className="size-3.5"
            />
            {control ? "Just watch" : "Take control"}
          </button>
        )}
        {expanded && live && (
          <a
            href={task.liveUrl}
            target="_blank"
            rel="noreferrer"
            aria-label="Open in a new tab"
            title="Open in a new tab"
            className={ICON_BUTTON}
          >
            <HugeiconsIcon icon={LinkSquare02Icon} className="size-4" />
          </a>
        )}
        <button
          onClick={() => setExpanded(!expanded)}
          aria-label={
            expanded ? "Make the browser small" : "Make the browser bigger"
          }
          title={expanded ? "Smaller" : "Bigger"}
          className={ICON_BUTTON}
        >
          <HugeiconsIcon
            icon={expanded ? ArrowShrink01Icon : ArrowExpand01Icon}
            className="size-4"
          />
        </button>
        <button
          onClick={onClose}
          aria-label="Close browser"
          title="Close"
          className={ICON_BUTTON}
        >
          <HugeiconsIcon icon={Cancel01Icon} className="size-4" />
        </button>
      </header>

      <div className={cn("@container", expanded ? "mx-3" : "mx-2 mb-2")}>
        <div
          className={cn(
            "bg-paper-2 relative overflow-hidden ring-1 ring-black/[0.06]",
            expanded ? FRAME_BIG : FRAME_SMALL
          )}
        >
          {live ? (
            <>
              {/* Watch-only is a UI guard (inert + no pointer events), as Browser Use's docs suggest. */}
              <div inert={!driving} className="h-full">
                <iframe
                  key={task.liveUrl}
                  src={task.liveUrl}
                  title="Live view of wali's browser"
                  tabIndex={driving ? 0 : -1}
                  allow={
                    driving
                      ? "autoplay; clipboard-read; clipboard-write"
                      : "autoplay"
                  }
                  referrerPolicy="no-referrer"
                  className={cn(
                    "border-0",
                    !driving && "pointer-events-none",
                    // Small view: lay the page out at twice the size and scale it down, so it reads as a
                    // real browser window in miniature rather than a cramped phone-width page.
                    expanded
                      ? "h-full w-full"
                      : "h-[200%] w-[200%] origin-top-left scale-50"
                  )}
                />
              </div>
              {!expanded && (
                <button
                  onClick={() => setExpanded(true)}
                  aria-label="Make the browser bigger"
                  className="absolute inset-0 cursor-zoom-in"
                />
              )}
            </>
          ) : active ? (
            <div className="flex h-full flex-col items-center justify-center gap-2.5 px-6 text-center">
              <Spinner className="text-ink-3 size-5" />
              <p className="text-ink-2 max-w-[30ch] text-[13.5px] leading-relaxed">
                {gaveUp
                  ? "wali is working in the browser. There's no live view for this one; the result will land in the chat."
                  : "Opening the browser…"}
              </p>
            </div>
          ) : (
            <div
              className={cn(
                "h-full overflow-y-auto",
                expanded ? "px-6 py-7 sm:px-8" : "px-4 py-4"
              )}
            >
              <p
                className={cn(
                  "display text-ink",
                  expanded ? "text-[26px]" : "text-[20px]"
                )}
              >
                {task.status === "completed" ? (
                  <>
                    All done.{" "}
                    <em className="text-ink-2">Here&apos;s what it found.</em>
                  </>
                ) : (
                  (ENDED[task.status] ?? "Ended")
                )}
              </p>
              {task.status === "completed" ? (
                task.result && (
                  <Markdown
                    className={cn(expanded ? "mt-4" : "mt-2.5 text-[13.5px]")}
                  >
                    {task.result}
                  </Markdown>
                )
              ) : (
                <p
                  className={cn(
                    "text-ink-2 leading-relaxed",
                    expanded ? "mt-3 text-[14.5px]" : "mt-2 text-[13.5px]"
                  )}
                >
                  {task.error ?? "The browser closed before the task was done."}
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {expanded && (
        <p
          className="text-ink-2 line-clamp-2 shrink-0 px-5 pt-3 pb-4 text-[13px] leading-relaxed"
          title={task.task}
        >
          {task.task}
        </p>
      )}
    </aside>
  )
}
