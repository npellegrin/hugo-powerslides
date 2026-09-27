/** Elapsed-time timer and wall clock for presenter mode. */
export class Timer {
  #elapsed = 0;
  #startedAt = Date.now();
  #isRunning = true;

  constructor({ display, clock, toggleButton }) {
    this.display = display;
    this.clock = clock;
    this.toggleButton = toggleButton;
  }

  start() {
    this.#render();
    setInterval(() => this.#render(), 1000);
  }

  toggle() {
    this.#elapsed = this.#currentElapsed();
    this.#startedAt = Date.now();
    this.#isRunning = !this.#isRunning;

    if (this.toggleButton) {
      this.toggleButton.textContent = this.#isRunning ? "Pause" : "Resume";
      this.toggleButton.setAttribute("aria-pressed", String(!this.#isRunning));
    }

    this.#render();
  }

  reset() {
    this.#elapsed = 0;
    this.#startedAt = Date.now();
    this.#render();
  }

  #currentElapsed() {
    return this.#elapsed + (this.#isRunning ? Date.now() - this.#startedAt : 0);
  }

  #render() {
    if (this.display) {
      this.display.textContent = formatDuration(this.#currentElapsed());
    }

    if (this.clock) {
      this.clock.textContent = new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit"
      });
    }
  }
}

function formatDuration(milliseconds) {
  const totalSeconds = Math.floor(milliseconds / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, "0");
  const seconds = String(totalSeconds % 60).padStart(2, "0");

  return hours > 0 ? `${hours}:${minutes}:${seconds}` : `${minutes}:${seconds}`;
}
