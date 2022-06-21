import {PLACEHOLDER_PASSWORD} from "constants/misc";
import {ChangeEvent, FC} from "react";
import "./SettingsInput.scss";

export interface SettingsInputProps {
  label: string;
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  submit: () => any;
  disabled?: boolean;
  type?: "text" | "password";
}

export const SettingsInput: FC<SettingsInputProps> = ({label, value, onChange, submit, disabled, type, children}) => {
  const getValue = (): string => {
    if (type !== "password") return value;
    if (disabled) return PLACEHOLDER_PASSWORD;
    return value;
  };

  return (
    <div className="settings-input__container">
      <input
        placeholder={label}
        value={getValue()}
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
};
