import classNames from "classnames";
import {EmojiData, emojiWithSkinTone} from "utils/hooks/useEmojiAutocomplete";
import "./EmojiSuggestions.scss";
import {useEffect, useRef} from "react";
import {useAppSelector} from "store";

type EmojiSuggestionsProps = {
  suggestions: EmojiData[];
  keyboardFocusedIndex: number;
  acceptSuggestion: (insertedEmoji: string) => void;
};

export const EmojiSuggestions = ({suggestions, keyboardFocusedIndex, acceptSuggestion}: EmojiSuggestionsProps) => {
  // the refs of the elements to scroll into view
  const suggestionsRef = useRef<HTMLLIElement[]>([]);

  useEffect(() => {
    // whenever the suggestions change, remove the old refs
    suggestionsRef.current = suggestionsRef.current.slice(0, suggestions.length);

    // scroll the currently selected element into view
    suggestionsRef.current[keyboardFocusedIndex]?.scrollIntoView({block: "nearest"});
  }, [keyboardFocusedIndex, suggestions]);

  const skinToneComponent = useAppSelector((state) => state.skinTone.component);

  if (suggestions.length === 0) return null;

  return (
    <ul className="emoji-suggestions">
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
  );
};
