import React, {useEffect, useState} from "react";

interface MoveDelta {
  x: number;
  y: number;
}

/** used to get a updated delta where you are dragging an element
 * right now only y-axis is supported
 * @param anchorRef reference to element that is draggable (where the touch event is called)
 * @returns delta which the element was moved from original position
 * */
export const useMoveDelta = (anchorRef: React.RefObject<HTMLDivElement>) => {
  const [delta, setDelta] = useState<MoveDelta>({x: 0, y: 0});

  useEffect(() => {
    const anchorElement = anchorRef.current!;
    const anchorDim = anchorElement.getBoundingClientRect();

    const handleTouchMove = (e: globalThis.TouchEvent) => {
      e.preventDefault();
      e.stopPropagation();
      const touch = e.changedTouches[0];
      const x = touch.clientX - anchorDim.x;
      const y = touch.clientY - anchorDim.y;
      setDelta({x, y});
    };
    anchorElement.addEventListener("touchmove", handleTouchMove);

    return () => {
      anchorElement.removeEventListener("touchmove", handleTouchMove);
    };
  }, [anchorRef]);

  return delta;
};
