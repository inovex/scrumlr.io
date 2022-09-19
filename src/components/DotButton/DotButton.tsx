import {ReactElement} from "react";
import classNames from "classnames";
import "./DotButton.scss";

type DotButtonProps = {
  className?: string;
  disabled?: boolean;
  onClick?: () => void;
  children?: ReactElement | ReactElement[];
  title?: string;
};

export const DotButton = ({className, disabled, onClick, children, title}: DotButtonProps) => (
  <button
    className={classNames("dot-button", className)}
    disabled={disabled}
    onClick={(e) => {
      e.stopPropagation();
      onClick?.();
    }}
    title={title}
  >
    {children}
  </button>
);
