import classNames from "classnames";
import {Color, getColorClassName} from "constants/colors";
import {MouseEvent, ReactNode} from "react";
import "./Button.scss";

type ButtonVariant = "primary" | "secondary" | "tertiary" | "ghost";
type IconStyle = "default" | "embedded";
type IconPosition = "left" | "right";
type IconAlignment = "compact" | "spaced"; // compact = close, spaced = far

type ButtonProps = {
  // Functional Props
  onClick?: (e: MouseEvent<HTMLButtonElement>) => void;
  disabled?: boolean;
  children?: ReactNode;
  dataCy?: string;
  id?: string;

  // Style Props
  variant?: ButtonVariant;
  color?: Color;
  className?: string;
  small?: boolean;
  hideLabel?: boolean;
  title?: string; // Tooltip text shown on hover
  dataTooltipId?: string; // ID for react-tooltip integration
  dataTooltipContent?: string; // Content for react-tooltip
  fullWidth?: boolean; // If true, button takes full width of its container. Defaults to false.

  // Icon Props
  icon?: ReactNode;
  iconStyle?: IconStyle; // Defaults to 'default'
  iconPosition?: IconPosition; // Defaults to 'right'
  iconAlignment?: IconAlignment; // Defaults to 'compact' (close)
};

export const Button = (props: ButtonProps) => {
  const hasLabel = props.children !== null && props.children !== undefined && props.children !== "";
  const isIconOnly = !!props.icon && (props.hideLabel || !hasLabel);

  const iconPos = props.iconPosition ?? "right";
  const iconAlign = props.iconAlignment ?? "compact";
  const iconStyle = props.iconStyle ?? "default";
  const buttonSize = props.small ? "small" : "default";

  const isFullWidth = props.fullWidth || iconAlign === "spaced";

  const renderButtonContent = () => {
    const label = !props.hideLabel && hasLabel ? props.children : null;

    if (!props.icon) return label;

    const iconMarkup = (
      <div data-size={buttonSize} className={`button__icon-background button__icon-background--${iconStyle}`}>
        {props.icon}
      </div>
    );

    if (isIconOnly) {
      return iconMarkup;
    }

    return (
      <div className="button__content-wrapper" data-align={iconAlign} data-pos={iconPos} data-size={buttonSize}>
        {iconPos === "left" && iconMarkup}
        {label}
        {iconPos !== "left" && iconMarkup}
      </div>
    );
  };

  return (
    <button
      id={props.id}
      className={classNames(
        props.className,
        "button",
        `button--${props.variant ?? "primary"}`,
        {
          "button--small": props.small,
          "button--full-width": isFullWidth,
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
      aria-label={isIconOnly ? props.title || "Button" : undefined}
    >
      {renderButtonContent()}
    </button>
  );
};
