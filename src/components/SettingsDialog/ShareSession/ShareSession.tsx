import classNames from "classnames";
import QRCode from "qrcode.react";
import {useTranslation} from "react-i18next";
import "./ShareSession.scss";
import {useState, VFC} from "react";

export const ShareSession: VFC = () => {
  const {t} = useTranslation();

  const [urlInClipBoard, setUrlInClipBoard] = useState(false);

  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(document.location.href);
    setUrlInClipBoard(true);
  };

  return (
    <div data-testid="qrcode" className="settings-dialog__container">
      <div className="settings-dialog__header">
        <h2 className={classNames("settings-dialog__header-text", "accent-color__planning-pink")}> {t("ShareQrCodeOption.title")}</h2>
      </div>
      <div className={classNames("share-session__container", "accent-color__planning-pink")}>
        <div className="share-session__background">
          <QRCode value={document.location.href} size={260} className="share-qr-code-option__qrcode" />
        </div>
        <button className={classNames("share-qr-code-option__copy-to-clipboard", {"--copied": urlInClipBoard})} onClick={handleCopyToClipboard}>
          {urlInClipBoard ? t("ShareQrCodeOption.inviteUrlCopied") : t("ShareQrCodeOption.copyInviteURL")}
        </button>
      </div>
    </div>
  );
};
