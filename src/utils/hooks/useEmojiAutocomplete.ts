import {ChangeEventHandler, FormEventHandler, HTMLProps, KeyboardEventHandler, useCallback, useEffect, useState, ComponentProps} from "react";
import {MAX_NOTE_LENGTH, MIN_CHARACTERS_TO_TRIGGER_EMOJI_SUGGESTIONS} from "constants/misc";
import {EmojiSuggestions} from "components/EmojiSuggestions";
import {useOnBlur} from "./useOnBlur";

export const emojiRegex = /^:([\w\d]+):?$/i;

export type EmojiData = [slug: string, emoji: string, supportsSkintones: boolean];

type InputElement = HTMLTextAreaElement | HTMLInputElement;

export const useEmojiAutocomplete = <ContainerElement extends HTMLElement>(
  {
    maxInputLength = MAX_NOTE_LENGTH,
    initialValue = "",
  }: {
    maxInputLength?: number;
    initialValue?: string;
  } = {maxInputLength: MAX_NOTE_LENGTH, initialValue: ""} // names 3 times?! better syntax please @typescript ^^
) => {
  const [emojiData, setEmojiData] = useState<EmojiData[] | null>(null);

  const [value, setValue] = useState(initialValue);
  // null -> no cursor
  const [cursor, setCursor] = useState<number | null>(null);

  const [emojiName, setEmojiName] = useState("");
  const [suggestions, setSuggestions] = useState<EmojiData[]>([]);
  const [focusedIndex, setFocusedIndex] = useState(0);

  const containerRef = useOnBlur<ContainerElement>(() => setEmojiName(""));

  const acceptSuggestion = useCallback(
    (emoji: string) => {
      if (cursor === null) return;

      setValue((prev) => {
        // end replace is cursor
        // start replace is last /\s+/
        const lastWordStart =
          prev
            .slice(0, cursor ?? -1)
            .split("")
            .findLastIndex((c) => /\s+/.test(c)) + 1;
        // add space behind emoji
        return `${prev.slice(0, lastWordStart)}${emoji} ${prev.slice(cursor)}`;
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

    // filter emojis
    setSuggestions(emojiData.filter(([slug]) => slug.includes(emojiName.toLowerCase())));
  }, [emojiName, emojiData]);

  // get emoji name from value
  useEffect(() => {
    setEmojiName("");
    setFocusedIndex(0);

    if (cursor === null) return;

    const lastWord = value.slice(0, cursor).split(/\s+/).pop();
    if (!lastWord) return;

    const [, newEmojiName] = lastWord.match(emojiRegex) || [];
    if (!newEmojiName || newEmojiName.length < MIN_CHARACTERS_TO_TRIGGER_EMOJI_SUGGESTIONS) return;

    if (lastWord.endsWith(":")) {
      const emoji = emojiData?.find(([slug]) => slug === newEmojiName);

      if (emoji) acceptSuggestion(emoji[1]);

      // dont set emoji name if emoji is not found
      return;
    }

    // emoji autocomplete
    setEmojiName(newEmojiName);
  }, [value, cursor, emojiData, acceptSuggestion]);

  const updateCursor = useCallback((target: InputElement) => setCursor(target.selectionStart === target.selectionEnd ? target.selectionStart : null), []);

  // handle: update input, update suggestions
  // FormEventHandler for TextareaAutosize
  const handleChange: FormEventHandler<InputElement> & ChangeEventHandler<InputElement> = useCallback(
    (e) => {
      const newVal = e.currentTarget.value;
      if (maxInputLength !== undefined && newVal.length > maxInputLength) setValue(newVal.slice(0, maxInputLength));
      else setValue(newVal);
      updateCursor(e.currentTarget);
    },
    [maxInputLength, updateCursor]
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
        acceptSuggestion(suggestions[focusedIndex][1]);
        break;
      }
      case "ArrowDown": {
        e.preventDefault();
        setFocusedIndex((prev) => (prev + 1) % suggestions.length);
        break;
      }
      case "ArrowUp": {
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

  // handle: arrow left/right -> update cursor
  const handleKeyUp: KeyboardEventHandler<InputElement> = (e) => {
    updateCursor(e.currentTarget);
  };

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
      onKeyUp: handleKeyUp,
      maxLength: maxInputLength,
      value,
    } satisfies HTMLProps<InputElement>,
  };
};
