import {FC, ReactElement, ReactNode} from "react";
import classNames from "classnames";
import {TextInput} from "../TextInput";
import "./TextInputLabel.scss";

export interface TextInputLabelProps {
  className?: string;
  htmlFor?: string;
  label: ReactNode;
  children?: ReactElement<typeof TextInput>;
}

export const TextInputLabel: FC<TextInputLabelProps> = ({className, label, htmlFor, children}) => (
  <label className={classNames("text-input-label", className)} htmlFor={htmlFor}>
    <span className="text-input-label__label">{label}</span>
    {children}
  </label>
);
