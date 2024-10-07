import classNames from "classnames";
import {QRCodeCanvas} from "qrcode.react";
import {useTranslation} from "react-i18next";
import {useState} from "react";
import {useAppSelector} from "store";
import {useAutoTheme} from "utils/hooks/useAutoTheme";
import {getCSSCustomPropertyValue} from "utils/computedStyles";
import "./ShareSession.scss";

export const ShareSession = () => {
  const {t} = useTranslation();
  const boardId = useAppSelector((state) => state.board.data?.id);
  const theme = useAppSelector((state) => state.view.theme);
  const autoTheme = useAutoTheme(theme);

  const gray000 = getCSSCustomPropertyValue("--gray--000");
  const navy900 = getCSSCustomPropertyValue("--navy--900");

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
          <QRCodeCanvas
            value={`${window.location.origin}/board/${boardId}`}
            size={1024}
            fgColor={autoTheme === "dark" ? gray000 : navy900}
            bgColor={autoTheme === "dark" ? navy900 : gray000}
            className="share-qr-code-option__qrcode"
          />
        </div>
        <button className={classNames("share-qr-code-option__copy-to-clipboard", {"--copied": urlInClipBoard})} onClick={handleCopyToClipboard} disabled={urlInClipBoard}>
          {urlInClipBoard ? t("ShareQrCodeOption.inviteUrlCopied") : t("ShareQrCodeOption.copyInviteURL")}
        </button>
      </div>
    </div>
  );
};
