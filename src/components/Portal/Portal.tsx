import {FC, HTMLAttributes, MouseEvent, PropsWithChildren, useRef} from "react";
import FocusLock from "react-focus-lock";
import {createPortal} from "react-dom";
import {useWindowEvent} from "utils/hooks/useWindowEvent";
import classNames from "classnames";
import "./Portal.scss";

type Alignment = "here" | "center" | "bottom";

export type PortalProps = {
  align: Alignment;
  onClose?: () => void;
  hiddenOverflow?: boolean;
  backdrop?: boolean;
  disabledPadding?: boolean;
  accentColor?: string;
} & HTMLAttributes<HTMLDivElement>;

/**
 * Portal for modals adds backdrop and locks focus within portal content.
 */
export const Portal: FC<PropsWithChildren<PortalProps>> = ({align, onClose, hiddenOverflow, backdrop, disabledPadding, accentColor, children, className, ...otherProps}) => {
  // Check existence of portal node
  const portal: HTMLElement | null = document.getElementById("portal");
  if (portal == null) {
    throw new Error("Portal HTML Element doesn't exist!");
  }

  const theme = document.documentElement.getAttribute("theme") ?? "light";

  // only close if the click target is not inside the contentRef, i.e., the background
  const handleBackgroundClick = (e: MouseEvent) => {
    // we only want to trigger onClose if the user clicked the frame/backdrop itself
    // e.currentTarget is the 'portal' div, e.target is the actual element clicked
    if (e.target === e.currentTarget || (e.target as HTMLElement).classList.contains("portal__frame")) {
      e.stopPropagation(); // only apply to the first modal if multiples are stacked (e.g. settings + confirmation)
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
            `portal__frame--align-${align}`,
            {"portal__frame--backdrop": backdrop},
            {"portal__frame--disabled-padding": disabledPadding},
            getAccentColor()
          )}
        >
          <div className="portal__content" role="dialog">
            <div className="portal__content-container">{children}</div>
          </div>
        </div>
      </FocusLock>
    </div>,
    portal
  );
};
