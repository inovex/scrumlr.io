import {render} from "testUtils";
import {Provider} from "react-redux";
import getTestStore from "utils/test/getTestStore";
import {ColumnsConfiguratorColumn} from "../ColumnsConfiguratorColumn";
import {EditableTemplateColumn} from "store/features";
import {MockStoreEnhanced} from "redux-mock-store";
import {ApplicationState} from "store";
import {fireEvent} from "@testing-library/react";
import {convertToEditableColumn} from "../../ColumnsConfigurator.utils";

describe("ColumnConfiguratorColumn render", () => {
  let testStore: MockStoreEnhanced<ApplicationState>;

  beforeEach(() => {
    testStore = getTestStore();
  });

  // different way of rendering the columns configurator column
  /* const renderColumnConfiguratorColumn = (override: Partial<ColumnsConfiguratorColumnProps> = {}) => {
    const testTemplatesColumns = getTestApplicationState().templatesColumns
    const testEditableTemplatesColumns = testTemplatesColumns.map(c => convertToEditableColumn(c))
    const editableTemplatesColumn0 = testEditableTemplatesColumns[0]
    const editableTemplatesColumn1 = testEditableTemplatesColumns[1]
    const allColumns = [editableTemplatesColumn0, editableTemplatesColumn1]

    const defaultProps: ColumnsConfiguratorColumnProps = {
      className: "columns-configurator-column",
      column: editableTemplatesColumn0,
      index: 0,
      allColumns,
      editColumn: jest.fn(),
    };

    return render(<ColumnsConfiguratorColumn {...defaultProps} {...override}/>);
  }; */

  const renderColumnConfiguratorColumn = (
    templateId: string,
    columnId: string,
    potentialIndex: number,
    editColumn?: (templateColumn: EditableTemplateColumn, overwrite: Partial<EditableTemplateColumn>) => void,
    deleteColumn?: (templateColumn: EditableTemplateColumn) => void
  ) => {
    // some preprocessing to get the correct column and convert to editableColumn, which would normally be done by TemplateEditor component
    const columns = testStore.getState().templateColumns.filter((tc) => tc.template === templateId);
    const editableColumns = columns.map((bc) => convertToEditableColumn(bc));
    const column = editableColumns.find((c) => c.id === columnId)!;

    return render(
      <Provider store={testStore}>
        <ColumnsConfiguratorColumn column={column} index={potentialIndex} allColumns={editableColumns} editColumn={editColumn} deleteColumn={deleteColumn} />
      </Provider>
    );
  };

  it("should render correctly", () => {
    const {container} = renderColumnConfiguratorColumn("test-templates-id-1", "test-templates-columns-id-1", 0);

    expect(container).toMatchSnapshot();
  });

  it("should be an even column with index 0", () => {
    const {container} = renderColumnConfiguratorColumn("test-templates-id-1", "test-templates-columns-id-1", 0);
    const rootNode = container.firstChild!;

    expect(rootNode).toHaveClass("columns-configurator-column--even");
  });

  it("should be an odd column with index 1", () => {
    const {container} = renderColumnConfiguratorColumn("test-templates-id-1", "test-templates-columns-id-1", 1);
    const rootNode = container.firstChild!;

    expect(rootNode).toHaveClass("columns-configurator-column--odd");
  });

  // opens color picker, select pink color, then checks if editColumn fn has been called
  it("should be able to change color", async () => {
    const columnId = "test-templates-columns-id-1";
    const editColumnSpy: jest.Mock<(templateColumn: EditableTemplateColumn, overwrite: Partial<EditableTemplateColumn>) => void> = jest.fn();
    const {container} = renderColumnConfiguratorColumn("test-templates-id-1", columnId, 0, editColumnSpy);

    const colorPickerElement = container.querySelector(".columns-configurator-column__color-picker")!;
    expect(colorPickerElement).toBeInTheDocument();
    fireEvent.click(colorPickerElement);

    const colorPickerButtonPlanningPink = container.querySelector<HTMLButtonElement>("li.accent-color__planning-pink button")!;

    fireEvent.mouseDown(colorPickerButtonPlanningPink);

    expect(editColumnSpy).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({color: "planning-pink"}));
  });

  it("should be able to toggle visibility", () => {
    const editColumnSpy: jest.Mock<(templateColumn: EditableTemplateColumn, overwrite: Partial<EditableTemplateColumn>) => void> = jest.fn();
    const {container} = renderColumnConfiguratorColumn("test-templates-id-1", "test-templates-columns-id-1", 0, editColumnSpy);
    const visibilityButtonElement = container.querySelector(".column-configurator-column__visibility-button")! as HTMLButtonElement;

    fireEvent.click(visibilityButtonElement);
    expect(editColumnSpy).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({visible: false}));
  });

  it("should be deletable", () => {
    const deleteColumnSpy: jest.Mock<(templateColumn: EditableTemplateColumn) => void> = jest.fn();
    const {container} = renderColumnConfiguratorColumn("test-templates-id-1", "test-templates-columns-id-1", 0, undefined, deleteColumnSpy);
    const deleteButtonElement = container.querySelector(".column-configurator-column__delete-button")! as HTMLButtonElement;

    expect(deleteButtonElement).not.toBeDisabled();
    fireEvent.click(deleteButtonElement);
    expect(deleteColumnSpy).toHaveBeenCalledWith(expect.objectContaining({id: "test-templates-columns-id-1"}));
  });
});
