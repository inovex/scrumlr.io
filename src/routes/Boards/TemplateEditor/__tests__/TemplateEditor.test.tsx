import {TemplateEditor, TemplateEditorProps} from "routes/Boards/TemplateEditor/TemplateEditor";
import {renderWithContext} from "testUtils";
import {fireEvent} from "@testing-library/react";

const renderTemplateEditor = (props: TemplateEditorProps, editTemplateId?: string) =>
  props.mode === "create"
    ? renderWithContext(<TemplateEditor {...props} />, {context: undefined, initialRouteEntries: [{pathname: "/boards/create"}], currentPath: "/boards/create"})
    : renderWithContext(<TemplateEditor {...props} />, {
        context: undefined,
        initialRouteEntries: [{pathname: `/boards/edit/${editTemplateId}`}],
        currentPath: "/boards/edit/:id",
      });

describe("TemplateEditor create", () => {
  it("should render correctly (create)", () => {
    const {container} = renderTemplateEditor({mode: "create"});
    expect(container).toMatchSnapshot();
  });

  it("should only allow clicking create if name is set", () => {
    const {container} = renderTemplateEditor({mode: "create"});
    const nameInputNode = container.querySelector<HTMLInputElement>(".template-editor__name-input input")!;
    const createTemplateButtonNode = container.querySelector<HTMLButtonElement>(".template-editor__button--create")!;

    expect(createTemplateButtonNode).toBeDisabled();

    fireEvent.input(nameInputNode, {target: {value: "hello world"}});

    expect(createTemplateButtonNode).not.toBeDisabled();
  });

  // need to spy on store
  it.skip("should dispatch create template", () => {});
});

describe("TemplateEditor edit", () => {
  it("should render correctly (edit)", () => {
    const {container} = renderTemplateEditor({mode: "edit"}, "test-templates-id-1");
    expect(container).toMatchSnapshot();
  });

  it("fill form with data from the corresponding template", () => {
    const {container} = renderTemplateEditor({mode: "edit"}, "test-templates-id-1");

    const nameInputNode = container.querySelector<HTMLInputElement>(".template-editor__name-input input")!;
    const descriptionInputNode = container.querySelector<HTMLTextAreaElement>(".template-editor__description-text-area")!;

    expect(nameInputNode).toHaveValue("sample name 1");
    expect(descriptionInputNode).toHaveValue("sample description 1");
  });

  // need to spy on store
  it.skip("should dispatch edit template", () => {});
});
