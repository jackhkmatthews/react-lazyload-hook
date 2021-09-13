import { Offsets } from "./types";

const defaultBoundingClientRect = {
  top: 0,
  right: 0,
  bottom: 0,
  left: 0,
  width: 0,
  height: 0,
};

export function on(el: any, eventName: any, callback: any, opts: any) {
  opts = opts || false;
  if (el.addEventListener) {
    el.addEventListener(eventName, callback, opts);
  } else if (el.attachEvent) {
    el.attachEvent(`on${eventName}`, (e: any) => {
      callback.call(el, e || window.event);
    });
  }
}

export function off(el: any, eventName: any, callback: any, opts: any) {
  opts = opts || false;
  if (el.removeEventListener) {
    el.removeEventListener(eventName, callback, opts);
  } else if (el.detachEvent) {
    el.detachEvent(`on${eventName}`, callback);
  }
}

export function scrollParent(node: any): HTMLElement | Document | Node {
  if (!(node instanceof HTMLElement)) {
    return document.documentElement;
  }

  const excludeStaticParent = node.style.position === "absolute";
  const overflowRegex = /(scroll|auto)/;
  let parent: Node | HTMLElement = node;

  while (parent) {
    if (!parent.parentNode) {
      return node.ownerDocument || document.documentElement;
    }

    const style = window.getComputedStyle(parent as unknown as Element);
    const position = style.position;
    const overflow = style.overflow;
    // @ts-ignore
    const overflowX = style["overflow-x"];
    // @ts-ignore
    const overflowY = style["overflow-y"];

    if (position === "static" && excludeStaticParent) {
      parent = parent.parentNode;
      continue;
    }

    if (
      overflowRegex.test(overflow) &&
      overflowRegex.test(overflowX) &&
      overflowRegex.test(overflowY)
    ) {
      return parent;
    }

    parent = parent.parentNode;
  }

  return (
    node.ownerDocument ||
    (node as unknown as Document).documentElement ||
    document.documentElement
  );
}

/**
 * Check if element is visible in overflow container parent
 */
export const checkOverflowVisible = function checkOverflowVisible(
  element: HTMLElement,
  parent: HTMLElement,
  offsets: Offsets
): boolean {
  let parentTop;
  let parentLeft;
  let parentHeight;
  let parentWidth;

  try {
    ({
      top: parentTop,
      left: parentLeft,
      height: parentHeight,
      width: parentWidth,
    } = parent.getBoundingClientRect());
  } catch (e) {
    ({
      top: parentTop,
      left: parentLeft,
      height: parentHeight,
      width: parentWidth,
    } = defaultBoundingClientRect);
  }

  const windowInnerHeight =
    window.innerHeight || document.documentElement.clientHeight;
  const windowInnerWidth =
    window.innerWidth || document.documentElement.clientWidth;

  // calculate top and height of the intersection of the element's scrollParent and viewport
  const intersectionTop = Math.max(parentTop, 0); // intersection's top relative to viewport
  const intersectionLeft = Math.max(parentLeft, 0); // intersection's left relative to viewport
  const intersectionHeight =
    Math.min(windowInnerHeight, parentTop + parentHeight) - intersectionTop; // height
  const intersectionWidth =
    Math.min(windowInnerWidth, parentLeft + parentWidth) - intersectionLeft; // width

  // check whether the element is visible in the intersection
  let top;
  let left;
  let height;
  let width;

  try {
    ({ top, left, height, width } = element.getBoundingClientRect());
  } catch (e) {
    ({ top, left, height, width } = defaultBoundingClientRect);
  }

  const offsetTop = top - intersectionTop; // element's top relative to intersection
  const offsetLeft = left - intersectionLeft; // element's left relative to intersection

  return (
    offsetTop - offsets[0] <= intersectionHeight &&
    offsetTop + height + offsets[1] >= 0 &&
    offsetLeft - offsets[0] <= intersectionWidth &&
    offsetLeft + width + offsets[1] >= 0
  );
};

/**
 * Check if element is visible in document
 */
export const checkNormalVisible = function checkNormalVisible(
  element: HTMLElement,
  offsets: Offsets
) {
  // If this element is hidden by css rules somehow, it's definitely invisible
  if (
    !(
      element.offsetWidth ||
      element.offsetHeight ||
      element.getClientRects().length
    )
  )
    return false;

  let top;
  let elementHeight;

  try {
    ({ top, height: elementHeight } = element.getBoundingClientRect());
  } catch (e) {
    ({ top, height: elementHeight } = defaultBoundingClientRect);
  }

  const windowInnerHeight =
    window.innerHeight || document.documentElement.clientHeight;

  return (
    top - offsets[0] <= windowInnerHeight &&
    top + elementHeight + offsets[1] >= 0
  );
};

/**
 * Detect if element is visible in viewport, if so, set `visible` state to true.
 * If `once` prop is provided true, remove component as listener after checkVisible
 */
export function checkVisible(element: HTMLElement, offsets: Offsets) {
  if (!(element instanceof HTMLElement)) {
    return false;
  }

  const parent = scrollParent(element);
  const isOverflow =
    parent !== element.ownerDocument &&
    parent !== document &&
    parent !== document.documentElement;

  return isOverflow
    ? checkOverflowVisible(element, parent as HTMLElement, offsets)
    : checkNormalVisible(element, offsets);
}
