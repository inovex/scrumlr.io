import {FC, PropsWithChildren} from "react";
import classNames from "classnames";
import "./DotButton.scss";

type DotButtonProps = {
  id?: string;
  className?: string;
  disabled?: boolean;
  onClick?: () => void;
  onAnimationEnd?: () => void;
  dataTooltipId?: string;
  dataTooltipContent?: string;
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
    aria-label={props.dataTooltipContent}
    onAnimationEnd={props.onAnimationEnd}
    data-tooltip-id={props.dataTooltipId}
    data-tooltip-content={props.dataTooltipContent}
  >
    {props.children}
  </button>
);
