"use client"

import { use } from "react"
import type { GenericId as Id } from "convex/values"
import { ChatView } from "@/components/chat/chat-view"

export default function ThreadPage({ params }: { params: Promise<{ threadId: string }> }) {
  const { threadId } = use(params)
  return <ChatView threadId={threadId as Id<"threads">} />
}
