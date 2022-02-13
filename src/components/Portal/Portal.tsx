import {FC} from "react";
import FocusLock from "react-focus-lock";
import ReactDOM from "react-dom";
import {useWindowEvent} from "utils/hooks/useWindowEvent";

import classNames from "classnames";

import "./Portal.scss";

export interface PortalProps {
  className?: string;
  onClose?: () => void;
  hiddenOverflow?: boolean;
  centered?: boolean;
  disabledPadding?: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

/**
 * Portal for modals adds backdrop and locks focus within portal content.
 */
export const Portal: FC<PortalProps> = ({onClose, hiddenOverflow, centered, disabledPadding, children, className, ...otherProps}) => {
  useWindowEvent("keydown", (event) => {
    console.log("keydown");
    if (event.key !== "Escape") return;
    event.preventDefault();
    event.stopPropagation();
    onClose?.();
  });

  // mount backdrop into separate located DOM node 'portal'
  const portal: HTMLElement = document.getElementById("portal")!;
  if (!portal) {
    throw new Error("portal element does not exist");
  }

  return ReactDOM.createPortal(
    <div className={classNames("portal", className)} onClick={() => onClose?.()} role="dialog" {...otherProps}>
      <FocusLock>
        <div
          className={classNames(
            "portal__frame",
            {"portal__frame--hiddenOverflow": hiddenOverflow},
            {"portal__frame--centered": centered},
            {"portal__frame--disabledPadding": disabledPadding}
          )}
        >
          <div className="portal__content" onClick={(e) => e.stopPropagation()} role="dialog">
            {children}
          </div>
        </div>
      </FocusLock>
    </div>,
    portal
  );
};
