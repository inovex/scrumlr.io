import {AnchorHTMLAttributes, ButtonHTMLAttributes, Children, cloneElement, DetailedHTMLProps, FC, PropsWithChildren, ReactElement, useEffect, useRef, useState} from "react";
import classNames from "classnames";
import "./Button.scss";

export interface ButtonProps extends DetailedHTMLProps<ButtonHTMLAttributes<HTMLButtonElement> & AnchorHTMLAttributes<HTMLAnchorElement>, HTMLButtonElement & HTMLAnchorElement> {
  color?: "primary" | "secondary";
  variant?: "contained" | "outlined" | "text-link";
  leftIcon?: ReactElement;
  rightIcon?: ReactElement;
  hideLabel?: boolean;
  block?: boolean;
}

export const Button: FC<PropsWithChildren<ButtonProps>> = ({
  className,
  variant = "contained",
  color = "secondary",
  leftIcon,
  rightIcon,
  block = false,
  hideLabel,
  children,
  ...other
}) => {
  const labelRef = useRef<HTMLSpanElement>(null);
  const [label, setLabel] = useState<string>("");

  useEffect(() => {
    setLabel(labelRef.current?.textContent as string);
  }, [labelRef]);

  const labelProps = hideLabel ? {"aria-label": label} : {};

  if (leftIcon) {
    const iconProps = Children.only(leftIcon)?.props;
    leftIcon = cloneElement(leftIcon!, {className: classNames(iconProps?.className, "button__icon", "button__left-icon")});
  }

  if (rightIcon) {
    const iconProps = Children.only(rightIcon)?.props;
    rightIcon = cloneElement(rightIcon!, {className: classNames(iconProps?.className, "button__icon", "button__right-icon")});
  }

  let Component: keyof JSX.IntrinsicElements = "button";
  if (other.href) {
    Component = "a";
  }

  return (
    <Component
      className={classNames("button", `button--${color}`, `button--${variant}`, {"button--block": block}, {"button__label--shown": !hideLabel}, className)}
      {...other}
      {...labelProps}
    >
      {leftIcon}
      <span ref={labelRef} className={classNames("button__label", {"button__label--hidden": hideLabel})}>
        {children}
      </span>
      {rightIcon}
    </Component>
  );
};
