const MAX_DIGITS = 4;
const TIMEOUT = 2500;

/** Go to a slide by typing its number, then Enter. Escape cancels. */
export class GotoPrompt {
  #digits = "";
  #timeout;

  constructor({ display, onConfirm }) {
    this.display = display;
    this.onConfirm = onConfirm;
  }

  /** Returns true when the key was handled. */
  handleKey(event) {
    if (/^[0-9]$/.test(event.key)) {
      this.#type(event.key);
      return true;
    }

    if (!this.#digits) {
      return false;
    }

    if (event.key === "Enter") {
      event.preventDefault();
      const slideNumber = Number(this.#digits);

      this.#clear();
      this.onConfirm(slideNumber - 1);
      return true;
    }

    if (event.key === "Escape") {
      this.#clear();
      return true;
    }

    return false;
  }

  #type(digit) {
    this.#digits = (this.#digits + digit).slice(-MAX_DIGITS);
    clearTimeout(this.#timeout);
    this.#timeout = setTimeout(() => this.#clear(), TIMEOUT);
    this.#show(`Go to ${this.#digits}`);
  }

  #clear() {
    this.#digits = "";
    clearTimeout(this.#timeout);
    this.#show("");
  }

  #show(text) {
    if (this.display) {
      this.display.textContent = text;
      this.display.hidden = !text;
    }
  }
}
