import {FC, HTMLAttributes, MouseEvent, PropsWithChildren, useRef} from "react";
import FocusLock from "react-focus-lock";
import {createPortal} from "react-dom";
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

  const portalContentRef = useRef<HTMLDivElement>(null);

  const theme = document.documentElement.getAttribute("theme") ?? "light";

  // only close if the click target is not inside the contentRef, i.e., the background
  const handleBackgroundClick = (e: MouseEvent) => {
    if (portalContentRef.current && !portalContentRef.current.contains(e.target as Node)) {
      onClose?.();
    }
  };

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

  return createPortal(
    <div className={classNames("portal", className)} onClick={handleBackgroundClick} role="dialog" {...otherProps}>
      <FocusLock autoFocus={false} returnFocus>
        <div
          className={classNames(
            "portal__frame",
            {"portal__frame--hiddenOverflow": hiddenOverflow},
            {"portal__frame--centered": centered},
            {"portal__frame--disabled-padding": disabledPadding},
            getAccentColor()
          )}
        >
          <div className="portal__content" role="dialog">
            <div ref={portalContentRef} className="portal__content-container">
              {children}
            </div>
          </div>
        </div>
      </FocusLock>
    </div>,
    portal
  );
};
