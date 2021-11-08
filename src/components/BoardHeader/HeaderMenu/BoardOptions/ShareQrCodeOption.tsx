import {ReactComponent as ShareIcon} from "assets/icon-share.svg";
import "../BoardSettings/BoardSettings.scss";
import classNames from "classnames";
import QRCode from "qrcode.react";
import {TabIndex} from "constants/tabIndex";
import {BoardOption} from "./BoardOption";
import {BoardOptionButton} from "./BoardOptionButton";
import "./ShareQrCodeOption.scss";

export type QRCodeProps = {
  onClick: () => void;
  expand: boolean;
};

export const ShareQrCodeOption = (props: QRCodeProps) => (
  <BoardOption data-testid="qrcode">
    <BoardOptionButton label="Share board" icon={ShareIcon} isExpandable onClick={props.onClick} />
    <div className={classNames("share-qr-code-option__container", {"share-qr-code-option__container--visible": props.expand})}>
      <QRCode value={document.location.href} size={260} className="share-qr-code-option__qrcode" />
      <button
        tabIndex={props.expand ? TabIndex.default : TabIndex.disabled}
        className="share-qr-code-option__copy-to-clipboard"
        onClick={() => navigator.clipboard.writeText(document.location.href)}
      >
        Copy Invite URL
      </button>
    </div>
  </BoardOption>
);
