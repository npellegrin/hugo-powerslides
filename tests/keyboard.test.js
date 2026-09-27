import assert from "node:assert/strict";
import { beforeEach, describe, test } from "node:test";
import { Commands } from "../assets/slides/js/core/commands.js";
import { GotoPrompt } from "../assets/slides/js/input/goto-prompt.js";
import { Keyboard } from "../assets/slides/js/input/keyboard.js";
import { fakeKeydown } from "./helpers/fake-dom.js";

describe("Keyboard", () => {
  let press;
  let ran;
  let overview;
  let gotoIndex;
  let display;

  beforeEach(() => {
    ran = [];
    gotoIndex = null;
    display = { textContent: "", hidden: true };
    overview = { isOpen: false, handleKey: () => true };

    const names = ["next", "previous", "first", "last", "overview", "fullscreen", "presenter"];
    const commands = new Commands(Object.fromEntries(names.map((name) => [name, () => ran.push(name)])));
    const gotoPrompt = new GotoPrompt({ display, onConfirm: (index) => (gotoIndex = index) });

    globalThis.document = { addEventListener: (type, handler) => (press = handler) };
    new Keyboard({ commands, gotoPrompt, overview }).start();
  });

  const pressKey = (key, options) => {
    const event = fakeKeydown(key, options);

    press(event);
    return event;
  };

  test("maps navigation keys, including presentation clickers", () => {
    ["ArrowRight", "PageDown", " ", "ArrowLeft", "PageUp", "Home", "End"].forEach((key) => pressKey(key));

    assert.deepEqual(ran, ["next", "next", "next", "previous", "previous", "first", "last"]);
  });

  test("maps letter shortcuts in either case", () => {
    ["F", "p", "o", "Escape"].forEach((key) => pressKey(key));

    assert.deepEqual(ran, ["fullscreen", "presenter", "overview", "overview"]);
  });

  test("prevents page scrolling for navigation keys", () => {
    assert.ok(pressKey(" ").wasPrevented);
  });

  test("ignores browser shortcuts and focused buttons", () => {
    pressKey("f", { ctrlKey: true });
    pressKey(" ", { onButton: true });

    assert.deepEqual(ran, []);
  });

  test("goes to a typed slide number on Enter", () => {
    pressKey("1");
    pressKey("2");
    assert.equal(display.textContent, "Go to 12");

    pressKey("Enter");
    assert.equal(gotoIndex, 11);
    assert.ok(display.hidden);
  });

  test("lets the open overview handle keys first", () => {
    overview.isOpen = true;
    pressKey("ArrowRight");

    assert.deepEqual(ran, []);
  });
});
