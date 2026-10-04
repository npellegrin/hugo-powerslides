# Changelog

All notable changes to this theme are documented here. Versions follow [Semantic Versioning](https://semver.org/) and are published as Git tags (`vX.Y.Z`) for Hugo Modules.

## 0.1.0 — Unreleased

First public release.

### Slides

- Slides written in Markdown and separated by `---`, with a build warning when a separator is missing its blank line.
- Layouts: `default`, `title`, `section` (numbered), `center`, `hero`, `image-left`, `image-right`.
- Per-slide background color or image, and a footer with text, logo, and slide number.
- Step-by-step reveals (`fragments`), entrance animations, and thirteen slide transitions, with reduced-motion support.
- Shortcodes: `slide`, `columns` / `column`, `figure`, `callout`, `fragments`, `notes`, `rule`, `video`, `embed`.
- Styled tables, code with theme-aware syntax highlighting, footnotes shown on the slide that cites them.
- Math with KaTeX and diagrams with Mermaid, loaded only on pages that use them.

### Presenting

- Fixed canvas (1920×1080 by default) scaled to any screen, with a fluid mode for portrait phones.
- Keyboard, presentation clicker, and swipe navigation; overview; go to a slide by number.
- Presenter window with notes, next-slide preview, timer, and clock, synchronized with the audience window.
- PDF export from the browser print dialog, one page per slide.

### Themes and sites

- Nine color themes (`dark`, `light`, `solarized`, `synthwave`, `terminal`, `halloween`, `unicorn`, `christmas`, `evergreen`), per page or per slide, with overridable color tokens.
- List pages for home, sections, and taxonomies; regular pages are slide decks without extra front matter.
- Works when the site is deployed under a subfolder.

### Security

- Content-Security-Policy on by default.
- Pinned external libraries with Subresource Integrity; theme CSS and JavaScript are fingerprinted with integrity hashes.
