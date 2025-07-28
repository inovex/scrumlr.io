import classNames from "classnames";
import {Outlet, useOutletContext, useNavigate, useLocation} from "react-router";
import {useAppSelector, useAppDispatch} from "store";
import {
  createBoardFromTemplate,
  CreateSessionAccessPolicy,
  deleteTemplate,
  getTemplates,
  ImportReducedTemplateWithColumns,
  setTemplateFavourite,
  Template,
  TemplateWithColumns,
} from "store/features";
import {useTranslation} from "react-i18next";
import {useEffect, useRef, useState} from "react";
import {CreateTemplateCard, TemplateCard} from "components/Templates";
// using a png instead of svg for now. reason being problems with layering
import StanDark from "assets/stan/Stan_Hanging_With_Coffee_Cropped_Dark.png";
import StanLight from "assets/stan/Stan_Hanging_With_Coffee_Cropped_Light.png";
import {ReactComponent as ArrowLeft} from "assets/icons/arrow-left.svg";
import {ReactComponent as ArrowRight} from "assets/icons/arrow-right.svg";
import templatesJsonRaw from "constants/recommendedTemplates.json";
import {DEFAULT_TEMPLATE_ID} from "constants/templates";
import {Portal} from "components/Portal";
import {AccessSettings} from "components/Templates/AccessSettings/AccessSettings";
import {toggleRecommendedFavourite} from "store/features/templates";
import sortBy from "lodash/sortBy";
import "./Templates.scss";

type Side = "left" | "right";

export type TemplatesNavigationState = {scrollToSaved?: boolean};

export const Templates = () => {
  const templatesRef = useRef<HTMLDivElement>(null);
  const {t} = useTranslation(["translation", "templates"]);
  const dispatch = useAppDispatch();
  const location = useLocation();
  const navigate = useNavigate();

  const [selectedTemplateWithColumns, setSelectedTemplateWithColumns] = useState<TemplateWithColumns | null>(null);
  const [showAccessSettingsPortal, setShowAccessSettingsPortal] = useState(false);

  const {searchBarInput} = useOutletContext<{searchBarInput: string}>();

  const isAnonymous = useAppSelector((state) => state.auth.user?.isAnonymous);
  const allowAnonymousCustomTemplates = useAppSelector((state) => state.view.allowAnonymousCustomTemplates);
  const showCustomTemplates = !isAnonymous || allowAnonymousCustomTemplates;

  const showCreateTemplateView = () => navigate("../create");

  const templates = useAppSelector((state) => state.templates);
  const templateColumns = useAppSelector((state) => state.templateColumns);

  // Helper to get columns for recommended templates from JSON, matching by template id
  // data like ids will be populated dynamically.
  const recommendedTemplatesJson: ImportReducedTemplateWithColumns[] = templatesJsonRaw as ImportReducedTemplateWithColumns[];
  const getRecommendedColumns = (templateId: string) => {
    const idx = templates.findIndex((template) => template.id === templateId && template.type === "RECOMMENDED");
    if (idx === -1) return [];
    const jsonTemplate = recommendedTemplatesJson[idx];
    if (!jsonTemplate) return [];
    return jsonTemplate.columns.map((column, indexColumn) => ({
      ...column,
      id: `column-${idx}-${indexColumn}`,
      template: templateId,
      index: indexColumn,
      name: t(column.name, {ns: "templates"}),
      description: t(column.description, {ns: "templates"}),
    }));
  };

  // init templates
  useEffect(() => {
    dispatch(getTemplates());
  }, [dispatch]);

  const toggleFavourite = (templateId: string, favourite: boolean, type: "RECOMMENDED" | "CUSTOM") => {
    if (type === "RECOMMENDED") {
      dispatch(toggleRecommendedFavourite(templateId));
    } else {
      dispatch(setTemplateFavourite({id: templateId, favourite}));
    }
  };

  const navigateToEdit = (templateId: string) => {
    navigate(`../edit/${templateId}`);
  };

  const deleteTemplateAndColumns = (templateId: string) => {
    // setShowMiniMenu(false); // close menu manually, because it stays open for some reason
    dispatch(deleteTemplate({id: templateId}));
  };

  // after selecting template and access policy, actually dispatch to create board from template
  const createBoard = (templateWithColumns: TemplateWithColumns, accessPolicy: CreateSessionAccessPolicy) => {
    dispatch(createBoardFromTemplate({templateWithColumns, accessPolicy}))
      .unwrap()
      .then((boardId) => navigate(`/board/${boardId}`));
  };

  // second step: after selecting access policy, collect selected template and selected accessPolicy and proceed to dispatch
  const onSelectSessionPolicy = (accessPolicy: CreateSessionAccessPolicy) => {
    if (!selectedTemplateWithColumns) return;

    setShowAccessSettingsPortal(false);

    createBoard(selectedTemplateWithColumns, accessPolicy);
  };

  // first step: after selecting a template, save it as state and proceed to access policy selection modal
  const onSelectTemplateWithColumns = (templateWithColumns: TemplateWithColumns) => {
    setSelectedTemplateWithColumns(templateWithColumns);
    setShowAccessSettingsPortal(true);
  };

  const onLeaveSessionPolicy = () => {
    setSelectedTemplateWithColumns(null);
    setShowAccessSettingsPortal(false);
  };

  const scrollToSide = (side: Side, smooth: boolean) => {
    const screenWidth = document.documentElement.clientWidth;
    const offset = screenWidth * (side === "left" ? -1 : 1);
    templatesRef.current?.scroll({left: offset, behavior: smooth ? "smooth" : "auto"});
  };

  // simple comparison between template name and search input
  const matchSearchInput = (template: Template) => template.name.toLowerCase().includes(searchBarInput.toLowerCase());

  // default template, which is in the state should not be shown.
  const excludeDefaultTemplate = (template: Template) => template.id !== DEFAULT_TEMPLATE_ID;

  // ironically, since templates and their columns are handled separately, we need to stitch them back together
  // to a common object in order to avoid losing information (since recommended templates don't have associated cols)
  // merging template with columns, using JSON for recommended, Redux for custom
  const mergeTemplateWithColumns = (template: Template): TemplateWithColumns => {
    if (template.type === "RECOMMENDED") {
      const translatedTemplate = {
        ...template,
        name: t(template.name, {ns: "templates"}),
        description: t(template.description, {ns: "templates"}),
      };
      return {template: translatedTemplate, columns: getRecommendedColumns(template.id)};
    }
    const associatedColumns = templateColumns.filter((tc) => tc.template === template.id);
    return {template, columns: associatedColumns};
  };

  // if we just created/edited a template, go to custom templates view immediately
  const scrollToSaved = !!(location.state as TemplatesNavigationState)?.scrollToSaved;
  useEffect(() => {
    if (scrollToSaved) {
      scrollToSide("right", false);
    }
  }, [scrollToSaved]);

  const renderContainerHeader = (renderSide: Side, title: string) =>
    showCustomTemplates ? (
      <header className="templates__container-header">
        <div className="templates__container-title">{title}</div>
      </header>
    ) : (
      <header className="templates__container-header">
        <button className="templates__container-arrow-button" disabled={renderSide === "left"} onClick={() => scrollToSide("left", true)} aria-label="scroll left">
          <ArrowLeft className={classNames("templates__container-arrow", "templates__container-arrow--left", {"templates__container-arrow--disabled": renderSide === "left"})} />
        </button>
        <div className="templates__container-title" role="button" tabIndex={0} onClick={() => scrollToSide(renderSide === "left" ? "right" : "left", true)}>
          {title}
        </div>
        <button className="templates__container-arrow-button" disabled={renderSide === "right"} onClick={() => scrollToSide("right", true)} aria-label="scroll right">
          <ArrowRight className={classNames("templates__container-arrow", "templates__container-arrow--right", {"templates__container-arrow--disabled": renderSide === "right"})} />
        </button>
      </header>
    );

  return (
    <>
      <Outlet /> {/* settings */}
      {showAccessSettingsPortal ? (
        <Portal className={classNames("templates__portal")} hiddenOverflow disabledPadding>
          <AccessSettings onCancel={onLeaveSessionPolicy} onSelectSessionPolicy={onSelectSessionPolicy} />
        </Portal>
      ) : null}
      <div className="templates" ref={templatesRef}>
        <div className="templates__stan-container">
          <img className={classNames("templates__stan", "templates__stan--dark")} src={StanDark} alt="Stan just hanging there with a coffee" />
          <img className={classNames("templates__stan", "templates__stan--light")} src={StanLight} alt="Stan just hanging there with a coffee" />
        </div>
        <section className="templates__container templates__container--recommended">
          {renderContainerHeader("left", t("Templates.recommendedTemplates"))}
          <div className="templates__card-container">
            {sortBy(
              templates.filter((template) => template.type === "RECOMMENDED" && matchSearchInput(template)),
              (template: Template) => !template.favourite
            ).map((template: Template) => (
              <TemplateCard
                templateType="RECOMMENDED"
                template={mergeTemplateWithColumns(template)}
                onSelectTemplate={onSelectTemplateWithColumns}
                onToggleFavourite={(id, fav) => toggleFavourite(id, fav, "RECOMMENDED")}
                key={template.id}
              />
            ))}
          </div>
        </section>
        {showCustomTemplates && (
          <section className="templates__container templates__container--saved">
            {renderContainerHeader("right", t("Templates.savedTemplates"))}
            <div className="templates__card-container">
              <CreateTemplateCard onClick={showCreateTemplateView} />
              {sortBy(
                templates
                  .filter((template) => template.type === "CUSTOM")
                  .filter(matchSearchInput)
                  .filter(excludeDefaultTemplate),
                (template: Template) => !template.favourite
              ).map((template: Template) => (
                <TemplateCard
                  templateType="CUSTOM"
                  template={mergeTemplateWithColumns(template)}
                  onSelectTemplate={onSelectTemplateWithColumns}
                  onDeleteTemplate={deleteTemplateAndColumns}
                  onNavigateToEdit={navigateToEdit}
                  onToggleFavourite={(id, fav) => toggleFavourite(id, fav, "CUSTOM")}
                  key={template.id}
                />
              ))}
            </div>
          </section>
        )}
      </div>
    </>
  );
};
