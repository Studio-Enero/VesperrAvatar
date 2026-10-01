# VESPERR — marketing site

Standalone static site. **No build step, no dependencies.**

```
website/
├── index.html    structure and copy
├── logo.svg      the star mark — stroked, for nav and large use
├── favicon.svg   filled variant; a hairline vanishes at 16px
├── styles.css    design system
├── script.js     scroll reveals, hero slider, gesture readout
├── check-site.cjs  structural guard — run `node check-site.cjs`
└── images/       drop your hero photos here — see images/README.md
```

## Design

**Liquid glass, shared with the product.** The site and the concierge's own UI
use the same material: a translucent navy fill, a cool blue-white hairline, a
heavy backdrop blur, and an inset highlight along the top edge. `.glass` in
`styles.css` is that one definition, applied to the nav, buttons, cards, table
rows and the hero readout alike — so the page is one substance rather than a set
of differently-finished boxes.

The accent is cyan, which is the product's own "active / live" colour. The
earlier brass-and-ink treatment is gone; the two should read as one thing.

Type is unchanged: **Fraunces** (display serif, optical sizing) against
**IBM Plex Mono** and **IBM Plex Sans**.

Everything runs off custom properties at the top of `styles.css` — change
`--glass-tint` or `--accent` and the whole site re-tunes.

## Content

Positioning is VESPERR's own: real-time interactive AI avatars and digital
humans, across three products (VESPERR Studio, VESPERR Avatars, VESPERR
Holograms) and six solution verticals, with on-premises deployment as the
security argument.

> The three product names and the six verticals are a working structure, not
> settled positioning. They were previously RAVATAR's own product taxonomy and
> were renamed on the rebranding pass — confirm they match what you actually
> sell before publishing.

**Nothing invented.** No customer logos, star ratings, usage numbers or
statistics, because there are none yet. Add real ones as you earn them.

## Adding hero images

Drop four files into `images/`: `hero-01.jpg` … `hero-04.jpg`. Until they
exist, each slide shows a designed placeholder with the filename on it, so the
site is safe to publish before the photography is ready. The slide list is near
the top of `script.js` — add or remove entries and the dots, counter and arrows
all follow.

## Before publishing

- [ ] Replace `hello@example.com` in `index.html` (the `mailto:` and the button
      label) with a real contact address
- [ ] Remove the `.engage__note` placeholder line once the address is real
- [ ] Add a favicon and a real og-image
- [ ] Link `/` nav items to your real product and solution pages
- [ ] Confirm the capability claims still match the product

## Accessibility

Semantic landmarks, visible focus rings, and a full `prefers-reduced-motion`
path: the hero readout holds a single static scene and every reveal is shown
without animation. If JavaScript is disabled the page renders fully — the
`no-js` class on `<html>` is cleared by the script precisely so the reveal
styles never leave a blank page behind.
