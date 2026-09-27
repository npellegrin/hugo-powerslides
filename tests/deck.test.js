import assert from "node:assert/strict";
import { beforeEach, describe, test } from "node:test";
import { Deck } from "../assets/slides/js/core/deck.js";
import { fakeSlide } from "./helpers/fake-dom.js";

describe("Deck", () => {
  let slides;
  let deck;
  let changes;

  beforeEach(() => {
    slides = [fakeSlide(0), fakeSlide(2), fakeSlide(0)];
    deck = new Deck(slides);
    changes = [];
    deck.addEventListener("change", (event) => changes.push(event.detail));
    deck.goTo(0);
  });

  const position = () => `${deck.index}.${deck.step}`;

  test("reveals each step before moving to the next slide", () => {
    const visited = [];

    for (let i = 0; i < 4; i += 1) {
      deck.next();
      visited.push(position());
    }

    assert.deepEqual(visited, ["1.0", "1.1", "1.2", "2.0"]);
  });

  test("going back into a slide shows all of its steps", () => {
    deck.goTo(2);
    deck.previous();

    assert.equal(position(), "1.2");
    assert.ok(slides[1].fragments.every((fragment) => fragment.classList.contains("is-visible")));
  });

  test("marks visible and current steps", () => {
    deck.goTo(1, 1);

    const [first, second] = slides[1].fragments;

    assert.ok(first.classList.contains("is-visible"));
    assert.ok(first.classList.contains("is-current"));
    assert.ok(!second.classList.contains("is-visible"));
  });

  test("marks the active and past slides", () => {
    deck.goTo(1);

    assert.ok(slides[0].classList.contains("is-past"));
    assert.ok(slides[1].classList.contains("is-active"));
    assert.ok(!slides[2].classList.contains("is-active"));
  });

  test("stays within the first and last slides", () => {
    deck.goTo(99);
    assert.equal(deck.index, 2);

    deck.next();
    assert.equal(deck.index, 2);

    deck.goTo(-5);
    assert.equal(deck.index, 0);
  });

  test("reports where a change comes from", () => {
    deck.goTo(1, 0, "remote");

    assert.deepEqual(changes.at(-1), { previousIndex: 0, origin: "remote" });
  });
});
