import {Tooltip as ReactTooltip} from "react-tooltip";
import classNames from "classnames";
import "./Tooltip.scss";

type TooltipProps = {
  anchorSelect?: string;
  className?: string;
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
      className={classNames("tooltip", props.className)}
      content={props.content}
      role="tooltip"
    />
  </div>
);
