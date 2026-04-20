import {FC, PropsWithChildren} from "react";
import classNames from "classnames";
import "./DotButton.scss";

type DotButtonProps = {
  id?: string;
  className?: string;
  disabled?: boolean;
  onClick?: () => void;
  onAnimationEnd?: () => void;
  label?: string;
};

export const DotButton: FC<PropsWithChildren<DotButtonProps>> = (props) => (
  <button
    id={props.id}
    className={classNames("dot-button", props.className)}
    disabled={props.disabled}
    onClick={(e) => {
      e.stopPropagation();
      props.onClick?.();
    }}
    onAnimationEnd={props.onAnimationEnd}
    aria-label={props.label}
  >
    {props.children}
  </button>
);
