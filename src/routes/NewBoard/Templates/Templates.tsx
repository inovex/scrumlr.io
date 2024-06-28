import classNames from "classnames";
import {Outlet} from "react-router-dom";
import {useAppSelector} from "store";
import {useTranslation} from "react-i18next";
// using a png instead of svg for now. reason being problems with layering
import Stan from "assets/stan/Stan_Hanging_With_Coffee_Cropped.png";
import {ReactComponent as ArrowLeft} from "assets/icons/arrow-left.svg";
import {ReactComponent as ArrowRight} from "assets/icons/arrow-right.svg";
import "./Templates.scss";

type Side = "left" | "right";

export const Templates = () => {
  const {t} = useTranslation();
  const isAnonymous = useAppSelector((state) => state.auth.user?.isAnonymous) ?? true;

  const scrollToSide = (side: Side) => {
    console.log("scroll to", side);
  };

  const renderContainerHeader = (renderSide: Side, title: string) => (
    <header className="templates__container-header">
      <button className="templates__container-arrow-button" disabled={renderSide === "left"} onClick={() => scrollToSide("left")} aria-label="scroll left">
        <ArrowLeft className={classNames("templates__container-arrow", "templates__container-arrow--left", {"templates__container-arrow--disabled": renderSide === "left"})} />
      </button>
      <div className="templates__container-title">{title}</div>
      <button className="templates__container-arrow-button" disabled={renderSide === "right"} onClick={() => scrollToSide("right")} aria-label="scroll right">
        <ArrowRight className={classNames("templates__container-arrow", "templates__container-arrow--right", {"templates__container-arrow--disabled": renderSide === "right"})} />
      </button>
    </header>
  );

  return (
    <>
      <Outlet /> {/* settings */}
      <div className="templates">
        <div className="templates__stan-container">
          <img className="templates__stan" src={Stan} alt="Stan just hanging there with a coffee" />
        </div>
        {!isAnonymous && <div className="templates__container templates__container--saved">{renderContainerHeader("left", t("Templates.savedTemplates"))}</div>}
        <div className="templates__container templates__container--recommended">{renderContainerHeader("right", t("Templates.recommendedTemplates"))}</div>
      </div>
    </>
  );
};
