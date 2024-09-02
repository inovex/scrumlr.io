import classNames from "classnames";
import {Close} from "components/Icon";
import "./TooltipButton.scss";

type TooltipButtonProps = {
  direction?: "left" | "right";
  onClick: () => void;
  label: string;
  disabled?: boolean;
  icon: React.FunctionComponent<React.SVGProps<SVGSVGElement>>;
  className?: string;
  active?: boolean;
  hotkeyKey?: string;
};

export const TooltipButton = (props: TooltipButtonProps) => {
  const Icon = props.icon;

  return (
    <button
      disabled={props.disabled}
      className={classNames("tooltip-button", `tooltip-button--${props.direction ?? "right"}`, {"tooltip-button--active": props.active}, props.className)}
      onClick={() => props.onClick()}
      aria-label={props.label}
    >
      <div className="tooltip-button__tooltip" aria-hidden>
        <span className="tooltip-button__tooltip-text">
          {props.label}
          {props.hotkeyKey !== undefined && <span className="tooltip-button__hotkey">{` [${props.hotkeyKey}]`}</span>}
        </span>
      </div>
      <div className="tooltip-button__icon-container">
        <Icon className="tooltip-button__icon" aria-hidden />
        <Close className="tooltip-button__icon" aria-hidden />
      </div>
    </button>
  );
};
