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
  thickBorder?: boolean; // border width

  placeholder?: string;

  disabled?: boolean;

  autoFocus?: boolean;
  onFocus?: (e: FocusEvent<HTMLTextAreaElement>) => void;
  onBlur?: (e: FocusEvent<HTMLTextAreaElement>) => void;
};

const LINES_DEFAULT = 7;

export const TextArea = (props: TextAreaProps) => {
  const updateInput = (e: FormEvent<HTMLTextAreaElement>) => props.setInput?.(e.currentTarget.value);

  return (
    <>
      <style>{`.text-area { --text-area-lines: ${props.lines ?? LINES_DEFAULT} }`}</style>
      <TextareaAutosize
        className={classNames(props.className, "text-area", {
          "text-area--extendable": props.extendable,
          "text-area--embedded": props.embedded,
          "text-area--fitted": props.fitted,
          "text-area--thick-border": props.thickBorder,
        })}
        value={props.input}
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
