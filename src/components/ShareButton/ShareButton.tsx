import {useTranslation} from "react-i18next";
import {useNavigate} from "react-router-dom";
import {Plus} from "components/Icon";
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
      <Plus />
    </button>
  );
};
