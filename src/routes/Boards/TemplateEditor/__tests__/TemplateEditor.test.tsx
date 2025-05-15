import {TemplateEditor, TemplateEditorProps} from "routes/Boards/TemplateEditor/TemplateEditor";
import {renderWithContext} from "testUtils";

const renderTemplateEditor = (props: TemplateEditorProps) =>
  renderWithContext(<TemplateEditor {...props} />, {context: undefined, initialRouteEntries: [{pathname: "/boards/edit/test-templates-id-1"}], currentPath: "/boards/edit/:id"});

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
});
