import {useState, useEffect, useRef, RefObject} from "react";

/**
 * Custom hook to detect whether the text within a referenced container is truncated (ellipsis).
 * It can be used to determine if a tooltip should be displayed based on text visibility.
 *
 * @template RefElement
 * @param {string} label - The text to monitor for overflow.
 * @returns {{ isTextTruncated: boolean, textRef: React.RefObject<RefElement> }} An object containing:
 * - `isTextTruncated`: A boolean indicating if the text is truncated.
 * - `textRef`: A ref to be attached to the text element to measure its dimensions.
 *
 * @example
 * const MyComponent = () => {
 *   const { isTextTruncated, textRef } = useTextOverflow<string>('Some text that might be truncated');
 *
 *   return (
 *     <div>
 *       <h2 ref={textRef}>Some text that might be truncated</h2>
 *       {isTextTruncated && <div className="tooltip">Some text that might be truncated</div>}
 *     </div>
 *   );
 * };
 */
export const useTextOverflow = <RefElement extends HTMLElement>(label: string): {isTextTruncated: boolean; textRef: RefObject<RefElement>} => {
  const [isTextTruncated, setIsTextTruncated] = useState<boolean>(false);
  const textRef = useRef<RefElement | null>(null);

  const detectTextOverflow = () => {
    if (textRef.current) {
      const isTextEllipsis = textRef.current.scrollWidth > textRef.current.clientWidth;
      setIsTextTruncated(isTextEllipsis);
    }
  };

  useEffect(() => {
    detectTextOverflow();

    // Add event listener to detect text overflow changes on window resize
    window.addEventListener("resize", detectTextOverflow);

    // Cleanup function to remove the event listener when the component unmounts
    return () => window.removeEventListener("resize", detectTextOverflow);
  }, [label]);

  return {isTextTruncated, textRef};
};
