import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { StatusView } from "../assets/slides/js/views/status.js";

const element = () => ({ textContent: "", style: {} });

describe("StatusView", () => {
  test("shows the slide number and advances the progress bar with steps", () => {
    const view = new StatusView({ current: element(), total: element(), progressBar: element() });

    view.update({ index: 1, count: 3, step: 1, stepCount: 1 });

    assert.equal(view.current.textContent, "2");
    assert.equal(view.total.textContent, "3");
    assert.equal(view.progressBar.style.transform, "scaleX(0.75)");
  });

  test("shows a full bar for a single slide", () => {
    const view = new StatusView({ progressBar: element() });

    view.update({ index: 0, count: 1, step: 0, stepCount: 0 });

    assert.equal(view.progressBar.style.transform, "scaleX(1)");
  });
});
