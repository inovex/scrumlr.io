import {Tooltip as ReactTooltip} from "react-tooltip";
import classNames from "classnames";
import {Color, getColorClassName} from "constants/colors";
import "./Tooltip.scss";

type TooltipProps = {
  anchorSelect?: string;
  className?: string;
  color?: Color;
  content?: string;
  id?: string;
};

export const Tooltip = (props: TooltipProps) => (
  <div className="tooltip-container">
    <ReactTooltip
      id={props.id}
      delayHide={0}
      opacity={1}
      anchorSelect={props.anchorSelect}
      className={classNames("tooltip", {"tooltip--colored": props.color}, props.className, getColorClassName(props.color))}
      content={props.content}
      role="tooltip"
    />
  </div>
);
