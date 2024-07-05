import {useEffect, useState, RefObject} from "react";
import {useSize} from "./useSize";

export const useIsTouchingSides = (ref: RefObject<HTMLElement>) => {
  const [isTouchingLeftSide, setIsTouchingLeftSide] = useState<boolean>(false);
  const [isTouchingRightSide, setIsTouchingRightSide] = useState<boolean>(false);
  const size = useSize(ref);

  const checkTouchingSides = () => {
    if (!ref.current || !size) return;

    const {scrollLeft, scrollWidth, clientWidth} = ref.current;
    const leftSide = scrollLeft === 0;
    const rightSide = scrollLeft + clientWidth === scrollWidth;

    setIsTouchingLeftSide(leftSide);
    setIsTouchingRightSide(rightSide);
  };

  useEffect(() => {
    if (!ref.current) return;

    checkTouchingSides(); // Initial check

    const handleScroll = () => {
      checkTouchingSides();
    };

    ref.current.addEventListener("scroll", handleScroll);

    return () => {
      ref.current?.removeEventListener("scroll", handleScroll);
    };
  }, [checkTouchingSides, ref, size]);

  // Check when size changes
  useEffect(() => {
    checkTouchingSides();
  }, [checkTouchingSides, size]);

  return {isTouchingLeftSide, isTouchingRightSide};
};
