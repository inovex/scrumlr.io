import TextareaAutosize from "react-textarea-autosize";
import classNames from "classnames";
import {Dispatch, FocusEvent, forwardRef, SetStateAction, useImperativeHandle, useRef} from "react";
import {useEmojiAutocomplete} from "utils/hooks/useEmojiAutocomplete";
import {EmojiSuggestions} from "components/EmojiSuggestions";
import "./TextArea.scss";

type TextAreaProps = {
  className?: string;
  input: string;
  setInput: Dispatch<SetStateAction<string>>;

  rows?: number;
  extendable?: boolean;
  // embedded:      to be used inside another component
  // not embedded:  form component like input
  embedded?: boolean;
  fitted?: boolean; // affects the text, padding, and border-radius rn
  border?: "none" | "normal" | "thick" | "transparent";
  textAlign?: "left" | "center";
  textDim?: boolean; // affects default text and its hover/focus color

  placeholder?: string;

  maxLength?: number;
  disabled?: boolean;

  autoFocus?: boolean;
  onFocus?: (e: FocusEvent<HTMLTextAreaElement>) => void;
  onBlur?: (e: FocusEvent<HTMLTextAreaElement>) => void;
};

const ROWS_DEFAULT = 7;

export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>((props, forwardedRef) => {
  const internalRef = useRef<HTMLTextAreaElement>(null);
  useImperativeHandle(forwardedRef, () => internalRef.current!); // use forwarded ref as internal

  const rows = props.rows ?? ROWS_DEFAULT;

  const {value, ...emoji} = useEmojiAutocomplete<HTMLTextAreaElement, HTMLDivElement>({
    inputRef: internalRef,
    value: props.input,
    onValueChange: props.setInput,
    maxInputLength: props.maxLength,
  });

  return (
    <>
      <style>{`.text-area { --text-area-rows: ${rows} }`}</style>
      <TextareaAutosize
        {...emoji.inputBindings}
        ref={internalRef}
        className={classNames(
          props.className,
          "text-area",
          {
            "text-area--extendable": props.extendable,
            "text-area--embedded": props.embedded,
            "text-area--fitted": props.fitted,
            "text-area--text-dim": props.textDim,
          },
          `text-area--border-${props.border ?? "normal"}`,
          `text-area--text-align-${props.textAlign ?? "left"}`
        )}
        maxLength={props.maxLength}
        maxRows={props.extendable ? Number.MAX_SAFE_INTEGER : rows}
        placeholder={props.placeholder}
        autoFocus={props.autoFocus}
        onFocus={props.onFocus}
        onBlur={props.onBlur}
        disabled={props.disabled}
      />
      <EmojiSuggestions {...emoji.suggestionsProps} />
    </>
  );
});
