/** Renders math with KaTeX, loaded only on pages that contain math (see the slides layout). */
const DELIMITERS = [
  { left: "$$", right: "$$", display: true },
  { left: "\\[", right: "\\]", display: true },
  { left: "\\(", right: "\\)", display: false }
];

const deckElement = document.querySelector("[data-deck]");

if (deckElement && typeof window.renderMathInElement === "function") {
  window.renderMathInElement(deckElement, { delimiters: DELIMITERS, throwOnError: false });
  document.dispatchEvent(new CustomEvent("powerslides:rendered"));
}
