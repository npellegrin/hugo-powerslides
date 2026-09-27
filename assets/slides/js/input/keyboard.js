// PageDown and PageUp are what most presentation clickers send.
const KEYMAP = {
  ArrowRight: "next",
  ArrowDown: "next",
  PageDown: "next",
  " ": "next",
  ArrowLeft: "previous",
  ArrowUp: "previous",
  PageUp: "previous",
  Home: "first",
  End: "last",
  f: "fullscreen",
  p: "presenter",
  o: "overview",
  Escape: "overview"
};

const ARROW_KEYS = ["ArrowRight", "ArrowDown", "ArrowLeft", "ArrowUp", "PageDown", "PageUp", " "];

/**
 * Translates key presses into commands. Priority: typed slide number, then the overview's
 * own keys, then the keymap.
 */
export class Keyboard {
  constructor({ commands, gotoPrompt, overview }) {
    this.commands = commands;
    this.gotoPrompt = gotoPrompt;
    this.overview = overview;
  }

  start() {
    document.addEventListener("keydown", (event) => this.#handle(event));
  }

  #handle(event) {
    if (shouldIgnore(event)) {
      return;
    }

    if (this.gotoPrompt.handleKey(event)) {
      return;
    }

    if (this.overview.isOpen && this.overview.handleKey(event)) {
      return;
    }

    const command = KEYMAP[event.key] || KEYMAP[event.key.toLowerCase()];

    if (command) {
      if (ARROW_KEYS.includes(event.key)) {
        event.preventDefault();
      }

      this.commands.run(command);
    }
  }
}

function shouldIgnore(event) {
  if (event.ctrlKey || event.metaKey || event.altKey || event.defaultPrevented) {
    return true;
  }

  if (event.target.closest("input, textarea, select, [contenteditable]")) {
    return true;
  }

  // Focused buttons and links handle their own activation keys.
  return (event.key === " " || event.key === "Enter") && Boolean(event.target.closest("button, a"));
}
