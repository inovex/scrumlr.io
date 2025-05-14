import {TemplateEditor, TemplateEditorProps} from "routes/Boards/TemplateEditor/TemplateEditor";
import {render} from "testUtils";

const renderTemplateEditor = (props: TemplateEditorProps) => render(<TemplateEditor {...props} />);

describe("TemplateEditor create", () => {
  it("should render correctly (create)", () => {
    const {container} = renderTemplateEditor({mode: "create"});
    expect(container).toMatchSnapshot();
  });
});

describe("TemplateEditor edit", () => {
  it("should render correctly (edit)", () => {
    const {container} = renderTemplateEditor({mode: "create"});
    expect(container).toMatchSnapshot();
  });
});
