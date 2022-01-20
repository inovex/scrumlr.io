import {FC, ReactNode, ElementType} from "react";
import "./SettingsButton.scss";

export interface SettingsButtonProps {
  label: string;
  icon?: ElementType;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onClick: (...args: any) => any;
  className?: string;
  children?: ReactNode;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

export const SettingsButton: FC<SettingsButtonProps> = ({label, icon, onClick, className, children, ...other}) => {
  const Icon = icon!;

  return (
    <button className="settings-option-button" onClick={onClick} {...other}>
      {icon && <Icon className="settings-option-button__icon" />}
      {children}
      <span className="settings-option-button__label">{label}</span>
    </button>
  );
};
