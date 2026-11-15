# Mind: design brief

The look and feel shared by every Mind surface: the landing page, the web app and the iOS app. For section-by-section landing notes, see `apps/landing/DESIGN.md`.

## Aesthetic

Mind should feel **warm, grounded, calm and spacious**. Think of a well-made physical object photographed in late light, not a tech dashboard.

- **Photography leads.** Large, full-bleed or generously rounded images carry the mood. The interface around them stays quiet.
- **Quiet over clever.** Every element needs a job. Leave out decorative eyebrows, mono labels, figure captions, dividers, dashed rules and accent borders. Hierarchy comes from type size and space.
- **Space is the luxury.** Sections breathe (about 120–190px of vertical padding on desktop). One idea per screen.
- **Soft and rounded.** Big radii, pill controls, no sharp corners and no hard shadows.
- **Human, not clinical.** This is a mental-wellbeing product, so it should never feel like surveillance or a medical device. Warm neutrals, soft serif type, real moments.

**References:** Wispr Flow, Lassie, Waabi, Daylight, Fixa, Unify and TinyWins (on Mobbin).

**Avoid:** purple or blue tech gradients, glassmorphism everywhere, emoji icons, rows of three identical icon cards, and stock-looking "person smiling at laptop" photos.

## Colour

The palette is warm neutrals. There is one accent, and it is used sparingly.

| Token | Hex | Role |
|---|---|---|
| `paper` | `#F6F4EF` | Page background |
| `paper-2` | `#ECE9E2` | Recessed panels and large tinted sections |
| `card` | `#FFFFFF` | Cards, inputs, FAQ items, popovers |
| `ink` | `#161513` | Primary text, primary buttons |
| `ink-2` | `#5A564E` | Secondary text, body copy under headlines |
| `ink-3` | `#9A958B` | Tertiary text, timestamps, inactive list items |
| `line` | `#161513` at 9% | Only where a boundary is truly needed (input outlines) |
| `night` | `#12110F` | Dark sections and the footer |
| `ember` | `#D27A33` | The single accent. Use it for "live" states (the listening dot, the pendant light) and text selection at 25% |

**Text on dark surfaces and photos:** white at 90% for body text, 75% for secondary and 40% for tertiary.

**Rules**
- Ember never appears as a large fill, a border or a gradient. It marks something that is happening now.
- Never use pure black (`#000`) or a cool grey. Every neutral leans warm.
- Colour comes mostly from photography. The UI itself stays near-monochrome.

## Typography

| Role | Face | Settings |
|---|---|---|
| Display (headlines, big statements, wordmark) | **Fraunces** | Weight 340, SOFT 100, WONK 0, tracking −0.03em, line-height 1.0, optical sizing on, `text-wrap: balance` |
| Emphasis inside a headline | Fraunces *italic* | Same weight, SOFT 100, WONK 1 |
| Body and UI | **Figtree** | 400 for text, 500–600 for labels and buttons |

**Scale** (fluid, desktop max):

| Style | Size | Use |
|---|---|---|
| Hero | 48 → 116px | One per page |
| H1 | 42 → 88px | Section-opening statements |
| H2 | 34 → 64px | Section headings |
| Lede | 25 → 42px | Large display-set paragraphs |
| H3 | 26 → 38px | Card and step titles |
| Body large | 17–18px / 1.55–1.6 | Under headlines |
| Body | 15–16px / 1.6 | Default text |
| Small | 12–13.5px | Meta, buttons, nav |

**Headline pattern:** a plain statement, then an emphasised italic phrase, often on its own line. For example: "Meet the pendant. *You just wear it.*"

**Do not use:** monospace type, all-caps labels, letter-spaced eyebrows or more than two families.

## Layout and spacing

- **Container:** max width 1360px, with 20px side padding on mobile and 40px on desktop. Use a 12-column grid.
- **Reading width:** body copy at 34–52ch. Large paragraphs at most about 1080px.
- **Spacing:** sections about 120–190px apart on desktop, 96–128px on mobile. Inside a section, 48–80px between the heading and the content.
- **Inset frames:** full-bleed images and tinted panels sit 8–12px in from the page edge so the paper shows around them.
- **Mobile:** must work at 390px wide with no sideways page scroll. Card rows become horizontal snap-scrollers.

## Shape and surfaces

| Element | Radius |
|---|---|
| Large photo frames and section panels | 28px mobile / 36px desktop |
| Photo cards | 24px |
| Small UI cards (notifications, approvals) | 18–22px |
| FAQ items and inputs | 18px / pill |
| Buttons, chips, nav | Fully round (pill) |

**Surfaces:**
- **Paper:** the page background.
- **paper-2 panels:** grouped content.
- **White cards:** anything you read or interact with.
- **Frosted white:** cards floating over photography. White at 88% with a 20px backdrop blur and a soft, wide shadow (`0 24px 60px -24px rgb(0 0 0 / .5)`).

**Depth:** soft and diffuse only. Never use hard, tight or coloured shadows. Borders are almost never used; use a 5–7% ink ring when an edge must be defined.

## Components

- **Buttons:** pill-shaped, 36–44px tall.
  - **Primary:** ink fill with white text, or cream `#FBF7EE` on photos.
  - **Secondary:** a 6% ink tint, or frosted dark with a 25% white ring on photos.
  - No outlined buttons.
- **Inputs:** a pill, with the submit button tucked inside on the right.
- **Nav:** a floating, centred segmented pill (tinted, blurred). The logo and the active item sit on white chips, and a single ink pill on the right is the call to action.
- **Notification card:** this is how Mind speaks, and it is the core UI object. It has three parts: a header row (Mind glyph, "Mind", timestamp on the right), one or two sentences of plain, specific text, and up to two pill actions (primary ink, secondary tint).
- **Approval card:** the same anatomy, with "Needs your OK" in the header and Approve / Edit actions.
- **Lists that track scroll:** only the active item is full ink; the rest drop to about 20% ink.
- **Accordion:** separate white cards with a small gap between them, not a bordered stack.

## Photography

There are two registers, and both share warm, filmic colour (Portra-like), soft grain and natural light.

1. **Mood (long exposure / motion):** painterly motion blur and long exposures of nature or people. Examples: grass streaking in wind, misty water, a forest from a moving train, one still person in a blurred crowd. Use these for heroes, backgrounds and transitions. This is the signature look.
2. **Moments (documentary):** candid 35mm scenes of real life. Examples: friends laughing at a kitchen table, scrolling late at night, a record shop. Nobody looks at the camera, nothing is posed, and phone screens are hidden.

**Rules**
- Leave negative space for type. When text sits on a photo, use a soft gradient or radial shade, never a box.
- **The product:** a black, bead-blasted anodized aluminum pebble with a 9-hole microphone grille and a thin bright chamfer, on a black braided cord. The approved reference is `~/Projects/mind/brand/pendant-reference.png`, and every image showing the pendant must match it.
- Show the product once per context. Don't show the same object several times side by side.
- Avoid stock-feeling setups such as posed smiles, people staring off by windows or generic office scenes.

## Motion

Motion should be slow, smooth and physical. Nothing bounces and nothing flashes.

- **Scrolling:** smooth scroll with Lenis (lerp about 0.11).
- **Scroll-linked effects:** gentle parallax on photos (10–15%); the hero shrinks into a rounded card as you leave it; words fill from faint to ink as a statement scrolls past; images open up to the page edge.
- **Entrances:** a 24px rise and fade over 0.9s with `cubic-bezier(.22,1,.36,1)`, staggered by 60–80ms.
- **Ambient:** reserve this for "live" signals, such as the listening waveform and the pulsing ember dot.
- **Reduced motion:** always respect `prefers-reduced-motion`.

## Voice (for UI and marketing copy)

Quiet, specific and kind. Use short sentences and concrete examples rather than adjectives. For example: "You've been on TikTok for 52 minutes. Want to finish the chapter you started Tuesday?" Never use hype ("unlock", "supercharge", "revolutionary") and never guilt the reader.
