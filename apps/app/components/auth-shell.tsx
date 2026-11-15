import Image from "next/image"
import { Wordmark } from "@/components/brand"

/** Split sign-in: long-exposure photo with the line, Clerk's form on paper. */
export function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <main className="grid min-h-svh bg-paper lg:grid-cols-[1.1fr_1fr]">
      <section className="relative m-2 hidden overflow-hidden rounded-[36px] lg:block grain">
        <Image src="/images/hero-meadow.jpg" alt="" fill priority className="object-cover" sizes="55vw" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />
        <div className="absolute inset-x-10 bottom-12 text-white">
          <h1 className="display text-[clamp(2.6rem,4.4vw,4.2rem)]">
            A Fitbit for your mind. <em>Quietly listening.</em>
          </h1>
          <p className="mt-4 max-w-[40ch] text-[16px] leading-relaxed text-white/75">
            wali notices who lifts you up, what wears you down, and what you said you&apos;d do.
          </p>
        </div>
      </section>
      <section className="flex flex-col px-5 py-8 md:px-10">
        <Wordmark />
        <div className="flex flex-1 items-center justify-center py-10">{children}</div>
      </section>
    </main>
  )
}
