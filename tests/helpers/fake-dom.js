/** The few DOM features the tested modules use, without a browser or a dependency. */
export class FakeClassList {
  #classes = new Set();

  add(...names) {
    names.forEach((name) => this.#classes.add(name));
  }

  remove(name) {
    this.#classes.delete(name);
  }

  toggle(name, force) {
    if (force) {
      this.#classes.add(name);
    } else {
      this.#classes.delete(name);
    }
  }

  contains(name) {
    return this.#classes.has(name);
  }
}

export function fakeFragment() {
  return { classList: new FakeClassList(), closest: () => null };
}

/** A slide with the given number of steps. */
export function fakeSlide(stepCount = 0) {
  const fragments = Array.from({ length: stepCount }, fakeFragment);

  return {
    fragments,
    classList: new FakeClassList(),
    querySelectorAll: (selector) => (selector === ".fragment" ? fragments : [])
  };
}

/** A keydown event aimed at an element that is not a form field, button, or link. */
export function fakeKeydown(key, options = {}) {
  return {
    key,
    ctrlKey: false,
    metaKey: false,
    altKey: false,
    defaultPrevented: false,
    wasPrevented: false,
    target: { closest: (selector) => (options.onButton && selector.includes("button") ? {} : null) },
    preventDefault() {
      this.wasPrevented = true;
    },
    ...options
  };
}
