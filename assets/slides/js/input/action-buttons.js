/** Buttons with a data-action attribute run the command of the same name. */
export function bindActionButtons(commands) {
  document.querySelectorAll("[data-action]").forEach((button) => {
    button.addEventListener("click", () => commands.run(button.dataset.action));
  });
}
