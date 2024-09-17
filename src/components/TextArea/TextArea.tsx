import TextareaAutosize from "react-autosize-textarea";
import classNames from "classnames";
import {useState} from "react";
import "./TextArea.scss";

type TextAreaProps = {
  className?: string;
};

export const TextArea = (props: TextAreaProps) => {
  const [content, setContent] = useState("");

  return (
    <TextareaAutosize
      className={classNames(props.className, "text-area")}
      value={content}
      onInput={(e) => setContent(e.currentTarget.value)}
      onPointerEnterCapture={undefined}
      onPointerLeaveCapture={undefined}
    />
  );
};
