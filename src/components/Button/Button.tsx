import React from "react";
import classNames from "classnames";
import {Color, getColorClassName} from "constants/colors";
import "./Button.scss";

type ButtonType = "primary" | "secondary" | "tertiary";

type ButtonProps = {
  type?: ButtonType;
  children?: React.ReactNode;
  className?: string;
  color?: Color;
  disabled?: boolean;
  small?: boolean;
  icon?: React.ReactNode;

  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;

  dataCy?: string;
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
    data-cy={props.dataCy}
  >
    {props.children}
    {props.icon}
  </button>
);
