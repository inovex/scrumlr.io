import React, {useEffect, useRef} from "react";
import "emoji-picker-element";

/**
 * 1. Define the shape of the data returned by the emoji picker.
 * Based on emoji-picker-element documentation.
 */
export interface EmojiClickData {
  annotation: string;
  order: number;
  shortcodes: string[];
  skinTone: number;
  tags: string[];
  unicode: string;
}

/**
 * 2. Define the Props for the React Wrapper.
 * We extend HTMLAttributes to allow passing styles, classNames, and ids.
 */
interface EmojiPickerProps extends React.HTMLAttributes<HTMLElement> {
  onEmojiClick?: (emoji: EmojiClickData) => void;
  /** Optional: 'light' | 'dark' | 'auto' */
  theme?: string;
}

/**
 * 3. Global Augmentation
 * This tells TypeScript that <emoji-picker> is a valid HTML tag.
 */
declare global {
  namespace JSX {
    interface IntrinsicElements {
      "emoji-picker": React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
    }
  }
}

/**
 * 4. The Component Implementation
 */
const EmojiPicker: React.FC<EmojiPickerProps> = ({onEmojiClick, theme, ...props}) => {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    // Event Handler
    const handleEmojiClick = (event: Event) => {
      // We must cast the event to CustomEvent to access .detail
      const customEvent = event as CustomEvent<EmojiClickData>;

      if (onEmojiClick) {
        onEmojiClick(customEvent.detail);
      }
    };

    // Attach Listener
    element.addEventListener("emoji-click", handleEmojiClick);

    // Cleanup
    return () => {
      element.removeEventListener("emoji-click", handleEmojiClick);
    };
  }, [onEmojiClick]);

  // Apply the theme if provided, otherwise default behavior
  useEffect(() => {
    const element = ref.current;
    if (element && theme) {
      // Many web components use class manipulation for theming
      if (theme === "dark") element.classList.add("dark");
      else element.classList.remove("dark");
    }
  }, [theme]);

  return <emoji-picker ref={ref} {...props} />;
};

export default EmojiPicker;
