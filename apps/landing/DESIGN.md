# wali landing: design notes

Run `bun run dev` from `web/`, or `bunx next dev -p 3100` from here.

## Type

- **Display:** Fraunces, with the SOFT axis at 100, weight 340, tracking −0.03em. Italics use WONK 1 for the emphasised phrase.
- **Body:** Figtree.

Every headline uses the `.display` class (`app/landing.css`), so retuning the face happens in one place. There are no mono labels or eyebrows on purpose: headings carry the hierarchy on their own.

## Tokens

- **Colours:** paper `#f6f4ef`, panels `#ece9e2`, ink `#161513`. Ember `#d27a33` is used only for the "listening" dot.
- **Shape:** photo frames have a 24–36px radius, and buttons and inputs are pills (shadcn `base-luma` preset).
- **Lines:** there are no hairlines or rules between content.

## Sections and their references (Mobbin)

- **Hero:** copied from [Wispr Flow](https://mobbin.com/sites/sections/cc8c2464-444f-40ff-bf96-bf01f747311d): a motion-blurred person in golden grass, a short centred serif line, two lines of support, two pill buttons and one quiet line under them. As you scroll, it shrinks into a rounded card ([TinyWins](https://mobbin.com/sites/sections/eb379572-6bc5-4f91-8ad9-ef6a2ff09f11), Lassie).
- **Nav:** a segmented pill with white chips for the logo and the active section ([Lassie](https://mobbin.com/sites/sections/dcaae0e2-5def-449a-b47b-5eb5bd001b17)).
- **Statement:** a paragraph whose words fill from faint to ink as you scroll ([Waabi](https://mobbin.com/sites/sections/d53933f1-ffc4-49f0-835e-c69ad731aab2)).
- **Pendant:** one product photo with the details beside it ([Daylight DC-1](https://mobbin.com/sites/sections/89ed61e7-de0b-49f4-ab94-b5a54d43cc7a)), and a two-tone headline ([Fixa](https://mobbin.com/sites/sections/920d0adb-7d8b-4531-9659-faa024c815f8)).
- **How it works:** long-exposure nature photos, each carrying one small piece of the real interface: listening, a transcript, memory and an approval ([Lassie](https://mobbin.com/sites/sections/310955c5-6f5c-44eb-bb3c-ca0362b77008) for both the cards and the working card over a blurred photo).
- **Moments:** a sticky list where only the active line is in ink ([TinyWins](https://mobbin.com/sites/sections/4a062c21-fa0d-47a8-a21b-70c2736b1cf0)), next to photos with wali notifications ([Lassie](https://mobbin.com/sites/sections/926d3a62-6a96-40d0-9c46-4965679df3c7), [Fixa](https://mobbin.com/sites/sections/3b3c2b66-b096-4752-aa90-29d318ec9568)).
- **Interstitial:** a long-exposure still that opens up to the page edge as you scroll ([Joby Aviation](https://mobbin.com/sites/sections/a08c6ac3-f624-4958-8d27-e175e0b8688d) caption placement).
- **Privacy:** a motion-blurred forest as the background, tabs, and a white card ([Unify](https://mobbin.com/sites/sections/571e65ed-4308-4480-80f0-a7bfae6f2ed5)).
- **FAQ:** separate white question cards on paper ([Lassie](https://mobbin.com/sites/sections/16821f81-24d8-4b62-8db0-f23c5ecb31a8)).
- **Closing and footer:** a long-exposure dusk lake with the waitlist field, then an oversized fading line behind a dark footer card ([Fixa](https://mobbin.com/sites/sections/eb5a6b83-775a-4d58-bfa4-208d6182adcf)) and a giant cropped wordmark ([Waabi](https://mobbin.com/sites/sections/0a5ddbbe-f22e-41e4-8087-f30b36c79ac5)).

## Photography

- **Direction:** long exposure and motion blur (painterly nature, a still figure in a moving crowd) for mood, and warm 35mm documentary for the people in Moments.
- **Product shots:** every shot of the pendant uses the approved reference, `~/Projects/mind/brand/pendant-reference.png` (Higgsfield job `4850fe2f-…`).
- **Files:** originals are in `~/Projects/mind/brand/photography/originals`, including unused alternates (worn, café, street, bedside, palm and macro pendant shots, and the earlier heroes).

## Motion

Lenis smooth scroll plus Motion `useScroll`/`useTransform`. All of it respects `prefers-reduced-motion`.

## Not done yet

- The waitlist form only confirms in the browser; nothing is stored. Wire it to Convex.
- There's no OG image, and the favicon is still the scaffold's.
