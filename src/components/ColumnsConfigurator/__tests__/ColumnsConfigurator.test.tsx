import {ColumnsConfigurator, ColumnsConfiguratorProps} from "../ColumnsConfigurator";
import {Partial} from "@react-spring/web";
import {render} from "testUtils";
import getTestApplicationState from "utils/test/getTestApplicationState";
import {convertToEditableColumn} from "components/ColumnsConfigurator/ColumnsConfigurator.utils";
import {fireEvent} from "@testing-library/react";

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

    const columnsNodeList = container.querySelectorAll(".columns-configurator__column");
    expect(columnsNodeList).toHaveLength(2);
  });

  it("should fire correct add new template col signal", () => {
    const addColumnSpy = jest.fn();
    const {container} = renderColumnsConfigurator("test-templates-id-1", {addColumn: addColumnSpy});
    const addTemplateColumnLeft = container.querySelector(".add-template-column--left")!;
    const addTemplateColumnRight = container.querySelector(".add-template-column--right")!;
    const addTemplateColumnLeftButton = addTemplateColumnLeft.querySelector("button")!;
    const addTemplateColumnRightButton = addTemplateColumnRight.querySelector("button")!;

    // template columns are backlog-blue and planning-pink, so the colors left and right to that are online-orange and poker-purple respectively
    expect(addTemplateColumnLeft).toHaveClass("accent-color__online-orange");
    expect(addTemplateColumnRight).toHaveClass("accent-color__poker-purple");

    fireEvent.click(addTemplateColumnLeftButton);
    expect(addColumnSpy).toHaveBeenCalledWith(
      {
        id: expect.stringMatching(/col(\d+)/),
        template: "test-templates-id-1",
        name: "Column 3",
        description: "",
        color: "online-orange",
        visible: true,
        index: -1,
      },
      0
    );

    fireEvent.click(addTemplateColumnRightButton);
    expect(addColumnSpy).toHaveBeenCalledWith(
      {
        id: expect.stringMatching(/col(\d+)/),
        template: "test-templates-id-1",
        name: "Column 3", // note hat since the state does not change, column length remains the same
        description: "",
        color: "poker-purple",
        visible: true,
        index: -1,
      },
      2
    );
  });
});
