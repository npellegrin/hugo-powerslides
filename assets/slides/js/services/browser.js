export function toggleFullscreen() {
  if (document.fullscreenElement) {
    document.exitFullscreen().catch(() => {});
  } else {
    // The browser may refuse fullscreen.
    document.documentElement.requestFullscreen?.().catch(() => {});
  }
}

export function isPresenterWindow() {
  return new URLSearchParams(window.location.search).has("presenter");
}

export function openPresenterWindow() {
  const url = new URL(window.location.href);

  url.searchParams.set("presenter", "1");
  window.open(url.toString(), "hugo-slides-presenter", "popup,width=1400,height=900,resizable=yes");
}
