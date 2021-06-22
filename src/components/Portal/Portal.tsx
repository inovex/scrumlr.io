import {useState,useEffect} from "react";
import {default as FocusLock} from "react-focus-lock";
import ReactDOM from "react-dom";

import classNames from "classnames";

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

  const [hasNext, setHasNext] = useState(document.getElementsByClassName("board__navigation-next").length !== 0);
  const [hasPrev, setHasPrev] = useState(document.getElementsByClassName("board__navigation-prev").length !== 0);

  const rootElement = document.getElementById("root");

  const observer = new MutationObserver((mutations, observer) => {
    setHasPrev(document.getElementsByClassName("board__navigation-prev").length !== 0);
    setHasNext(document.getElementsByClassName("board__navigation-next").length !== 0);
  });

  if (rootElement) observer.observe(rootElement, {childList: true});

  // Key-Listener to "Escape"
  useEffect(() => {
    window.addEventListener("keydown", handleKeydown);
  }, []);

  const handleKeydown = (event: KeyboardEvent) => {
    if (closeable && event.key === "Escape") {
      onClose!();
      event.preventDefault();
    }
  };

  // mount backdrop into separate located DOM node 'portal'
  const portal: HTMLElement = document.getElementById("portal")!;
  if (!portal) {
    throw new Error("portal element does not exist");
  }

  return ReactDOM.createPortal(
    <div
      className={classNames("portal", {"portal--hasPrev": hasPrev}, {"portal--hasNext": hasNext})}
      onClick={() => {
        if (closeable) {
          onClose!();
        }
      }}
    >
      <FocusLock>
        <div className="portal__frame">
          <div className="portal__content" onClick={(e) => e.stopPropagation()}>
            {children}
          </div>
        </div>
      </FocusLock>
    </div>,
    portal
  );
};

export default Portal;
