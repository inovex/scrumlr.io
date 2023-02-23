import classNames from "classnames";
import {ButtonHTMLAttributes, DetailedHTMLProps, FC, PropsWithChildren} from "react";
import "./TextInputAdornment.scss";

export interface TextInputAdornmentProps extends DetailedHTMLProps<ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement> {
  title: string;
}

export const TextInputAdornment: FC<PropsWithChildren<TextInputAdornmentProps>> = ({title, className, children, ...other}) => (
  <button type="button" className={classNames("text-input-adornment", className)} aria-label={title} title={title} {...other}>
    {children}
  </button>
);
