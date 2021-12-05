import {useState, useEffect} from "react";
import FocusLock from "react-focus-lock";
import ReactDOM from "react-dom";

import classNames from "classnames";

import "./Portal.scss";

export interface PortalProps {
  children: React.ReactNode;
  onClose?: () => void;
  darkBackground: boolean;
  hiddenOverflow?: boolean;
  centered?: boolean;
  disabledPadding?: boolean;
}

/**
 * Portal for modals adds backdrop and locks focus within portal content.
 */
export const Portal = ({onClose, children, darkBackground, hiddenOverflow, centered, disabledPadding}: PortalProps) => {
  const closeable = useState(onClose !== undefined);

  const [hasNext, setHasNext] = useState(document.getElementsByClassName("board__navigation-next").length !== 0);
  const [hasPrev, setHasPrev] = useState(document.getElementsByClassName("board__navigation-prev").length !== 0);

  const rootElement = document.getElementById("root");

  const observer = new MutationObserver(() => {
    setHasPrev(document.getElementsByClassName("board__navigation-prev").length !== 0);
    setHasNext(document.getElementsByClassName("board__navigation-next").length !== 0);
  });

  if (rootElement) observer.observe(rootElement, {childList: true});

  // Key-Listener to "Escape"
  useEffect(() => {
    const handleKeydown = (event: KeyboardEvent) => {
      if (closeable && event.key === "Escape") {
        onClose!();
        event.preventDefault();
      }
    };
    window.addEventListener("keydown", handleKeydown);

    return () => {
      window.removeEventListener("keydown", handleKeydown);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [closeable]);

  // mount backdrop into separate located DOM node 'portal'
  const portal: HTMLElement = document.getElementById("portal")!;
  if (!portal) {
    throw new Error("portal element does not exist");
  }

  return ReactDOM.createPortal(
    <div
      className={classNames("portal", {"portal--darkBackground": darkBackground}, {"portal--hasPrev": hasPrev}, {"portal--hasNext": hasNext})}
      onClick={() => {
        if (closeable) {
          onClose!();
        }
      }}
      role="dialog"
    >
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
