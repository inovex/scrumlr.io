import {ColumnsConfigurator, ColumnsConfiguratorProps} from "../ColumnsConfigurator";
import {Partial} from "@react-spring/web";
import {render} from "testUtils";
import getTestApplicationState from "utils/test/getTestApplicationState";
import {convertToEditableColumn} from "components/ColumnsConfigurator/ColumnsConfigurator.utils";

const renderColumnsConfigurator = (override?: Partial<ColumnsConfiguratorProps>) => {
  const defaultTemplateId = "test-templates-id-1";
  const defaultProps: ColumnsConfiguratorProps = {
    className: "test-columns-configurator",
    templateId: defaultTemplateId,
    columns: getTestApplicationState()
      .templatesColumns.filter((c) => c.template === defaultTemplateId)
      .map((tc) => convertToEditableColumn(tc)),
    addColumn: jest.fn(),
    deleteColumn: jest.fn(),
    editColumn: jest.fn(),
    moveColumn: jest.fn(),
  };

  return render(<ColumnsConfigurator {...defaultProps} {...override} />);
};

describe("ColumnsConfigurator", () => {
  it("should render correctly", () => {
    const {container} = renderColumnsConfigurator();
    expect(container).toMatchSnapshot();
  });
});
