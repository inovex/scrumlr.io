import classNames from "classnames";
import {ButtonHTMLAttributes, DetailedHTMLProps, FC} from "react";
import "./TextInputAction.scss";

export interface TextInputActionProps extends DetailedHTMLProps<ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement> {
  title: string;
}

export var TextInputAction: FC<TextInputActionProps> = function ({title, className, children, ...other}) {
  return (
    <button type="button" className={classNames("text-input-action", className)} aria-label={title} title={title} {...other}>
      {children}
    </button>
  );
};
