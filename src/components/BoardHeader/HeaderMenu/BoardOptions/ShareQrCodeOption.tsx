import {ReactComponent as ShareIcon} from "assets/icon-share.svg";
import {Dispatch, SetStateAction} from "react";
import "../BoardSettings/HeaderMenuItems.scss";
import classNames from "classnames";
import QRCode from "qrcode.react";
import {BoardOption} from "./BoardOption";
import {BoardOptionButton} from "./BoardOptionButton";
import "./ShareQrCodeOption.scss";

export type QRCodeProps = {
  setShowDelete: Dispatch<SetStateAction<boolean>>;
  setShowQrCode: Dispatch<SetStateAction<boolean>>;
  setShowExport: Dispatch<SetStateAction<boolean>>;
  showQrCode: boolean;
};

export const ShareQrCodeOption = (props: QRCodeProps) => (
  <BoardOption data-testid="qrcode">
    <BoardOptionButton
      label="Share board"
      icon={ShareIcon}
      className="board-option-button--expandable"
      onClick={() => {
        props.setShowDelete(false);
        props.setShowExport(false);
        props.setShowQrCode(!props.showQrCode);
      }}
    />
    <div className={classNames("share-qr-code-option__container", {"share-qr-code-option__container--visible": props.showQrCode})}>
      <QRCode value={document.location.href} size={260} className="qrcode-container__qrcode" />
      <button className="qrcode-container__copy-to-clipboard" onClick={() => navigator.clipboard.writeText(document.location.href)}>
        Copy Invite URL
      </button>
    </div>
  </BoardOption>
);
