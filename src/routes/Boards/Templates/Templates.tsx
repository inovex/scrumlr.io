import classNames from "classnames";
import {Outlet, useOutletContext} from "react-router-dom";
import {useAppSelector, useAppDispatch} from "store";
import {getTemplates} from "store/features";
import {useTranslation} from "react-i18next";
import {useEffect, useRef} from "react";
import {CreateTemplateCard, TemplateCard} from "components/Templates";
// using a png instead of svg for now. reason being problems with layering
import StanDark from "assets/stan/Stan_Hanging_With_Coffee_Cropped_Dark.png";
import StanLight from "assets/stan/Stan_Hanging_With_Coffee_Cropped_Light.png";
import {ReactComponent as ArrowLeft} from "assets/icons/arrow-left.svg";
import {ReactComponent as ArrowRight} from "assets/icons/arrow-right.svg";
import {RECOMMENDED_TEMPLATES} from "constants/templates";
import "./Templates.scss";

type Side = "left" | "right";

export const Templates = () => {
  const templatesRef = useRef<HTMLDivElement>(null);
  const {t} = useTranslation();
  const dispatch = useAppDispatch();

  const searchBarInput: string = useOutletContext();

  const isAnonymous = useAppSelector((state) => state.auth.user?.isAnonymous) ?? true;

  const templates = useAppSelector((state) => state.templates);

  // init templates
  useEffect(() => {
    dispatch(getTemplates());
  }, [dispatch]);

  const scrollToSide = (side: Side) => {
    const screenWidth = document.documentElement.clientWidth;
    const offset = screenWidth * (side === "left" ? -1 : 1);
    templatesRef.current?.scroll({left: offset, behavior: "smooth"});
  };

  const renderContainerHeader = (renderSide: Side, title: string) =>
    isAnonymous ? (
      <header className="templates__container-header">
        <div className="templates__container-title">{title}</div>
      </header>
    ) : (
      <header className="templates__container-header">
        <button className="templates__container-arrow-button" disabled={renderSide === "left"} onClick={() => scrollToSide("left")} aria-label="scroll left">
          <ArrowLeft className={classNames("templates__container-arrow", "templates__container-arrow--left", {"templates__container-arrow--disabled": renderSide === "left"})} />
        </button>
        <div className="templates__container-title" role="button" tabIndex={0} onClick={() => scrollToSide(renderSide === "left" ? "right" : "left")}>
          {title}
        </div>
        <button className="templates__container-arrow-button" disabled={renderSide === "right"} onClick={() => scrollToSide("right")} aria-label="scroll right">
          <ArrowRight className={classNames("templates__container-arrow", "templates__container-arrow--right", {"templates__container-arrow--disabled": renderSide === "right"})} />
        </button>
      </header>
    );

  return (
    <>
      <Outlet /> {/* settings */}
      <div className="templates" ref={templatesRef}>
        <div className="templates__stan-container">
          <img className={classNames("templates__stan", "templates__stan--dark")} src={StanDark} alt="Stan just hanging there with a coffee" />
          <img className={classNames("templates__stan", "templates__stan--light")} src={StanLight} alt="Stan just hanging there with a coffee" />
        </div>
        <section className="templates__container templates__container--recommended">
          {renderContainerHeader("left", t("Templates.recommendedTemplates"))}
          <div className="templates__card-container">
            {RECOMMENDED_TEMPLATES.filter((template) => template.name.toLowerCase().includes(searchBarInput.toLowerCase())).map((template) => (
              <TemplateCard templateType="RECOMMENDED" template={template} />
            ))}
          </div>
        </section>
        {!isAnonymous && (
          <section className="templates__container templates__container--saved">
            {renderContainerHeader("right", t("Templates.savedTemplates"))}
            <div className="templates__card-container">
              <CreateTemplateCard />
              {templates
                .filter((template) => template.name.toLowerCase().includes(searchBarInput.toLowerCase()))
                .map((template) => (
                  <TemplateCard templateType="CUSTOM" template={template} />
                ))}
            </div>
          </section>
        )}
      </div>
    </>
  );
};
