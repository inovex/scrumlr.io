import classNames from "classnames";
import {Color, getColorClassName} from "constants/colors";
import {MouseEvent, ReactNode} from "react";
import "./Button.scss";

type ButtonVariant = "primary" | "secondary" | "tertiary" | "ghost";
type IconPosition = "left" | "right";

type ButtonProps = {
  onClick?: (e: MouseEvent<HTMLButtonElement>) => void;
  disabled?: boolean;
  children?: ReactNode;
  testId?: string;
  id?: string;

  variant?: ButtonVariant;
  color?: Color;
  className?: string;
  small?: boolean;
  /** Native tooltip; also used as aria-label when the label is hidden */
  title?: string;

  icon?: ReactNode;
  /** Defaults to "right" */
  iconPosition?: IconPosition;
  /** Renders icon only; string children are still used as the accessible name */
  hideLabel?: boolean;
};

export const Button = (props: ButtonProps) => {
  const hasLabel = props.children !== null && props.children !== undefined && props.children !== "";
  const isIconOnly = !!props.icon && (props.hideLabel || !hasLabel);
  const iconLeft = !!props.icon && !isIconOnly && props.iconPosition === "left";

  const labelText = typeof props.children === "string" ? props.children : undefined;
  const accessibleName = isIconOnly ? (props.title ?? labelText) : undefined;

  return (
    <button
      id={props.id}
      className={classNames(
        props.className,
        "button",
        `button--${props.variant ?? "primary"}`,
        {
          "button--small": props.small,
          "button--with-icon": props.icon && !isIconOnly,
          "button--icon-left": iconLeft,
          "button--icon-only": isIconOnly,
        },
        getColorClassName(props.color ?? "planning-pink")
      )}
      disabled={props.disabled}
      onClick={props.onClick}
      title={props.title}
      data-cy={props.testId}
      data-testid={props.testId}
      aria-label={accessibleName}
    >
      {iconLeft && props.icon}
      {!isIconOnly && props.children}
      {!iconLeft && props.icon}
    </button>
  );
};
