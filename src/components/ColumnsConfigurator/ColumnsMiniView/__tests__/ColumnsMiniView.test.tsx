import {ColumnsMiniView} from "../ColumnsMiniView";
import getTestApplicationState from "utils/test/getTestApplicationState";
import {convertToEditableColumn} from "../../ColumnsConfigurator.utils";
import {render} from "testUtils";

const renderColumnsMiniView = (templateId: string) => {
  const columns = getTestApplicationState()
    .templateColumns.filter((tc) => tc.template === templateId)
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

  it("should have left and right border respectively", () => {
    const {container} = renderColumnsMiniView("test-templates-id-1");

    const miniColumnElement = container.querySelectorAll<HTMLDivElement>(".columns-mini-view__column");
    expect(miniColumnElement[0]).toHaveClass("columns-mini-view__column--border-first");
    expect(miniColumnElement[1]).toHaveClass("columns-mini-view__column--border-last");
  });

  it("should have all borders", () => {
    const {container} = renderColumnsMiniView("test-templates-id-2");

    const miniColumnElement = container.querySelector<HTMLDivElement>(".columns-mini-view__column");
    expect(miniColumnElement).toHaveClass("columns-mini-view__column--border-all");
  });
});
