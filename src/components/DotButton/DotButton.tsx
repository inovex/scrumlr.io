import {FC, PropsWithChildren} from "react";
import classNames from "classnames";
import "./DotButton.scss";

type DotButtonProps = {
  className?: string;
  disabled?: boolean;
  onClick?: () => void;
  title?: string;
  onAnimationEnd?: () => void;
  dataTooltipId?: string;
  dataTooltipContent?: string;
};

export const DotButton: FC<PropsWithChildren<DotButtonProps>> = (props) => (
  <button
    className={classNames("dot-button", props.className)}
    disabled={props.disabled}
    onClick={(e) => {
      e.stopPropagation();
      props.onClick?.();
    }}
    title={props.title}
    onAnimationEnd={props.onAnimationEnd}
    data-tooltip-id={props.dataTooltipId}
    data-tooltip-content={props.dataTooltipContent}
  >
    {props.children}
  </button>
);
