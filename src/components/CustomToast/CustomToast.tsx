import "./CustomToast.scss";
import {ReactElement} from "react";
import classNames from "classnames";
import {ReactComponent as IconDelete} from "assets/icon-delete.svg";
import {ReactComponent as IconHand} from "assets/icon-hand.svg";

export interface CustomToastProps {
  icon?: ReactElement;
  message: string;
  hintMessage?: string;
  hintOnClick?: () => void;
  buttonTitle?: string;
  buttonOnClick: () => void;
}

// const buttons = ["cancel"]
const buttons = ["yes", "no", "cancel"];

export const CustomToast = () => (
  <div className={classNames("toast", {"toast__single-button-container": buttons.length === 1})}>
    <div className="content">
      <div className="icon">
        <IconDelete />
      </div>
      <div className="info">
        <div className="info-text">Du hast den Präsentationsmodus gestartet. Ausgewählte Karten werden mit allen Teilnehmern</div>
        <div className="info-hint">
          <div className="info-hint-text">Don't show this anymore</div>
          <button className="info-hint-button" />
        </div>
      </div>
    </div>
    {buttons.length === 1 && (
      <button className="actions-single-button">
        <IconHand />
      </button>
    )}
    {buttons.length > 1 && (
      <div className="actions">
        <button className="actions-button">YES</button>
        <button className="actions-button">CANCEL</button>
      </div>
    )}
  </div>
);
