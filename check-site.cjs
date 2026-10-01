/*
 * Structural guard for the marketing site. No browser here, so this stands in
 * for one: it catches the failure that has actually bitten this file twice --
 * an edit that splices from one rule start to a distant closing brace and
 * silently deletes everything in between, leaving valid-looking CSS that
 * simply stops styling a whole section.
 *
 * Run: node check-site.cjs
 */
const fs = require("fs");

const read = (f) => fs.readFileSync(f, "utf8");
const html = read("index.html");
const js = read("script.js");
const raw = read("styles.css");
const css = raw.replace(/^\uFEFF/, "").replace(/\/\*[\s\S]*?\*\//g, "");

let failures = 0;
const check = (label, ok, detail) => {
  if (!ok) failures++;
  console.log((ok ? "ok   " : "FAIL ") + label + (detail ? "  -> " + detail : ""));
};

console.log("--- brand ---");
check("title is VESPERR", /<title>VESPERR/.test(html));
check("og:title is VESPERR", /og:title[^>]*VESPERR/.test(html));
check("no RAVATAR left in html", !/RAVATAR/i.test(html));
check("no RAVATAR left in css", !/RAVATAR/i.test(raw));

console.log("--- css structure ---");
const opens = (css.match(/\{/g) || []).length;
const closes = (css.match(/\}/g) || []).length;
check("braces balanced", opens === closes, opens + " open / " + closes + " close");

// Walk brace depth and flag any rule that swallows a large block. A rule
// that legitimately spans >25 lines is almost always a missing brace.
// :root is exempt: it is one big custom-property block, and its length is
// real. Comments are ignored when measuring, or a heavily commented :root
// would trip this.
let depth = 0, start = null, startLine = 0, wide = [];
raw.split(/\r?\n/).forEach((L, i) => {
  if (/^\s*\/\*/.test(L) || /^\s*\*[^:]*$/.test(L)) return; // comment furniture
  if (depth === 0 && L.includes("{")) { start = L.trim(); startLine = i + 1; }
  for (const ch of L) { if (ch === "{") depth++; else if (ch === "}") depth--; }
  if (depth === 0 && L.includes("}")) {
    const exempt = start && /^:root\b/.test(start);
    if (start && !exempt && i + 1 - startLine > 25) {
      wide.push(start.slice(0, 40) + " (line " + startLine + ", " + (i + 1 - startLine) + " lines)");
    }
    start = null;
  }
});
check("no rule spans >25 lines", wide.length === 0, wide.join(" | "));

console.log("--- every class has a rule ---");
const used = new Set();
for (const src of [html, js]) {
  for (const m of src.matchAll(/class="([^"]+)"/g)) {
    m[1].split(/\s+/).filter(Boolean).forEach((c) => used.add(c));
  }
}
const defined = new Set([...css.matchAll(/\.([a-zA-Z][\w-]*)/g)].map((m) => m[1]));
const missing = [...used].filter((c) => !defined.has(c));
check("no unstyled classes", missing.length === 0, missing.join(", "));

console.log("--- the hero is intact (this is what a spanning edit destroys) ---");
for (const sel of [".hero", ".hero__copy", ".hero__title", ".hero__lede",
                   ".hero__actions", ".btn", ".btn::before", ".btn--solid",
                   ".btn--ghost", ".specstrip", ".specstrip dt", ".specstrip dd",
                   "@keyframes sweep"]) {
  check(sel + " present", css.includes(sel));
}
// The m flag matters: without it ^ anchors to the start of the whole file,
// which is :root, so this silently reported false.
check(".hero is a grid", /^\.hero \{[^}]*display: grid/ms.test(css));
check("btn has backdrop blur", /\.btn \{[^}]*backdrop-filter/s.test(css));

console.log("--- the mark ---");
check("nav carries an inline star", /nav__glyph[\s\S]{0,300}svg viewBox="0 0 24 24"/.test(html));
check("favicon linked", /rel="icon" href="favicon\.svg"/.test(html));
check(".nav__glyph holds the svg", /\.nav__glyph svg \{ display: block/.test(css));
check("old inner-dot pseudo removed", !/\.nav__glyph::after/.test(css));
check("markGlow keyframes defined", /@keyframes markGlow/.test(css));

// A star must be mirror-symmetric. Match the <path d="..."> only: a loose
// /d="([^"]+)"/ also matches the tail of id="..." (e.g. id="vesperrMark").
for (const f of ["logo.svg", "favicon.svg"]) {
  const s = read(f);
  const m = s.match(/<path[^>]*\bd="([^"]+)"/);
  if (!m) { check(f + " has a path", false); continue; }
  const p = m[1].replace(/[MLZ]/g, "").split(/[ ,]+/).filter(Boolean).map(Number);
  const xs = p.filter((_, i) => i % 2 === 0);
  const ys = p.filter((_, i) => i % 2 === 1);
  const n = xs.length;
  let sym = n === 10;
  for (let i = 0; i < n; i++) {
    const j = (n - i) % n;
    if (Math.abs(xs[i] + xs[j] - 24) > 0.02) sym = false;
    if (Math.abs(ys[i] - ys[j]) > 0.02) sym = false;
  }
  check(f + " is a symmetric 5-point star", sym, n + " points");
}

console.log("");
console.log(failures === 0 ? "all checks passed" : failures + " CHECK(S) FAILED");
process.exit(failures === 0 ? 0 : 1);
