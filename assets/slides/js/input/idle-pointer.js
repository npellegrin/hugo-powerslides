const IDLE_DELAY = 2500;

/** Marks the page idle when the mouse stops moving, so CSS can hide the controls and cursor. */
export class IdlePointer {
  #timeout;

  start() {
    document.addEventListener("pointermove", (event) => {
      if (event.pointerType !== "mouse") {
        return;
      }

      document.body.classList.remove("is-idle");
      clearTimeout(this.#timeout);
      this.#timeout = setTimeout(() => document.body.classList.add("is-idle"), IDLE_DELAY);
    });
  }
}
