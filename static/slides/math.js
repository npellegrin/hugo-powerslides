(function () {
  "use strict";

  const deck = document.querySelector("[data-deck]");

  if (!deck || typeof window.renderMathInElement !== "function") {
    return;
  }

  window.renderMathInElement(deck, {
    delimiters: [
      { left: "$$", right: "$$", display: true },
      { left: "\\[", right: "\\]", display: true },
      { left: "\\(", right: "\\)", display: false }
    ],
    throwOnError: false
  });

  document.dispatchEvent(new CustomEvent("powerslides:rendered"));
})();
