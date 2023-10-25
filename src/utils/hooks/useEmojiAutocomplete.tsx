import {ChangeEventHandler, FormEventHandler, HTMLProps, KeyboardEventHandler, useCallback, useEffect, useState, KeyboardEvent} from "react";
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

  const containerRef = useOnBlur<ContainerElement>(() => setEmojiName(""));

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

    if (cursor === null) return;

    const lastWord = value.slice(0, cursor).split(/\s+/).pop();
    if (!lastWord) return;

    const [, newEmojiName] = lastWord.match(emojiRegex) || [];
    if (!newEmojiName || newEmojiName.length < MIN_CHARACTERS_TO_TRIGGER_EMOJI_SUGGESTIONS) return;

    // emoji autocomplete
    setEmojiName(newEmojiName);
  }, [value, cursor]);

  const updateCursor = useCallback((target: InputElement) => setCursor(target.selectionStart === target.selectionEnd ? target.selectionStart : null), []);

  const Suggestions = useCallback(() => suggestions.length > 0 && <EmojiSuggestions keyboardFocusedIndex={0} suggestions={suggestions} />, [suggestions]); // TODO use context

  // handle: update input, update suggestions
  // FormEventHandler for TextareaAutosize
  const handleChange: FormEventHandler<InputElement> & ChangeEventHandler<InputElement> = useCallback(
    (e) => {
      const newVal = e.currentTarget.value;
      if (maxInputLength !== undefined && newVal.length > maxInputLength) return;
      setValue(newVal);
      updateCursor(e.currentTarget);
    },
    [maxInputLength, updateCursor]
  );

  // handle: enter/tab (accept suggestion), arrow up/down (switch suggestion), escape (close suggestions)
  const handleKeyDown: KeyboardEventHandler<InputElement> = (e) => {
    if (!emojiName || suggestions.length === 0 || e.shiftKey || e.ctrlKey || e.altKey || e.metaKey) {
      // nothing to do with emoji suggestions
      handleKeyDownInput?.(e, value);
    }

    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      console.log("enter pressed", suggestions[0]);
    }
  };

  // handle: arrow left/right -> update cursor
  const handleKeyUp: KeyboardEventHandler<InputElement> = (e) => {
    updateCursor(e.currentTarget);

    handleKeyUpInput?.(e, value);
  };

  return {
    containerRef,
    Suggestions,
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
