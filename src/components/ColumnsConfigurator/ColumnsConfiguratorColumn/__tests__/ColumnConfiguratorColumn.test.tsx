import {render} from "testUtils";
import {Provider} from "react-redux";
import getTestStore from "utils/test/getTestStore";
import {ColumnsConfiguratorColumn} from "../ColumnsConfiguratorColumn";
import {EditableTemplateColumn} from "store/features";
import {MockStoreEnhanced} from "redux-mock-store";
import {ApplicationState} from "store";

describe("ColumnConfiguratorColumn render", () => {
  let testStore: MockStoreEnhanced<ApplicationState>;

  beforeEach(() => {
    testStore = getTestStore();
  });

  const renderColumnConfiguratorColumn = (templateId: string, columnId: string, potentialIndex: number) => {
    // some preprocessing to get the correct column and convert to editableColumn, which would normally be done by TemplateEditor component
    const columns = testStore.getState().templatesColumns.filter((tc) => tc.template === templateId);
    const editableColumns = columns.map((bc) => ({...bc, persisted: false, mode: undefined}) as EditableTemplateColumn);
    const column = editableColumns.find((c) => c.id === columnId)!;

    return render(
      <Provider store={testStore}>
        <ColumnsConfiguratorColumn column={column} index={potentialIndex} allColumns={editableColumns} />
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
});
