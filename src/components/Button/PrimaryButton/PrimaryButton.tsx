import React from "react";
import classNames from "classnames";
import "./PrimaryButton.scss";

type PrimaryButtonProps = {
  className?: string;
  children?: React.ReactNode;
  onClick?: () => void;
};

export const PrimaryButton = (props: PrimaryButtonProps) => <button className={classNames("primary-button", props.className)}>{props.children}</button>;
