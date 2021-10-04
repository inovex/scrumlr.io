import {ReactComponent as ShareIcon} from "assets/icon-share.svg";
import {Dispatch, SetStateAction} from "react";
import "./HeaderMenuItems.scss";
import "../HeaderMenu.scss";
import classNames from "classnames";
import QRCode from "qrcode.react";

export type QRCodeProps = {
  setShowDelete: Dispatch<SetStateAction<boolean>>;
  setShowQrCode: Dispatch<SetStateAction<boolean>>;
  setShowExport: Dispatch<SetStateAction<boolean>>;
  showQrCode: boolean;
};

export const QrCode = (props: QRCodeProps) => (
    <div className="menu__item-button">
      <li className="header-menu__item">
        <button
          className="menu__item-button"
          onClick={() => {
            props.setShowDelete(false);
            props.setShowExport(false);
            props.setShowQrCode(!props.showQrCode);
          }}
        >
          <ShareIcon className="item-button__icon" />
          <label className="item-button__label">Share board</label>
        </button>
      </li>
      <li className={classNames("header-menu__qrcode-container", {"header-menu__qrcode-container--visible": props.showQrCode})}>
        <QRCode value={document.location.href} size={260} className="qrcode-container__qrcode" />
        <button className="qrcode-container__copy-to-clipboard" onClick={() => navigator.clipboard.writeText(document.location.href)}>
          Copy Invite URL
        </button>
      </li>
    </div>
  );
