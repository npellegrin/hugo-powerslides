const GROUP_ITEMS = ":scope > :not(ul, ol), :scope > ul > li, :scope > ol > li";

/**
 * Returns the steps of a slide, in document order.
 * Items inside a `fragments` shortcode become steps; so does any element with the `fragment` class.
 * Speaker notes never contain steps.
 */
export function collectFragments(slide) {
  slide.querySelectorAll("[data-fragments]").forEach((group) => {
    const style = group.dataset.fragments;

    group.querySelectorAll(GROUP_ITEMS).forEach((item) => {
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
