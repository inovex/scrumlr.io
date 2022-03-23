import classNames from "classnames";
import {FC, ElementType} from "react";
import "./SettingsButton.scss";

export interface SettingsButtonProps {
  label?: string;
  icon?: ElementType;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onClick?: (...args: any) => any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onBlur?: (...args: any) => any;
  className?: string;
  disabled?: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

export const SettingsButton: FC<SettingsButtonProps> = ({label, icon, onClick, onBlur, className, children, disabled, ...other}) => {
  const Icon = icon!;

  return (
    <button className={classNames("settings-option-button", {"settings-option-button--disabled": disabled}, className)} onClick={onClick} onBlur={onBlur} {...other}>
      {label && <span className="settings-option-button__label">{label}</span>}
      {children}
      {icon && <Icon className="settings-option-button__icon" />}
    </button>
  );
};
