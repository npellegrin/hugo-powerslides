/**
 * Presenter window: speaker notes, a preview of the next slide, and the current position.
 * The timer is a separate object; this view only shows slide information.
 */
export class PresenterView {
  #previewDeck = null;

  constructor({ deck, deckElement, panels, notesContent, nextFrame, position }) {
    this.deck = deck;
    this.deckElement = deckElement;
    this.panels = panels;
    this.notesContent = notesContent;
    this.nextFrame = nextFrame;
    this.position = position;
  }

  /** Shows the presenter panels and returns the preview canvas, which the viewport must scale. */
  start() {
    document.body.classList.add("is-presenter");
    this.panels.forEach((panel) => {
      panel.hidden = false;
    });

    if (this.nextFrame) {
      this.#previewDeck = this.deckElement.cloneNode(false);
      this.#previewDeck.removeAttribute("data-deck");
      this.#previewDeck.classList.add("deck--preview");
      this.#previewDeck.setAttribute("aria-hidden", "true");
      this.nextFrame.append(this.#previewDeck);
    }

    return this.#previewDeck;
  }

  update() {
    this.#updatePosition();
    this.#updateNotes();
    this.#updatePreview();
  }

  #updatePosition() {
    if (!this.position) {
      return;
    }

    const { index, count, step, stepCount } = this.deck;
    const steps = stepCount > 0 ? ` · Step ${step} / ${stepCount}` : "";

    this.position.textContent = `Slide ${index + 1} / ${count}${steps}`;
  }

  #updateNotes() {
    if (!this.notesContent) {
      return;
    }

    const notes = this.deck.currentSlide.querySelector("[data-notes]");
    const content = notes && (notes.querySelector(".speaker-notes__content") || notes);

    if (content) {
      this.notesContent.innerHTML = content.innerHTML;
    } else {
      this.notesContent.replaceChildren(message("No notes for this slide."));
    }
  }

  #updatePreview() {
    if (!this.#previewDeck) {
      return;
    }

    const nextSlide = this.deck.slides[this.deck.index + 1];

    this.#previewDeck.replaceChildren(
      nextSlide ? previewOf(nextSlide) : message("End of presentation")
    );
  }
}

/** A static copy of a slide: fully revealed, silent, without ids or embedded pages. */
function previewOf(slide) {
  const clone = slide.cloneNode(true);

  clone.removeAttribute("id");
  clone.removeAttribute("data-slide");
  clone.classList.remove("is-past");
  clone.classList.add("is-active");

  // SVG ids (diagram markers, gradients) stay: the copy's references must still resolve.
  clone.querySelectorAll("[id]:not(svg *)").forEach((element) => element.removeAttribute("id"));
  clone.querySelectorAll(".fragment").forEach((fragment) => fragment.classList.add("is-visible"));
  clone.querySelectorAll("iframe").forEach((frame) => {
    frame.removeAttribute("src");
    frame.removeAttribute("data-src");
  });
  clone.querySelectorAll("video, audio").forEach((media) => {
    media.removeAttribute("data-autoplay");
    media.muted = true;
  });

  return clone;
}

function message(text) {
  const paragraph = document.createElement("p");

  paragraph.className = "presenter-empty";
  paragraph.textContent = text;

  return paragraph;
}
