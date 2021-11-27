import {FC, ReactElement, ReactNode} from "react";
import classNames from "classnames";
import {TextInput} from "../TextInput";
import "./TextInputLabel.scss";

export interface TextInputLabelProps {
  className?: string;
  label: ReactNode;
  children: ReactElement<typeof TextInput>;
}

export var TextInputLabel: FC<TextInputLabelProps> = function({className, label, children}) {
  return <label className={classNames("text-input-label", className)}>
    <span className="text-input-label__label">{label}</span>
    {children}
  </label>
}
