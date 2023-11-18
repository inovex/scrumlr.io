import {ChangeEventHandler, FormEventHandler, HTMLProps, KeyboardEventHandler, useCallback, useEffect, useState, ComponentProps, ReactEventHandler} from "react";
import {MAX_NOTE_LENGTH, MIN_CHARACTERS_TO_TRIGGER_EMOJI_SUGGESTIONS} from "constants/misc";
import {EmojiSuggestions} from "components/EmojiSuggestions";
import {SkinToneComponent} from "types/skinTone";
import {useAppSelector} from "store";
import {useOnBlur} from "./useOnBlur";

export const emojiRegex = /^:([\w\d]+):?$/i;

export type EmojiData = [slug: string, emoji: string, supportsSkintones: boolean];

type InputElement = HTMLTextAreaElement | HTMLInputElement;

export function emojiWithSkinTone(emoji: string, skinTone: SkinToneComponent) {
  // the emoji with skin color support is assumed to be the first unicode character
  // this means emojis with multiple people are unfortunately not supported
  return emoji.substring(0, 2) + skinTone + emoji.substring(2);
}

/**
 * this hook handles all the logic for the emoji autocomplete
 * if you want to extend the event handlers, first call the handler retured,
 * then check with e.defaultPrevented if the input has something to do with the emoji suggestions
 *
 * @param maxInputLength the maximum length of the input
 * @param initialValue the initial value of the input
 * @param suggestionsHidden whether the suggestions should be hidden (affects keyboard navigation)
 * @returns `containerRef`: set this to the container element that includes both the input and the `EmojiSuggestions` component (used for onBlur)
 * @returns `suggestionsProps`: props for the EmojiSuggestions component
 * @returns `value` and `setValue`: get and set the value of the input
 * @returns `inputBindings`: bindings for the input element (onChange, onKeyDown, onKeyUp, onClick, maxLength, value)
 */
export const useEmojiAutocomplete = <ContainerElement extends HTMLElement>(
  {
    maxInputLength = MAX_NOTE_LENGTH,
    initialValue = "",
    suggestionsHidden = false,
  }: {
    maxInputLength?: number;
    initialValue?: string;
    suggestionsHidden?: boolean;
  } = {maxInputLength: MAX_NOTE_LENGTH, initialValue: "", suggestionsHidden: false} // names 3 times?! better syntax please @typescript ^^
) => {
  // stores all the emojis
  const [emojiData, setEmojiData] = useState<EmojiData[] | null>(null);

  const [value, setValue] = useState(initialValue);
  // null -> no cursor
  const [cursor, setCursor] = useState<number | null>(null);

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

      setValue((prev) => {
        // end replace is cursor
        // start replace is last /\s+/
        const lastWordStart =
          prev
            .slice(0, cursor)
            .split("")
            .findLastIndex((c) => /\s+/.test(c)) + 1;
        // remove the inputed :emoji_name add space behind emoji
        return `${prev.slice(0, lastWordStart)}${insertedEmoji} ${prev.slice(cursor)}`;
      });
    },
    [cursor]
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
    setSuggestions(emojiData.filter(([slug]) => slug.includes(emojiName.toLowerCase())));
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
      if (maxInputLength !== undefined && newVal.length > maxInputLength) setValue(newVal.slice(0, maxInputLength));
      else setValue(newVal);
    },
    [maxInputLength]
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

  return {
    containerRef,
    suggestionsProps: {
      suggestions,
      keyboardFocusedIndex: focusedIndex,
      acceptSuggestion,
    } satisfies ComponentProps<typeof EmojiSuggestions>,
    value,
    setValue,
    inputBindings: {
      onChange: handleChange,
      onKeyDown: handleKeyDown,
      onKeyUp: handleUpdateCursor,
      onClick: handleUpdateCursor,
      maxLength: maxInputLength,
      value,
    } satisfies HTMLProps<InputElement>,
  };
};
