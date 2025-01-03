import TextareaAutosize from "react-autosize-textarea";
import classNames from "classnames";
import {Dispatch, FormEvent, SetStateAction} from "react";
import "./TextArea.scss";

type TextAreaProps = {
  className?: string;
  input: string;
  setInput: Dispatch<SetStateAction<string>>;

  extendable?: boolean;
  // minLines?: number;

  placeholder?: string;
};

export const TextArea = (props: TextAreaProps) => {
  const updateInput = (e: FormEvent<HTMLTextAreaElement>) => props.setInput(e.currentTarget.value);

  return (
    <TextareaAutosize
      className={classNames(props.className, "text-area", {"text-area--extendable": props.extendable})}
      value={props.input}
      onInput={updateInput}
      placeholder={props.placeholder}
      onPointerEnterCapture={undefined}
      onPointerLeaveCapture={undefined}
    />
  );
};