import classNames from "classnames";
import "./Tooltip.scss";

type TooltipProps = {
  className?: string;
  text: string;
};

export const Tooltip = ({className, text}: TooltipProps) => <div className={classNames("tooltip", className)}>{text}</div>;
