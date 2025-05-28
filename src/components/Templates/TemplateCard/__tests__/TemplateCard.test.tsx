import {render} from "testUtils";
import {TemplateCard} from "components/Templates/TemplateCard/TemplateCard";
import {getTemplateAndColumnsByTemplateId} from "components/ColumnsConfigurator/ColumnsConfigurator.utils";
import getTestApplicationState from "utils/test/getTestApplicationState";
import {TemplateWithColumns} from "store/features";

const renderRecommendedTemplateCard = (templateId: string, onSelectTemplate: (template: TemplateWithColumns) => void = jest.fn()) => {
  const templateWithColumns = getTemplateAndColumnsByTemplateId({...getTestApplicationState()}, templateId)!;

  return render(<TemplateCard template={templateWithColumns} templateType={"RECOMMENDED"} onSelectTemplate={onSelectTemplate} />);
};

const renderCustomTemplateCard = (
  templateId: string,
  onSelectTemplate: (template: TemplateWithColumns) => void = jest.fn(),
  onDeleteTemplate: (templateId: string) => void = jest.fn(),
  onToggleFavourite: (templateId: string, favourite: boolean) => void = jest.fn(),
  onNavigateToEdit: (templateId: string) => void = jest.fn()
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

describe("TemplateCard", () => {
  it("should render correctly (recommended)", () => {
    const {container} = renderRecommendedTemplateCard("test-templates-id-1");
    expect(container).toMatchSnapshot();
  });

  it("should render correctly (custom)", () => {
    const {container} = renderCustomTemplateCard("test-templates-id-1");
    expect(container).toMatchSnapshot();
  });
});
