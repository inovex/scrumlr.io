import classNames from "classnames";
import {ButtonHTMLAttributes, DetailedHTMLProps, FC} from "react";
import "./TextInputAdornment.scss";

export interface TextInputAdornmentProps extends DetailedHTMLProps<ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement> {
  title: string;
}

export var TextInputAdornment: FC<TextInputAdornmentProps> = function({title, className, children, ...other}) {
  return <button className={classNames("text-input-adornment", className)} aria-label={title} title={title} {...other}>
    {children}
  </button>
}
