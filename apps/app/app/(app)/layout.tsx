import { redirect } from "next/navigation"
import { auth } from "@clerk/nextjs/server"
import { SidebarInset, SidebarProvider } from "@workspace/ui/components/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { EnsureUser } from "@/components/ensure-user"

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const { userId } = await auth()
  if (!userId) redirect("/sign-in")
  return (
    <EnsureUser>
      <SidebarProvider className="h-svh overflow-hidden bg-sidebar">
        <AppSidebar />
        <SidebarInset className="h-svh min-h-0 overflow-y-auto overscroll-contain bg-paper md:h-[calc(100svh-1rem)] md:rounded-[28px] md:shadow-[0_1px_2px_rgba(0,0,0,0.04),0_20px_60px_-40px_rgba(0,0,0,0.35)]">
          {children}
        </SidebarInset>
      </SidebarProvider>
    </EnsureUser>
  )
}
