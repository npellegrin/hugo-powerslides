(function () {
  "use strict";

  const presentation = document.querySelector("#presentation");

  if (!presentation) {
    return;
  }

  const slides = Array.from(
    presentation.querySelectorAll("[data-slide]")
  );

  if (slides.length === 0) {
    return;
  }

  const currentElement = document.querySelector("[data-current-slide]");
  const totalElement = document.querySelector("[data-total-slides]");
  const notesPanel = document.querySelector("[data-notes-panel]");
  const notesPanelContent = document.querySelector("[data-notes-panel-content]");
  const channel = "clean-hugo-slides";

  let currentIndex = getInitialIndex();

  totalElement.textContent = String(slides.length);

  function getInitialIndex() {
    const hash = window.location.hash.replace("#", "");

    if (!hash) {
      return 0;
    }

    const index = slides.findIndex((slide) => slide.id === hash);

    return index >= 0 ? index : 0;
  }

  function render(index, broadcast = true) {
    currentIndex = clamp(index, 0, slides.length - 1);

    slides.forEach((slide, slideIndex) => {
      slide.classList.toggle("is-active", slideIndex === currentIndex);
      slide.classList.toggle(
        "is-next",
        slideIndex === currentIndex + 1
      );
    });

    currentElement.textContent = String(currentIndex + 1);

    const activeSlide = slides[currentIndex];

    updateNotesPanel(activeSlide);

    if (activeSlide.id) {
      history.replaceState(null, "", `#${activeSlide.id}`);
    }

    if (broadcast) {
      sendMessage({
        type: "slide-change",
        index: currentIndex
      });
    }
  }

  function updateNotesPanel(activeSlide) {
    if (!notesPanel || !notesPanelContent) {
      return;
    }

    const notes = activeSlide.querySelector("[data-notes]");

    notesPanelContent.innerHTML = notes ? notes.innerHTML : "";
    notesPanel.hidden = !notes;
  }

  function goNext() {
    render(currentIndex + 1);
  }

  function goPrevious() {
    render(currentIndex - 1);
  }

  function clamp(value, minimum, maximum) {
    return Math.min(Math.max(value, minimum), maximum);
  }

  function sendMessage(message) {
    if ("BroadcastChannel" in window) {
      const broadcastChannel = new BroadcastChannel(channel);
      broadcastChannel.postMessage(message);
      broadcastChannel.close();
    }

    localStorage.setItem(
      channel,
      JSON.stringify({
        ...message,
        timestamp: Date.now()
      })
    );
  }

  function openPresenter() {
    const url = new URL(window.location.href);
    url.searchParams.set("presenter", "1");

    window.open(
      url.toString(),
      "hugo-slides-presenter",
      "popup,width=1400,height=900,resizable=yes"
    );
  }

  function requestFullscreen() {
    if (!document.documentElement.requestFullscreen) {
      return;
    }

    document.documentElement.requestFullscreen().catch(() => {
      // The browser may refuse fullscreen.
    });
  }

  function registerEvents() {
    document.addEventListener("keydown", (event) => {
      if (event.key === "ArrowRight" || event.key === " ") {
        event.preventDefault();
        goNext();
      }

      if (event.key === "ArrowLeft") {
        event.preventDefault();
        goPrevious();
      }

      if (event.key === "Home") {
        render(0);
      }

      if (event.key === "End") {
        render(slides.length - 1);
      }

      if (event.key.toLowerCase() === "f") {
        requestFullscreen();
      }

      if (event.key.toLowerCase() === "p") {
        openPresenter();
      }
    });

    document.querySelectorAll("[data-action]").forEach((button) => {
      button.addEventListener("click", () => {
        const action = button.dataset.action;

        if (action === "next") {
          goNext();
        }

        if (action === "previous") {
          goPrevious();
        }

        if (action === "fullscreen") {
          requestFullscreen();
        }

        if (action === "presenter") {
          openPresenter();
        }
      });
    });

    window.addEventListener("hashchange", () => {
      render(getInitialIndex(), false);
    });

    window.addEventListener("storage", (event) => {
      if (event.key !== channel || !event.newValue) {
        return;
      }

      const message = JSON.parse(event.newValue);

      if (message.type === "slide-change") {
        render(message.index, false);
      }
    });

    if ("BroadcastChannel" in window) {
      const broadcastChannel = new BroadcastChannel(channel);

      broadcastChannel.addEventListener("message", (event) => {
        if (event.data.type === "slide-change") {
          render(event.data.index, false);
        }
      });
    }
  }

  if (new URLSearchParams(window.location.search).has("presenter")) {
    document.body.classList.add("is-presenter");
  }

  registerEvents();
  render(currentIndex, false);
})();
