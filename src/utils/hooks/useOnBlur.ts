import {useCallback, useEffect, useRef} from "react";

/**
 * Calls the function if the target is outside the ref.
 * @param callback The function to call.
 * @param eventType The type of event to listen to.
 * @returns A `RefObject` from an `useRef` hook.
 */
export const useOnBlur = <RefElement extends HTMLElement = HTMLDivElement>(callback: () => unknown, eventType: keyof DocumentEventMap = "click") => {
  const ref = useRef<RefElement | null>(null);

  const handleBlur = useCallback(
    (event: DocumentEventMap[typeof eventType]) => {
      const target = event.target as HTMLElement;
      if (ref.current && !ref.current.contains(target)) {
        callback();
      }
    },
    [callback]
  );

  useEffect(() => {
    document.addEventListener(eventType, handleBlur, true);
    return () => {
      document.removeEventListener(eventType, handleBlur, true);
    };
  }, [eventType, handleBlur]);

  return ref;
};
