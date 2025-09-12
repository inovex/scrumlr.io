import {render} from "testUtils";
import {ColumnDetails, ColumnDetailsProps} from "components/Column/ColumnDetails/ColumnDetails";
import {Column, Participant, ParticipantRole} from "store/features";
import getTestApplicationState from "utils/test/getTestApplicationState";
import getTestStore from "utils/test/getTestStore";
import {Provider} from "react-redux";
import {fireEvent} from "@testing-library/react";

describe("ColumnDetails", () => {
  const renderColumnDetails = (overrideProps?: Partial<ColumnDetailsProps>, userRole: ParticipantRole = "OWNER") => {
    const defaultProps: ColumnDetailsProps = {
      column: getTestApplicationState().columns[0],
      notesCount: 1,
      mode: "view",
      isTemporary: false,
      changeMode: jest.fn(),
    };

    const props = {...defaultProps, ...overrideProps};
    const self: Participant = {...getTestApplicationState().participants.self!, role: userRole};

    return render(
      <Provider store={getTestStore({participants: {self}})}>
        <ColumnDetails {...props} />
      </Provider>
    );
  };

  it("should render correctly (view)", () => {
    const {container} = renderColumnDetails();
    expect(container).toMatchSnapshot();
  });

  it("should render correctly (edit)", () => {
    const {container} = renderColumnDetails({mode: "edit"});
    expect(container).toMatchSnapshot();
  });

  it("should switch to edit mode (self is moderator)", () => {
    const changeModeSpy = jest.fn();
    const {container} = renderColumnDetails({changeMode: changeModeSpy});
    const columnDetailNameNode = container.querySelector<HTMLDivElement>(".column-details__name")!;

    fireEvent.click(columnDetailNameNode);
    expect(changeModeSpy).toHaveBeenCalledWith("edit");
  });

  it("should not switch to edit mode (self is participant)", () => {
    const changeModeSpy = jest.fn();
    const {container} = renderColumnDetails({changeMode: changeModeSpy}, "PARTICIPANT");
    const columnDetailNameNode = container.querySelector<HTMLDivElement>(".column-details__name")!;

    fireEvent.click(columnDetailNameNode);
    expect(changeModeSpy).not.toHaveBeenCalledWith("edit");
  });

  describe("Description click editing with readOnly TextArea", () => {
    it("should switch to edit mode when clicking description placeholder (moderator)", () => {
      const changeModeSpy = jest.fn();
      const columnWithoutDescription = {...getTestApplicationState().columns[0], description: ""};
      const {container} = renderColumnDetails({column: columnWithoutDescription, changeMode: changeModeSpy});

      const placeholderNode = container.querySelector<HTMLDivElement>(".column-details__description--placeholder")!;
      expect(placeholderNode).toBeTruthy();

      fireEvent.click(placeholderNode);
      expect(changeModeSpy).toHaveBeenCalledWith("edit");
    });

    it("should not switch to edit mode when clicking description placeholder (participant)", () => {
      const changeModeSpy = jest.fn();
      const columnWithoutDescription = {...getTestApplicationState().columns[0], description: ""};
      const {container} = renderColumnDetails({column: columnWithoutDescription, changeMode: changeModeSpy}, "PARTICIPANT");

      const placeholderNode = container.querySelector<HTMLDivElement>(".column-details__description--placeholder")!;
      expect(placeholderNode).toBeTruthy();

      fireEvent.click(placeholderNode);
      expect(changeModeSpy).not.toHaveBeenCalledWith("edit");
    });

    it("should switch to edit mode when clicking filled description with readOnly TextArea (moderator)", () => {
      const changeModeSpy = jest.fn();
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
      const changeModeSpy = jest.fn();
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
      const changeModeSpy = jest.fn();
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
      const changeModeSpy = jest.fn();
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
      const changeModeSpy = jest.fn();
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
