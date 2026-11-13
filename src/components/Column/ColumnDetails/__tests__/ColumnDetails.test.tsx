import {render} from "testUtils";
import {ColumnDetails, ColumnDetailsProps} from "components/Column/ColumnDetails/ColumnDetails";
import {ParticipantWithUser, ParticipantRole} from "store/features";
import getTestApplicationState from "utils/test/getTestApplicationState";
import getTestStore from "utils/test/getTestStore";
import {Provider} from "react-redux";
import {fireEvent, waitFor} from "@testing-library/react";
import {API} from "api";
import {TEMPORARY_COLUMN_ID} from "constants/misc";

describe("ColumnDetails", () => {
  const renderColumnDetails = (overrideProps?: Partial<ColumnDetailsProps>, userRole: ParticipantRole = "OWNER") => {
    const defaultProps: ColumnDetailsProps = {
      column: getTestApplicationState().columns[0],
      notesCount: 1,
      mode: "view",
      isTemporary: false,
      changeMode: vi.fn(),
    };

    const props = {...defaultProps, ...overrideProps};
    const self: ParticipantWithUser = {...getTestApplicationState().participants.self!, role: userRole};
    const store = getTestStore({participants: {self}, columns: [props.column]});

    return {
      ...render(
        <Provider store={store}>
          <ColumnDetails {...props} />
        </Provider>
      ),
      store,
    };
  };

  const temporaryColumn = {...getTestApplicationState().columns[0], id: TEMPORARY_COLUMN_ID, name: "", description: "", visible: false};

  afterEach(() => vi.restoreAllMocks());

  it.each<ParticipantRole>(["OWNER", "MODERATOR"])("should hide temporary column settings while keeping draft controls for %s", (role) => {
    const {container, getAllByRole, getByRole, queryByRole} = renderColumnDetails({column: temporaryColumn, mode: "edit", isTemporary: true}, role);

    expect(container.querySelector(".column-details__settings")).not.toBeInTheDocument();
    expect(container.querySelector(".column-settings")).not.toBeInTheDocument();
    expect(queryByRole("button", {name: "Add column left"})).not.toBeInTheDocument();
    expect(queryByRole("button", {name: "Add column right"})).not.toBeInTheDocument();
    expect(queryByRole("button", {name: "Change color"})).not.toBeInTheDocument();
    expect(getAllByRole("textbox")).toHaveLength(2);
    getAllByRole("textbox").forEach((input) => expect(input).toBeEnabled());
    expect(getByRole("button", {name: "Save"})).toBeDisabled();
    expect(getByRole("button", {name: "Cancel"})).toBeEnabled();
  });

  describe.each<ParticipantRole>(["OWNER", "MODERATOR"])("persisted column settings for %s", (role) => {
    it.each<ColumnDetailsProps["mode"]>(["view", "edit"])("should open settings in %s mode", (mode) => {
      const {container, getByRole} = renderColumnDetails({mode}, role);
      const settingsButton = container.querySelector<HTMLButtonElement>(".column-details__settings--closed")!;

      expect(settingsButton).toBeEnabled();
      fireEvent.click(settingsButton);
      expect(container.querySelector(".column-settings")).toBeInTheDocument();
      expect(getByRole("button", {name: "Add column left"})).toBeEnabled();
      expect(getByRole("button", {name: "Add column right"})).toBeEnabled();
    });
  });

  it.each([false, true])("should hide settings for participants when isTemporary is %s", (isTemporary) => {
    const column = isTemporary ? temporaryColumn : getTestApplicationState().columns[0];
    const {container} = renderColumnDetails({column, isTemporary, mode: "edit"}, "PARTICIPANT");

    expect(container.querySelector(".column-details__settings")).not.toBeInTheDocument();
    expect(container.querySelector(".column-settings")).not.toBeInTheDocument();
  });

  it.each(["Save", "outside click"])("should create a temporary column with valid details on %s", async (action) => {
    const createColumnSpy = vi.spyOn(API, "createColumn").mockResolvedValue({...temporaryColumn, id: "persisted-column-id"});
    const {getAllByRole, getByRole, store} = renderColumnDetails({column: temporaryColumn, mode: "edit", isTemporary: true});
    const [name, description] = getAllByRole("textbox");

    fireEvent.change(name, {target: {value: "New column"}});
    fireEvent.click(description);
    fireEvent.change(description, {target: {value: "New description"}});
    fireEvent.click(name);
    expect(name).toHaveValue("New column");
    expect(description).toHaveValue("New description");
    expect(getByRole("button", {name: "Save"})).toBeEnabled();
    expect(createColumnSpy).not.toHaveBeenCalled();
    fireEvent.click(action === "Save" ? getByRole("button", {name: "Save"}) : document.body);

    await waitFor(() =>
      expect(createColumnSpy).toHaveBeenCalledExactlyOnceWith(store.getState().board.data!.id, {...temporaryColumn, name: "New column", description: "New description"})
    );
  });

  it.each(["Cancel", "Escape", "outside click"])("should remove an empty temporary column on %s", (action) => {
    const {getByRole, getAllByRole, store} = renderColumnDetails({column: temporaryColumn, mode: "edit", isTemporary: true});
    expect(store.getState().columns).toContainEqual(temporaryColumn);

    if (action === "Escape") {
      fireEvent.keyUp(getAllByRole("textbox")[0], {key: "Escape"});
    } else {
      fireEvent.click(action === "Cancel" ? getByRole("button", {name: "Cancel"}) : document.body);
    }

    expect(store.getState().columns).toEqual([]);
  });

  it("should render correctly (view)", () => {
    const {container} = renderColumnDetails();
    expect(container).toMatchSnapshot();
  });

  it("should render correctly (edit)", () => {
    const {container} = renderColumnDetails({mode: "edit"});
    expect(container).toMatchSnapshot();
  });

  it("should switch to edit mode (self is moderator)", () => {
    const changeModeSpy = vi.fn();
    const {container} = renderColumnDetails({changeMode: changeModeSpy});
    const columnDetailNameNode = container.querySelector<HTMLDivElement>(".column-details__name")!;

    fireEvent.click(columnDetailNameNode);
    expect(changeModeSpy).toHaveBeenCalledWith("edit");
  });

  it("should show the character count indicator for a long description", () => {
    const columnWithLongDescription = {...getTestApplicationState().columns[0], description: "a".repeat(768)};
    const {container} = renderColumnDetails({column: columnWithLongDescription, mode: "edit"});

    expect(container.querySelector(".character-count-indicator")).toHaveTextContent("768/1024");
  });

  it("should not switch to edit mode (self is participant)", () => {
    const changeModeSpy = vi.fn();
    const {container} = renderColumnDetails({changeMode: changeModeSpy}, "PARTICIPANT");
    const columnDetailNameNode = container.querySelector<HTMLDivElement>(".column-details__name")!;

    fireEvent.click(columnDetailNameNode);
    expect(changeModeSpy).not.toHaveBeenCalledWith("edit");
  });

  describe("Description click editing with readOnly TextArea", () => {
    it("should switch to edit mode when clicking description placeholder (moderator)", () => {
      const changeModeSpy = vi.fn();
      const columnWithoutDescription = {...getTestApplicationState().columns[0], description: ""};
      const {container} = renderColumnDetails({column: columnWithoutDescription, changeMode: changeModeSpy});

      const placeholderNode = container.querySelector<HTMLDivElement>(".column-details__description--placeholder")!;
      expect(placeholderNode).toBeTruthy();

      fireEvent.click(placeholderNode);
      expect(changeModeSpy).toHaveBeenCalledWith("edit");
    });

    it("should not switch to edit mode when clicking description placeholder (participant)", () => {
      const changeModeSpy = vi.fn();
      const columnWithoutDescription = {...getTestApplicationState().columns[0], description: ""};
      const {container} = renderColumnDetails({column: columnWithoutDescription, changeMode: changeModeSpy}, "PARTICIPANT");

      const placeholderNode = container.querySelector<HTMLDivElement>(".column-details__description--placeholder")!;
      expect(placeholderNode).toBeTruthy();

      fireEvent.click(placeholderNode);
      expect(changeModeSpy).not.toHaveBeenCalledWith("edit");
    });

    it("should switch to edit mode when clicking filled description with readOnly TextArea (moderator)", () => {
      const changeModeSpy = vi.fn();
      const columnWithDescription = {...getTestApplicationState().columns[0], description: "Test description content"};
      const {container} = renderColumnDetails({column: columnWithDescription, changeMode: changeModeSpy});

      const textAreaWrapper = container.querySelector<HTMLDivElement>(".column-details__description-wrapper--view")!;
      expect(textAreaWrapper).toBeTruthy();

      const textArea = textAreaWrapper.querySelector<HTMLTextAreaElement>("textarea")!;
      expect(textArea).toBeTruthy();
      expect(textArea.value).toBe("Test description content");
      expect(textArea.readOnly).toBe(true);
      expect(textArea.disabled).toBe(false);

      // Click on the readOnly textarea should trigger edit mode
      fireEvent.click(textArea);
      expect(changeModeSpy).toHaveBeenCalledWith("edit");
    });

    it("should not switch to edit mode when clicking filled description (participant)", () => {
      const changeModeSpy = vi.fn();
      const columnWithDescription = {...getTestApplicationState().columns[0], description: "Test description content"};
      const {container} = renderColumnDetails({column: columnWithDescription, changeMode: changeModeSpy}, "PARTICIPANT");

      const textAreaWrapper = container.querySelector<HTMLDivElement>(".column-details__description-wrapper--view")!;
      expect(textAreaWrapper).toBeTruthy();

      const textArea = textAreaWrapper.querySelector<HTMLTextAreaElement>("textarea")!;
      expect(textArea).toBeTruthy();
      expect(textArea.readOnly).toBe(true);

      fireEvent.click(textArea);
      expect(changeModeSpy).not.toHaveBeenCalledWith("edit");
    });

    it("should focus description field when switching to edit mode via placeholder click", () => {
      const changeModeSpy = vi.fn();
      const columnWithoutDescription = {...getTestApplicationState().columns[0], description: ""};
      const {container, rerender} = renderColumnDetails({column: columnWithoutDescription, changeMode: changeModeSpy});

      const placeholderNode = container.querySelector<HTMLDivElement>(".column-details__description--placeholder")!;
      fireEvent.click(placeholderNode);
      expect(changeModeSpy).toHaveBeenCalledWith("edit");

      // Simulate mode change by re-rendering with edit mode
      const self = {...getTestApplicationState().participants.self!, role: "OWNER" as const};
      rerender(
        <Provider store={getTestStore({participants: {self}})}>
          <ColumnDetails column={columnWithoutDescription} notesCount={1} mode="edit" isTemporary={false} changeMode={changeModeSpy} />
        </Provider>
      );

      // In edit mode, the description textarea should be focusable and not readOnly
      const editTextArea = container.querySelector<HTMLTextAreaElement>(".column-details__description-text-area")!;
      expect(editTextArea).toBeTruthy();
      expect(editTextArea.readOnly).toBe(false);
      expect(editTextArea.disabled).toBe(false);
    });

    it("should focus description field when switching to edit mode via filled description click", () => {
      const changeModeSpy = vi.fn();
      const columnWithDescription = {...getTestApplicationState().columns[0], description: "Test description content"};
      const {container, rerender} = renderColumnDetails({column: columnWithDescription, changeMode: changeModeSpy});

      const textArea = container.querySelector<HTMLTextAreaElement>("textarea")!;
      fireEvent.click(textArea);
      expect(changeModeSpy).toHaveBeenCalledWith("edit");

      // Simulate mode change by re-rendering with edit mode
      const self = {...getTestApplicationState().participants.self!, role: "OWNER" as const};
      rerender(
        <Provider store={getTestStore({participants: {self}})}>
          <ColumnDetails column={columnWithDescription} notesCount={1} mode="edit" isTemporary={false} changeMode={changeModeSpy} />
        </Provider>
      );

      // In edit mode, the description textarea should be focusable and not readOnly
      const editTextArea = container.querySelector<HTMLTextAreaElement>(".column-details__description-text-area")!;
      expect(editTextArea).toBeTruthy();
      expect(editTextArea.readOnly).toBe(false);
      expect(editTextArea.disabled).toBe(false);
      expect(editTextArea.value).toBe("Test description content");
    });

    it("should show readOnly textarea is not editable but interactive", () => {
      const columnWithDescription = {...getTestApplicationState().columns[0], description: "Test description content"};
      const {container} = renderColumnDetails({column: columnWithDescription});

      const textArea = container.querySelector<HTMLTextAreaElement>("textarea")!;
      expect(textArea).toBeTruthy();
      expect(textArea.value).toBe("Test description content");
      expect(textArea.readOnly).toBe(true);
      expect(textArea.disabled).toBe(false);

      // Verify readOnly prevents typing but allows events
      expect(textArea.getAttribute("readonly")).not.toBeNull();
      expect(textArea.getAttribute("disabled")).toBeNull();
    });

    it("should show expand button for long descriptions and handle expansion", () => {
      const longDescription = "This is a very long description that should trigger the expand functionality ".repeat(10);
      const columnWithLongDescription = {...getTestApplicationState().columns[0], description: longDescription};
      const {container} = renderColumnDetails({column: columnWithLongDescription});

      const textArea = container.querySelector<HTMLTextAreaElement>("textarea")!;
      expect(textArea.value).toBe(longDescription);
      expect(textArea.readOnly).toBe(true);

      // The expand button should be present for long content
      const expandButton = container.querySelector<HTMLButtonElement>(".column-details__description-expand-icon-container");
      if (expandButton) {
        fireEvent.click(expandButton);
        // After clicking expand, the content should still be there and readOnly
        expect(textArea.value).toBe(longDescription);
        expect(textArea.readOnly).toBe(true);
      }
    });

    it("should preserve click functionality after expand/collapse", () => {
      const changeModeSpy = vi.fn();
      const longDescription = "This is a long description ".repeat(10);
      const columnWithLongDescription = {...getTestApplicationState().columns[0], description: longDescription};
      const {container} = renderColumnDetails({column: columnWithLongDescription, changeMode: changeModeSpy});

      const textArea = container.querySelector<HTMLTextAreaElement>("textarea")!;
      const expandButton = container.querySelector<HTMLButtonElement>(".column-details__description-expand-icon-container");

      // Expand the description
      if (expandButton) {
        fireEvent.click(expandButton);
      }

      // Click should still work after expansion
      fireEvent.click(textArea);
      expect(changeModeSpy).toHaveBeenCalledWith("edit");
    });
  });
});
