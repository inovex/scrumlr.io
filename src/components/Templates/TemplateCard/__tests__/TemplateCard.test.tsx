import {render} from "testUtils";
import {TemplateCard, TemplateCardType} from "components/Templates/TemplateCard/TemplateCard";
import {getTemplateAndColumnsByTemplateId} from "components/ColumnsConfigurator/ColumnsConfigurator.utils";
import getTestApplicationState from "utils/test/getTestApplicationState";

const renderTemplateCard = (templateId: string, templateType: TemplateCardType) => {
  const templateWithColumns = getTemplateAndColumnsByTemplateId({...getTestApplicationState()}, templateId)!;
  return render(<TemplateCard template={templateWithColumns} templateType={templateType} />);
};

describe("TemplateCard", () => {
  it("should render correctly (recommended)", () => {
    const {container} = renderTemplateCard("test-templates-id-1", "RECOMMENDED");
    expect(container).toMatchSnapshot();
  });

  it("should render correctly (custom)", () => {
    const {container} = renderTemplateCard("test-templates-id-1", "CUSTOM");
    expect(container).toMatchSnapshot();
  });

  // more tests could include dispatch spies, which we don't support yet (#5079)
});
