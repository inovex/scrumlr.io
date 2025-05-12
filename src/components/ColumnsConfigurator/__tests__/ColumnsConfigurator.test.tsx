import {ColumnsConfigurator, ColumnsConfiguratorProps} from "../ColumnsConfigurator";
import {Partial} from "@react-spring/web";
import {render} from "testUtils";
import getTestApplicationState from "utils/test/getTestApplicationState";
import {convertToEditableColumn} from "components/ColumnsConfigurator/ColumnsConfigurator.utils";

const renderColumnsConfigurator = (templateId: string, override?: Partial<Omit<ColumnsConfiguratorProps, "templateId" | "columns">>) => {
  const defaultProps: ColumnsConfiguratorProps = {
    className: "test-columns-configurator",
    templateId,
    columns: getTestApplicationState()
      .templatesColumns.filter((tc) => tc.template === templateId)
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
    const {container} = renderColumnsConfigurator("test-templates-id-1");
    expect(container).toMatchSnapshot();
  });
});
