# Contributing

Thank you for helping improve Hugo PowerSlides. This guide covers how the theme is organized, how to test a change, and how to release a version.

## Setup

Clone the theme and the [demo site](https://github.com/npellegrin/hugo-powerslides-demo) side by side; the demo's `go.mod` uses the local theme through a `replace` directive:

```bash
git clone git@github.com:npellegrin/hugo-powerslides.git
git clone git@github.com:npellegrin/hugo-powerslides-demo.git
cd hugo-powerslides-demo
hugo server
```

Changes to the theme show up in the demo right away.

## Where things are

```text
layouts/
├── slides.html                 the slide deck page
├── single.html                 regular pages, rendered as slide decks
├── list.html                   lists of decks (home, sections, taxonomies)
├── _markup/                    render hooks: headings, images, links, Mermaid code blocks
├── _partials/powerslides/      head, security policy, external libraries, URL resolution
└── _shortcodes/                slide, notes, fragments, columns, callout, video, embed…
assets/slides/
├── css/                        one file per concern; load order in _partials/powerslides/stylesheet.html
└── js/
    ├── main.js                 creates each part and connects them
    ├── core/                   navigation state (Deck), commands, fragments
    ├── views/                  scaling, counter, overview, presenter view, timer
    ├── input/                  keyboard, go-to-slide, swipe, idle pointer, buttons
    ├── services/               URL hash, media, window sync, browser helpers
    └── integrations/           KaTeX and Mermaid
tests/                          unit tests (Node.js built-in test runner)
```

Parts of the JavaScript do not know about each other: they react to the deck's `change` event and run named commands. Only `main.js` wires them together.

Hugo bundles the CSS and JavaScript at build time: readable with `hugo server`, minified and fingerprinted with `hugo`. No Node.js tooling is needed for that.

## Guidelines

- Keep code readable by a human without an agent: small files, one responsibility each, explicit names.
- Add a feature only for a clear need, keep it isolated in its own file, and make it optional when possible.
- Keep colors in `assets/slides/css/themes.css`, with a contrast ratio of at least 4.5:1 for text. Never convey information through color alone.
- Keep keyboard navigation, visible focus, and reduced-motion support working.
- Stay compatible with the minimum Hugo version in `hugo.toml` and with the latest release.
- Write code, comments, and documentation in English.

See [AGENTS.md](AGENTS.md) for the complete list.

## Checking a change

```bash
npm test                                     # unit tests, Node.js 20 or later, no dependency to install
cd ../hugo-powerslides-demo
hugo --panicOnWarning                        # the demo must build without any warning
hugo server                                  # check the result in a browser
```

Add or update tests in `tests/` when you change JavaScript behavior, and record user-visible changes under `Unreleased` in [CHANGELOG.md](CHANGELOG.md).

Continuous integration runs the tests and builds the demo with the minimum supported Hugo version and the latest release, at the domain root and in a subfolder.

## Updating KaTeX or Mermaid

Versions and integrity hashes are in `layouts/_partials/powerslides/libraries.html`. For each file, compute the hash and check that the CDN copy matches the npm package:

```bash
url=https://cdn.jsdelivr.net/npm/katex@0.18.7/dist/katex.min.js
echo "sha384-$(curl -s "$url" | openssl dgst -sha384 -binary | openssl base64 -A)"
```

Before upgrading, check the version's age, publisher, and security advisories on npm. Update the version table in the README as well.

## Releasing

1. Make sure CI passes on `main`.
2. In `CHANGELOG.md`, replace `Unreleased` with the version and date.
3. Commit, then tag and push:

   ```bash
   git tag -a v0.1.0 -m "v0.1.0"
   git push origin main v0.1.0
   ```

4. Optionally, create a GitHub release from the tag with the changelog section as notes.

A published tag must never be moved or deleted: Go's module proxy keeps every version forever. Fix mistakes with a new patch version. From v2 on, the module path must end with `/v2`.

The [Hugo themes gallery](https://github.com/gohugoio/hugoThemesSiteBuilder) also needs `images/screenshot.png` (1500×1000) and `images/tn.png` (900×600).
