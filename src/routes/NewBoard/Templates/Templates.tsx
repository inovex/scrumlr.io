import {Outlet} from "react-router-dom";
import {useAppSelector} from "store";
import {useTranslation} from "react-i18next";
// using a png instead of svg for now. reason being problems with layering
import Stan from "assets/stan/Stan_Hanging_With_Coffee_Cropped.png";
import "./Templates.scss";

export const Templates = () => {
  const {t} = useTranslation();
  const isAnonymous = useAppSelector((state) => state.auth.user?.isAnonymous) ?? true;

  const renderContainerHeader = (title: string) => (
      <header className="templates__container-header">
        <div className="templates__container-title">{title}</div>
      </header>
    );

  return (
    <>
      <Outlet /> {/* settings */}
      <div className="templates">
        <div className="templates__stan-container">
          <img className="templates__stan" src={Stan} alt="Stan just hanging there with a coffee" />
        </div>
        {!isAnonymous && <div className="templates__container templates__container--saved">{renderContainerHeader(t("Templates.savedTemplates"))}</div>}
        <div className="templates__container templates__container--recommended">{renderContainerHeader(t("Templates.recommendedTemplates"))}</div>
      </div>
    </>
  );
};
