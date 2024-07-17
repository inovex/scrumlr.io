import classNames from "classnames";
import QRCode from "qrcode.react";
import {useTranslation} from "react-i18next";
import {useState, VFC} from "react";
import {useAppSelector} from "store";
import {MenuItem} from "constants/settings";
import {getColorClassName} from "constants/colors";
import {useOutletContext} from "react-router";
import "./ShareSession.scss";

export const ShareSession: VFC = () => {
  const {t} = useTranslation();
  const activeMenuItem: MenuItem = useOutletContext();

  const boardId = useAppSelector((state) => state.board.data?.id);

  const [urlInClipBoard, setUrlInClipBoard] = useState(false);

  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(`${window.location.origin}/board/${boardId}`);
    setUrlInClipBoard(true);
  };

  return (
    <div data-testid="qrcode" className={classNames("settings-dialog__container", getColorClassName(activeMenuItem?.color))}>
      <div className="settings-dialog__header">
        <h2 className={classNames("settings-dialog__header-text")}> {t("ShareQrCodeOption.title")}</h2>
      </div>
      <div className={classNames("share-session__container")}>
        <div className="share-session__background">
          <QRCode value={`${window.location.origin}/board/${boardId}`} renderAs="svg" className="share-qr-code-option__qrcode" />
        </div>
        <button className={classNames("share-qr-code-option__copy-to-clipboard", {"--copied": urlInClipBoard})} onClick={handleCopyToClipboard} disabled={urlInClipBoard}>
          {urlInClipBoard ? t("ShareQrCodeOption.inviteUrlCopied") : t("ShareQrCodeOption.copyInviteURL")}
        </button>
      </div>
    </div>
  );
};
