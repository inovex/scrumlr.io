import {RefObject, useEffect} from "react";

/**
 * attaches a keydown event listener to a specified element
 * and triggers a callback function when the 'Cmd + Enter' or 'Ctrl + Enter' key combination is pressed.
 *
 * @param {RefObject<T>} elementRef - the ref object pointing to the target DOM element.
 * @param {() => void} callback - the function to be executed when the key combination is detected.
 */
export const useSubmitOnShortcut = <T extends HTMLElement>(elementRef: RefObject<T>, callback?: () => void) => {
  useEffect(() => {
    const element = elementRef.current;
    if (!element) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
        event.preventDefault();
        callback?.();
      }
    };

    element.addEventListener("keydown", handleKeyDown);

    // cleanup
    return () => {
      element.removeEventListener("keydown", handleKeyDown);
    };
  }, [elementRef, callback]);
};
