import "./CustomToast.scss";
import {ReactElement, useEffect, useRef, useState} from "react";
// import classNames from "classnames";
import {ReactComponent as IconDelete} from "assets/icon-delete.svg";
import classNames from "classnames";
// import {ReactComponent as IconHand} from "assets/icon-hand.svg";

export interface CustomToastProps {
  icon?: ReactElement;
  message: string;
  hintMessage?: string;
  hintOnClick?: () => void;
  buttonTitle?: string;
  buttonOnClick: () => void;
}

// Mocking
const buttons = ["CANCEL"];
// const buttons = ["YES", "CANCEL"];
// const message = "Du hast eine Karte gelöscht. Möchtest du die aktion widerrufen?";
const message = "Karte wurde gelöscht";
// const hintMessage = "Don't show this anymore";
const hintMessage = null;

export const CustomToast = () => {
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

  const isSingleLineToast = buttons.length === 1 && isSingleTextLine && !hintMessage;

  return (
    <>
      <style>{`.Toastify__toast { 
        --toast-height: ${isSingleLineToast ? "56px;" : "fit-content;"} 
        --toast-border-radius: ${isSingleLineToast ? "28px;" : "16px;"}
    }`}</style>
      <div className="toast">
        <div className="content">
          <div className={classNames("icon", {"icon-singleLine": isSingleLineToast})}>
            <IconDelete />
          </div>
          <div className={classNames("info", {"info-singleLine": !isSingleLineToast})}>
            {" "}
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
            <button className="actions-single-button">
              {/* <IconHand /> */}
              Zurücksetzen
            </button>
          )}
        </div>
        {(buttons.length > 1 || !isSingleTextLine || hintMessage) && (
          <div className="actions">
            {buttons.map((button, index) => {
              console.log(index, buttons.length - 1);
              console.log(index < buttons.length - 1);
              return (
                <>
                  <button className="actions-button">{button}</button>
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
