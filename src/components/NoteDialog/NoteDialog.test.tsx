import {render} from "@testing-library/react";
import configureStore from "redux-mock-store";
import {Provider} from "react-redux";
import {wrapWithTestBackend} from "react-dnd-test-utils";
import NoteDialog from "./NoteDialog";

const mockStore = configureStore();

const createNoteDialog = (text: string, authorId: string, showAuthors: boolean) => {
  const initialState = {
    board: {
      data: {
        columns: [{id: "test_column", name: "test_header", hidden: false}],
      },
    },
    notes: [],
    users: {
      admins: [
        {
          id: "jkKqOUgt3hEDvl7CWcBokVOGs6AzINon",
          displayName: "Kinetic Kobold",
          admin: true,
          createdAt: "2021-08-11T10:45:41.640Z",
          updatedAt: "2021-08-11T10:52:21.558Z",
          online: true,
        },
      ],
      basic: [],
      all: [],
    },
  };
  const store = mockStore(initialState);
  const [NoteDialogContext] = wrapWithTestBackend(NoteDialog);
  return (
    <Provider store={store}>
      <NoteDialogContext
        noteId="0"
        isAdmin
        text={text}
        authorId={authorId}
        columnName=""
        columnColor=""
        show
        activeVoting
        authorName=""
        showAuthors={showAuthors}
        votes={[
          {
            id: "test-id",
            board: "test-board",
            note: "0",
            user: "test-user",
            votingIteration: 1,
          },
        ]}
        childrenNotes={[
          {id: "1", columnId: "test_column", text: "", author: "", parentId: "0", dirty: true, authorName: "", votes: []},
          {id: "2", columnId: "test_column", text: "", author: "", parentId: "0", dirty: true, authorName: "", votes: []},
        ]}
        onClose={() => {}}
      />
    </Provider>
  );
};

describe("NoteDialog", () => {
  beforeEach(() => {
    window.IntersectionObserver = jest.fn(
      () =>
        ({
          observe: jest.fn(),
          disconnect: jest.fn(),
        } as unknown as IntersectionObserver)
    );

    const portal = global.document.createElement("div");
    portal.setAttribute("id", "portal");
    global.document.querySelector("body")!.appendChild(portal);
  });

  describe("should render correctly", () => {
    test("portal--darkBackground is present", () => {
      const {container} = render(createNoteDialog("Test Text", "Test Author", true), {container: global.document.querySelector("#portal")!});
      expect(container.firstChild).toHaveClass("portal--darkBackground");
    });

    test("note-dialog is present", () => {
      const {container} = render(createNoteDialog("Test Text", "Test Author", true), {container: global.document.querySelector("#portal")!});
      expect(container.querySelector(".portal__content")?.firstChild).toHaveClass("note-dialog");
    });

    test("note-dialog__header is present", () => {
      const {container} = render(createNoteDialog("Test Text", "Test Author", true), {container: global.document.querySelector("#portal")!});
      expect(container.querySelector(".note-dialog")?.firstChild).toHaveClass("note-dialog__header");
    });

    test("note-dialog__note one is present", () => {
      const {container} = render(createNoteDialog("Test Text", "Test Author", true), {container: global.document.querySelector("#portal")!});
      expect(container.querySelector(".note-dialog")?.children.item(1)).toHaveClass("note-dialog__note");
    });

    test("note-dialog__options note two is present", () => {
      const {container} = render(createNoteDialog("Test Text", "Test Author", true), {container: global.document.querySelector("#portal")!});
      expect(container.querySelector(".note-dialog")?.children.item(2)?.children.item(2)?.children.item(0)).toHaveClass("note-dialog__options");
    });

    test("note-dialog__options note three is present", () => {
      const {container} = render(createNoteDialog("Test Text", "Test Author", true), {container: global.document.querySelector("#portal")!});
      expect(container.querySelector(".note-dialog")?.children.item(3)?.children.item(2)?.children.item(0)).toHaveClass("note-dialog__options");
    });

    test("note-dialog__note two is present", () => {
      const {container} = render(createNoteDialog("Test Text", "Test Author", true), {container: global.document.querySelector("#portal")!});
      expect(container.querySelector(".note-dialog")?.children.item(2)).toHaveClass("note-dialog__note");
    });

    test("note-dialog__note three is present", () => {
      const {container} = render(createNoteDialog("Test Text", "Test Author", true), {container: global.document.querySelector("#portal")!});
      expect(container.querySelector(".note-dialog")?.children.item(3)).toHaveClass("note-dialog__note");
    });

    test("note-dialog__content is present", () => {
      const {container} = render(createNoteDialog("Test Text", "Test Author", true), {container: global.document.querySelector("#portal")!});
      expect(container.querySelector(".note-dialog__note")?.firstChild).toHaveClass("note-dialog__content");
    });

    test("note-dialog__footer is present", () => {
      const {container} = render(createNoteDialog("Test Text", "Test Author", true), {container: global.document.querySelector("#portal")!});
      expect(container.querySelector(".note-dialog__note")?.children.item(1)).toHaveClass("note-dialog__footer");
    });
  });
});
