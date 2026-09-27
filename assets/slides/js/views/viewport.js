const COMPACT_MAX_WIDTH = 700;

/**
 * Scales the fixed-size slide canvas to fit its container.
 * Portrait phones get a fluid canvas with a smaller font instead of a tiny letterboxed one.
 */
export class Viewport {
  #previews = [];
  #isPrinting = false;

  constructor({ container, deckElement, canvas, allowCompact }) {
    this.container = container;
    this.deckElement = deckElement;
    this.canvas = canvas;
    this.allowCompact = allowCompact;
  }

  start() {
    if (window.ResizeObserver) {
      new ResizeObserver(() => this.fit()).observe(this.container);
    } else {
      window.addEventListener("resize", () => this.fit());
    }

    // Printing always uses the full canvas, one page per slide.
    window.addEventListener("beforeprint", () => this.#setPrinting(true));
    window.addEventListener("afterprint", () => this.#setPrinting(false));

    this.fit();
  }

  /** Keeps another canvas, such as the presenter's next-slide preview, scaled to its own container. */
  addPreview(deckElement, container) {
    this.#previews.push({ deckElement, container });
    this.fit();
  }

  fit() {
    const isCompact = this.#isCompact();
    const style = this.deckElement.style;

    document.body.classList.toggle("is-compact", isCompact);

    if (isCompact) {
      style.setProperty("--deck-width", `${this.container.clientWidth}px`);
      style.setProperty("--deck-height", `${this.container.clientHeight}px`);
      style.setProperty("--deck-scale", "1");
    } else {
      style.removeProperty("--deck-width");
      style.removeProperty("--deck-height");
      this.#scale(this.deckElement, this.container);
    }

    this.#previews.forEach(({ deckElement, container }) => this.#scale(deckElement, container));
  }

  #isCompact() {
    return (
      this.allowCompact &&
      !this.#isPrinting &&
      window.innerWidth < COMPACT_MAX_WIDTH &&
      window.innerHeight > window.innerWidth
    );
  }

  #scale(deckElement, container) {
    const scale = Math.min(
      container.clientWidth / this.canvas.width,
      container.clientHeight / this.canvas.height
    );

    deckElement.style.setProperty("--deck-scale", String(scale || 1));
  }

  #setPrinting(isPrinting) {
    this.#isPrinting = isPrinting;
    this.fit();
  }
}
