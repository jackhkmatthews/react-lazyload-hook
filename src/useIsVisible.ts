import { useEffect, useRef, useState } from "react";
import { Listener, Offsets } from "./types";
import { checkVisible, off, on } from "./utils";

let listeners: Listener[] = [];

function updateIsVisible(
  visible: boolean,
  setIsVisible: React.Dispatch<React.SetStateAction<boolean>>,
  element: HTMLElement,
  once: boolean
) {
  setIsVisible((prevIsVisible) => {
    if (once && !prevIsVisible && visible) {
      listeners = listeners.filter((listener) => listener.element !== element);
    }
    return visible;
  });
}

export function lazyLoadHandler() {
  listeners.forEach(({ element, offsets, setIsVisible, once }) => {
    const visible = checkVisible(element, offsets);
    updateIsVisible(visible, setIsVisible, element, once);
  });
}

export function useIsVisible(
  // Seperate arguments for use in useEffect dep array
  bottomOffset: number,
  topOffset: number,
  once = false
): [React.MutableRefObject<HTMLElement>, boolean] {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLElement>(null!);

  useEffect(() => {
    const element = ref.current;
    const offsets: Offsets = [bottomOffset, topOffset];
    on(window, "scroll", lazyLoadHandler, { passive: true });
    on(window, "resize", lazyLoadHandler, { passive: true });

    listeners.push({
      element,
      setIsVisible,
      once,
      offsets,
    });

    const visible = checkVisible(element, offsets);
    updateIsVisible(visible, setIsVisible, element, once);

    return function cleanup() {
      const index = listeners
        .map((listener) => listener.element)
        .indexOf(element);
      if (index !== -1) {
        listeners.splice(index, 1);
      }

      off(window, "resize", lazyLoadHandler, { passive: true });
      off(window, "scroll", lazyLoadHandler, { passive: true });
    };
  }, [once, bottomOffset, topOffset]);
  return [ref, isVisible];
}
