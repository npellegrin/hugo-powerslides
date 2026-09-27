/**
 * Videos play and pause with their slide; embedded pages load only while their slide
 * is current or next, which saves bandwidth and stops their playback.
 */
export class MediaController {
  #lastIndex = -1;

  constructor({ deck, isMuted }) {
    this.deck = deck;
    this.isMuted = isMuted;
  }

  update({ isOverviewOpen = false } = {}) {
    const hasSlideChanged = this.#lastIndex !== this.deck.index;

    this.#lastIndex = this.deck.index;

    this.deck.slides.forEach((slide, slideIndex) => {
      const isCurrent = slideIndex === this.deck.index && !isOverviewOpen;
      const isNear = slideIndex === this.deck.index || slideIndex === this.deck.index + 1;

      slide.querySelectorAll("video, audio").forEach((media) => {
        this.#updatePlayback(media, isCurrent, hasSlideChanged);
      });
      slide.querySelectorAll("iframe[data-src]").forEach((frame) => updateFrame(frame, isNear));
    });
  }

  #updatePlayback(media, isCurrent, hasSlideChanged) {
    // The audience window plays the sound; the presenter window stays silent.
    if (this.isMuted) {
      media.muted = true;
    }

    if (!isCurrent) {
      media.pause();
    } else if (hasSlideChanged && media.hasAttribute("data-autoplay")) {
      media.play().catch(() => {});
    }
  }
}

function updateFrame(frame, shouldLoad) {
  if (shouldLoad && !frame.hasAttribute("src")) {
    frame.setAttribute("src", frame.dataset.src);
  } else if (!shouldLoad && frame.hasAttribute("src")) {
    // A fresh iframe unloads the page without navigating to about:blank, which renders in quirks mode.
    const empty = frame.cloneNode(false);

    empty.removeAttribute("src");
    frame.replaceWith(empty);
  }
}
