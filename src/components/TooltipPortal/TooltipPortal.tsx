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

  // colons (which are included from react useId()) are not allowed in CSS selectors, so we escape them
  const escapedAnchor = CSS.escape(props.anchor);

  return createPortal(
    <div className="tooltip-portal__root">
      <Tooltip className="tooltip-portal" anchorSelect={`#${escapedAnchor}`} place={props.place}>
        {props.children}
      </Tooltip>
    </div>,
    document.body
  );
};
