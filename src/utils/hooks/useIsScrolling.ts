import React, {useEffect, useState} from "react";

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
