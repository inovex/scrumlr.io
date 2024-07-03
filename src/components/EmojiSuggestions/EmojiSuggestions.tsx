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

export const EmojiSuggestions = ({autocomplete: {suggestions, keyboardFocusedIndex, acceptSuggestion}, approxTopDistance}: EmojiSuggestionsProps) => {
  // the refs of the elements to scroll into view
  const suggestionsRef = useRef<HTMLLIElement[]>([]);

  useEffect(() => {
    // whenever the suggestions change, remove the old refs
    suggestionsRef.current = suggestionsRef.current.slice(0, suggestions.length);

    // scroll the currently selected element into view
    suggestionsRef.current[keyboardFocusedIndex]?.scrollIntoView({behavior: "instant", block: "nearest", inline: "nearest"});
    // suggestionsRef.current[keyboardFocusedIndex]?.focus();
  }, [keyboardFocusedIndex, suggestions]);

  const skinToneComponent = useAppSelector((state) => state.skinTone.component);

  if (suggestions.length === 0) return null;

  return (
    <div className="emoji-suggestions emoji-suggestions__container" style={{"--approx-top-distance": approxTopDistance} as CSSProperties}>
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
