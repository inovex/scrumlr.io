import classNames from "classnames";
import {ButtonHTMLAttributes, DetailedHTMLProps, FC} from "react";
import "./TextInputAction.scss";

export interface TextInputActionProps extends DetailedHTMLProps<ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement> {
  title: string;
}

export const TextInputAction: FC<TextInputActionProps> = ({title, className, children, ...other}) => (
  <button type="button" className={classNames("text-input-action", className)} aria-label={title} title={title} {...other}>
    {children}
  </button>
);
