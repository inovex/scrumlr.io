import {default as FocusLock} from "react-focus-lock";
import ReactDOM from "react-dom";
import {useEffect} from "react";

import "./Portal.scss";

export interface PortalProps {
  children: any;
  onClose?: () => void;
}

/**
 * Portal for modals adds backdrop and locks focus within portal content.
 */
const Portal = ({onClose, children}: PortalProps) => {
  const closeable = Boolean(onClose);

  // Key-Listener to "Escape"
  // TODO: Is this correct?
  useEffect(() => {
    window.addEventListener("keydown", handleKeydown);
  }, []);

  const handleKeydown = (event: KeyboardEvent) => {
    if (closeable && event.key === "Escape") {
      onClose!();
      event.preventDefault();
    }
  };

  // TODO: Warum gibt es im v1-scrumlr einen portal__close-button?
  // TODDO: Wenn auf die Note selbst geklickt wird, soll diese nicht geschlossen werden!

  // mount backdrop into separate located DOM node 'portal'
  const portal: HTMLElement = document.getElementById("portal")!;
  if (!portal) {
    throw new Error("portal element does not exist");
  }

  return ReactDOM.createPortal(
    <div
      className="portal"
      onClick={() => {
        if (closeable) {
          onClose!();
        }
      }}
    >
      <FocusLock>
        <div className="portal__content" onClick={(e) => e.stopPropagation}>
          {children}
        </div>
      </FocusLock>
    </div>,
    portal
  );
};

export default Portal;
