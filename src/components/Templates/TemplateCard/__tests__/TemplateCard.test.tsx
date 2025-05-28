import {render} from "testUtils";
import {TemplateCard} from "components/Templates/TemplateCard/TemplateCard";
import {getTemplateAndColumnsByTemplateId} from "components/ColumnsConfigurator/ColumnsConfigurator.utils";
import getTestApplicationState from "utils/test/getTestApplicationState";
import {TemplateWithColumns} from "store/features";
import {fireEvent} from "@testing-library/react";

const renderRecommendedTemplateCard = (templateId: string, onSelectTemplate: (template: TemplateWithColumns) => void = jest.fn()) => {
  const templateWithColumns = getTemplateAndColumnsByTemplateId({...getTestApplicationState()}, templateId)!;

  return render(<TemplateCard template={templateWithColumns} templateType={"RECOMMENDED"} onSelectTemplate={onSelectTemplate} />);
};

const renderCustomTemplateCard = (
  templateId: string,
  {
    onSelectTemplate = jest.fn(),
    onDeleteTemplate = jest.fn(),
    onToggleFavourite = jest.fn(),
    onNavigateToEdit = jest.fn(),
  }: {
    onSelectTemplate?: (template: TemplateWithColumns) => void;
    onDeleteTemplate?: (templateId: string) => void;
    onToggleFavourite?: (templateId: string, favourite: boolean) => void;
    onNavigateToEdit?: (templateId: string) => void;
  } = {}
) => {
  const templateWithColumns = getTemplateAndColumnsByTemplateId({...getTestApplicationState()}, templateId)!;

  return render(
    <TemplateCard
      template={templateWithColumns}
      templateType={"CUSTOM"}
      onSelectTemplate={onSelectTemplate}
      onDeleteTemplate={onDeleteTemplate}
      onToggleFavourite={onToggleFavourite}
      onNavigateToEdit={onNavigateToEdit}
    />
  );
};

// helper function which queries the mini menu icon and clicks it, which opens the mini menu
const openMiniMenu = (container: HTMLElement & Element) => {
  const miniMenuIcon = container.querySelector(".template-card__icon--menu")!;
  fireEvent.click(miniMenuIcon);
  const miniMenu = container.querySelector<HTMLDivElement>(".template-card__menu--open");
  expect(miniMenu).toBeInTheDocument();
};

// helper function which clicks a mini menu item by querying it by label
const clickMiniMenuItem = (container: HTMLElement & Element, label: string) => {
  const miniMenuButton = container.querySelector<HTMLButtonElement>(`.mini-menu__item[data-tooltip-content="${label}"]`);
  expect(miniMenuButton).toBeInTheDocument();
  fireEvent.mouseDown(miniMenuButton!);
};

describe("TemplateCard", () => {
  it("should render correctly (recommended)", () => {
    const {container} = renderRecommendedTemplateCard("test-templates-id-1");
    expect(container).toMatchSnapshot();
  });

  it("should render correctly (custom)", () => {
    const {container} = renderCustomTemplateCard("test-templates-id-1");
    expect(container).toMatchSnapshot();
  });

  it("should call back on select", () => {
    const onSelectTemplate: (template: TemplateWithColumns) => void = jest.fn();

    const {container} = renderCustomTemplateCard("test-templates-id-1", {onSelectTemplate});
    const startButton = container.querySelector<HTMLButtonElement>(".template-card__start-button--start")!;

    fireEvent.click(startButton);

    expect(onSelectTemplate).toHaveBeenCalledWith(expect.objectContaining({template: expect.objectContaining({id: "test-templates-id-1"})}));
  });

  it("should favourite template", () => {
    const onToggleFavourite: (templateId: string, favourite: boolean) => void = jest.fn();

    const {container} = renderCustomTemplateCard("test-templates-id-1", {onToggleFavourite});
    const favouriteButton = container.querySelector<HTMLButtonElement>(".template-card__favourite")!;

    fireEvent.click(favouriteButton);

    expect(onToggleFavourite).toHaveBeenCalledWith("test-templates-id-1", true);
  });

  it("should un-favourite template", () => {
    const onToggleFavourite: (templateId: string, favourite: boolean) => void = jest.fn();

    const {container} = renderCustomTemplateCard("test-templates-id-2", {onToggleFavourite});
    const favouriteButton = container.querySelector<HTMLButtonElement>(".template-card__favourite")!;

    fireEvent.click(favouriteButton);

    expect(onToggleFavourite).toHaveBeenCalledWith("test-templates-id-2", false);
  });

  it("should call back on delete", () => {
    const onDeleteTemplate: (templateId: string) => void = jest.fn();

    const {container} = renderCustomTemplateCard("test-templates-id-1", {onDeleteTemplate});

    openMiniMenu(container);
    clickMiniMenuItem(container, "Delete");

    expect(onDeleteTemplate).toHaveBeenCalledWith("test-templates-id-1");
  });

  it("should call back on edit", () => {
    const onNavigateToEdit: (templateId: string) => void = jest.fn();

    const {container} = renderCustomTemplateCard("test-templates-id-1", {onNavigateToEdit});

    openMiniMenu(container);
    clickMiniMenuItem(container, "Edit");

    expect(onNavigateToEdit).toHaveBeenCalledWith("test-templates-id-1");
  });
});
