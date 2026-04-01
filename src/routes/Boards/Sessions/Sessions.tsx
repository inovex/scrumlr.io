import {Outlet} from "react-router";
import {useTranslation} from "react-i18next";
import classNames from "classnames";
import {InfoIcon} from "components/Icon";
import StanDark from "assets/stan/Stan_Okay_Cutted_Darkblue_Shirt.svg";
import StanLight from "assets/stan/Stan_Okay_Cutted_White_Shirt.svg";
import "./Sessions.scss";

export const Sessions = () => {
  const {t} = useTranslation();
  return (
    <>
      <Outlet /> {/* settings */}
      <div className="sessions__card">
        <div className="sessions__stan-container">
          <div className="sessions__stan-spacing" />
          <img className={classNames("sessions__stan", "sessions__stan--dark")} src={StanDark} alt="" />
          <img className={classNames("sessions__stan", "sessions__stan--light")} src={StanLight} alt="" />
        </div>
        <div className="sessions__teaser">
          <h2 className="sessions__teaser-title">{t("Sessions.savedBoards")}</h2>
          <div className="sessions__teaser-info">
            <InfoIcon className="sessions__teaser-icon" />
            <p className="sessions__teaser-text">{t("Sessions.teaserText")}</p>
          </div>
        </div>
      </div>
    </>
  );
};
