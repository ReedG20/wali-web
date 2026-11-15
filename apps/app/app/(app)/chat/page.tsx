"use client"

import { useQuery } from "convex/react"
import { Spinner } from "@workspace/ui/components/spinner"
import { api } from "@/lib/convex-api"
import type { Thread } from "@/lib/types"
import { ChatView } from "@/components/chat/chat-view"

/** The home thread: where wali's nudges arrive and where you can always just talk. */
export default function HomeChat() {
  const home = useQuery(api.threads.home) as Thread | null | undefined
  if (!home)
    return (
      <div className="flex flex-1 items-center justify-center text-ink-3">
        <Spinner />
      </div>
    )
  return <ChatView threadId={home._id} />
}
