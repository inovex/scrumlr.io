import {TemplateEditor, TemplateEditorProps} from "routes/Boards/TemplateEditor/TemplateEditor";
import {renderWithContext} from "testUtils";

const renderTemplateEditor = (props: TemplateEditorProps) =>
  props.mode === "create"
    ? renderWithContext(<TemplateEditor {...props} />, {context: undefined, initialRouteEntries: [{pathname: "/boards/create"}], currentPath: "/boards/create"})
    : renderWithContext(<TemplateEditor {...props} />, {
        context: undefined,
        initialRouteEntries: [{pathname: "/boards/edit/test-templates-id-1"}],
        currentPath: "/boards/edit/:id",
      });

describe("TemplateEditor create", () => {
  it("should render correctly (create)", () => {
    const {container} = renderTemplateEditor({mode: "create"});
    expect(container).toMatchSnapshot();
  });
});

describe("TemplateEditor edit", () => {
  it("should render correctly (edit)", () => {
    const {container} = renderTemplateEditor({mode: "edit"});
    expect(container).toMatchSnapshot();
  });

  it("fill form with data from the corresponding template", () => {});
});
