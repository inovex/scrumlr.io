import {useNavigate} from "react-router";
import {ReactComponent as ShareIcon} from "assets/icon-share.svg";
import "./ReturnToFocusButton.scss";
import {useTranslation} from "react-i18next";

type ReturnToFocusButtonProps = {
  sharedNote: string;
};

export const ReturnToFocusButton = ({sharedNote}: ReturnToFocusButtonProps) => {
  const navigate = useNavigate();
  const {t} = useTranslation();

  return (
    <button className="return-to-focus-button" onClick={() => navigate(`stack/${sharedNote}`)}>
      <span>{t("InfoBar.ReturnToFocusedNote")}</span>
      <ShareIcon />
    </button>
  );
};
