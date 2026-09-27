/** Slide counter and progress bar. The progress bar also advances with each step. */
export class StatusView {
  constructor({ current, total, progressBar }) {
    this.current = current;
    this.total = total;
    this.progressBar = progressBar;
  }

  update(deck) {
    if (this.total) {
      this.total.textContent = String(deck.count);
    }

    if (this.current) {
      this.current.textContent = String(deck.index + 1);
    }

    if (this.progressBar) {
      this.progressBar.style.transform = `scaleX(${progress(deck)})`;
    }
  }
}

function progress(deck) {
  if (deck.count <= 1) {
    return 1;
  }

  const stepShare = deck.stepCount > 0 ? deck.step / (deck.stepCount + 1) : 0;

  return Math.min((deck.index + stepShare) / (deck.count - 1), 1);
}
