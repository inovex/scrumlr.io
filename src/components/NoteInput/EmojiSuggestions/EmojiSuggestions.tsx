import classNames from "classnames";
import {EmojiData} from "../NoteInput";
import "./EmojiSuggestions.scss";

type NoteInputEmojiSuggestionsProps = {
  suggestions: EmojiData[];
  keyboardFocusedIndex: number;
};

export const NoteInputEmojiSuggestions = ({suggestions, keyboardFocusedIndex}: NoteInputEmojiSuggestionsProps) => (
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
