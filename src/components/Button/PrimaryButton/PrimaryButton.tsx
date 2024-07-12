import React from "react";
import classNames from "classnames";
import "./PrimaryButton.scss";

type PrimaryButtonProps = {
  children?: React.ReactNode;
  className?: string;
  color?: "pink" | "blue";
  disabled?: boolean;
  small?: boolean;
  icon?: React.ReactNode;

  onClick?: () => void;
};

export const PrimaryButton = (props: PrimaryButtonProps) => (
  <button
    className={classNames(
      "primary-button",
      {
        "primary-button--small": props.small,
        "primary-button--with-icon": props.icon,
        "primary-button--pink": props.color === "pink" || !props.color,
        "primary-button--blue": props.color === "blue",
      },
      props.className
    )}
    disabled={props.disabled}
  >
    {props.children}
    {props.icon}
  </button>
);
