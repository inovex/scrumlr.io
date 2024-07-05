import {useEffect, useState, RefObject, useCallback} from "react";
import {useSize} from "./useSize";
import {useIsScrolling} from "./useIsScrolling";

/**
 * returns if the container is scrolled to the very left or very right of the viewport.
 * @param ref the container ref which is checked
 */
export const useIsTouchingSides = (ref: RefObject<HTMLDivElement>) => {
  const [isTouchingLeftSide, setIsTouchingLeftSide] = useState<boolean>(false);
  const [isTouchingRightSide, setIsTouchingRightSide] = useState<boolean>(false);
  const size = useSize(ref);
  const isScrolling = useIsScrolling(ref, 30);

  const checkTouchingSides = useCallback(() => {
    if (!ref.current || !size) return;

    const {scrollLeft: currentScrollLeft, scrollWidth: currentScrollWidth, clientWidth: currentClientWidth} = ref.current;
    const touchingLeft = currentScrollLeft === 0;
    const touchingRight = currentScrollLeft + currentClientWidth === currentScrollWidth;

    setIsTouchingLeftSide(touchingLeft);
    setIsTouchingRightSide(touchingRight);
  }, [ref, size]);

  useEffect(() => {
    checkTouchingSides();
  }, [size, isScrolling, checkTouchingSides]);

  return {isTouchingLeftSide, isTouchingRightSide};
};
