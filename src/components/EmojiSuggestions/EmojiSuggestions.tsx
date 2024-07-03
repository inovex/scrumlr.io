import classNames from "classnames";
import {EmojiData, emojiWithSkinTone} from "utils/hooks/useEmojiAutocomplete";
import "./EmojiSuggestions.scss";
import {CSSProperties, useEffect, useRef} from "react";
import {useAppSelector} from "store";

type EmojiSuggestionsProps = {
  // used to prevent the suggestion container from extending beyond the viewport
  approxTopDistance?: string;
  // autocomplete hooks from useEmojiAutocomplete
  autocomplete: {
    suggestions: EmojiData[];
    keyboardFocusedIndex: number;
    acceptSuggestion: (insertedEmoji: string) => void;
  };
};

const PADDING = 8;

export const EmojiSuggestions = ({autocomplete: {suggestions, keyboardFocusedIndex, acceptSuggestion}, approxTopDistance}: EmojiSuggestionsProps) => {
  // the refs of the elements to scroll into view
  const suggestionsRef = useRef<HTMLLIElement[]>([]);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // whenever the suggestions change, remove the old refs
    suggestionsRef.current = suggestionsRef.current.slice(0, suggestions.length);

    // scroll the currently selected element into view
    // can't use scrollIntoView directly because it scrolls the whole container horizontally on firefox (see https://github.com/inovex/scrumlr.io/pull/4274)
    const focusedElementRect = suggestionsRef.current[keyboardFocusedIndex]?.getBoundingClientRect();
    const containerRect = containerRef.current?.getBoundingClientRect();
    if (!focusedElementRect || !containerRect || !containerRef.current) return;

    // a) is inside (doesn't care about padding) -> no need to scroll
    if (focusedElementRect.top >= containerRect.top && focusedElementRect.bottom <= containerRect.bottom) return;

    const scrollPosition =
      focusedElementRect.top < containerRect.top
        ? // b) is above
          containerRef.current.scrollTop + focusedElementRect.top - containerRect.top - PADDING
        : // c) is below
          containerRef.current.scrollTop + focusedElementRect.bottom - containerRect.bottom + PADDING;

    containerRef.current?.scrollTo({
      top: scrollPosition,
      behavior: "instant",
    });
  }, [keyboardFocusedIndex, suggestions]);

  const skinToneComponent = useAppSelector((state) => state.skinTone.component);

  if (suggestions.length === 0) return null;

  return (
    <div className="emoji-suggestions emoji-suggestions__container" style={{"--approx-top-distance": approxTopDistance} as CSSProperties} ref={containerRef}>
      <ul className="emoji-suggestions__list">
        {suggestions.map(([slug, emoji, supportsSkintones], i) => {
          const actualEmoji = supportsSkintones ? emojiWithSkinTone(emoji, skinToneComponent) : emoji;
          return (
            <li
              className={classNames("emoji-suggestions__element", {"emoji-suggestions__element--focus": i === keyboardFocusedIndex})}
              onMouseDown={(e) => {
                // using onMouseDown to prevent the input from losing focus
                e.preventDefault();
                acceptSuggestion(actualEmoji);
              }}
              key={slug}
              ref={(el) => {
                suggestionsRef.current[i] = el!;
              }}
            >
              <span className="emoji-suggestions__emoji">{actualEmoji}</span>:{slug}:
            </li>
          );
        })}
      </ul>
    </div>
  );
};
