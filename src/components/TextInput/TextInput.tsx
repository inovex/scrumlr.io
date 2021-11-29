import {Children, cloneElement, DetailedHTMLProps, FC, InputHTMLAttributes, ReactElement, ReactNode} from "react";
import classNames from "classnames";
import "./TextInput.scss";

export interface TextInputProps extends DetailedHTMLProps<InputHTMLAttributes<HTMLInputElement>, HTMLInputElement> {
  type?: "text" | "password";
  rightAdornment?: ReactElement<any, any>;
  leftAdornment?: ReactElement<any, any>;
  actions?: ReactNode;
}

export var TextInput: FC<TextInputProps> = function ({className, leftAdornment, rightAdornment, actions, type = "text", ...other}) {
  if (leftAdornment) {
    const iconProps = Children.only(leftAdornment)?.props as any;
    leftAdornment = cloneElement(leftAdornment!, {className: classNames(iconProps?.className, "text-input__adornment", "text-input__adornment--left")});
  }

  if (rightAdornment) {
    const iconProps = Children.only(rightAdornment)?.props as any;
    rightAdornment = cloneElement(rightAdornment!, {className: classNames(iconProps?.className, "text-input__adornment", "text-input__adornment--right")});
  }

  return (
    <div className="text-input__container">
      <div className="text-input__input-wrapper">
        {leftAdornment}
        <input
          className={classNames("text-input", {"text-input--adornment-left": Boolean(leftAdornment), "text-input--adornment-right": Boolean(rightAdornment)}, className)}
          type={type}
          {...other}
        />
        {rightAdornment}
      </div>
      <div className="text-input__actions">{actions}</div>
    </div>
  );
};
