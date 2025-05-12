import {ColumnsMiniView, ColumnsMiniViewProps} from "../ColumnsMiniView";
import getTestApplicationState from "utils/test/getTestApplicationState";
import {convertToEditableColumn} from "../../ColumnsConfigurator.utils";
import {render} from "testUtils";

const renderColumnsMiniView = (templateId: string) => {
  const columns = getTestApplicationState()
    .templatesColumns.filter((tc) => tc.template === templateId)
    .map((tc) => convertToEditableColumn(tc));

  return render(<ColumnsMiniView className={"test-columns-mini-view"} columns={columns} />);
};

describe("ColumnsMiniView", () => {
  it("should match render of template 1", () => {
    const {container} = renderColumnsMiniView("test-templates-id-1");
    expect(container).toMatchSnapshot();
    expect(container.firstChild?.childNodes).toHaveLength(2);
  });

  it("should match render of template 2", () => {
    const {container} = renderColumnsMiniView("test-templates-id-2");
    expect(container).toMatchSnapshot();
    expect(container.firstChild?.childNodes).toHaveLength(1);
  });
});
