import {PlacesType, Tooltip} from "react-tooltip";
import {ReactNode} from "react";
import {createPortal} from "react-dom";
import "./TooltipPortal.scss";

interface TooltipPortalProps {
  anchor: string;
  place: PlacesType;
  show?: boolean;
  children: ReactNode;
}

// a Tooltip with any content that is injected into the DOM using a React Portal
export const TooltipPortal = (props: TooltipPortalProps) => {
  if (!props.show) return null;

  return createPortal(
    <div className="tooltip-portal__root">
      <Tooltip className="tooltip-portal" anchorSelect={`#${props.anchor}`} place={props.place}>
        {props.children}
      </Tooltip>
    </div>,
    document.body
  );
};
