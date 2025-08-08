import {ChangeEventHandler, FormEventHandler, HTMLProps, KeyboardEventHandler, useCallback, useEffect, useState, ComponentProps, ReactEventHandler, RefObject} from "react";
import {MAX_NOTE_LENGTH, MIN_CHARACTERS_TO_TRIGGER_EMOJI_SUGGESTIONS} from "constants/misc";
import {EmojiSuggestions} from "components/EmojiSuggestions";
import {SkinToneComponent} from "store/features/skinTone/types";
import {useAppSelector} from "store";
import {useOnBlur} from "./useOnBlur";

export const emojiRegex = /^:([\w\d]+):?$/i;

export type EmojiData = [slug: string, emoji: string, supportsSkintones: boolean, names: string[]];

export function emojiWithSkinTone(emoji: string, skinTone: SkinToneComponent) {
  // the emoji with skin color support is assumed to be the first unicode character
  // this means emojis with multiple people are unfortunately not supported
  return emoji.substring(0, 2) + skinTone + emoji.substring(2);
}

type UseEmojiAutocompleteOptions<InputElement extends HTMLInputElement | HTMLTextAreaElement> = {
  /** the ref to the input or textarea element. This is required. */
  inputRef: RefObject<InputElement>;
  /** the controlled value from the parent component */
  value: string;
  /** the function to update the parent's state */
  onValueChange: (newValue: string) => void;
  /** the maximum length of the input. Defaults to MAX_NOTE_LENGTH. */
  maxInputLength?: number;
  /** whether the suggestions should be hidden. Defaults to false. */
  suggestionsHidden?: boolean;
};

/**
 * A hook that handles all the logic for emoji autocomplete.
 *
 * If you want to extend an event handler, first call the one from `inputBindings`,
 * then check `e.defaultPrevented` to see if the event was already handled by the hook.
 *
 * @template {HTMLInputElement | HTMLTextAreaElement} InputElement The type of the DOM input element (e.g., `HTMLTextAreaElement`).
 * @template {HTMLElement} ContainerElement The type of the container element that wraps the input and suggestions (e.g., `HTMLDivElement`).
 *
 * @param {UseEmojiAutocompleteOptions<InputElement>} options - The configuration options for the hook, including the required `inputRef`.
 *
 * @returns An object containing the state and bindings needed to power the emoji autocomplete feature.
 * @property {React.RefObject<ContainerElement>} containerRef - A ref to be attached to the main container element for blur detection.
 * @property {object} suggestionsProps - Props to be spread onto the `EmojiSuggestions` component.
 * @property {string} value - The current value of the input.
 * @property {React.Dispatch<React.SetStateAction<string>>} setValue - The state setter for the input's value.
 * @property {object} inputBindings - Props to be spread onto the input element (`<textarea>` or `<input>`).
 */
export const useEmojiAutocomplete = <InputElement extends HTMLInputElement | HTMLTextAreaElement, ContainerElement extends HTMLElement>({
  inputRef,
  value,
  onValueChange,
  maxInputLength = MAX_NOTE_LENGTH,
  suggestionsHidden = false,
}: UseEmojiAutocompleteOptions<InputElement>) => {
  // stores all the emojis
  const [emojiData, setEmojiData] = useState<EmojiData[] | null>(null);

  // null -> no cursor
  const [cursor, setCursor] = useState<number | null>(null);
  const [nextCursor, setNextCursor] = useState<number | null>(null);

  // update cursor to new selection after emoji was inserted
  useEffect(() => {
    const input = inputRef.current;
    if (input && nextCursor !== null) {
      input.setSelectionRange(nextCursor, nextCursor);
      setNextCursor(null);
    }
  }, [nextCursor, inputRef]);

  // stores the currently inputed emoji name
  const [emojiName, setEmojiName] = useState("");
  const [suggestions, setSuggestions] = useState<EmojiData[]>([]);

  // focused index for EmojiSuggestions
  const [focusedIndex, setFocusedIndex] = useState(0);

  const skinToneComponent = useAppSelector((state) => state.skinTone.component);

  // set the emoji name to "" when the input loses focus to hide the suggestions
  const containerRef = useOnBlur<ContainerElement>(() => setEmojiName(""));

  const acceptSuggestion = useCallback(
    (insertedEmoji: string) => {
      if (cursor === null) return;

      const lastWordStart =
        value
          .slice(0, cursor)
          .split("")
          .findLastIndex((c) => /\s+/.test(c)) + 1;

      const newCursorPos = lastWordStart + insertedEmoji.length + 1;

      // remove the inputed :emoji_name add space behind emoji
      const newValue = `${value.slice(0, lastWordStart)}${insertedEmoji} ${value.slice(cursor)}`;

      // set the desired cursor position for the next render.
      setNextCursor(newCursorPos);

      // call the parent's update function with the final, complete string.
      onValueChange(newValue);
    },
    [cursor, value, onValueChange]
  );

  // get suggestions for emoji name
  useEffect(() => {
    if (!emojiName) {
      setSuggestions([]);
      return;
    }
    // lazy load emoji data
    if (!emojiData) {
      import("constants/emojis.json").then((data) => setEmojiData(data.default as EmojiData[]));
      return;
    }

    // update suggestions with filtered emojis
    const matchedInName: EmojiData[] = [];
    const matchedInSlug: EmojiData[] = [];

    // no for ... of
    emojiData.forEach((emoji) => {
      const [slug, , , names] = emoji;
      if (slug.includes(emojiName.toLowerCase())) matchedInSlug.push(emoji);
      else if (names.some((name) => name.includes(emojiName.toLowerCase()))) matchedInName.push(emoji);
    });

    setSuggestions([...matchedInSlug, ...matchedInName]);
  }, [emojiName, emojiData]);

  // extract emoji name from value
  useEffect(() => {
    // reset emoji name and focused index when value changes
    setEmojiName("");
    setFocusedIndex(0);

    if (cursor === null) return;

    const lastWord = value.slice(0, cursor).split(/\s+/).pop();
    if (!lastWord) return;

    const [, newEmojiName] = lastWord.match(emojiRegex) || [];
    if (!newEmojiName || newEmojiName.length < MIN_CHARACTERS_TO_TRIGGER_EMOJI_SUGGESTIONS) return;

    if (lastWord.endsWith(":")) {
      // find and insert emoji
      const emoji = emojiData?.find(([slug]) => slug === newEmojiName);

      if (emoji) {
        const [, emojiString, supportsSkintones] = emoji;
        acceptSuggestion(supportsSkintones ? emojiWithSkinTone(emojiString, skinToneComponent) : emojiString);
      }

      // dont set emoji name if emoji is not found
      return;
    }

    // emoji autocomplete
    setEmojiName(newEmojiName);
  }, [value, cursor, emojiData, acceptSuggestion, skinToneComponent]);

  // handle: update input, update suggestions
  // FormEventHandler for TextareaAutosize
  const handleChange: FormEventHandler<InputElement> & ChangeEventHandler<InputElement> = useCallback(
    (e) => {
      const newVal = e.currentTarget.value;
      // prevent exceeding max input length by slicing the input
      if (maxInputLength !== undefined && newVal.length > maxInputLength) onValueChange(newVal.slice(0, maxInputLength));
      else onValueChange(newVal);
    },
    [maxInputLength, onValueChange]
  );

  // handle: enter/tab (accept suggestion), arrow up/down (switch suggestion), escape (close suggestions)
  const handleKeyDown: KeyboardEventHandler<InputElement> = (e) => {
    if (!emojiName || suggestions.length === 0 || e.shiftKey || e.ctrlKey || e.altKey || e.metaKey) {
      // nothing to do with emoji suggestions
      return;
    }

    switch (e.key) {
      case "Enter":
      case "Tab": {
        e.preventDefault();
        const [, emojiString, supportsSkintones] = suggestions[focusedIndex];
        acceptSuggestion(supportsSkintones ? emojiWithSkinTone(emojiString, skinToneComponent) : emojiString);
        break;
      }
      case "ArrowDown": {
        if (suggestionsHidden) return;
        e.preventDefault();
        setFocusedIndex((prev) => (prev + 1) % suggestions.length);
        break;
      }
      case "ArrowUp": {
        if (suggestionsHidden) return;
        e.preventDefault();
        setFocusedIndex((prev) => (prev - 1 + suggestions.length) % suggestions.length);
        break;
      }
      case "Escape": {
        e.preventDefault();
        setEmojiName("");
        break;
      }
      default: {
        break;
      }
    }
  };

  // cursor culd change from
  // - typing / arrow keys -> onKeyUp
  // - clicking -> onClick
  const handleUpdateCursor: ReactEventHandler<InputElement> = useCallback((e) => {
    const target = e.currentTarget;
    setCursor(target.selectionStart === target.selectionEnd ? target.selectionStart : null);
  }, []);

  const handleClickClearEmojiSuggestions: ReactEventHandler<InputElement> = useCallback(() => {
    setEmojiName("");
  }, []);

  return {
    containerRef,
    suggestionsProps: {
      suggestions,
      keyboardFocusedIndex: focusedIndex,
      acceptSuggestion,
    } satisfies ComponentProps<typeof EmojiSuggestions>,
    value,
    inputBindings: {
      onChange: handleChange,
      onKeyDown: handleKeyDown,
      onKeyUp: handleUpdateCursor,
      onClick: handleClickClearEmojiSuggestions,
      maxLength: maxInputLength,
      value,
    } satisfies HTMLProps<InputElement>,
  };
};
