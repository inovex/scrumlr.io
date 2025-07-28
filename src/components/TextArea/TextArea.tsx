import TextareaAutosize from "react-textarea-autosize";
import classNames from "classnames";
import React, {Dispatch, FocusEvent, FormEvent, SetStateAction} from "react";
import "./TextArea.scss";

type TextAreaProps = {
  className?: string;
  input: string;
  setInput?: Dispatch<SetStateAction<string>>;

  lines?: number;
  extendable?: boolean;
  // embedded:      to be used inside another component
  // not embedded:  form component like input
  embedded?: boolean;
  fitted?: boolean; // affects the text, padding, and border-radius rn
  border?: "none" | "normal" | "thick";

  placeholder?: string;

  disabled?: boolean;

  autoFocus?: boolean;
  onFocus?: (e: FocusEvent<HTMLTextAreaElement>) => void;
  onBlur?: (e: FocusEvent<HTMLTextAreaElement>) => void;
};

const LINES_DEFAULT = 7;

export const TextArea = (props: TextAreaProps) => {
  const updateInput = (e: FormEvent<HTMLTextAreaElement>) => props.setInput?.(e.currentTarget.value);
  const lines = props.lines ?? LINES_DEFAULT;

  return (
    <>
      <style>{`.text-area { --text-area-lines: ${lines} }`}</style>
      <TextareaAutosize
        className={classNames(
          props.className,
          "text-area",
          {
            "text-area--extendable": props.extendable,
            "text-area--embedded": props.embedded,
            "text-area--fitted": props.fitted,
          },
          `text-area--border-${props.border ?? "normal"}`
        )}
        value={props.input}
        maxRows={props.extendable ? Number.MAX_SAFE_INTEGER : lines}
        onInput={updateInput}
        placeholder={props.placeholder}
        autoFocus={props.autoFocus}
        onFocus={props.onFocus}
        onBlur={props.onBlur}
        disabled={props.disabled}
      />
    </>
  );
};
