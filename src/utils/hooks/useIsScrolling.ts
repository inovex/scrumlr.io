import React, {useEffect, useState} from "react";

/**
 * this hook returns whether a references container is currently being scrolled.
 * this can be used to do certain tasks when scrolling has started or stopped
 * @param ref the container which can be scrolled
 * @param delay the required timespan of not scrolling to be recognized as such
 * @returns boolean whether or not ref container is currently being scrolled
 */
export const useIsScrolling = (ref: React.RefObject<HTMLDivElement>, delay = 200) => {
  const [isScrolling, setIsScrolling] = useState(false);

  useEffect(() => {
    let scrollTimeout: NodeJS.Timeout;

    const handleScroll = () => {
      // Clear previous timeout
      clearTimeout(scrollTimeout);

      // Set scrolling state to true
      setIsScrolling(true);

      // Set a new timeout after scrolling ends
      scrollTimeout = setTimeout(() => {
        setIsScrolling(false);
      }, delay);
    };

    const element = ref.current!;
    element.addEventListener("scroll", handleScroll);

    return () => {
      element.removeEventListener("scroll", handleScroll);
      clearTimeout(scrollTimeout);
    };
  }, [ref, delay]);

  return isScrolling;
};
