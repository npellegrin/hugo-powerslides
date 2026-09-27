(function () {
  "use strict";

  const presentation = document.querySelector("#presentation");
  const deck = presentation && presentation.querySelector("[data-deck]");

  if (!deck) {
    return;
  }

  const slides = Array.from(deck.querySelectorAll("[data-slide]"));

  if (slides.length === 0) {
    return;
  }

  const find = (selector) => document.querySelector(selector);
  const currentElement = find("[data-current-slide]");
  const totalElement = find("[data-total-slides]");
  const progressBar = find("[data-progress]");
  const gotoElement = find("[data-goto]");
  const overviewButton = find('[data-action="overview"]');
  const notesPanel = find("[data-notes-panel]");
  const notesPanelContent = find("[data-notes-panel-content]");
  const presenterBar = find("[data-presenter-bar]");
  const presenterNext = find("[data-presenter-next]");
  const nextFrame = find("[data-next-frame]");
  const timerElement = find("[data-timer]");
  const timerButton = find('[data-action="timer-toggle"]');
  const clockElement = find("[data-clock]");
  const positionElement = find("[data-presenter-position]");

  const channelName = "hugo-powerslides";
  const isPresenter = new URLSearchParams(window.location.search).has("presenter");
  const canvas = {
    width: Number(deck.dataset.width) || 1920,
    height: Number(deck.dataset.height) || 1080
  };
  const fragments = slides.map(collectFragments);

  let currentIndex = indexFromHash();
  let mediaIndex = -1;
  let currentStep = 0;
  let isOverview = false;
  let isPrinting = false;
  let gotoBuffer = "";
  let gotoTimeout;
  let nextDeck = null;
  let channel = null;

  const timer = {
    elapsed: 0,
    start: Date.now(),
    running: true
  };

  function collectFragments(slide) {
    slide.querySelectorAll("[data-fragments]").forEach((group) => {
      const style = group.dataset.fragments;
      const items = group.querySelectorAll(
        ":scope > :not(ul, ol), :scope > ul > li, :scope > ol > li"
      );

      items.forEach((item) => {
        item.classList.add("fragment");

        if (style) {
          item.classList.add(`fragment--${style}`);
        }
      });
    });

    return Array.from(slide.querySelectorAll(".fragment")).filter(
      (fragment) => !fragment.closest("[data-notes]")
    );
  }

  function indexFromHash() {
    const hash = decodeURIComponent(window.location.hash.slice(1));
    const index = slides.findIndex((slide) => slide.id === hash);

    return index >= 0 ? index : 0;
  }

  function clamp(value, minimum, maximum) {
    return Math.min(Math.max(value, minimum), maximum);
  }

  // A step of Infinity shows every fragment, which is where going back into a slide lands.
  function render(index, step = 0, broadcast = true) {
    currentIndex = clamp(index, 0, slides.length - 1);
    currentStep = clamp(step, 0, fragments[currentIndex].length);

    slides.forEach((slide, slideIndex) => {
      slide.classList.toggle("is-active", slideIndex === currentIndex);
      slide.classList.toggle("is-past", slideIndex < currentIndex);

      const visibleCount =
        slideIndex < currentIndex ? Infinity : slideIndex === currentIndex ? currentStep : 0;

      fragments[slideIndex].forEach((fragment, fragmentIndex) => {
        fragment.classList.toggle("is-visible", fragmentIndex < visibleCount);
        fragment.classList.toggle(
          "is-current",
          slideIndex === currentIndex && fragmentIndex === currentStep - 1
        );
      });
    });

    const activeSlide = slides[currentIndex];
    const fragmentCount = fragments[currentIndex].length;

    if (currentElement) {
      currentElement.textContent = String(currentIndex + 1);
    }

    if (progressBar) {
      const slideProgress = fragmentCount > 0 ? currentStep / (fragmentCount + 1) : 0;
      const progress =
        slides.length > 1 ? (currentIndex + slideProgress) / (slides.length - 1) : 1;

      progressBar.style.transform = `scaleX(${Math.min(progress, 1)})`;
    }

    if (positionElement) {
      positionElement.textContent =
        `Slide ${currentIndex + 1} / ${slides.length}` +
        (fragmentCount > 0 ? ` · Step ${currentStep} / ${fragmentCount}` : "");
    }

    if (isOverview) {
      activeSlide.scrollIntoView({ block: "nearest" });
    }

    updateNotesPanel(activeSlide);
    updatePresenterNext();
    updateMedia();

    if (activeSlide.id) {
      history.replaceState(null, "", `#${activeSlide.id}`);
    }

    if (broadcast) {
      send({ type: "state", index: currentIndex, step: currentStep });
    }
  }

  function next() {
    if (currentStep < fragments[currentIndex].length) {
      render(currentIndex, currentStep + 1);
    } else if (currentIndex < slides.length - 1) {
      render(currentIndex + 1, 0);
    }
  }

  function previous() {
    if (currentStep > 0) {
      render(currentIndex, currentStep - 1);
    } else if (currentIndex > 0) {
      render(currentIndex - 1, Infinity);
    }
  }

  // Media: videos play and pause with their slide; embeds load only near the current slide.

  function updateMedia() {
    const slideChanged = mediaIndex !== currentIndex;

    mediaIndex = currentIndex;

    slides.forEach((slide, slideIndex) => {
      const isCurrent = slideIndex === currentIndex && !isOverview;
      const isNear = slideIndex === currentIndex || slideIndex === currentIndex + 1;

      slide.querySelectorAll("video, audio").forEach((media) => {
        // The audience window plays the sound; the presenter window stays silent.
        if (isPresenter) {
          media.muted = true;
        }

        if (!isCurrent) {
          media.pause();
        } else if (slideChanged && media.hasAttribute("data-autoplay")) {
          media.play().catch(() => {});
        }
      });

      slide.querySelectorAll("iframe[data-src]").forEach((frame) => {
        const target = isNear ? frame.dataset.src : "about:blank";

        if (frame.getAttribute("src") !== target && (isNear || frame.hasAttribute("src"))) {
          frame.setAttribute("src", target);
        }
      });
    });
  }

  // Scaling

  function scaleDeck(target, container) {
    const scale = Math.min(
      container.clientWidth / canvas.width,
      container.clientHeight / canvas.height
    );

    target.style.setProperty("--deck-scale", String(scale || 1));
  }

  // Portrait phones get a fluid, smaller-font layout instead of a tiny letterboxed canvas.
  function fit() {
    const isCompact =
      !isPresenter &&
      !isPrinting &&
      window.innerWidth < 700 &&
      window.innerHeight > window.innerWidth;

    document.body.classList.toggle("is-compact", isCompact);

    if (isCompact) {
      deck.style.setProperty("--deck-width", `${presentation.clientWidth}px`);
      deck.style.setProperty("--deck-height", `${presentation.clientHeight}px`);
      deck.style.setProperty("--deck-scale", "1");
    } else {
      deck.style.removeProperty("--deck-width");
      deck.style.removeProperty("--deck-height");
      scaleDeck(deck, presentation);
    }

    if (nextDeck) {
      scaleDeck(nextDeck, nextFrame);
    }
  }

  function withoutTransitions(callback) {
    document.body.classList.add("is-instant");
    callback();
    requestAnimationFrame(() => {
      requestAnimationFrame(() => document.body.classList.remove("is-instant"));
    });
  }

  // Overview

  function setOverview(enabled) {
    isOverview = enabled;

    withoutTransitions(() => {
      document.body.classList.toggle("is-overview", enabled);
    });

    if (overviewButton) {
      overviewButton.setAttribute("aria-pressed", String(enabled));
    }

    updateMedia();

    if (enabled) {
      slides[currentIndex].scrollIntoView({ block: "center" });
    } else {
      presentation.scrollTop = 0;
      fit();
    }
  }

  function overviewColumns() {
    const columns = getComputedStyle(deck).gridTemplateColumns.split(" ").length;

    return Math.max(columns, 1);
  }

  function handleOverviewKey(event) {
    const moves = {
      ArrowRight: 1,
      ArrowLeft: -1,
      ArrowDown: overviewColumns(),
      ArrowUp: -overviewColumns()
    };

    if (event.key in moves) {
      event.preventDefault();
      render(currentIndex + moves[event.key], 0);
    } else if (event.key === "Home") {
      render(0);
    } else if (event.key === "End") {
      render(slides.length - 1);
    } else if (["Enter", "Escape", "o", "O"].includes(event.key)) {
      event.preventDefault();
      setOverview(false);
    }
  }

  // Go to slide: type the slide number, then Enter.

  function typeDigit(digit) {
    gotoBuffer = (gotoBuffer + digit).slice(-4);
    clearTimeout(gotoTimeout);
    gotoTimeout = setTimeout(clearGoto, 2500);

    if (gotoElement) {
      gotoElement.textContent = `Go to ${gotoBuffer}`;
      gotoElement.hidden = false;
    }
  }

  function clearGoto() {
    gotoBuffer = "";
    clearTimeout(gotoTimeout);

    if (gotoElement) {
      gotoElement.hidden = true;
      gotoElement.textContent = "";
    }
  }

  function confirmGoto() {
    const index = Number(gotoBuffer) - 1;

    clearGoto();
    render(index, 0);

    if (isOverview) {
      setOverview(false);
    }
  }

  // Presenter mode

  function updateNotesPanel(activeSlide) {
    if (!isPresenter || !notesPanelContent) {
      return;
    }

    const notes = activeSlide.querySelector("[data-notes]");
    const content = notes && (notes.querySelector(".speaker-notes__content") || notes);

    notesPanelContent.innerHTML = content
      ? content.innerHTML
      : '<p class="presenter-empty">No notes for this slide.</p>';
  }

  function updatePresenterNext() {
    if (!nextDeck) {
      return;
    }

    const nextSlide = slides[currentIndex + 1];

    if (!nextSlide) {
      const end = document.createElement("p");
      end.className = "presenter-empty";
      end.textContent = "End of presentation";
      nextDeck.replaceChildren(end);
      return;
    }

    const clone = nextSlide.cloneNode(true);

    clone.removeAttribute("id");
    clone.removeAttribute("data-slide");
    // SVG ids (diagram markers, gradients) stay: the clone's references must still resolve.
    clone.querySelectorAll("[id]:not(svg *)").forEach((element) => element.removeAttribute("id"));
    clone.querySelectorAll("iframe").forEach((frame) => {
      frame.removeAttribute("src");
      frame.removeAttribute("data-src");
    });
    clone.querySelectorAll("video, audio").forEach((media) => {
      media.removeAttribute("data-autoplay");
      media.muted = true;
    });
    clone.classList.remove("is-past");
    clone.classList.add("is-active");
    clone.querySelectorAll(".fragment").forEach((fragment) => {
      fragment.classList.add("is-visible");
    });

    nextDeck.replaceChildren(clone);
  }

  function formatDuration(milliseconds) {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, "0");
    const seconds = String(totalSeconds % 60).padStart(2, "0");

    return hours > 0 ? `${hours}:${minutes}:${seconds}` : `${minutes}:${seconds}`;
  }

  function timerElapsed() {
    return timer.elapsed + (timer.running ? Date.now() - timer.start : 0);
  }

  function tick() {
    if (timerElement) {
      timerElement.textContent = formatDuration(timerElapsed());
    }

    if (clockElement) {
      clockElement.textContent = new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit"
      });
    }
  }

  function toggleTimer() {
    timer.elapsed = timerElapsed();
    timer.start = Date.now();
    timer.running = !timer.running;

    if (timerButton) {
      timerButton.textContent = timer.running ? "Pause" : "Resume";
      timerButton.setAttribute("aria-pressed", String(!timer.running));
    }

    tick();
  }

  function resetTimer() {
    timer.elapsed = 0;
    timer.start = Date.now();
    tick();
  }

  function setupPresenter() {
    document.body.classList.add("is-presenter");

    [presenterBar, presenterNext, notesPanel].forEach((element) => {
      if (element) {
        element.hidden = false;
      }
    });

    if (nextFrame) {
      nextDeck = deck.cloneNode(false);
      nextDeck.removeAttribute("data-deck");
      nextDeck.classList.add("deck--preview");
      nextDeck.setAttribute("aria-hidden", "true");
      nextFrame.append(nextDeck);
    }

    tick();
    setInterval(tick, 1000);
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

  // Window synchronization between the audience and presenter windows

  function send(message) {
    if (channel) {
      channel.postMessage(message);
      return;
    }

    try {
      localStorage.setItem(channelName, JSON.stringify({ ...message, timestamp: Date.now() }));
    } catch {
      // Storage may be unavailable, for example in private browsing.
    }
  }

  function receive(message) {
    if (message && message.type === "state") {
      render(message.index, message.step, false);
    }
  }

  function toggleFullscreen() {
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    } else if (document.documentElement.requestFullscreen) {
      // The browser may refuse fullscreen.
      document.documentElement.requestFullscreen().catch(() => {});
    }
  }

  // Events

  function onKeydown(event) {
    const key = event.key;

    if (event.ctrlKey || event.metaKey || event.altKey || event.defaultPrevented) {
      return;
    }

    if (event.target.closest("input, textarea, select, [contenteditable]")) {
      return;
    }

    // Let focused buttons and links handle their own activation keys.
    if ((key === " " || key === "Enter") && event.target.closest("button, a")) {
      return;
    }

    if (/^[0-9]$/.test(key)) {
      typeDigit(key);
      return;
    }

    if (gotoBuffer && key === "Enter") {
      event.preventDefault();
      confirmGoto();
      return;
    }

    if (gotoBuffer && key === "Escape") {
      clearGoto();
      return;
    }

    if (isOverview) {
      handleOverviewKey(event);
      return;
    }

    // PageDown and PageUp are what most presentation clickers send.
    if (["ArrowRight", "ArrowDown", "PageDown", " "].includes(key)) {
      event.preventDefault();
      next();
    } else if (["ArrowLeft", "ArrowUp", "PageUp"].includes(key)) {
      event.preventDefault();
      previous();
    } else if (key === "Home") {
      render(0);
    } else if (key === "End") {
      render(slides.length - 1);
    } else if (key === "f" || key === "F") {
      toggleFullscreen();
    } else if (key === "p" || key === "P") {
      openPresenter();
    } else if (key === "o" || key === "O" || key === "Escape") {
      setOverview(true);
    }
  }

  function registerTouch() {
    let start = null;

    presentation.addEventListener(
      "touchstart",
      (event) => {
        start =
          event.touches.length === 1 && !isOverview
            ? { x: event.touches[0].clientX, y: event.touches[0].clientY }
            : null;
      },
      { passive: true }
    );

    presentation.addEventListener("touchend", (event) => {
      if (!start) {
        return;
      }

      const touch = event.changedTouches[0];
      const deltaX = touch.clientX - start.x;
      const deltaY = touch.clientY - start.y;
      const scroller = event.target.closest("pre, table");

      start = null;

      if (Math.abs(deltaX) < 50 || Math.abs(deltaX) < Math.abs(deltaY) * 1.5) {
        return;
      }

      // Horizontal swipes inside wide code blocks and tables scroll them instead.
      if (scroller && scroller.scrollWidth > scroller.clientWidth) {
        return;
      }

      if (deltaX < 0) {
        next();
      } else {
        previous();
      }
    });
  }

  function registerIdle() {
    let idleTimeout;

    document.addEventListener("pointermove", (event) => {
      if (event.pointerType !== "mouse") {
        return;
      }

      document.body.classList.remove("is-idle");
      clearTimeout(idleTimeout);
      idleTimeout = setTimeout(() => document.body.classList.add("is-idle"), 2500);
    });
  }

  function registerEvents() {
    const actions = {
      next,
      previous,
      fullscreen: toggleFullscreen,
      presenter: openPresenter,
      overview: () => setOverview(!isOverview),
      "timer-toggle": toggleTimer,
      "timer-reset": resetTimer
    };

    document.addEventListener("keydown", onKeydown);

    document.querySelectorAll("[data-action]").forEach((button) => {
      button.addEventListener("click", () => {
        const action = actions[button.dataset.action];

        if (action) {
          action();
        }
      });
    });

    deck.addEventListener("click", (event) => {
      const slide = isOverview && event.target.closest("[data-slide]");

      if (slide) {
        event.preventDefault();
        render(slides.indexOf(slide), 0);
        setOverview(false);
      }
    });

    registerTouch();
    registerIdle();

    // Math and diagrams render asynchronously; refresh the copies shown in presenter mode.
    document.addEventListener("powerslides:rendered", () => {
      updateNotesPanel(slides[currentIndex]);
      updatePresenterNext();
    });

    window.addEventListener("hashchange", () => render(indexFromHash()));

    if (window.ResizeObserver) {
      new ResizeObserver(fit).observe(presentation);
    } else {
      window.addEventListener("resize", fit);
    }

    window.addEventListener("beforeprint", () => {
      isPrinting = true;
      fit();
    });

    window.addEventListener("afterprint", () => {
      isPrinting = false;
      fit();
    });

    if ("BroadcastChannel" in window) {
      channel = new BroadcastChannel(channelName);
      channel.addEventListener("message", (event) => receive(event.data));
    } else {
      window.addEventListener("storage", (event) => {
        if (event.key !== channelName || !event.newValue) {
          return;
        }

        try {
          receive(JSON.parse(event.newValue));
        } catch {
          // Ignore malformed messages.
        }
      });
    }
  }

  if (totalElement) {
    totalElement.textContent = String(slides.length);
  }

  if (isPresenter) {
    setupPresenter();
  }

  registerEvents();
  fit();
  render(currentIndex, 0, false);
})();
