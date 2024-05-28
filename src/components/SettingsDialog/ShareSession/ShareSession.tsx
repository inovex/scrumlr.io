import classNames from "classnames";
import QRCode from "qrcode.react";
import {useTranslation} from "react-i18next";
import {useState} from "react";
import {useAppSelector} from "store";
import "./ShareSession.scss";

export const ShareSession = () => {
  const {t} = useTranslation();
  const boardId = useAppSelector((state) => state.board.data?.id);

  const [urlInClipBoard, setUrlInClipBoard] = useState(false);

  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(`${window.location.origin}/board/${boardId}`);
    setUrlInClipBoard(true);
  };

  return (
    <div data-testid="qrcode" className="settings-dialog__container">
      <div className="settings-dialog__header">
        <h2 className={classNames("settings-dialog__header-text", "accent-color__planning-pink")}> {t("ShareQrCodeOption.title")}</h2>
      </div>
      <div className={classNames("share-session__container", "accent-color__planning-pink")}>
        <div className="share-session__background">
          {/* using an upscaled canvas instead of svg to make it a savable image */}
          <QRCode value={`${window.location.origin}/board/${boardId}`} renderAs="canvas" className="share-qr-code-option__qrcode" size={1024} />
        </div>
        <button className={classNames("share-qr-code-option__copy-to-clipboard", {"--copied": urlInClipBoard})} onClick={handleCopyToClipboard} disabled={urlInClipBoard}>
          {urlInClipBoard ? t("ShareQrCodeOption.inviteUrlCopied") : t("ShareQrCodeOption.copyInviteURL")}
        </button>
      </div>
    </div>
  );
};
