import classNames from "classnames";
import React, {ChangeEvent, FC, useState} from "react";
import {ReactComponent as VisibleIcon} from "assets/icon-visible.svg";
import {ReactComponent as HiddenIcon} from "assets/icon-hidden.svg";
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
  maxLength?: number;
  containerClassName?: string;
  className?: string;
  passwordToggle?: boolean;
}

export const SettingsInput: FC<SettingsInputProps> = ({
  label,
  id,
  value,
  onChange,
  submit,
  disabled,
  type = "text",
  placeholder,
  maxLength,
  containerClassName,
  className,
  passwordToggle = false,
}) => {
  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.preventDefault();
    setShowPassword((curr) => !curr);
  };

  console.log(value);

  return (
    <div className={classNames("settings-input__container", containerClassName)}>
      <input
        className={classNames("settings-input__input", className, {"settings-input__hidden-placeholder": !placeholder})}
        placeholder={placeholder ?? label}
        value={value}
        onChange={onChange}
        onBlur={() => value && submit()}
        onKeyDown={(e) => e.key === "Enter" && value && submit()}
        disabled={disabled}
        type={type === "text" ? "text" : showPassword ? "text" : "password"}
        id={id}
        autoComplete="off"
        maxLength={maxLength}
      />
      {maxLength !== undefined && (
        <small className="settings-input__length">
          {value.length}/{maxLength}
        </small>
      )}
      <label htmlFor={id}>{label}</label>
      {type === "password" && passwordToggle && value && (
        <button className="settings-input__password-toggle" onClick={togglePasswordVisibility}>
          {showPassword ? <VisibleIcon /> : <HiddenIcon />}
        </button>
      )}
    </div>
  );
};
