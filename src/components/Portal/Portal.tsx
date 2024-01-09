import {FC, HTMLAttributes, PropsWithChildren} from "react";
import FocusLock from "react-focus-lock";
import ReactDOM from "react-dom";
import {useWindowEvent} from "utils/hooks/useWindowEvent";
import classNames from "classnames";
import "./Portal.scss";

export type PortalProps = {
  onClose?: () => void;
  hiddenOverflow?: boolean;
  centered?: boolean;
  disabledPadding?: boolean;
  accentColor?: string;
} & HTMLAttributes<HTMLDivElement>;

/**
 * Portal for modals adds backdrop and locks focus within portal content.
 */
export const Portal: FC<PropsWithChildren<PortalProps>> = ({onClose, hiddenOverflow, centered, disabledPadding, accentColor, children, className, ...otherProps}) => {
  // Check existence of portal node
  const portal: HTMLElement | null = document.getElementById("portal");
  if (portal == null) {
    throw new Error("Portal HTML Element doesn't exist!");
  }

  const theme = document.documentElement.getAttribute("theme") ?? "light";

  useWindowEvent("keydown", (event) => {
    if (event.key !== "Escape") return;
    event.preventDefault();
    event.stopPropagation();
    onClose?.();
  });

  const getAccentColor = () => {
    if (accentColor) return accentColor;
    return theme === "light" ? "accent-color__backlog-blue" : "accent-color__planning-pink";
  };

  return ReactDOM.createPortal(
    <div className={classNames("portal", className)} onClick={() => onClose?.()} role="dialog" {...otherProps}>
      <FocusLock autoFocus={false} returnFocus>
        <div
          className={classNames(
            "portal__frame",
            {"portal__frame--hiddenOverflow": hiddenOverflow},
            {"portal__frame--centered": centered},
            {"portal__frame--disabledPadding": disabledPadding},
            getAccentColor()
          )}
        >
          <div className="portal__content" role="dialog">
            {children}
          </div>
        </div>
      </FocusLock>
    </div>,
    portal
  );
};
