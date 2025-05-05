import classNames from "classnames";
import {Outlet, useOutletContext} from "react-router";
import {useAppDispatch, useAppSelector} from "store";
import {getTemplates, ReducedTemplateWithColumns, Template, TemplateColumn, TemplateWithColumns} from "store/features";
import {useTranslation} from "react-i18next";
import {useEffect, useRef} from "react";
import {CreateTemplateCard, TemplateCard} from "components/Templates";
// using a png instead of svg for now. reason being problems with layering
import StanDark from "assets/stan/Stan_Hanging_With_Coffee_Cropped_Dark.png";
import StanLight from "assets/stan/Stan_Hanging_With_Coffee_Cropped_Light.png";
import {ReactComponent as ArrowLeft} from "assets/icons/arrow-left.svg";
import {ReactComponent as ArrowRight} from "assets/icons/arrow-right.svg";
import templatesJsonRaw from "constants/templates.json";
import "./Templates.scss";

type Side = "left" | "right";

// takes the template json data and converts it to the full template with columns type.
// data like ids will be populated dynamically.
const convertJsonToFullTemplates = (reducedTemplates: ReducedTemplateWithColumns[]): TemplateWithColumns[] =>
  reducedTemplates.map(({columns, ...rest}, indexTemplate) => {
    const templateId = `template-${indexTemplate}`;

    return {
      ...rest,
      id: templateId,
      creator: "scrumlr",
      favourite: false,
      accessPolicy: "PUBLIC", // this property will be removed in the next PR
      columns: columns.map((column, indexColumn) => {
        const columnId = `column-${indexTemplate}-${indexColumn}`;

        return {
          ...column,
          id: columnId,
          template: templateId,
          index: indexColumn,
        } as TemplateColumn;
      }),
    } as TemplateWithColumns;
  });

export const Templates = () => {
  const templatesRef = useRef<HTMLDivElement>(null);
  const {t} = useTranslation();
  const dispatch = useAppDispatch();

  const searchBarInput: string = useOutletContext();

  const isAnonymous = useAppSelector((state) => state.auth.user?.isAnonymous) ?? true;

  const templates = useAppSelector((state) => state.templates);
  const templateColumns = useAppSelector((state) => state.templatesColumns);

  const reducedRecommendedTemplates: ReducedTemplateWithColumns[] = templatesJsonRaw as ReducedTemplateWithColumns[];
  const fullRecommendedTemplates = convertJsonToFullTemplates(reducedRecommendedTemplates);

  // init templates
  useEffect(() => {
    dispatch(getTemplates());
  }, [dispatch]);

  const scrollToSide = (side: Side) => {
    const screenWidth = document.documentElement.clientWidth;
    const offset = screenWidth * (side === "left" ? -1 : 1);
    templatesRef.current?.scroll({left: offset, behavior: "smooth"});
  };

  // simple comparison between template name and search input
  const matchSearchInput = (template: Template) => template.name.toLowerCase().includes(searchBarInput.toLowerCase());

  // ironically, since templates and their columns are handled separately, we need to stitch them back together
  // to a common object in order to avoid losing information (since recommended templates don't have associated cols)
  const mergeTemplateWithColumns = (template: Template, columns?: TemplateColumn[]): TemplateWithColumns => {
    if (columns) {
      return {...template, columns};
    }

    const associatedColumns = templateColumns.filter((tc) => tc.template === template.id);
    return {...template, columns: associatedColumns};
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
            {fullRecommendedTemplates.filter(matchSearchInput).map((template) => (
              <TemplateCard templateType="RECOMMENDED" template={mergeTemplateWithColumns(template, template.columns)} key={template.id} />
            ))}
          </div>
        </section>
        {!isAnonymous && (
          <section className="templates__container templates__container--saved">
            {renderContainerHeader("right", t("Templates.savedTemplates"))}
            <div className="templates__card-container">
              <CreateTemplateCard />
              {templates.filter(matchSearchInput).map((template) => (
                <TemplateCard templateType="CUSTOM" template={mergeTemplateWithColumns(template)} key={template.id} />
              ))}
            </div>
          </section>
        )}
      </div>
    </>
  );
};
