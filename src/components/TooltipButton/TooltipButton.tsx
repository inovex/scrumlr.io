import classNames from "classnames";
import {ReactComponent as CloseIcon} from "assets/icon-close.svg";
import "./TooltipButton.scss";

type TooltipButtonProps = {
  direction?: "left" | "right";
  onClick: () => void;
  label: string;
  disabled?: boolean;
  icon: React.FunctionComponent<React.SVGProps<SVGSVGElement>>;
  className?: string;
  active?: boolean;
};

export const TooltipButton = ({direction, onClick, label, disabled, icon, className, active}: TooltipButtonProps) => {
  const Icon = icon;

  return (
    <button
      disabled={disabled}
      className={classNames("tooltip-button", `tooltip-button--${direction ?? "right"}`, {"tooltip-button--active": active}, className)}
      onClick={() => onClick()}
      aria-label={label}
    >
      <div className="tooltip-button__tooltip" aria-hidden>
        <span className="tooltip-button__tooltip-text">{label}</span>
      </div>
      <Icon className="tooltip-button__icon" aria-hidden />
      <CloseIcon className="tooltip-button__icon" aria-hidden />
    </button>
  );
};
