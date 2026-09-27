const CHANNEL = "hugo-powerslides";

/**
 * Keeps the audience and presenter windows on the same slide and step.
 * Uses BroadcastChannel, or storage events in browsers without it.
 */
export class WindowSync {
  #channel = null;

  constructor({ onState }) {
    this.onState = onState;
  }

  start() {
    if ("BroadcastChannel" in window) {
      this.#channel = new BroadcastChannel(CHANNEL);
      this.#channel.addEventListener("message", (event) => this.#receive(event.data));
      return;
    }

    window.addEventListener("storage", (event) => {
      if (event.key === CHANNEL && event.newValue) {
        this.#receive(parse(event.newValue));
      }
    });
  }

  send(index, step) {
    const message = { type: "state", index, step };

    if (this.#channel) {
      this.#channel.postMessage(message);
      return;
    }

    try {
      localStorage.setItem(CHANNEL, JSON.stringify({ ...message, timestamp: Date.now() }));
    } catch {
      // Storage may be unavailable, for example in private browsing.
    }
  }

  #receive(message) {
    if (message?.type === "state") {
      this.onState(message.index, message.step);
    }
  }
}

function parse(json) {
  try {
    return JSON.parse(json);
  } catch {
    return null;
  }
}
