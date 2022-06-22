import {ChangeEvent, FC} from "react";
import "./SettingsInput.scss";

export interface SettingsInputProps {
  label: string;
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  submit: () => void;
  disabled?: boolean;
  type?: "text" | "password";
  placeholder?: string;
}

export const SettingsInput: FC<SettingsInputProps> = ({label, value, onChange, submit, disabled, type, placeholder, children}) => (
  <div className="settings-input__container">
    <input
      className={!placeholder ? "settings-input__hidden-placeholder" : undefined}
      placeholder={placeholder ?? label}
      value={value}
      onChange={onChange}
      onBlur={() => value && submit()}
      onKeyDown={(e) => e.key === "Enter" && value && submit()}
      disabled={disabled}
      type={type ?? "text"}
      id={label}
      autoComplete="off"
    />
    <label htmlFor={label}>{label}</label>
    <div className="settings-input__children">{children}</div>
  </div>
);
