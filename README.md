# yaleedhaque.github.io — Portfolio

Single-page GitHub Pages portfolio for **Md. Yaleed Haque** (C#/.NET + Kotlin developer).

Live: https://yaleedhaque.github.io · Deploys by pushing to `main` (~1–2 min rebuild).

> Developer-facing README — design tokens, page structure, behaviors, performance rules, verification checklist, and history.

---

## Stack (100% free)

Plain HTML/CSS/JS — **no build step, no npm**. External CDNs only: Google Fonts (Fraunces/Inter/JetBrains Mono) + `three@0.160.0` via importmap from unpkg.

## Files (5)

| File | Purpose |
|---|---|
| `index.html` | All content/markup |
| `styles.css` | All styling (~810 lines) |
| `script.js` | All interactivity (~306 lines), one IIFE |
| `bg.js` | Three.js hero background, ES module (loaded at end of body as `<script type="module">`) |
| `banner.png` / `banner.svg` | Profile banner assets (rasterized PNG is the one referenced in the profile README) |

## Design tokens (styles.css `:root`)

- `--bg #06070d`, `--bg-2 #0b0d17`, `--ink/--mist #eef1f8`, `--mist-dim #8b94a9`
- `--aurora/--aurora-violet #a78bfa`, `--aurora-cyan #67e8f9`, `--line rgba(255,255,255,.12)`
- Fonts: `--display` Fraunces (serif headings), `--body` Inter, `--mono` JetBrains Mono
- Signature look: dark + violet/cyan aurora accents, 1px `rgba(255,255,255,.12)` borders, uppercase mono eyebrows, **square corners** (no border-radius), `html{scroll-behavior:smooth}`

## Page structure (index.html sections, in order)

`.topbar` (nav: Projects/Skills/Terminal/About/Contact + GitHub) → `main#top` → `.hero` (canvas#hero-3d + orb-1/2 + status-pill + **h1 = name** + `.hero-role` catchy line + hero-sub + 2 magnetic CTAs) → `.stats` (4 `.stat`; 3 have `.count` animated counters) → `#narrative` (scroll-sticky stage, 4 `.scroll-panel` data-side left/right, scroll-hint + progress bar) → `#projects` (8 `.card` **P1–P8: GamePadEcosystem / StarkAgent / BluetoothRemoteHid / Lumen / AetherCompass / opencode-free-fallback / Edge-project / OmniFetch**, each with a themed `.card-icon` SVG + `.card-tag` + `.status`) → `#skills` (7 `.pillar`) → `#terminal` (.terminal + #terminal-body + #terminal-input) → `#about` → `.beliefs-section` (3) → `.quotes-section` (3) → `#contact` (.contact-box) → footer.

**Nav ids must exist:** `#top #projects #skills #terminal #about #contact`. Sections get `scroll-margin-top:90px` for the fixed header.

## How to add a project

Duplicate an `<article class="card">` in `#projects`, bump the P-number, set `.status` active/wip, pick a matching `.card-icon` SVG (project-themed stroke icon in the `.card-header-left` tile), update `.card-tech/.card-desc/.card-link`. Also update: stats `.count` for "projects shipped", narrative panel "Shipped" copy, terminal `projects` command array (script.js), footer Code column, and add to `#skills`/terminal `skills` if it's a new pillar/tech.

## script.js behaviors

1. `history.scrollRestoration="manual"` + `window.scrollTo(0,0)` on load.
2. Boot overlay `#boot`: typewriter 9 lines (12–24 ms/char, 130 ms line gap), click-anywhere skip, hard 2600 ms cap → `.done` fade → remove at +900 ms; `reduceMotion` → instant.
3. Magnetic buttons (pointermove translate, disabled on reduceMotion).
4. Anchor links → `preventDefault` + `scrollIntoView({behavior:smooth, block:start})`.
5. `revealOnScroll(selector, stagger)` → IntersectionObserver `.15` adds `.visible` (cards/pillars/quotes/stats/terminal/contact).
6. Narrative scroll handler (rAF-throttled; per-panel opacity + translate3d drift + progress bar scaleX; **no blur**).
7. `.count` counters (IO `.4`, 1200 ms cubic ease-out).
8. Terminal: commands `help/whoami/projects/skills/philosophy/status/clear/contact` + boot lines after 600 ms; input focus uses `{preventScroll:true}` (**critical** — bare `focus()` scrolls to terminal on load).

## bg.js (Three.js hero)

- importmap `three@0.160.0`; **IIFE-wrapped** (top-level `return` in an ES module = silent fail — module must not fail, canvas stays 300×150).
- N=110 aurora/cyan points + edges `lineSegments` + 10 packet spheres along edges; camera z=20; mouse-lerped rotation; antialias FALSE, pixelRatio capped 1.5, alpha canvas.
- **Pauses while scrolling** (wheel/touchmove/scroll → 180 ms debounce markScrolling) + IntersectionObserver visible gate + `document.hidden`. This is the perf-critical behavior — added because GPU contention made Chrome smooth-scroll overshoot to page bottom.

## Performance rules (Intel UHD 620 — keep it light)

- NO animated `filter:blur` anywhere, NO `backdrop-filter`, NO animated grain, NO Lenis, NO custom cursor, NO per-frame JS scroll work (rAF-throttle if needed).
- Everything GPU-cheap: transforms/opacity only.
- Already removed for perf: Lenis, custom cursor, marquee, 3D card tilt + glare, grain animation, per-frame narrative blur, nav backdrop-filter.

## Verification

Boot completes + removes; `scrollY:0` on fresh load; counters reach targets (3/275+/8); terminal `help` echoes; anchors land at top:90; canvas has webgl2 context. Local preview: `python -m http.server 8000` from repo dir → http://localhost:8000.

---

## History

- **2026-08-13** — Projects **7 → 8**: added **OmniFetch** (P8, Windows video/audio/playlist downloader, Python/CustomTkinter + yt-dlp/ffmpeg, v1.0.0). New download-into-tray `.card-icon`; stats 7 → 8, narrative "Eight projects live", terminal `projects` array + footer Code column updated; meta/og descriptions 7 → 8.
- **2026-08-02** — Portfolio v1 shipped: controller-HUD theme, interactive CSS gamepad signature (A/B/X/Y lights up on card hover, "player slots" P1-P4). GitHub profile updated via API (name/bio/location/blog). Profile banner: SVG-via-camo failed in browsers (poisoned camo cache; alt-text showed) → rasterized to `banner.png` with Edge headless from a `data:` URL (file:// and http:// both capture blank; System.Drawing rasterization drew nothing).
- **2026-08-02** — GitHub SEO package: profile README rewritten (real H1, plain-text sections, truthful stack, featured-projects table, `llms.txt`), name-first bio, repo topics added.
- **2026-08-04** — Portfolio v2 "futurist": researched 2026 award-winning portfolio patterns (WebGL/3D, scroll storytelling, custom cursor, magnetic buttons, terminal, boot loader, counters, 3D tilt, Lenis) and implemented them; then a perf pass (user: "scrolling stops/pauses, laggy") removed blur/backdrop-filter/animated-grain and tuned Lenis to 0.16. Edge-project is P3 (dgll topic removed; narrative says "Three projects live").
- **2026-08-06** — Portfolio v3 content refresh: projects grow from 3 → 6 shipped cards. Added the three newly released Android apps — **BluetoothRemoteHid** (P3, wireless keyboard/touchpad/air-mouse over Classic + BLE HID, v1.2.6), **Lumen** (P4, torch + Morse send/decode from camera, v1.1.0), **AetherCompass** (P5, offline compass, v1.0.2) — and **opencode-free-fallback** (P6). Dropped the empty Edge-project card. Stats "projects shipped" 3 → 6; narrative "Six projects live"; boot lines + terminal `projects`/`skills` arrays updated; Kotlin pillar + footer Code column updated; meta/hero copy mentions remotes & torches.
- **2026-08-06** — Portfolio v3.1 "name-first" refresh (researched 2026 portfolio best practices): hero now **leads with the name** (H1) + role line "Phones into controllers. PCs into agents. *Zero cloud.*" + positioning sub (recruiter 6-second scan pattern); catchy title + description + og tags ("Phones into Controllers, PCs into Agents"); added **JSON-LD Person schema** for SEO. Projects **6 → 7**: re-added **Edge-project** (P7, self-hosted on-device Whisper transcription, Flask + faster-whisper) after it was rebuilt/upgraded in its own repo. Every card now has a **project-themed SVG icon** (gamepad/robot/bluetooth/torch/compass/rotate/mic) in a rounded accent tile that glows cyan on hover. Stats 6 → 7, narrative "Seven projects live", new pillar 07 "On-device AI & speech", boot line `edge_transcribe.py READY` + v3.1, terminal `projects`/`skills` arrays + footer updated.
- **2026-08-07** — Deploy resumed after GitHub Pages/Actions incident (2026-08-06, builds errored/"Page build failed"): added `.nojekyll` (5e25092) to disable Jekyll on the legacy static build, then re-triggered a fresh build after the incident cleared.

---

## Git notes

- Per-repo identity REQUIRED (global has none): `git config user.name "Md. Yaleed Haque"` / `user.email yaleedhaque@users.noreply.github.com`.
- ⚠ Never re-save files via PowerShell `Set-Content`/`Get-Content` — it mangles UTF-8 (em/en-dashes → mojibake). Use an editor that preserves UTF-8.

---

**Md. Yaleed Haque** — [GitHub](https://github.com/yaleedhaque) · [Portfolio](https://yaleedhaque.github.io) · yaleedhaque@users.noreply.github.com
