# Hugo PowerSlides

A lightweight Markdown slide theme for Hugo.

The theme is designed to be easy to maintain, customize, and extend without dependencies.

## Requirements

- Hugo Extended
- Go
- Git

Check your installation:

```bash
hugo version
go version
```

## Using the theme

Add the theme module to the site's `hugo.toml`:

```toml
[module]
  [[module.imports]]
    path = "github.com/npellegrin/hugo-powerslides"
```

Initialize the site's Hugo module if necessary:

```bash
hugo mod init example.com/my-slides
```

Download the theme:

```bash
hugo mod get github.com/npellegrin/hugo-powerslides
hugo mod tidy
```

Run Hugo:

```bash
hugo server
```

## Writing slides

Use the `slides` layout and separate slides with `---`:

```markdown
---
title: "My talk"
layout: "slides"
---

{{< slide id="intro" layout="title" transition="zoom" >}}

# My talk

---

# Second slide
```

The optional `slide` shortcode at the top of a slide accepts:

| Option       | Description                                                                 |
| ------------ | --------------------------------------------------------------------------- |
| `id`         | Stable anchor for direct links (defaults to `slide-N`).                     |
| `layout`     | `default`, `title`, `section`, `center`, `hero`, `image-left`, `image-right`. |
| `image`      | Image used by `hero`, `image-left`, and `image-right`.                      |
| `alt`        | Alternative text for `image`; leave empty for decorative images.            |
| `transition` | See below. Defaults to the page, then site setting.                         |
| `theme`      | Color theme for this slide only.                                            |
| `class`      | Extra CSS classes (`no-footer` hides the footer).                           |
| `background` | Background color (any CSS color); combine with `theme` for matching text.   |
| `background-image` | Background image, tinted with the theme background.                  |
| `background-dim` | Tint opacity over the background image, from 0 to 1 (default 0.75).     |

`section` slides are numbered automatically.

### Transitions

- Subtle: `fade` (default), `slide`, `up`, `zoom`, `blur`, `none`
- Classic: `push`, `flip`, `wipe`, `iris`
- Kitsch: `spin`, `bounce`, `swing`, `tv`

All transitions fall back to a short fade when the system requests reduced motion.

### Step-by-step reveals

Wrap content in `fragments`: each list item, or each top-level block, appears on its own step.

```markdown
{{</* fragments style="zoom" */>}}
- First point
- Second point
{{</* /fragments */>}}
```

Styles: `up` (default), `fade`, `zoom`, `highlight`. Any element with the `fragment` class (and optionally `fragment--fade`, etc.) is also a step. Going back into a slide shows all of its steps.

The `anim-fade`, `anim-up`, `anim-zoom`, and `anim-slide` classes are different: they play automatically when the slide appears.

### Shortcodes

- `columns` (`count` = 2, 3, or 4) containing `column` blocks
- `figure` (`src`, `alt`, `caption`)
- `callout` (`type` = `note`, `tip`, or `warning`; optional `title`)
- `fragments` (`style`), see above
- `video` (`src`, `poster`, `caption`, `title`, `autoplay`, `loop`, `controls`): autoplay videos start muted when their slide appears and pause when it is left
- `embed` (`src`, `title`, `ratio` such as `4/3`): sandboxed iframe, loaded only while its slide is current or next
- `notes` for speaker notes, shown in presenter mode (<kbd>P</kbd>)

Markdown tables, code blocks, blockquotes, task lists, `<kbd>`, and `<mark>` are styled.

### Code, math, and diagrams

- **Code** follows the slide theme when Hugo emits CSS classes (`noClasses = false`, see below). Use `hl_lines` to highlight lines: ```` ```js {hl_lines=[2]} ````. With Hugo's default inline colors, the chosen `markup.highlight.style` applies instead.
- **Math**: write `\( … \)` inline and `$$ … $$` or `\[ … \]` for blocks. KaTeX loads only when a page contains these delimiters; force it with `math: true` or `math: false` in front matter. It needs the Goldmark passthrough extension (see below).
- **Diagrams**: a ```` ```mermaid ```` code block becomes a Mermaid diagram in the slide's colors. Mermaid loads only on pages that contain one.

### Images and links

Paths work the same whether the site is served from the domain root or a subfolder (for example `baseURL = "https://example.com/talks/"`):

- `/images/photo.jpg` points to the site's `static/images/photo.jpg`, with the base path added;
- `photo.jpg` uses the file next to the Markdown file (page bundle) when there is one;
- full URLs and `#anchors` are left unchanged.

This applies to Markdown images and links, and to every theme option or shortcode that takes a path (`image`, `background-image`, `figure`, `video`, footer `logo`, `customCSS`).

### Footer

A footer with the slide number is shown on every slide except `title` and `hero` layouts. Add a text and a logo in the configuration below; set `number = false` to remove the number. Hide it on one slide with `class="no-footer"`.

## Presenting

| Keys                                          | Action                         |
| --------------------------------------------- | ------------------------------ |
| <kbd>→</kbd> <kbd>↓</kbd> <kbd>Space</kbd> <kbd>Page Down</kbd> | Next step or slide |
| <kbd>←</kbd> <kbd>↑</kbd> <kbd>Page Up</kbd>  | Previous step or slide         |
| <kbd>Home</kbd> <kbd>End</kbd>                | First or last slide            |
| Slide number, then <kbd>Enter</kbd>           | Go to that slide               |
| <kbd>O</kbd> or <kbd>Esc</kbd>                | Overview (arrows, <kbd>Enter</kbd>, or click to pick a slide) |
| <kbd>F</kbd>                                  | Toggle fullscreen              |
| <kbd>P</kbd>                                  | Open the presenter window      |

On touch screens, swipe left or right. Page Up and Page Down make most presentation clickers work out of the box.

Slides are drawn on a fixed canvas (1920×1080 by default) scaled to fit the window, so they look the same on a laptop and a projector. On portrait phones, the canvas becomes fluid with a smaller font.

The presenter window stays in sync with the audience window. It shows the current slide with upcoming steps faded, the next slide, the speaker notes, an elapsed-time timer (pause and reset), and the clock.

### Export to PDF

Print the page from the browser and choose **Save as PDF**. Each slide becomes one page at the canvas size, with every step visible and controls hidden. Enable background graphics if the print dialog asks. Chromium-based browsers honor the page size best.

## Configuration

Hugo does not merge `markup` settings from themes, so set them in the site's `hugo.toml`:

```toml
# Allows inline HTML in slides, such as <li class="anim-up">.
[markup.goldmark.renderer]
  unsafe = true

# Emits CSS classes so code colors follow the theme.
[markup.highlight]
  noClasses = false

# Required for math: leaves LaTeX untouched for KaTeX.
[markup.goldmark.extensions.passthrough]
  enable = true
  [markup.goldmark.extensions.passthrough.delimiters]
    block = [['\[', '\]'], ['$$', '$$']]
    inline = [['\(', '\)']]

[params.powerslides]
  theme = "dark"         # dark, light, solarized, synthwave, terminal
  transition = "fade"
  progress = true        # progress bar at the top
  width = 1920           # canvas size in pixels; use 1600 × 1200 for 4:3
  height = 1080
  customCSS = ["css/custom.css"]

  [params.powerslides.colors]
    primary = "#34d399"
    on-primary = "#022c22"

  [params.powerslides.footer]
    text = "Jane Doe · Conference 2026"   # Markdown allowed
    logo = "/images/logo.svg"
    logoAlt = ""                           # empty when the logo is decorative
    number = true
```

`theme`, `transition`, and `colors` can also be set in a page's front matter.

Color tokens: `background`, `surface`, `border`, `text`, `muted`, `primary`, `on-primary`, `accent`, `warning`, `code-background`, `code-text`. Each maps to a `--color-*` CSS property. Keep text at a contrast ratio of at least 4.5:1 against `background` and `surface`.

To create a new theme, define the tokens under a `[data-theme="name"]` selector in a custom stylesheet and set `theme = "name"`. Fonts use `--font-body`, `--font-heading`, and `--font-mono`.

## External libraries

The theme itself has no dependency. KaTeX and Mermaid are loaded only on pages that use them, from pinned versions, with [Subresource Integrity](https://developer.mozilla.org/docs/Web/Security/Subresource_Integrity): the browser refuses any file whose hash differs.

| Library | Version | Files                                                        |
| ------- | ------- | ------------------------------------------------------------ |
| KaTeX   | 0.18.7  | `katex.min.css`, `katex.min.js`, `contrib/auto-render.min.js` |
| Mermaid | 11.17.2 | `mermaid.min.js` (single-file build, so the hash covers all the code) |

The files are served by jsDelivr from the npm packages. Before pinning, each file was checked to be byte-identical to the npm tarball, and each tarball against the registry's integrity hash. Mermaid is published with an npm provenance attestation from its GitHub repository. Neither version had a known security advisory. Mermaid runs with `securityLevel: "strict"`, and KaTeX with its default `trust: false`.

To present offline or avoid the CDN, copy the same files and point to them. The hashes still apply, so only these exact versions will load:

```toml
[params.powerslides]
  katexURL = "/vendor/katex"                  # folder containing katex.min.css, katex.min.js, contrib/
  mermaidURL = "/vendor/mermaid.min.js"
```

Updating a version means updating its hashes in `layouts/_default/slides.html`.
