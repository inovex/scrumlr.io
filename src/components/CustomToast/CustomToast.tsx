import "./CustomToast.scss";
import {FC, FunctionComponent, SVGProps, useEffect, useRef, useState} from "react";
import {CloseIcon} from "components/Icon";
import {ToastTypes} from "utils/Toast";
import classNames from "classnames";

const TITLE_MAX_HEIGHT_DESKTOP = 38; // two lines of text
const TITLE_MAX_HEIGHT_MOBILE = 19; // one line of text
const MAX_WIDTH_MOBILE = 767; // $smartphone: "screen and (max-width: 767px)"

// on mobile, a title next to two buttons never fits on a single line, otherwise it depends on the rendered height
const isMultiLineTitle = (titleHeight: number, isMobile: boolean, buttons?: string[]) => {
  if (!isMobile || !buttons) {
    return titleHeight > TITLE_MAX_HEIGHT_DESKTOP;
  }
  if (buttons.length >= 2) {
    return true;
  }
  return titleHeight > TITLE_MAX_HEIGHT_MOBILE;
};

export interface CustomToastProps {
  title: string;
  message?: string;
  hintMessage?: string;
  hintOnClick?: () => void;
  buttons?: string[];
  firstButtonOnClick?: () => void;
  secondButtonOnClick?: () => void;
  icon?: FunctionComponent<SVGProps<SVGSVGElement>>;
  iconName?: string;
  type?: ToastTypes;
}

export const CustomToast: FC<CustomToastProps> = ({title, message, buttons, hintMessage, hintOnClick, firstButtonOnClick, secondButtonOnClick, icon, iconName, type}) => {
  const [isSingleToastTitle, setIsSingleToastTitle] = useState<boolean>(true);
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const titleRef = useRef<HTMLDivElement>(null);
  const standardIcon = ["info", "success", "error"].includes(iconName!);
  const Icon = icon;

  // check whether screensize is mobile/desktop
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= MAX_WIDTH_MOBILE);
    };
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // detects whether the title spans one or two lines
  useEffect(() => {
    const titleHeight = titleRef.current?.offsetHeight;
    if (titleHeight !== undefined && isMultiLineTitle(titleHeight, isMobile, buttons)) {
      setIsSingleToastTitle(false);
    }
  }, [title, isMobile]);

  const isSingleToast = (!buttons || buttons?.length <= 1) && isSingleToastTitle && !message && !hintMessage;

  return (
    <div className={`${isSingleToast ? "toast-single" : "toast-multi"}`}>
      <div
        className={classNames(
          "toast__icon",
          {"toast__icon-single": isSingleToast, "toast__icon-multi": !isSingleToast},
          standardIcon && `toast__icon-${isSingleToast ? "single" : "multi"}-${type}`
        )}
      >
        {Icon && <Icon />}
      </div>
      {isSingleToast ? (
        <div className="toast__title-button-single-wrapper">
          <div className="toast__title" ref={titleRef}>
            {title}
          </div>
          {buttons?.length === 1 && (
            <button className={`toast__button toast__button-single toast__button-${type}`} onClick={firstButtonOnClick}>
              {buttons[0]}
            </button>
          )}
        </div>
      ) : (
        <div className="toast__title" ref={titleRef}>
          {title}
        </div>
      )}
      {message && <div className="toast__message">{message}</div>}
      {hintMessage && (
        <label className="toast__hint">
          <input
            type="checkbox"
            name="checkbox"
            onClick={(e) => {
              e.stopPropagation();
              hintOnClick?.();
            }}
          />
          {hintMessage}
        </label>
      )}
      {!isSingleToast && buttons && buttons.length > 0 && (
        <div className="toast__buttons-multi">
          {buttons &&
            buttons.map((button, index) => {
              if (index > 1) return false;
              return (
                <button
                  key={index}
                  className={
                    index === 0
                      ? `toast__button toast__button-multi toast__button-multi-primary toast__button-${type}`
                      : `toast__button toast__button-multi toast__button-multi-secondary toast__button-${type}`
                  }
                  onClick={index === 0 ? firstButtonOnClick : secondButtonOnClick}
                >
                  {button}
                </button>
              );
            })}
        </div>
      )}
      <div className={`toast__close-icon ${isSingleToast ? "toast__close-icon-single" : "toast__close-icon-multi"}`}>
        <CloseIcon />
      </div>
    </div>
  );
};
