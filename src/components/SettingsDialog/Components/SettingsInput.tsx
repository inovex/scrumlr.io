import {ChangeEvent, FC, PropsWithChildren} from "react";
import "./SettingsInput.scss";

export interface SettingsInputProps {
  label: string;
  id: string;
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  submit: () => void;
  disabled?: boolean;
  type?: "text" | "password";
  placeholder?: string;
}

export const SettingsInput: FC<PropsWithChildren<SettingsInputProps>> = ({label, id, value, onChange, submit, disabled, type, placeholder, children}) => (
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
      id={id}
      autoComplete="off"
    />
    <label htmlFor={id}>{label}</label>
    {children && (
      <button className="settings-input__children" onMouseDown={(e) => e.preventDefault()}>
        {children}
      </button>
    )}
  </div>
);
