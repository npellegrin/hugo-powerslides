(async function () {
  "use strict";

  const mermaid = window.mermaid;
  const nodes = Array.from(document.querySelectorAll("[data-deck] pre.mermaid"));

  if (!mermaid || nodes.length === 0) {
    return;
  }

  // Diagrams are rendered one by one so each follows the theme of its own slide.
  for (const node of nodes) {
    const style = getComputedStyle(node);
    const color = (name) => style.getPropertyValue(`--color-${name}`).trim();
    const slide = node.closest(".slide");
    const fontSize = slide ? parseFloat(getComputedStyle(slide).fontSize) * 0.8 : 24;

    mermaid.initialize({
      startOnLoad: false,
      securityLevel: "strict",
      theme: "base",
      fontFamily: style.fontFamily,
      themeVariables: {
        fontFamily: style.fontFamily,
        fontSize: `${fontSize}px`,
        background: color("background"),
        primaryColor: color("surface"),
        primaryTextColor: color("text"),
        primaryBorderColor: color("primary"),
        secondaryColor: color("background"),
        tertiaryColor: color("surface"),
        lineColor: color("muted"),
        textColor: color("text"),
        noteBkgColor: color("surface"),
        noteTextColor: color("text")
      }
    });

    await mermaid.run({ nodes: [node], suppressErrors: true });
  }

  document.dispatchEvent(new CustomEvent("powerslides:rendered"));
})();
