import {PlacesType, Tooltip as ReactTooltip} from "react-tooltip";
import classNames from "classnames";
import {Color, getColorClassName} from "constants/colors";
import {ReactNode} from "react";
import "./Tooltip.scss";

type TooltipProps = {
  id?: string;
  anchorId: string;
  className?: string;

  color?: Color;
  place?: PlacesType;

  children: ReactNode;
};

export const Tooltip = (props: TooltipProps) => {
  // colons (which are included from React useId()) are not allowed in CSS selectors, so we escape them
  // including prefixed '#' for id selector
  const escapedAnchor = `#${CSS.escape(props.anchorId)}`;

  return (
    <div className="tooltip-container">
      <ReactTooltip
        id={props.id}
        anchorSelect={escapedAnchor}
        className={classNames("tooltip", {"tooltip--colored": props.color}, props.className, getColorClassName(props.color))}
        place={props.place}
        delayHide={0}
        opacity={1}
        role="tooltip"
      >
        {props.children}
      </ReactTooltip>
    </div>
  );
};
