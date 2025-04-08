import classNames from "classnames";
import {Color, getColorClassName} from "constants/colors";
import {MouseEvent, ReactNode} from "react";
import "./Button.scss";

type ButtonType = "primary" | "secondary" | "tertiary";

type ButtonProps = {
  type?: ButtonType;
  children?: ReactNode;
  className?: string;
  color?: Color;
  disabled?: boolean;
  small?: boolean;
  icon?: ReactNode;

  onClick?: (e: MouseEvent<HTMLButtonElement>) => void;
};

export const Button = (props: ButtonProps) => (
  <button
    className={classNames(
      props.className,
      "button",
      `button--${props.type ?? "primary"}`,
      {
        "button--small": props.small,
        "button--with-icon": props.icon,
      },
      getColorClassName(props.color ?? "planning-pink")
    )}
    disabled={props.disabled}
    onClick={props.onClick}
  >
    {props.children}
    {props.icon}
  </button>
);
