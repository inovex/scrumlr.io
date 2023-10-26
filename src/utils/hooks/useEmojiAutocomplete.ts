import {ChangeEventHandler, FormEventHandler, HTMLProps, KeyboardEventHandler, useCallback, useEffect, useState, KeyboardEvent, ComponentProps} from "react";
import {MIN_CHARACTERS_TO_TRIGGER_EMOJI_SUGGESTIONS} from "constants/misc";
import {EmojiSuggestions} from "components/EmojiSuggestions";
import {useOnBlur} from "./useOnBlur";

export const emojiRegex = /^:([a-z0-9_]+):?$/i;

export type EmojiData = [slug: string, emoji: string, supportsSkintones: boolean];

type InputElement = HTMLTextAreaElement | HTMLInputElement;

export const useEmojiAutocomplete = <ContainerElement extends HTMLElement>({
  onKeyDown: handleKeyDownInput,
  onKeyUp: handleKeyUpInput,
  maxInputLength,
}: {
  onKeyDown?: (e: KeyboardEvent<InputElement>, value: string) => void;
  onKeyUp?: (e: KeyboardEvent<InputElement>, value: string) => void;
  maxInputLength?: number;
}) => {
  const [emojiData, setEmojiData] = useState<EmojiData[] | null>(null);

  const [value, setValue] = useState("");
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
        return prev.slice(0, lastWordStart) + emoji + prev.slice(cursor);
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
    setSuggestions(emojiData.filter(([slug]) => slug.includes(emojiName)));
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
      handleKeyDownInput?.(e, value);
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
        handleKeyDownInput?.(e, value);
        break;
      }
    }
  };

  // handle: arrow left/right -> update cursor
  const handleKeyUp: KeyboardEventHandler<InputElement> = (e) => {
    updateCursor(e.currentTarget);

    handleKeyUpInput?.(e, value);
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
      value,
    } satisfies HTMLProps<InputElement>,
  };
};
