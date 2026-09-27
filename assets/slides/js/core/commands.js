/**
 * Named actions shared by the keyboard, buttons, and gestures,
 * so input handlers never depend on the objects that do the work.
 */
export class Commands {
  #actions = new Map();

  constructor(actions) {
    Object.entries(actions).forEach(([name, action]) => this.#actions.set(name, action));
  }

  run(name) {
    this.#actions.get(name)?.();
  }
}
