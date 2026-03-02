import {render} from "testUtils";
import {TemplateCard} from "components/Templates/TemplateCard/TemplateCard";
import {getTemplateAndColumnsByTemplateId} from "components/ColumnsConfigurator/ColumnsConfigurator.utils";
import getTestApplicationState from "utils/test/getTestApplicationState";
import {TemplateWithColumns} from "store/features";
import {act, fireEvent} from "@testing-library/react";

const renderRecommendedTemplateCard = (
  templateId: string,
  {
    onSelectTemplate = vi.fn(),
    onToggleFavourite = vi.fn(),
  }: {
    onSelectTemplate?: (template: TemplateWithColumns) => void;
    onToggleFavourite?: (templateId: string, favourite: boolean) => void;
  } = {},
  favourite: boolean = false,
  disabled: boolean = false,
  disabledReason?: string
) => {
  const templateWithColumns = getTemplateAndColumnsByTemplateId({...getTestApplicationState()}, templateId)!;
  const patchedTemplateWithColumns = {
    ...templateWithColumns,
    template: {
      ...templateWithColumns.template,
      favourite,
    },
  };
  return render(
    <TemplateCard
      template={patchedTemplateWithColumns}
      templateType="RECOMMENDED"
      onSelectTemplate={onSelectTemplate}
      onToggleFavourite={onToggleFavourite}
      disabled={disabled}
      disabledReason={disabledReason}
    />
  );
};

const renderCustomTemplateCard = (
  templateId: string,
  {
    onSelectTemplate = vi.fn(),
    onDeleteTemplate = vi.fn(),
    onToggleFavourite = vi.fn(),
    onNavigateToEdit = vi.fn(),
  }: {
    onSelectTemplate?: (template: TemplateWithColumns) => void;
    onDeleteTemplate?: (templateId: string) => void;
    onToggleFavourite?: (templateId: string, favourite: boolean) => void;
    onNavigateToEdit?: (templateId: string) => void;
  } = {},
  disabled: boolean = false,
  disabledReason?: string
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
      disabled={disabled}
      disabledReason={disabledReason}
    />
  );
};

// helper function which queries the mini menu icon and clicks it, which opens the mini menu
const openMiniMenu = (container: HTMLElement & Element) => {
  const miniMenuIcon = container.querySelector(".template-card__icon--menu")!;
  act(() => fireEvent.click(miniMenuIcon));
  const miniMenu = container.querySelector<HTMLDivElement>(".template-card__menu--open");
  expect(miniMenu).toBeInTheDocument();
};

// helper function which clicks a mini menu item by querying it by label
const clickMiniMenuItem = (container: HTMLElement & Element, label: string) => {
  const miniMenuButton = container.querySelector<HTMLButtonElement>(`.mini-menu__item[data-tooltip-content="${label}"]`);
  expect(miniMenuButton).toBeInTheDocument();
  act(() => fireEvent.mouseDown(miniMenuButton!));
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
    const onSelectTemplate: (template: TemplateWithColumns) => void = vi.fn();

    const {container} = renderCustomTemplateCard("test-templates-id-1", {onSelectTemplate});
    const startButton = container.querySelector<HTMLButtonElement>(".template-card__start-button--start")!;

    act(() => fireEvent.click(startButton));

    expect(onSelectTemplate).toHaveBeenCalledWith(expect.objectContaining({template: expect.objectContaining({id: "test-templates-id-1"})}));
  });

  it("should favourite template", () => {
    const onToggleFavourite: (templateId: string, favourite: boolean) => void = vi.fn();

    const {container} = renderCustomTemplateCard("test-templates-id-1", {onToggleFavourite});
    const favouriteButton = container.querySelector<HTMLButtonElement>(".template-card__favourite")!;

    act(() => fireEvent.click(favouriteButton));

    expect(onToggleFavourite).toHaveBeenCalledWith("test-templates-id-1", true);
  });

  it("should un-favourite template", () => {
    const onToggleFavourite: (templateId: string, favourite: boolean) => void = vi.fn();

    const {container} = renderCustomTemplateCard("test-templates-id-2", {onToggleFavourite});
    const favouriteButton = container.querySelector<HTMLButtonElement>(".template-card__favourite")!;

    act(() => fireEvent.click(favouriteButton));

    expect(onToggleFavourite).toHaveBeenCalledWith("test-templates-id-2", false);
  });

  it("should favourite template (recommended)", () => {
    const onToggleFavourite: (templateId: string, favourite: boolean) => void = vi.fn();

    const {container} = renderRecommendedTemplateCard("test-templates-id-1", {onToggleFavourite}, false);
    const favouriteButton = container.querySelector<HTMLButtonElement>(".template-card__favourite")!;

    act(() => fireEvent.click(favouriteButton));

    expect(onToggleFavourite).toHaveBeenCalledWith("test-templates-id-1", true);
  });

  it("should un-favourite template (recommended)", () => {
    const onToggleFavourite: (templateId: string, favourite: boolean) => void = vi.fn();

    const {container} = renderRecommendedTemplateCard("test-templates-id-2", {onToggleFavourite}, true);
    const favouriteButton = container.querySelector<HTMLButtonElement>(".template-card__favourite")!;

    act(() => fireEvent.click(favouriteButton));

    expect(onToggleFavourite).toHaveBeenCalledWith("test-templates-id-2", false);
  });

  it("should call back on delete", () => {
    const onDeleteTemplate: (templateId: string) => void = vi.fn();

    const {container} = renderCustomTemplateCard("test-templates-id-1", {onDeleteTemplate});

    openMiniMenu(container);
    clickMiniMenuItem(container, "Delete");

    expect(onDeleteTemplate).toHaveBeenCalledWith("test-templates-id-1");
  });

  it("should call back on edit", () => {
    const onNavigateToEdit: (templateId: string) => void = vi.fn();

    const {container} = renderCustomTemplateCard("test-templates-id-1", {onNavigateToEdit});

    openMiniMenu(container);
    clickMiniMenuItem(container, "Edit");

    expect(onNavigateToEdit).toHaveBeenCalledWith("test-templates-id-1");
  });

  describe("disabled state", () => {
    it("should render disabled template card with disabled styling", () => {
      const {container} = renderRecommendedTemplateCard("test-templates-id-1", {}, false, true, "Sign in to create boards");

      expect(container.querySelector(".template-card")).toHaveClass("template-card--disabled");
    });

    it("should disable start button when template card is disabled", () => {
      const onSelectTemplate = vi.fn();
      const {container} = renderRecommendedTemplateCard("test-templates-id-1", {onSelectTemplate}, false, true, "Sign in to create boards");

      const startButton = container.querySelector<HTMLButtonElement>(".template-card__start-button--start")!;
      expect(startButton).toBeDisabled();
    });

    it("should show tooltip on disabled start button", () => {
      const {container} = renderRecommendedTemplateCard("test-templates-id-1", {}, false, true, "Anonymous users cannot create boards");

      const startButton = container.querySelector<HTMLButtonElement>(".template-card__start-button--start")!;
      expect(startButton).toHaveAttribute("data-tooltip-id", "template-card-tooltip");
      expect(startButton).toHaveAttribute("data-tooltip-content", "Anonymous users cannot create boards");
    });

    it("should not call onSelectTemplate when disabled start button is clicked", () => {
      const onSelectTemplate = vi.fn();
      const {container} = renderRecommendedTemplateCard("test-templates-id-1", {onSelectTemplate}, false, true, "Sign in to create boards");

      const startButton = container.querySelector<HTMLButtonElement>(".template-card__start-button--start")!;
      act(() => fireEvent.click(startButton));

      expect(onSelectTemplate).not.toHaveBeenCalled();
    });

    it("should not show tooltip attributes when template card is enabled", () => {
      const {container} = renderRecommendedTemplateCard("test-templates-id-1", {}, false, false);

      const startButton = container.querySelector<HTMLButtonElement>(".template-card__start-button--start")!;
      expect(startButton).not.toHaveAttribute("data-tooltip-id");
      expect(startButton).not.toHaveAttribute("data-tooltip-content");
      expect(startButton).not.toBeDisabled();
    });

    it("should still allow favourite functionality when template card is disabled", () => {
      const onToggleFavourite = vi.fn();
      const {container} = renderRecommendedTemplateCard("test-templates-id-1", {onToggleFavourite}, false, true, "Sign in to create boards");

      const favouriteButton = container.querySelector<HTMLButtonElement>(".template-card__favourite")!;
      act(() => fireEvent.click(favouriteButton));

      expect(onToggleFavourite).toHaveBeenCalledWith("test-templates-id-1", true);
    });

    it("should work with custom template cards when disabled", () => {
      const onSelectTemplate = vi.fn();
      const {container} = renderCustomTemplateCard("test-templates-id-1", {onSelectTemplate}, true, "Custom disabled reason");

      expect(container.querySelector(".template-card")).toHaveClass("template-card--disabled");

      const startButton = container.querySelector<HTMLButtonElement>(".template-card__start-button--start")!;
      expect(startButton).toBeDisabled();
      expect(startButton).toHaveAttribute("data-tooltip-content", "Custom disabled reason");

      act(() => fireEvent.click(startButton));
      expect(onSelectTemplate).not.toHaveBeenCalled();
    });
  });
});
