import { collectFragments } from "./fragments.js";

const clamp = (value, minimum, maximum) => Math.min(Math.max(value, minimum), maximum);

/**
 * Navigation state: the current slide and how many of its steps are shown.
 * It updates the slides' state classes and emits a "change" event that views listen to.
 */
export class Deck extends EventTarget {
  constructor(slides) {
    super();
    this.slides = slides;
    this.fragments = slides.map(collectFragments);
    this.index = 0;
    this.step = 0;
  }

  get count() {
    return this.slides.length;
  }

  get currentSlide() {
    return this.slides[this.index];
  }

  get stepCount() {
    return this.fragments[this.index].length;
  }

  indexOf(slide) {
    return this.slides.indexOf(slide);
  }

  /**
   * A step of Infinity shows every step, which is where going back into a slide lands.
   * The origin ("local" or "remote") lets listeners avoid echoing changes from another window.
   */
  goTo(index, step = 0, origin = "local") {
    const previousIndex = this.index;

    this.index = clamp(index, 0, this.count - 1);
    this.step = clamp(step, 0, this.stepCount);
    this.#applyState();

    this.dispatchEvent(
      new CustomEvent("change", { detail: { previousIndex, origin } })
    );
  }

  next() {
    if (this.step < this.stepCount) {
      this.goTo(this.index, this.step + 1);
    } else if (this.index < this.count - 1) {
      this.goTo(this.index + 1, 0);
    }
  }

  previous() {
    if (this.step > 0) {
      this.goTo(this.index, this.step - 1);
    } else if (this.index > 0) {
      this.goTo(this.index - 1, Infinity);
    }
  }

  first() {
    this.goTo(0);
  }

  last() {
    this.goTo(this.count - 1);
  }

  #applyState() {
    this.slides.forEach((slide, slideIndex) => {
      slide.classList.toggle("is-active", slideIndex === this.index);
      slide.classList.toggle("is-past", slideIndex < this.index);

      this.fragments[slideIndex].forEach((fragment, fragmentIndex) => {
        fragment.classList.toggle("is-visible", fragmentIndex < this.#visibleSteps(slideIndex));
        fragment.classList.toggle(
          "is-current",
          slideIndex === this.index && fragmentIndex === this.step - 1
        );
      });
    });
  }

  // Past slides show all their steps so that going back looks complete.
  #visibleSteps(slideIndex) {
    if (slideIndex < this.index) {
      return Infinity;
    }

    return slideIndex === this.index ? this.step : 0;
  }
}
