/** Renders Mermaid diagrams, loaded only on pages that contain one (see the slides layout). */
const DIAGRAM_FONT_RATIO = 0.8;

async function renderDiagrams() {
  const mermaid = window.mermaid;
  const nodes = Array.from(document.querySelectorAll("[data-deck] pre.mermaid"));

  if (!mermaid || nodes.length === 0) {
    return;
  }

  // One diagram at a time, so each follows the theme of its own slide.
  for (const node of nodes) {
    mermaid.initialize(configFor(node));
    await mermaid.run({ nodes: [node], suppressErrors: true });
  }

  document.dispatchEvent(new CustomEvent("powerslides:rendered"));
}

function configFor(node) {
  const style = getComputedStyle(node);
  const color = (name) => style.getPropertyValue(`--color-${name}`).trim();
  const slide = node.closest(".slide");
  const fontSize = slide ? parseFloat(getComputedStyle(slide).fontSize) * DIAGRAM_FONT_RATIO : 24;

  return {
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
  };
}

renderDiagrams();
