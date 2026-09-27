/**
 * Grid of every slide. Arrows move the selection, Enter or a click opens a slide.
 * Emits "toggle" so that other parts (scaling, media) can react.
 */
export class Overview extends EventTarget {
  isOpen = false;

  constructor({ deck, deckElement, container, button }) {
    super();
    this.deck = deck;
    this.deckElement = deckElement;
    this.container = container;
    this.button = button;
  }

  start() {
    this.deckElement.addEventListener("click", (event) => this.#handleClick(event));
    this.deck.addEventListener("change", () => {
      if (this.isOpen) {
        this.deck.currentSlide.scrollIntoView({ block: "nearest" });
      }
    });
  }

  toggle() {
    this.#setOpen(!this.isOpen);
  }

  open() {
    this.#setOpen(true);
  }

  close() {
    this.#setOpen(false);
  }

  /** Returns true when the key was handled. */
  handleKey(event) {
    const moves = {
      ArrowRight: 1,
      ArrowLeft: -1,
      ArrowDown: this.#columnCount(),
      ArrowUp: -this.#columnCount()
    };

    if (event.key in moves) {
      event.preventDefault();
      this.deck.goTo(this.deck.index + moves[event.key]);
    } else if (event.key === "Home") {
      this.deck.first();
    } else if (event.key === "End") {
      this.deck.last();
    } else if (["Enter", "Escape", "o", "O"].includes(event.key)) {
      event.preventDefault();
      this.close();
    } else {
      return false;
    }

    return true;
  }

  #handleClick(event) {
    const slide = this.isOpen && event.target.closest("[data-slide]");

    if (slide) {
      event.preventDefault();
      this.deck.goTo(this.deck.indexOf(slide));
      this.close();
    }
  }

  #setOpen(isOpen) {
    if (isOpen === this.isOpen) {
      return;
    }

    this.isOpen = isOpen;
    withoutTransitions(() => document.body.classList.toggle("is-overview", isOpen));
    this.button?.setAttribute("aria-pressed", String(isOpen));

    if (isOpen) {
      this.deck.currentSlide.scrollIntoView({ block: "center" });
    } else {
      this.container.scrollTop = 0;
    }

    this.dispatchEvent(new Event("toggle"));
  }

  #columnCount() {
    return Math.max(getComputedStyle(this.deckElement).gridTemplateColumns.split(" ").length, 1);
  }
}

// Switching between the overview and the slides must not animate every slide.
function withoutTransitions(callback) {
  document.body.classList.add("is-instant");
  callback();
  requestAnimationFrame(() => {
    requestAnimationFrame(() => document.body.classList.remove("is-instant"));
  });
}
