import {ChangeEvent, FC} from "react";
import "./SettingsInput.scss";

export interface SettingsInputProps {
  label: string;
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  submit: () => any;
  disabled?: boolean;
}

export const SettingsInput: FC<SettingsInputProps> = ({label, value, onChange, submit, disabled}) => (
  <div className="settings-input__container">
    <input
      placeholder={label}
      value={value}
      onChange={onChange}
      onBlur={() => value && submit()}
      onKeyDown={(e) => e.key === "Enter" && value && submit()}
      disabled={disabled}
      type="text"
      id={label}
      autoComplete="off"
    />
    <label htmlFor={label}>{label}</label>
  </div>
);
