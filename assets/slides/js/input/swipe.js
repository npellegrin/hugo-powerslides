const MIN_DISTANCE = 50;
const HORIZONTAL_RATIO = 1.5;

/** Horizontal swipes on touch screens go to the next or previous step. */
export class Swipe {
  #start = null;

  constructor({ surface, commands, isEnabled }) {
    this.surface = surface;
    this.commands = commands;
    this.isEnabled = isEnabled;
  }

  start() {
    this.surface.addEventListener("touchstart", (event) => this.#begin(event), { passive: true });
    this.surface.addEventListener("touchend", (event) => this.#end(event));
  }

  #begin(event) {
    const touch = event.touches[0];

    this.#start =
      event.touches.length === 1 && this.isEnabled() ? { x: touch.clientX, y: touch.clientY } : null;
  }

  #end(event) {
    if (!this.#start) {
      return;
    }

    const touch = event.changedTouches[0];
    const deltaX = touch.clientX - this.#start.x;
    const deltaY = touch.clientY - this.#start.y;

    this.#start = null;

    if (Math.abs(deltaX) < MIN_DISTANCE || Math.abs(deltaX) < Math.abs(deltaY) * HORIZONTAL_RATIO) {
      return;
    }

    if (scrollsHorizontally(event.target)) {
      return;
    }

    this.commands.run(deltaX < 0 ? "next" : "previous");
  }
}

// Swipes inside wide code blocks and tables scroll them instead.
function scrollsHorizontally(target) {
  const scroller = target.closest("pre, table");

  return Boolean(scroller) && scroller.scrollWidth > scroller.clientWidth;
}
