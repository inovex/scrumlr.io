import {PlacesType} from "react-tooltip";
import {ReactNode} from "react";
import {createPortal} from "react-dom";
import {Tooltip} from "components/Tooltip";
import {Color} from "constants/colors";
import "./TooltipPortal.scss";

interface TooltipPortalProps {
  anchorId: string;
  place: PlacesType;
  color?: Color;
  show?: boolean;
  children: ReactNode;
}

// a Tooltip with any content that is injected into the DOM using a React Portal
export const TooltipPortal = (props: TooltipPortalProps) => {
  if (!props.show) return null;

  return createPortal(
    <div className="tooltip-portal__root">
      <Tooltip className="tooltip-portal" anchorId={props.anchorId} place={props.place} color={props.color}>
        {props.children}
      </Tooltip>
    </div>,
    document.body
  );
};
