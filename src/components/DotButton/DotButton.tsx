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

export const DotButton = (props: DotButtonProps) => (
  <button
    className={classNames("dot-button", props.className)}
    disabled={props.disabled}
    onClick={(e) => {
      e.stopPropagation();
      props.onClick?.();
    }}
    title={props.title}
  >
    {props.children}
  </button>
);
