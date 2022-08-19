import classNames from "classnames";
import {ReactComponent as CloseIcon} from "assets/icon-close.svg";
import {TabIndex} from "constants/tabIndex";
import "./TooltipButton.scss";

type TooltipButtonProps = {
  direction?: "left" | "right";
  onClick: () => void;
  label: string;
  disabled?: boolean;
  tabIndex?: number;
  icon: React.FunctionComponent<React.SVGProps<SVGSVGElement>>;
  className?: string;
  active?: boolean;
};

export const TooltipButton = (props: TooltipButtonProps) => {
  const Icon = props.icon;

  return (
    <button
      disabled={props.disabled}
      className={classNames("tooltip-button", `tooltip-button--${props.direction ?? "right"}`, {"tooltip-button--active": props.active}, props.className)}
      onClick={() => props.onClick()}
      tabIndex={props.tabIndex ?? TabIndex.default}
      aria-label={props.label}
    >
      <div className="tooltip-button__tooltip" aria-hidden>
        <span className="tooltip-button__tooltip-text">{props.label}</span>
      </div>
      <Icon className="tooltip-button__icon" aria-hidden />
      <CloseIcon className="tooltip-button__icon" aria-hidden />
    </button>
  );
};
