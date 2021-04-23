import "./Backdrop.scss";
import {default as FocusLock} from "react-focus-lock";
import ReactDOM from "react-dom";

export interface BackdropProps {
  children: any;
  onClose?: () => void;
}

const Backdrop = ({onClose, children}: BackdropProps) => {
  // mount backdrop into separate located DOM node 'portal'
  const portal: HTMLElement = document.getElementById("portal")!;
  if (!portal) {
    throw new Error("portal element does not exist");
  }

  return ReactDOM.createPortal(
    <div className="backdrop">
      <FocusLock>
        <div className="backdrop__content">{children}</div>
      </FocusLock>
    </div>,
    portal
  );
};
export default Backdrop;
