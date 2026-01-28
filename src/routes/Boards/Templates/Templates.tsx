import classNames from "classnames";
import {Outlet, useOutletContext, useNavigate, useLocation} from "react-router";
import {useAppSelector, useAppDispatch} from "store";
import {createBoardFromTemplate, CreateSessionAccessPolicy, deleteTemplate, getTemplates, setTemplateFavourite, Template, TemplateWithColumns} from "store/features";
import {useTranslation} from "react-i18next";
import {useEffect, useRef, useState} from "react";
import {CreateTemplateCard, TemplateCard} from "components/Templates";
import StanDark from "assets/stan/Stan_Hanging_With_Coffee_Cropped_Dark.svg";
import StanLight from "assets/stan/Stan_Hanging_With_Coffee_Cropped_Light.svg";
import {ReactComponent as ArrowLeft} from "assets/icons/arrow-left.svg";
import {ReactComponent as ArrowRight} from "assets/icons/arrow-right.svg";
import {DEFAULT_TEMPLATE_ID} from "constants/templates";
import {Portal} from "components/Portal";
import {AccessSettings} from "components/Templates/AccessSettings/AccessSettings";
import {toggleRecommendedFavourite} from "store/features/templates";
import {Tooltip} from "components/Tooltip";
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
  const allowAnonymousBoardCreation = useAppSelector((state) => state.view.allowAnonymousBoardCreation);
  const canCreateBoard = !isAnonymous || allowAnonymousBoardCreation;
  const showCustomTemplates = !isAnonymous || allowAnonymousCustomTemplates;

  const showCreateTemplateView = () => navigate("../create");

  const templates = useAppSelector((state) => state.templates);
  const templateColumns = useAppSelector((state) => state.templateColumns);

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

  // stitch template and associated columns back together
  const mergeTemplateWithColumns = (template: Template): TemplateWithColumns => {
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
    ) : (
      <header className="templates__container-header">
        <div className="templates__container-title">{title}</div>
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
          <div className="templates__stan-spacing" />
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
                disabled={!canCreateBoard}
                disabledReason={!canCreateBoard ? t("Templates.TemplateCard.signInToCreateBoards") : undefined}
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
                  disabled={!canCreateBoard}
                  disabledReason={!canCreateBoard ? t("Templates.TemplateCard.signInToCreateBoards") : undefined}
                  key={template.id}
                />
              ))}
            </div>
          </section>
        )}
      </div>
      <Tooltip id="template-card-tooltip" />
    </>
  );
};
