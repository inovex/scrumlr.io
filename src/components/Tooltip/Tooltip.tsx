import {Tooltip as ReactTooltip} from "react-tooltip";
import classNames from "classnames";
import "./Tooltip.scss";

type TooltipProps = {
  anchorSelect?: string;
  className?: string;
  content?: string;
};

export const Tooltip = (props: TooltipProps) => (
    <div className="tooltip-container">
      <ReactTooltip anchorSelect={props.anchorSelect} className={classNames("tooltip", props.className)} content={props.content} role="tooltip" />
    </div>
  );
