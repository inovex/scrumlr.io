import {fireEvent, render, waitFor} from "@testing-library/react";
import configureStore from "redux-mock-store";
import {Provider} from "react-redux";
import {wrapWithTestBackend} from "react-dnd-test-utils";
import {User} from "parse";
import {NoteDialog} from "components/NoteDialog";
import {mocked} from "ts-jest/utils";
import store from "store";
import {ActionFactory} from "store/action";

const mockStore = configureStore();
const mockedUser = mocked(User, true);

jest.mock("store", () => ({
  ...jest.requireActual("store"),
  dispatch: jest.fn(),
}));

type NoteDialogTestProps = {
  text?: string;
  authorId?: string;
  showAuthors?: boolean;
  activeModeration?: {userId: string; status: boolean};
  currentUserIsModerator?: boolean;
};

const createNoteDialog = (
  {text = "Test Text", authorId = "Test Author", showAuthors = true, activeModeration = {userId: authorId, status: false}, currentUserIsModerator = false}: NoteDialogTestProps = {
    text: "Test Text",
    authorId: "Test Author",
    showAuthors: true,
    activeModeration: {userId: "Test Author", status: false},
    currentUserIsModerator: false,
  }
) => {
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
          {id: "1", columnId: "test_column", text: "", author: "", parentId: "0", dirty: true, authorName: "", votes: [], focus: false},
          {id: "2", columnId: "test_column", text: "", author: "", parentId: "0", dirty: true, authorName: "", votes: [], focus: false},
        ]}
        onClose={() => {}}
        activeModeration={activeModeration}
        currentUserIsModerator={currentUserIsModerator}
        onDeleteOfParent={() => {}}
      />
    </Provider>
  );
};

describe("<NoteDialog/>", () => {
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
      const {container} = render(createNoteDialog(), {container: global.document.querySelector("#portal")!});
      expect(container.firstChild).toHaveClass("portal--darkBackground");
    });

    test("note-dialog is present", () => {
      const {container} = render(createNoteDialog(), {container: global.document.querySelector("#portal")!});
      expect(container.querySelector(".portal__content")?.firstChild).toHaveClass("note-dialog");
    });

    test("note-dialog__note-header is present", () => {
      const {container} = render(createNoteDialog(), {container: global.document.querySelector("#portal")!});
      expect(container.querySelector(".note-dialog")?.firstChild).toHaveClass("note-dialog__header");
    });

    test("three note-dialog__note present", () => {
      const {container} = render(createNoteDialog(), {container: global.document.querySelector("#portal")!});
      const noteDialogNotes = container.querySelectorAll(".note-dialog__note");
      expect(noteDialogNotes.length).toEqual(3);
    });

    test("note-dialog__note one is present", () => {
      const {container} = render(createNoteDialog(), {container: global.document.querySelector("#portal")!});
      const noteDialogNotes = container.querySelectorAll(".note-dialog__note");
      expect(noteDialogNotes[0]).toHaveClass("note-dialog__note");
    });

    test("note-dialog__note two is present", () => {
      const {container} = render(createNoteDialog(), {container: global.document.querySelector("#portal")!});
      const noteDialogNotes = container.querySelectorAll(".note-dialog__note");
      expect(noteDialogNotes[1]).toHaveClass("note-dialog__note");
    });

    test("note-dialog__note three is present", () => {
      const {container} = render(createNoteDialog(), {container: global.document.querySelector("#portal")!});
      const noteDialogNotes = container.querySelectorAll(".note-dialog__note");
      expect(noteDialogNotes[2]).toHaveClass("note-dialog__note");
    });

    test("note-dialog__note-options note two is present", () => {
      const {container} = render(createNoteDialog(), {container: global.document.querySelector("#portal")!});
      const noteDialogNotes = container.querySelectorAll(".note-dialog__note");
      expect(noteDialogNotes[1].querySelector(".note-dialog__options")).toBeDefined();
    });

    test("note-dialog__note-options note three is present", () => {
      const {container} = render(createNoteDialog(), {container: global.document.querySelector("#portal")!});
      const noteDialogNotes = container.querySelectorAll(".note-dialog__note");
      expect(noteDialogNotes[2].querySelector(".note-dialog__options")).toBeDefined();
    });

    describe("NoteDialogNoteContent", () => {
      test("note-dialog__note-content is present", () => {
        const {container} = render(createNoteDialog(), {container: global.document.querySelector("#portal")!});
        expect(container.querySelector(".note-dialog__note")!.querySelector(".note-dialog__note-content")).toBeDefined();
      });

      test("click on NoteContent as author", async () => {
        mockedUser.current = jest.fn(() => ({id: "test-user-2"} as never));
        const {container} = render(createNoteDialog({authorId: "test-user-2"}), {container: global.document.querySelector("#portal")!});
        const noteContentText = container.querySelector(".note-dialog__note-content__text")!;
        fireEvent.blur(noteContentText, {target: {textContent: "Changed Text"}});

        await waitFor(() => {
          expect(store.dispatch).toHaveBeenCalledWith(ActionFactory.editNote({id: "0", text: "Changed Text"}));
        });
      });

      test("click on NoteContent as moderator", async () => {
        mockedUser.current = jest.fn(() => ({id: "test-user-2"} as never));
        const {container} = render(createNoteDialog({currentUserIsModerator: true}), {container: global.document.querySelector("#portal")!});
        const noteContentText = container.querySelector(".note-dialog__note-content__text")!;
        fireEvent.blur(noteContentText, {target: {textContent: "Changed Text"}});

        await waitFor(() => {
          expect(store.dispatch).toHaveBeenCalledWith(ActionFactory.editNote({id: "0", text: "Changed Text"}));
        });
      });

      test("click on NoteContent as other user", async () => {
        mockedUser.current = jest.fn(() => ({id: "test-user-2"} as never));
        const {container} = render(createNoteDialog(), {container: global.document.querySelector("#portal")!});
        const noteContentText = container.querySelector(".note-dialog__note-content__text")!;
        fireEvent.blur(noteContentText, {target: {textContent: "Changed Text"}});

        await waitFor(() => {
          expect(store.dispatch).not.toHaveBeenCalled();
        });
      });
    });

    test("note-dialog__note-footer is present", () => {
      const {container} = render(createNoteDialog(), {container: global.document.querySelector("#portal")!});
      expect(container.querySelector(".note-dialog__note")!.querySelector(".note-dialog__note-footer")).toBeDefined();
    });

    test("note-dialog match snapshot", () => {
      const {container} = render(createNoteDialog(), {container: global.document.querySelector("#portal")!});
      expect(container.querySelector(".note-dialog")).toMatchSnapshot();
    });

    describe("Moderation phase", () => {
      beforeEach(() => {
        mockedUser.current = jest.fn(() => ({id: "test-user-2"} as never));
      });

      test("three note-dialog__note present during moderation phase", () => {
        const {container} = render(createNoteDialog({activeModeration: {userId: "test-user-1", status: true}, authorId: "test-user-1"}), {
          container: global.document.querySelector("#portal")!,
        });
        const noteDialogNotes = container.querySelectorAll(".note-dialog__note");
        expect(noteDialogNotes.length).toEqual(3);
      });

      test("moderation: last note-dialog__options note isn't present", () => {
        const {container} = render(createNoteDialog({activeModeration: {userId: "test-user-1", status: true}, authorId: "test-user-1"}), {
          container: global.document.querySelector("#portal")!,
        });
        const noteDialogNotes = container.querySelectorAll(".note-dialog__note");
        expect(noteDialogNotes[noteDialogNotes.length - 1].children.length).toEqual(2);
        expect(noteDialogNotes[noteDialogNotes.length - 1].querySelector(".note-dialog__note-content")).not.toBeNull();
        expect(noteDialogNotes[noteDialogNotes.length - 1].querySelector(".note-dialog__note-footer")).not.toBeNull();
        expect(noteDialogNotes[noteDialogNotes.length - 1].querySelector(".note-dialog__note-options")).toBeNull();
      });

      test("moderation: last note-dialog__notes has two children", () => {
        const {container} = render(createNoteDialog({activeModeration: {userId: "test-user-1", status: true}, authorId: "test-user-1"}), {
          container: global.document.querySelector("#portal")!,
        });
        const noteDialogNotes = container.querySelectorAll(".note-dialog__note");
        expect(noteDialogNotes[noteDialogNotes.length - 1].children.length).toEqual(2);
      });

      test("moderation: last note-dialog__options note is present", () => {
        const {container} = render(createNoteDialog({activeModeration: {userId: "test-user-1", status: true}, authorId: "test-user-1", currentUserIsModerator: true}), {
          container: global.document.querySelector("#portal")!,
        });
        const noteDialogNotes = container.querySelectorAll(".note-dialog__note");
        expect(noteDialogNotes[noteDialogNotes.length - 1].querySelector(".note-dialog__note-content")).not.toBeNull();
        expect(noteDialogNotes[noteDialogNotes.length - 1].querySelector(".note-dialog__note-footer")).not.toBeNull();
        expect(noteDialogNotes[noteDialogNotes.length - 1].querySelector(".note-dialog__note-options")).not.toBeNull();
      });

      test("moderation: last note-dialog__notes has three children", () => {
        const {container} = render(createNoteDialog({activeModeration: {userId: "test-user-1", status: true}, authorId: "test-user-1", currentUserIsModerator: true}), {
          container: global.document.querySelector("#portal")!,
        });
        const noteDialogNotes = container.querySelectorAll(".note-dialog__note");
        expect(noteDialogNotes[noteDialogNotes.length - 1].children.length).toEqual(2);
      });
    });
  });
});
