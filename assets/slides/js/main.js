/**
 * Entry point: finds the page elements, creates each part, and connects them.
 * Parts do not know about each other; they talk through the deck's "change" event and named commands.
 */
import { Commands } from "./core/commands.js";
import { Deck } from "./core/deck.js";
import { bindActionButtons } from "./input/action-buttons.js";
import { GotoPrompt } from "./input/goto-prompt.js";
import { IdlePointer } from "./input/idle-pointer.js";
import { Keyboard } from "./input/keyboard.js";
import { Swipe } from "./input/swipe.js";
import { isPresenterWindow, openPresenterWindow, toggleFullscreen } from "./services/browser.js";
import { MediaController } from "./services/media.js";
import { UrlHash } from "./services/url-hash.js";
import { WindowSync } from "./services/window-sync.js";
import { Overview } from "./views/overview.js";
import { PresenterView } from "./views/presenter.js";
import { StatusView } from "./views/status.js";
import { Timer } from "./views/timer.js";
import { Viewport } from "./views/viewport.js";

const find = (selector) => document.querySelector(selector);

function main() {
  const container = find("#presentation");
  const deckElement = container?.querySelector("[data-deck]");
  const slides = deckElement ? Array.from(deckElement.querySelectorAll("[data-slide]")) : [];

  if (slides.length === 0) {
    return;
  }

  const isPresenter = isPresenterWindow();
  const deck = new Deck(slides);

  const viewport = new Viewport({
    container,
    deckElement,
    canvas: {
      width: Number(deckElement.dataset.width) || 1920,
      height: Number(deckElement.dataset.height) || 1080
    },
    allowCompact: !isPresenter
  });
  const status = new StatusView({
    current: find("[data-current-slide]"),
    total: find("[data-total-slides]"),
    progressBar: find("[data-progress]")
  });
  const overview = new Overview({
    deck,
    deckElement,
    container,
    button: find('[data-action="overview"]')
  });
  const media = new MediaController({ deck, isMuted: isPresenter });
  const urlHash = new UrlHash({ deck, deckElement });
  const sync = new WindowSync({ onState: (index, step) => deck.goTo(index, step, "remote") });
  const presenter = isPresenter ? createPresenter(deck, deckElement) : null;

  const commands = new Commands({
    next: () => deck.next(),
    previous: () => deck.previous(),
    first: () => deck.first(),
    last: () => deck.last(),
    overview: () => overview.toggle(),
    fullscreen: toggleFullscreen,
    presenter: openPresenterWindow,
    "timer-toggle": () => presenter?.timer.toggle(),
    "timer-reset": () => presenter?.timer.reset()
  });

  deck.addEventListener("change", (event) => {
    status.update(deck);
    presenter?.view.update();
    media.update({ isOverviewOpen: overview.isOpen });
    urlHash.update();

    if (event.detail.origin === "local") {
      sync.send(deck.index, deck.step);
    }
  });

  overview.addEventListener("toggle", () => {
    media.update({ isOverviewOpen: overview.isOpen });

    if (!overview.isOpen) {
      viewport.fit();
    }
  });

  // Math and diagrams render asynchronously; refresh the copies shown in presenter mode.
  document.addEventListener("powerslides:rendered", () => presenter?.view.update());

  if (presenter) {
    const preview = presenter.view.start();

    if (preview) {
      viewport.addPreview(preview, find("[data-next-frame]"));
    }

    presenter.timer.start();
  }

  // The overview handles clicks on slides before in-page links do.
  overview.start();
  urlHash.start();
  viewport.start();
  sync.start();
  bindActionButtons(commands);

  new Keyboard({
    commands,
    overview,
    gotoPrompt: new GotoPrompt({
      display: find("[data-goto]"),
      onConfirm: (index) => {
        deck.goTo(index);
        overview.close();
      }
    })
  }).start();
  new Swipe({ surface: container, commands, isEnabled: () => !overview.isOpen }).start();
  new IdlePointer().start();

  deck.goTo(Math.max(urlHash.initialIndex(), 0), 0, "initial");
}

function createPresenter(deck, deckElement) {
  return {
    view: new PresenterView({
      deck,
      deckElement,
      panels: [find("[data-presenter-bar]"), find("[data-presenter-next]"), find("[data-notes-panel]")].filter(Boolean),
      notesContent: find("[data-notes-panel-content]"),
      nextFrame: find("[data-next-frame]"),
      position: find("[data-presenter-position]")
    }),
    timer: new Timer({
      display: find("[data-timer]"),
      clock: find("[data-clock]"),
      toggleButton: find('[data-action="timer-toggle"]')
    })
  };
}

main();
