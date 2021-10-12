import {ReactComponent as ShareIcon} from "assets/icon-share.svg";
import {Dispatch, SetStateAction} from "react";
import "../BoardSettings/HeaderMenuItems.scss";
import classNames from "classnames";
import QRCode from "qrcode.react";
import {BoardOption} from "./BoardOption";
import {BoardOptionButton} from "./BoardOptionButton";

export type QRCodeProps = {
  setShowDelete: Dispatch<SetStateAction<boolean>>;
  setShowQrCode: Dispatch<SetStateAction<boolean>>;
  setShowExport: Dispatch<SetStateAction<boolean>>;
  showQrCode: boolean;
};

export const ShareQrCodeOption = (props: QRCodeProps) => (
  <BoardOption data-testid="qrcode">
    <li className="header-menu__item">
      <BoardOptionButton
        onClick={() => {
          props.setShowDelete(false);
          props.setShowExport(false);
          props.setShowQrCode(!props.showQrCode);
        }}
      >
        <ShareIcon className="item-button__icon" />
        <label className="item-button__label">Share board</label>
      </BoardOptionButton>
    </li>
    <li className={classNames("header-menu__qrcode-container", {"header-menu__qrcode-container--visible": props.showQrCode})}>
      <QRCode value={document.location.href} size={260} className="qrcode-container__qrcode" />
      <button className="qrcode-container__copy-to-clipboard" onClick={() => navigator.clipboard.writeText(document.location.href)}>
        Copy Invite URL
      </button>
    </li>
  </BoardOption>
);
