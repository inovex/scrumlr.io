import "./CustomToast.scss";
import {FC, useEffect, useRef, useState} from "react";
import {ReactComponent as CloseIcon} from "assets/icon-close.svg";
import {ToastTypes} from "utils/Toast";
import classNames from "classnames";

export interface CustomToastProps {
  title: string;
  message?: string;
  hintMessage?: string | null;
  hintOnClick?: () => void;
  buttons?: string[];
  firstButtonOnClick?: () => void;
  secondButtonOnClick?: () => void;
  icon?: React.FunctionComponent<React.SVGProps<SVGSVGElement>>;
  type?: ToastTypes;
}

export const CustomToast: FC<CustomToastProps> = ({title, message, buttons, hintMessage, hintOnClick, firstButtonOnClick, secondButtonOnClick, icon, type}) => {
  const [isSingleLineTitle, setIsSingleLineTitle] = useState<boolean>(true);
  const [hintChecked, setHintChecked] = useState<boolean>(false); // retrieve setting from somewhere redux?
  const titleRef = useRef<HTMLDivElement>(null);
  const Icon = icon;

  useEffect(() => {
    // console.log(textRef.current?.offsetHeight);
    if (titleRef.current && titleRef.current.offsetHeight > 16) {
      // adjust this value to match your font-size and line-height
      setIsSingleLineTitle(false);
    } else {
      setIsSingleLineTitle(true);
    }
  }, [title]);

  const isSingleLineToast = (!buttons || buttons?.length <= 1) && isSingleLineTitle && !message && !hintMessage; // maybe two line Title ok aswell?
  console.log("------");
  console.log(!buttons || buttons?.length <= 1);
  console.log(isSingleLineTitle);
  console.log(!message);
  console.log(!hintMessage);
  console.log("------");

  return (
    <>
      <style>{`.Toastify__toast { 
        --toast-height: ${isSingleLineToast ? "56px;" : "fit-content;"} 
        --toast-border-radius: ${isSingleLineToast ? "28px;" : "16px;"}
    }`}</style>

      <div className={`${isSingleLineToast ? "toast-single" : "toast-multi"}`}>
        <div
          className={classNames(
            {"toast__icon-single": isSingleLineToast, "toast__icon-multi": !isSingleLineToast},
            `toast__icon-${type}-${isSingleLineToast ? "single" : "multi"}`
          )}
        >
          {Icon && <Icon />}
        </div>
        <div className={`${isSingleLineToast ? "toast__title-single" : "toast__title-multi"}`} ref={titleRef}>
          {title}
        </div>
        {message && <div className="toast__message">{message}</div>}
        {hintMessage && (
          <div className="toast__hint">
            <label
              onClick={(e) => {
                e.stopPropagation();
                setHintChecked(true);
                hintOnClick;
              }}
            >
              <input className={hintChecked ? "toast__hint-button-checked" : "toast__hint-button"} type="checkbox" defaultChecked={hintChecked} />
              <span className="toast__hint-text">{hintMessage}</span>
            </label>
          </div>
        )}
        {isSingleLineToast && buttons?.length == 1 && (
          <button className={`toast__button toast__button-single toast__button-${type}`} onClick={firstButtonOnClick}>
            {buttons[0]}
          </button>
        )}
        {!isSingleLineToast && (
          <div className="toast__buttons-multi">
            {buttons &&
              buttons.map((button, index) => (
                <button
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
    </>
  );
};
