import {useTranslation} from "react-i18next";
import Stan from "assets/stan/Stan_Hanging_With_Coffee_Cropped.png";
import "./Templates.scss";

export const Templates = () => {
  const {t} = useTranslation();

  return (
    <div className="templates">
      <div className="templates__stan-container">
        <img className="templates__stan" src={Stan} alt="Stan just hanging there with a coffee" />
      </div>
      {/* TODO: display saved templates only when user isn't anonymous (blocked by #4229) */}
      <div className="templates__container templates__container--saved">
        <div className="templates__container-title">{t("Templates.savedTemplates")}</div>
      </div>
      <div className="templates__container templates__contaner--recommended">
        <div className="templates__container-title">{t("Templates.recommendedTemplates")}</div>
      </div>
    </div>
  );
};
