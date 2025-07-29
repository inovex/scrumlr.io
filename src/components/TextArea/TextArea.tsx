import TextareaAutosize from "react-textarea-autosize";
import classNames from "classnames";
import {Dispatch, FocusEvent, FormEvent, forwardRef, SetStateAction} from "react";
import "./TextArea.scss";

type TextAreaProps = {
  className?: string;
  input: string;
  setInput?: Dispatch<SetStateAction<string>>;

  rows?: number;
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

const ROWS_DEFAULT = 7;

export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>((props, ref) => {
  const updateInput = (e: FormEvent<HTMLTextAreaElement>) => props.setInput?.(e.currentTarget.value);
  const rows = props.rows ?? ROWS_DEFAULT;

  return (
    <>
      <style>{`.text-area { --text-area-rows: ${rows} }`}</style>
      <TextareaAutosize
        ref={ref}
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
        maxRows={props.extendable ? Number.MAX_SAFE_INTEGER : rows}
        onInput={updateInput}
        placeholder={props.placeholder}
        autoFocus={props.autoFocus}
        onFocus={props.onFocus}
        onBlur={props.onBlur}
        disabled={props.disabled}
      />
    </>
  );
});
