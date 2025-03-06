import TextareaAutosize from "react-textarea-autosize";
import classNames from "classnames";
import React, {Dispatch, FormEvent, SetStateAction} from "react";
import "./TextArea.scss";

type TextAreaProps = {
  className?: string;
  input: string;
  setInput: Dispatch<SetStateAction<string>>;

  extendable?: boolean;
  // embedded:      to be used inside another component
  // not embedded:  form component like input
  embedded?: boolean;
  small?: boolean; // affects the text, padding, and border-radius rn
  // minLines?: number;

  placeholder?: string;

  autoFocus?: boolean;
  onFocus?: (e: React.FocusEvent<HTMLTextAreaElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLTextAreaElement>) => void;
};

export const TextArea = (props: TextAreaProps) => {
  const updateInput = (e: FormEvent<HTMLTextAreaElement>) => props.setInput(e.currentTarget.value);

  return (
    <TextareaAutosize
      className={classNames(props.className, "text-area", {"text-area--extendable": props.extendable, "text-area--embedded": props.embedded, "text-area--small": props.small})}
      value={props.input}
      onInput={updateInput}
      placeholder={props.placeholder}
      autoFocus={props.autoFocus}
      onFocus={props.onFocus}
      onBlur={props.onBlur}
    />
  );
};
