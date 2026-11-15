import { Figtree, Fraunces } from "next/font/google"

/** Display: Fraunces with the SOFT axis maxed. Body: Figtree. */

export const fraunces = Fraunces({
  subsets: ["latin"],
  style: ["normal", "italic"],
  axes: ["SOFT", "WONK", "opsz"],
  variable: "--ff-display",
})

export const figtree = Figtree({
  subsets: ["latin"],
  variable: "--ff-body",
})

export const fontVariables = `${fraunces.variable} ${figtree.variable}`
