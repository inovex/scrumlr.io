import "./CustomToast.scss";
import {FC, useEffect, useRef, useState} from "react";
import {ReactComponent as CloseIcon} from "assets/icon-close.svg";
import {ToastTypes} from "utils/toast";
import classNames from "classnames";

export interface CustomToastProps {
  title: string;
  message?: string;
  hintMessage?: string;
  hintOnClick?: () => void;
  buttons?: string[];
  firstButtonOnClick?: () => void;
  secondButtonOnClick?: () => void;
  icon?: React.FunctionComponent<React.SVGProps<SVGSVGElement>>;
  iconName?: string;
  type?: ToastTypes;
}

export const CustomToast: FC<CustomToastProps> = ({title, message, buttons, hintMessage, hintOnClick, firstButtonOnClick, secondButtonOnClick, icon, iconName, type}) => {
  const [isSingleLineTitle, setIsSingleLineTitle] = useState<boolean>(true);
  const titleRef = useRef<HTMLDivElement>(null);
  const standardIcon = ["info", "success", "error"].includes(iconName!);
  const Icon = icon;

  // detects whether the title spans two lines
  useEffect(() => {
    if (titleRef.current && titleRef.current.offsetHeight > 19) {
      setIsSingleLineTitle(false);
    } else {
      setIsSingleLineTitle(true);
    }
  }, [title]);

  const isSingleLineToast = (!buttons || buttons?.length <= 1) && isSingleLineTitle && !message && !hintMessage;

  return (
    <div className={`${isSingleLineToast ? "toast-single" : "toast-multi"}`}>
      <div
        className={classNames(
          "toast__icon",
          {"toast__icon-single": isSingleLineToast, "toast__icon-multi": !isSingleLineToast},
          standardIcon && `toast__icon-${isSingleLineToast ? "single" : "multi"}-${type}`
        )}
      >
        {Icon && <Icon />}
      </div>
      {isSingleLineToast ? (
        <div className="toast__title-button-single-wrapper">
          <div className="toast__title" ref={titleRef}>
            {title}
          </div>
          {buttons?.length == 1 && (
            <button className={`toast__button toast__button-single toast__button-${type}`} onClick={firstButtonOnClick}>
              {buttons[0]}
            </button>
          )}
        </div>
      ) : (
        <div className="toast__title toast__title-multi" ref={titleRef}>
          {title}
        </div>
      )}
      {message && <div className="toast__message">{message}</div>}
      {hintMessage && (
        <label
          className="toast__hint"
          onClick={(e) => {
            e.stopPropagation();
          }}
        >
          <input
            type="checkbox"
            name="checkbox"
            onClick={(e) => {
              e.stopPropagation();
              hintOnClick && hintOnClick();
            }}
          />
          {hintMessage}
        </label>
      )}
      {!isSingleLineToast && (
        <div className="toast__buttons-multi">
          {buttons &&
            buttons.map((button, index) => (
              <button
                key={index}
                className={index == 0 ? `toast__button toast__button-multi-primary toast__button-${type}` : `toast__button toast__button-multi-secondary toast__button-${type}`}
                onClick={index == 0 ? firstButtonOnClick : secondButtonOnClick}
              >
                {button}
              </button>
            ))}
        </div>
      )}
      <div className={`toast__close-icon ${isSingleLineToast ? "toast__close-icon-single" : "toast__close-icon-multi"}`}>
        <CloseIcon />
      </div>
    </div>
  );
};
