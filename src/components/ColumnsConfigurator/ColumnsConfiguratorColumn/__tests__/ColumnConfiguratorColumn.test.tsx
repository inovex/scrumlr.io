import {render} from "testUtils";
import {Provider} from "react-redux";
import getTestStore from "utils/test/getTestStore";
import {ColumnsConfiguratorColumn} from "../ColumnsConfiguratorColumn";
import {EditableTemplateColumn} from "store/features";

const renderColumnConfiguratorColumn = (templateId: string, columnId: string, potentialIndex: number) => {
  const testStore = getTestStore();
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

describe("ColumnConfiguratorColumn", () => {
  it("should render correctly", () => {
    const {container} = renderColumnConfiguratorColumn("test-templates-id-1", "test-templates-columns-id-1", 0);

    expect(container).toMatchSnapshot();
  });
});
