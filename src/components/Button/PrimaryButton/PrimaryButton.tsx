import React from "react";
import classNames from "classnames";
import {Color, getColorClassName} from "constants/colors";
import "./PrimaryButton.scss";

type ButtonType = "primary" | "secondary" | "tertiary";

type PrimaryButtonProps = {
  type?: ButtonType;
  children?: React.ReactNode;
  className?: string;
  color?: Color;
  disabled?: boolean;
  small?: boolean;
  icon?: React.ReactNode;

  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
};

export const PrimaryButton = (props: PrimaryButtonProps) => (
  <button
    className={classNames(
      props.className,
      "button",
      {
        "button--primary": props.type === "primary" || !props.type,
        "button--secondary": props.type === "secondary",
        "button--tertiary": props.type === "tertiary",
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
