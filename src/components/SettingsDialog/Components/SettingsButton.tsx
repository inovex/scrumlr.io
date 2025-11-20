import classNames from "classnames";
import {FC, ElementType, MouseEventHandler, FocusEventHandler, PropsWithChildren} from "react";
import "./SettingsButton.scss";

export interface SettingsButtonProps {
  label?: string;
  icon?: ElementType;
  onClick?: MouseEventHandler<HTMLButtonElement> | undefined;
  onBlur?: FocusEventHandler<HTMLButtonElement> | undefined;
  className?: string;
  disabled?: boolean;
  reverseOrder?: boolean;
  [key: string]: unknown;
}

export const SettingsButton: FC<PropsWithChildren<SettingsButtonProps>> = ({label, icon, onClick, onBlur, className, children, disabled, reverseOrder, ...other}) => {
  const Icon = icon!;

  return (
    <button
      aria-label={label}
      className={classNames("settings-option-button", {"settings-option-button--disabled": disabled}, {"settings-option-button--reverse-order": reverseOrder}, className)}
      disabled={disabled}
      onClick={onClick}
      onBlur={onBlur}
      type="button"
      {...other}
    >
      {label && <span className="settings-option-button__label">{label}</span>}
      {children}
      {icon && <Icon className="settings-option-button__icon" />}
    </button>
  );
};
