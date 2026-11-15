import { Closing } from "@/components/site/closing"
import { Faq } from "@/components/site/faq"
import { Hero } from "@/components/site/hero"
import { HowItWorks } from "@/components/site/how-it-works"
import { Interstitial } from "@/components/site/interstitial"
import { Moments } from "@/components/site/moments"
import { Nav } from "@/components/site/nav"
import { Pendant } from "@/components/site/pendant"
import { Privacy } from "@/components/site/privacy"
import { SmoothScroll } from "@/components/site/smooth-scroll"
import { Statement } from "@/components/site/statement"

export default function Page() {
  return (
    <>
      <SmoothScroll />
      <Nav />
      <main>
        <Hero />
        <Statement />
        <Pendant />
        <HowItWorks />
        <Moments />
        <Interstitial />
        <div className="h-24 md:h-36" />
        <Privacy />
        <Faq />
        <Closing />
      </main>
    </>
  )
}
