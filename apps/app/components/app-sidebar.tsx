"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useMutation, useQuery } from "convex/react"
import { UserButton, useUser } from "@clerk/nextjs"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Activity01Icon,
  AudioWave01Icon,
  Home01Icon,
  Brain02Icon,
  Delete02Icon,
  MoreHorizontalIcon,
  Note01Icon,
  Plug01Icon,
  PlusSignIcon,
  UserMultiple02Icon,
} from "@hugeicons/core-free-icons"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@workspace/ui/components/sidebar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu"
import { cn } from "@workspace/ui/lib/utils"

import { api } from "@/lib/convex-api"
import type { Thread } from "@/lib/types"
import { EmberDot, Wordmark } from "@/components/brand"

const NAV = [
  { href: "/memory", label: "Memory", icon: Brain02Icon },
  { href: "/transcripts", label: "Transcripts", icon: Note01Icon },
  { href: "/voices", label: "Voices", icon: UserMultiple02Icon },
  { href: "/pendant", label: "Pendant", icon: AudioWave01Icon },
  { href: "/connections", label: "Connections", icon: Plug01Icon },
  { href: "/activity", label: "Activity", icon: Activity01Icon },
]

/** Active items sit on a white chip, like the landing nav. */
const chip =
  "h-9 rounded-full px-3 text-[13.5px] text-ink-2 hover:bg-white/60 hover:text-ink data-active:bg-white data-active:text-ink data-active:font-normal data-active:shadow-[0_1px_2px_rgba(0,0,0,0.06)]"

export function AppSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { user } = useUser()
  const threads = (useQuery(api.threads.list) ?? []) as Thread[]
  const devices = (useQuery(api.devices.mine) ?? []) as { status: string }[]
  const createThread = useMutation(api.threads.create)
  const removeThread = useMutation(api.threads.remove)
  const home = threads.find((t) => t.kind === "home")
  const chats = threads.filter((t) => t.kind === "chat")
  const listening = devices.some((d) => d.status === "connected")

  async function newChat() {
    const id = await createThread({})
    router.push(`/chat/${id}`)
  }

  return (
    <Sidebar variant="inset" className="border-none">
      <SidebarHeader className="px-3 pt-4 pb-2">
        <div className="flex items-center justify-between">
          <Link href="/chat" className="rounded-full px-1.5 py-1">
            <Wordmark />
          </Link>
          <span className="flex items-center gap-1.5 text-[12px] text-ink-3" title={listening ? "Pendant connected" : "No pendant connected"}>
            <EmberDot live={listening} />
            {listening ? "Listening" : "Idle"}
          </span>
        </div>
        <button
          onClick={newChat}
          className="mt-4 flex h-10 w-full items-center gap-2 rounded-full bg-ink px-4 text-[13.5px] font-medium text-white transition-transform active:translate-y-px"
        >
          <HugeiconsIcon icon={PlusSignIcon} className="size-4" />
          New chat
        </button>
      </SidebarHeader>

      <SidebarContent className="px-1">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="gap-0.5">
              <SidebarMenuItem>
                <SidebarMenuButton
                  isActive={pathname === "/chat" || (!!home && pathname === `/chat/${home._id}`)}
                  className={chip}
                  render={<Link href="/chat" />}
                >
                  <HugeiconsIcon icon={Home01Icon} className="size-4" />
                  <span>Home</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              {NAV.map((n) => (
                <SidebarMenuItem key={n.href}>
                  <SidebarMenuButton isActive={pathname.startsWith(n.href)} className={chip} render={<Link href={n.href} />}>
                    <HugeiconsIcon icon={n.icon} className="size-4" />
                    <span>{n.label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="px-3 text-[12px] font-normal text-ink-3">Chats</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-0.5">
              {chats.length === 0 && <p className="px-3 py-1.5 text-[13px] text-ink-3">No chats yet</p>}
              {chats.map((t) => (
                <SidebarMenuItem key={t._id}>
                  <SidebarMenuButton
                    isActive={pathname === `/chat/${t._id}`}
                    className={cn(chip, "pr-8")}
                    render={<Link href={`/chat/${t._id}`} />}
                  >
                    <span className="truncate">{t.title}</span>
                  </SidebarMenuButton>
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      render={<SidebarMenuAction showOnHover className="top-1.5 right-1.5 rounded-full" />}
                    >
                      <HugeiconsIcon icon={MoreHorizontalIcon} className="size-4" />
                      <span className="sr-only">More</span>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent side="right" align="start" className="rounded-2xl">
                      <DropdownMenuItem
                        variant="destructive"
                        onClick={async () => {
                          await removeThread({ id: t._id })
                          if (pathname === `/chat/${t._id}`) router.push("/chat")
                        }}
                      >
                        <HugeiconsIcon icon={Delete02Icon} className="size-4" />
                        Delete chat
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="px-3 pb-4">
        <div className="flex items-center gap-2.5 rounded-full bg-white/70 p-1.5 pr-3">
          <UserButton appearance={{ elements: { avatarBox: "size-8" } }} />
          <div className="min-w-0 text-[13px] leading-tight">
            <div className="truncate text-ink">{user?.fullName || user?.firstName || "You"}</div>
            <div className="truncate text-ink-3">{user?.primaryEmailAddress?.emailAddress}</div>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
