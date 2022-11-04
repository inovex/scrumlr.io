import classNames from "classnames";
import {DefaultTFuncReturn} from "i18next";
import {FC, ElementType, MouseEventHandler, FocusEventHandler} from "react";
import "./SettingsButton.scss";

export interface SettingsButtonProps {
  label?: string | DefaultTFuncReturn;
  icon?: ElementType;
  onClick?: MouseEventHandler<HTMLButtonElement> | undefined;
  onBlur?: FocusEventHandler<HTMLButtonElement> | undefined;
  className?: string;
  disabled?: boolean;
  [key: string]: unknown;
}

export const SettingsButton: FC<SettingsButtonProps> = ({label, icon, onClick, onBlur, className, children, disabled, ...other}) => {
  const Icon = icon!;

  return (
    <button
      type="button"
      disabled={disabled}
      className={classNames("settings-option-button", {"settings-option-button--disabled": disabled}, className)}
      onClick={onClick}
      onBlur={onBlur}
      {...other}
    >
      {label && <span className="settings-option-button__label">{label}</span>}
      {children}
      {icon && <Icon className="settings-option-button__icon" />}
    </button>
  );
};
