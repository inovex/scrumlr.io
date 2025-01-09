import TextareaAutosize from "react-autosize-textarea";
import classNames from "classnames";
import {Dispatch, FormEvent, SetStateAction} from "react";
import "./TextArea.scss";

type TextAreaProps = {
  className?: string;
  input: string;
  setInput: Dispatch<SetStateAction<string>>;

  extendable?: boolean;
  // embedded:      to be used inside another component
  // not embedded:  form component like input
  embedded?: boolean;
  // minLines?: number;

  placeholder?: string;

  onFocus?: () => void;
  onBlur?: () => void;
};

export const TextArea = (props: TextAreaProps) => {
  const updateInput = (e: FormEvent<HTMLTextAreaElement>) => props.setInput(e.currentTarget.value);

  return (
    <TextareaAutosize
      className={classNames(props.className, "text-area", {"text-area--extendable": props.extendable, "text-area--embedded": props.embedded})}
      value={props.input}
      onInput={updateInput}
      placeholder={props.placeholder}
      onFocus={props.onFocus}
      onBlur={props.onBlur}
      onPointerEnterCapture={undefined}
      onPointerLeaveCapture={undefined}
    />
  );
};
