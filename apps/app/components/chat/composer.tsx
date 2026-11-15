"use client"

import { useRef, useState } from "react"
import { useAction } from "convex/react"
import { api } from "@/lib/convex-api"
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowUp02Icon } from "@hugeicons/core-free-icons"
import { cn } from "@workspace/ui/lib/utils"

let lastWarm = 0

/** A rounded white card with the send button tucked inside (design brief: inputs are pills/cards). */
export function Composer({
  onSend,
  disabled,
  placeholder = "Talk to wali…",
  autoFocus,
}: {
  onSend: (text: string) => Promise<void> | void
  disabled?: boolean
  placeholder?: string
  autoFocus?: boolean
}) {
  const [value, setValue] = useState("")
  const ref = useRef<HTMLTextAreaElement>(null)
  const warmAction = useAction(api.agentNode.warm)
  // Wake the agent runtime while you type, so the reply isn't waiting on a cold start.
  const warm = () => {
    const now = Date.now()
    if (now - lastWarm < 120_000) return
    lastWarm = now
    void warmAction({}).catch(() => {})
  }
  const canSend = value.trim().length > 0 && !disabled

  async function submit() {
    if (!canSend) return
    const text = value
    setValue("")
    requestAnimationFrame(() => ref.current && (ref.current.style.height = "auto"))
    await onSend(text)
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        void submit()
      }}
      className="soft-card flex items-end gap-2 rounded-[26px] p-2 pl-5 transition-shadow focus-within:shadow-[0_1px_2px_rgba(0,0,0,0.05),0_22px_50px_-28px_rgba(0,0,0,0.45)]"
    >
      <textarea
        ref={ref}
        rows={1}
        autoFocus={autoFocus}
        value={value}
        placeholder={placeholder}
        onFocus={warm}
        onChange={(e) => {
          warm()
          setValue(e.target.value)
          e.target.style.height = "auto"
          e.target.style.height = `${Math.min(e.target.scrollHeight, 220)}px`
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
            e.preventDefault()
            void submit()
          }
        }}
        className="max-h-[220px] min-h-[24px] flex-1 resize-none bg-transparent py-2 text-[15.5px] leading-6 text-ink outline-none placeholder:text-ink-3"
      />
      <button
        type="submit"
        disabled={!canSend}
        aria-label="Send"
        className={cn(
          "flex size-10 shrink-0 items-center justify-center rounded-full bg-ink text-white transition-all active:translate-y-px",
          !canSend && "bg-ink/15 text-ink-3"
        )}
      >
        <HugeiconsIcon icon={ArrowUp02Icon} className="size-[18px]" />
      </button>
    </form>
  )
}
