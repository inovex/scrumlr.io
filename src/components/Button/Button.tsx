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

  // Icon Props
  icon?: ReactNode;
  iconStyle?: IconStyle; // Defaults to 'default'
  iconPosition?: IconPosition; // Defaults to 'right'
  iconAlignment?: IconAlignment; // Defaults to 'compact' (close)

  /** TODO remove tabIndex and ariaHidden as it will no longer be needed */

  /** Used to remove button from keyboard navigation */
  tabIndex?: number;
  /** Used to hide button from screen readers */
  ariaHidden?: boolean;
};

// logic:
// if we have no icon given, then we ignore the iconType and iconPosition
// if we have an icon given:
// if type is not given -> default same as now
// if type is embedded then it gets a round cycle in white (or todo perhaps even other color) in size 0.85 of the button
// if pos is not given it is right close
// close means aligned to text
// far means aligned to the border

export const Button = (props: ButtonProps) => {
  const hasLabel = props.children !== null && props.children !== undefined && props.children !== "";
  const isIconOnly = !!props.icon && (props.hideLabel || !hasLabel);

  const iconPos = props.iconPosition ?? "right";
  const iconAlign = props.iconAlignment ?? "compact";
  const iconStyle = props.iconStyle ?? "default";

  const renderButtonContent = () => {
    // 1. Define the label content once
    const label = !props.hideLabel && hasLabel ? props.children : null;

    // 2. If there is no icon, we can exit early
    if (!props.icon) return label;

    // 3. Define the icon structure once
    const iconMarkup = (
      // Added BEM element convention for clarity
      <div className={`button__icon-background button__icon-background--${iconStyle}`}>{props.icon}</div>
    );

    if (isIconOnly) {
      return iconMarkup;
    }

    // 4. Return them in the correct order
    return (
      // 1. Fixed spelling (alignment)
      // 2. Added default value (iconAlign)
      // 3. Added position class (iconPos) -> Critical for CSS Flex direction/margins
      <div className={classNames("button__content-wrapper", `button__content-wrapper--align-${iconAlign}`, `button__content-wrapper--pos-${iconPos}`)}>
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
      tabIndex={props.tabIndex}
      aria-hidden={props.ariaHidden}
    >
      {renderButtonContent()}
    </button>
  );
};
