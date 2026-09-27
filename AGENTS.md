# Agent Instructions

## Project

- Lightweight Hugo slide theme with no front-end dependencies. Preserve this simplicity and follow Hugo Modules conventions.
- Keep source changes in `layouts/`, `assets/` (CSS and JavaScript, built by Hugo Pipes), and `static/`. Do not edit generated files in `public/`.
- Use the neighboring `../hugo-powerslides-demo` project for integration checks; its `go.mod` uses a local `replace` directive for this theme.
- Write all project-authored material in English, including code comments, documentation, slide content, and user-facing text, unless explicitly asked otherwise.

## Code Quality

- Code must stay clean and readable by humans: agents are at the service of humans. Favor clarity over cleverness, and code a maintainer can understand without an agent.
- Follow SOLID, clean code, and clean architecture principles pragmatically: small files, one responsibility per module or class, explicit names, and no speculative abstractions.
- No file should grow into a catch-all. Split by responsibility before a file becomes hard to read.
- JavaScript lives in `assets/slides/js/` as ES modules: `core/` (navigation state), `views/` (what is displayed), `input/` (keyboard, touch, buttons), `services/` (URL, media, window sync), `integrations/` (KaTeX, Mermaid). Only `main.js` wires parts together; parts communicate through the deck's `change` event and named commands.
- CSS lives in `assets/slides/css/`, one file per concern (tokens, themes, base, typography, code, components, layouts, transitions, animations, controls, overview, presenter, print). Colors belong in `themes.css`, other design tokens in `tokens.css`. The load order is set in `layouts/partials/powerslides/stylesheet.html`.

## Efficient Work

- Keep investigation and responses concise. Read only the files needed to understand the change; avoid repeated searches, rereads, and restating context.
- Make the smallest complete change and run the narrowest useful check.
- Do not add comments that repeat what the code does. Comment only to clarify non-obvious intent or constraints.

## Hugo, HTML, and JavaScript

- Keep templates compatible with Hugo. Use Hugo functions for URLs (`relURL`) and escaping dynamic values.
- Preserve the shortcode contract: each slide is a `<section data-slide>` with a stable ID and Markdown content.
- Prefer semantic HTML, accessible labels, and native controls. Preserve keyboard navigation and existing commands.
- Keep JavaScript dependency-free and deferred. Hugo's built-in `js.Build` bundles the modules; no Node.js tooling is required. Handle optional elements safely; add a dependency only for a demonstrated need.
- External libraries are loaded only where needed, from pinned versions with Subresource Integrity, and must be allowed by the Content-Security-Policy in the slides layout.
- Respect `prefers-reduced-motion`; transitions must not obstruct reading or slide navigation.

## Design and Accessibility

- Prioritize projection and small-screen readability with clear hierarchy, concise text, and responsive layouts.
- Centralize colors in CSS properties. Meet WCAG contrast ratios: at least 4.5:1 for normal text and 3:1 for large text and relevant UI components.
- Never communicate information through color alone. Add labels, shapes, patterns, or icons, and check that states remain distinguishable for users with color-vision deficiencies.
- Preserve visible focus indicators and keyboard-operable controls.

## Verification

- After theme changes, run `hugo` from `../hugo-powerslides-demo`; use `hugo server` for visual checks.
- For template or shortcode changes, inspect the generated HTML and check missing content and implicit IDs.
