import {useState, useEffect, useRef, RefObject} from "react";

/**
 * Custom hook to detect whether the text within a referenced container is truncated (ellipsis).
 * It can be used to determine if a tooltip should be displayed based on text visibility.
 *
 * @template RefElement
 * @param {string} label - The text to monitor for overflow.
 * @returns {{
 *   isTextTruncated: { horizontal: boolean; vertical: boolean },
 *   textRef: React.RefObject<RefElement>
 * }} An object containing:
 * - `isTextTruncated`: An object indicating if the text is truncated in either direction:
 *   - `horizontal`: A boolean indicating if the text is truncated horizontally.
 *   - `vertical`: A boolean indicating if the text is truncated vertically.
 * - `textRef`: A ref to be attached to the text element to measure its dimensions.
 *
 * @example
 * const MyComponent = () => {
 *   const { isTextTruncated, textRef } = useTextOverflow<string>('Some text that might be truncated');
 *
 *   return (
 *     <div>
 *       <h2 ref={textRef}>Some text that might be truncated</h2>
 *       {isTextTruncated.horizontal && <div className="tooltip">Text is truncated horizontally</div>}
 *       {isTextTruncated.vertical && <div className="tooltip">Text is truncated vertically</div>}
 *     </div>
 *   );
 * };
 */

export const useTextOverflow = <RefElement extends HTMLElement>(
  label: string
): {
  isTextTruncated: {horizontal: boolean; vertical: boolean};
  textRef: RefObject<RefElement>;
} => {
  const [isTextTruncated, setIsTextTruncated] = useState<{horizontal: boolean; vertical: boolean}>({
    horizontal: false,
    vertical: false,
  });
  const textRef = useRef<RefElement | null>(null);

  const detectTextOverflow = () => {
    if (textRef.current) {
      const isHorizontalOverflow = textRef.current.scrollWidth > textRef.current.clientWidth;
      const isVerticalOverflow = textRef.current.scrollHeight > textRef.current.clientHeight;

      setIsTextTruncated({
        horizontal: isHorizontalOverflow,
        vertical: isVerticalOverflow,
      });
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
