/**
 * Links the URL hash to the current slide: the hash names the slide, and anchors inside a slide
 * (such as footnotes) lead to that slide instead of scrolling the canvas.
 */
export class UrlHash {
  constructor({ deck, deckElement }) {
    this.deck = deck;
    this.deckElement = deckElement;
  }

  /** Index of the slide named in the URL, or -1. */
  initialIndex() {
    return this.#indexFromId(decodeHash(window.location.hash));
  }

  start() {
    window.addEventListener("hashchange", () => {
      const index = this.initialIndex();

      if (index >= 0) {
        this.deck.goTo(index);
      }
    });

    this.deckElement.addEventListener("click", (event) => this.#followInPageLink(event));
  }

  update() {
    const id = this.deck.currentSlide.id;

    if (id) {
      history.replaceState(null, "", `#${id}`);
    }
  }

  #followInPageLink(event) {
    const link = event.defaultPrevented ? null : event.target.closest('a[href^="#"]');

    if (!link) {
      return;
    }

    event.preventDefault();

    const index = this.#indexFromId(decodeHash(link.getAttribute("href")));

    if (index >= 0 && index !== this.deck.index) {
      this.deck.goTo(index);
    }
  }

  #indexFromId(id) {
    const target = id ? document.getElementById(id) : null;
    const slide = target?.closest("[data-slide]");

    return slide ? this.deck.indexOf(slide) : -1;
  }
}

function decodeHash(hash) {
  try {
    return decodeURIComponent(hash.replace(/^#/, ""));
  } catch {
    return "";
  }
}
