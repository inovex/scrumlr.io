import classNames from "classnames";
import {Color, getColorClassName} from "constants/colors";
import {MouseEvent, ReactNode} from "react";
import "./Button.scss";

type ButtonType = "primary" | "secondary" | "tertiary" | "ghost";

type ButtonProps = {
  type?: ButtonType;
  children?: ReactNode;
  className?: string;
  color?: Color;
  disabled?: boolean;
  small?: boolean;
  icon?: ReactNode;
  /** Tooltip text shown on hover */
  title?: string;
  /** ID for react-tooltip integration */
  dataTooltipId?: string;
  /** Content for react-tooltip */
  dataTooltipContent?: string;

  onClick?: (e: MouseEvent<HTMLButtonElement>) => void;

  dataCy?: string;

  hideLabel?: boolean;
};

export const Button = (props: ButtonProps) => {
  const isIconOnly = props.hideLabel && props.icon;

  return (
    <button
      className={classNames(
        props.className,
        "button",
        `button--${props.type ?? "primary"}`,
        {
          "button--small": props.small,
          "button--with-icon": props.icon && !isIconOnly,
          "button--icon-only": isIconOnly,
        },
        getColorClassName(props.color ?? "planning-pink")
      )}
      disabled={props.disabled}
      onClick={props.onClick}
      title={props.title}
      data-tooltip-id={props.dataTooltipId}
      data-tooltip-content={props.dataTooltipContent}
      data-cy={props.dataCy}
    >
      {!props.hideLabel && props.children}
      {props.icon}
    </button>
  );
};
