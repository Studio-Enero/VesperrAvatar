# Hero images

Drop your three hero images here using these exact filenames:

| File | Suggested shot |
|---|---|
| `hero-01.jpg` | Wide — the avatar in a lobby or entrance, full figure |
| `hero-02.jpg` | Close — the face mid-speech, showing lip-sync |
| `hero-03.jpg` | Mid — the avatar gesturing, e.g. pointing somewhere |

**Until a file exists, that slide shows a designed placeholder** with the
filename printed on it. The hero never looks broken and never shows a
torn-image icon — you can publish before the photography is ready.

## Specifications

- **Aspect** 4:3 fills the frame; anything close to that works. The frame crops
  with `object-fit: cover`, so keep important detail away from the edges.
- **Size** 1600 × 1200 is plenty. Keep each under ~300 KB so the hero stays fast.
- **Format** `.jpg` is the default. `.png` works if you need it; `.webp` if you
  want the smaller file — just update the `src` in `script.js`.
- **Tone** These are the only real photographs on the page. They will set the
  expectation for everything else.

## Using a different number of slides

The list lives at the top of `script.js`:

```js
var SLIDES = [
  { src: "images/hero-01.jpg", alt: "...", caption: "<strong>Arrival.</strong> ..." },
  // add or remove entries freely
];
```

Dots, the `01 / 03` counter and the arrow handlers all derive from that array,
so changing its length needs no other edits. Captions accept a small amount of
HTML — the `<strong>` lead-in is intentional.

## Accessibility note

Alt text is set per slide. Write it for someone who will never see the image:
describe what it shows, not that it is a screenshot or a render.
