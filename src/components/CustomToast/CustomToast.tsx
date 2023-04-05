import "./CustomToast.scss";
import {FC, useEffect, useRef, useState} from "react";
// import classNames from "classnames";
import {ReactComponent as IconDelete} from "assets/icon-delete.svg";
import classNames from "classnames";
// import {ReactComponent as IconHand} from "assets/icon-hand.svg";

export interface CustomToastProps {
  message: string;
  hintMessage?: string | null;
  hintOnClick?: () => void;
  buttons?: string[] | null;
  firstButtonOnClick?: () => void;
  secondButtonOnClick?: () => void;
  icon?: Element;
}

// MOCKING
// const buttons = null;
// const buttons = ["CANCEL"];
// const buttons = ["YES", "CANCEL"];
// const message = "Du hast eine Karte gelöscht. Möchtest du die aktion widerrufen?";
// const message = "Karte wurde gelöscht";
// const hintMessage = "Don't show this anymore";
// const hintMessage = null;

export const CustomToast: FC<CustomToastProps> = ({message, buttons, hintMessage, hintOnClick, firstButtonOnClick, secondButtonOnClick}) => {
  const [isSingleTextLine, setIsSingleTextLine] = useState<boolean>(true);
  const textRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // console.log(textRef.current?.offsetHeight);
    if (textRef.current && textRef.current.offsetHeight > 16) {
      // adjust this value to match your font-size and line-height
      setIsSingleTextLine(false);
    } else {
      setIsSingleTextLine(true);
    }
  }, [message]);

  const isSingleLineToast = buttons?.length === 1 && isSingleTextLine && !hintMessage;

  return (
    <>
      <style>{`.Toastify__toast { 
        --toast-height: ${isSingleLineToast ? "56px;" : "fit-content;"} 
        --toast-border-radius: ${isSingleLineToast ? "28px;" : "16px;"}
    }`}</style>
      <div className="toast">
        <div className={classNames("content", {"content-singleLine-multipleButtons": isSingleTextLine && !hintMessage && buttons && buttons.length > 1})}>
          <div className={classNames({icon: !isSingleTextLine || hintMessage}, {"icon-singleLine": isSingleTextLine && !hintMessage})}>
            <IconDelete />
          </div>
          <div className={classNames({info: !isSingleTextLine || hintMessage}, {"info-singleLine": isSingleLineToast || (isSingleTextLine && !hintMessage)})}>
            {/* TODO buttons but single text info-singleLine inverted? */}
            <div className="info-text" ref={textRef}>
              {message}
            </div>
            {hintMessage && (
              <div className="info-hint">
                <button className="info-hint-button" />
                <div className="info-hint-text">{hintMessage}</div>
              </div>
            )}
          </div>
          {isSingleLineToast && (
            <button className="actions-single-button" onClick={firstButtonOnClick}>
              Zurücksetzen
            </button>
          )}
        </div>
        {buttons && (buttons.length > 1 || !isSingleTextLine || hintMessage) && (
          <div className="actions">
            {buttons &&
              buttons.map((button, index) => {
                console.log(index, buttons.length - 1);
                console.log(index < buttons.length - 1);
                return (
                  <>
                    <button className="actions-button" onClick={index == 0 ? firstButtonOnClick : secondButtonOnClick}>
                      {button}
                    </button>
                    {index < buttons.length - 1 && <hr className="actions-button-seperator" />}
                  </>
                );
              })}
          </div>
        )}
      </div>
    </>
  );
};
