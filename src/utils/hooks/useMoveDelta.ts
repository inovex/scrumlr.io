import React, {useEffect, useState} from "react";

/** used to get a updated delta where you are dragging an element
 * right now only y-axis is supported
 * @param movableRef reference to element that is draggable (where the touch event is called)
 * @param parentRef reference to element which is moved
 * @returns delta y which the element was moved from original position
 * */
export const useMoveDelta = (movableRef: React.RefObject<HTMLDivElement>, parentRef?: React.RefObject<HTMLDivElement>) => {
  const [deltaY, setDeltaY] = useState(0);

  useEffect(() => {
    const movableElement = movableRef.current!;
    const parentElement = parentRef?.current;
    const refY = movableElement.getBoundingClientRect().y;
    const offsetY = parentElement?.offsetHeight ?? 0;

    const handleTouchMove = (e: globalThis.TouchEvent) => {
      e.preventDefault();
      e.stopPropagation();
      const touch = e.changedTouches[0];
      setDeltaY(touch.clientY - refY + offsetY);
    };
    movableElement.addEventListener("touchmove", handleTouchMove);

    return () => {
      movableElement.removeEventListener("touchmove", handleTouchMove);
    };
  }, [movableRef, parentRef]);

  return deltaY;
};
