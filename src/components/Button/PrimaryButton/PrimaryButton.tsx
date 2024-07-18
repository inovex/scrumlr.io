import React from "react";
import classNames from "classnames";
import {Color, getColorClassName} from "constants/colors";
import "./PrimaryButton.scss";

type PrimaryButtonProps = {
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
      "primary-button",
      {
        "primary-button--small": props.small,
        "primary-button--with-icon": props.icon,
      },
      props.className,
      getColorClassName(props.color ?? "planning-pink")
    )}
    disabled={props.disabled}
    onClick={props.onClick}
  >
    {props.children}
    {props.icon}
  </button>
);
