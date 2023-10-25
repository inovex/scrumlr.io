import classNames from "classnames";
import {EmojiData} from "utils/hooks/useEmojiAutocomplete";
import "./EmojiSuggestions.scss";

type EmojiSuggestionsProps = {
  suggestions: EmojiData[];
  keyboardFocusedIndex: number;
};

export const EmojiSuggestions = ({suggestions, keyboardFocusedIndex}: EmojiSuggestionsProps) => (
  <ul className="emoji-suggestions">
    {suggestions.map(([slug, emoji, _supportsSkintones], i) => (
      <li
        className={classNames("emoji-suggestions__element", {"emoji-suggestions__element--focus": i === keyboardFocusedIndex})}
        onClick={() => console.log("clicked on", emoji, slug)}
        key={slug}
      >
        <span className="emoji-suggestions__emoji">{emoji}</span>:{slug}:
      </li>
    ))}
  </ul>
);
