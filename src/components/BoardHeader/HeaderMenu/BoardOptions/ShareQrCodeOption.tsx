import {ReactComponent as ShareIcon} from "assets/icon-share.svg";
import "../BoardSettings/BoardSettings.scss";
import classNames from "classnames";
import QRCode from "qrcode.react";
import {useTranslation} from "react-i18next";
import {TabIndex} from "constants/tabIndex";
import {BoardOption} from "./BoardOption";
import {BoardOptionButton} from "./BoardOptionButton";
import "./ShareQrCodeOption.scss";

export type QRCodeProps = {
  onClick: () => void;
  expand: boolean;
};

export const ShareQrCodeOption = (props: QRCodeProps) => {
  const {t} = useTranslation();

  return (
    <BoardOption data-testid="qrcode">
      <BoardOptionButton label={t("ShareQrCodeOption.button")} icon={ShareIcon} isExpandable onClick={props.onClick} />
      <div className={classNames("share-qr-code-option__container", {"share-qr-code-option__container--visible": props.expand})}>
        <QRCode value={document.location.href} size={260} className="share-qr-code-option__qrcode" />
        <button
          className="share-qr-code-option__copy-to-clipboard"
          onClick={() => navigator.clipboard.writeText(document.location.href)}
          tabIndex={props.expand ? TabIndex.default : TabIndex.disabled}
        >
          {t("ShareQrCodeOption.copyInviteURL")}
        </button>
      </div>
    </BoardOption>
  );
};
