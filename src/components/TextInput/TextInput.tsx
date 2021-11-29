import {DetailedHTMLProps, FC, InputHTMLAttributes} from "react";
import classNames from "classnames";
import "./TextInput.scss";

export interface TextInputProps extends DetailedHTMLProps<InputHTMLAttributes<HTMLInputElement>, HTMLInputElement> {
  type?: "text" | "password";
}

export var TextInput: FC<TextInputProps> = function ({className, type = "text", ...other}) {
  return <input className={classNames("text-input", className)} type={type} {...other} />;
};
