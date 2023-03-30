import {useTranslation} from "react-i18next";
import {useNavigate} from "react-router-dom";
import {ReactComponent as PlusIcon} from "assets/icon-add.svg";
import "./ShareButton.scss";

export const ShareButton = () => {
  const {t} = useTranslation();
  const navigate = useNavigate();

  return (
    <button
      aria-label={t("ShareQrCodeOption.title")}
      className="share-button"
      onClick={() => {
        navigate("settings/share");
      }}
      title={t("ShareQrCodeOption.title")}
    >
      <PlusIcon />
    </button>
  );
};
