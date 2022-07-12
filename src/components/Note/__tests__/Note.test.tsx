import {fireEvent} from "@testing-library/react";
import {Note} from "components/Note";
import {wrapWithTestBackend} from "react-dnd-test-utils";
import {Provider} from "react-redux";
import {Actions} from "store/action";
import {render} from "testUtils";
import getTestStore from "utils/test/getTestStore";
import getTestParticipant from "utils/test/getTestParticipant";
import * as redux from "react-redux";
import {ApplicationState} from "types";
import getTestNote from "utils/test/getTestNote";

type TestProps = {
  showAuthors: boolean;
  moderating: boolean;
  currentUserIsModerator: boolean;
  overwrite?: Partial<ApplicationState>;
};

const createNote = (props: Partial<TestProps>) => {
  const [NoteContext] = wrapWithTestBackend(Note);
  return (
    <Provider store={getTestStore(props.overwrite)}>
      <NoteContext
        key="test-notes-id-1"
        noteId="test-notes-id-1"
        columnId="test-columns-id-1"
        columnName="test-columns-name-1"
        columnColor="backlog-blue"
        showAuthors={props.showAuthors || false}
        moderating={props.moderating || false}
        viewer={getTestParticipant(props.currentUserIsModerator ? {role: "MODERATOR"} : {role: "PARTICIPANT"})}
        columnVisible={false}
      />
    </Provider>
  );
};

describe("Note", () => {
  beforeEach(() => {
    window.IntersectionObserver = jest.fn(
      () =>
        ({
          observe: jest.fn(),
          disconnect: jest.fn(),
        } as unknown as IntersectionObserver)
    );
  });

  describe("should render correctly", () => {
    test("note__root is present", () => {
      const {container} = render(createNote({showAuthors: true}));
      expect(container.firstChild).toHaveClass("note__root");
    });

    test("note is present", () => {
      const {container} = render(createNote({showAuthors: true}));
      expect(container.querySelector(".note__root")!.firstChild).toHaveClass("note");
    });

    test("note--own-card is present", () => {
      const {container} = render(createNote({showAuthors: true, overwrite: {notes: [getTestNote({id: "test-notes-id-1", author: getTestParticipant().user.id})]}}));
      expect(container.querySelector(".note__root")!.firstChild).toHaveClass("note--own-card");
    });

    test("note--own-card is not present", () => {
      const {container} = render(createNote({showAuthors: true}));
      expect(container.querySelector(".note__root")!.firstChild).not.toHaveClass("note--own-card");
    });

    test("note text is present", () => {
      const {container} = render(createNote({showAuthors: true}));
      expect(container.querySelector(".note")?.firstChild).toHaveClass("note__text");
    });

    test("note text has correct text", () => {
      const {container} = render(createNote({showAuthors: true}));
      expect(container.firstChild).toHaveTextContent("Lorem Ipsum");
    });

    test("note footer is present", () => {
      const {container} = render(createNote({showAuthors: true}));
      expect(container.querySelector(".note")?.lastChild).toHaveClass("note__footer");
    });

    test("note author is present", () => {
      const {container} = render(createNote({showAuthors: true}));
      expect(container.querySelector(".note__footer")?.firstChild).toHaveClass("note__author");
    });

    test("note author is hidden", () => {
      const {container} = render(createNote({showAuthors: false}));
      expect(container.querySelector(".note__footer")).not.toHaveClass("note__author");
    });

    test("note author name is present", () => {
      const {container} = render(createNote({showAuthors: true}));
      expect(container.querySelector(".note__author")?.lastChild).toHaveClass("note__author-name");
    });

    test("own note author name is me", () => {
      const {container} = render(createNote({showAuthors: true, overwrite: {notes: [getTestNote({id: "test-notes-id-1", author: getTestParticipant().user.id})]}}));
      expect(container.firstChild).toHaveTextContent("Me");
    });
  });

  describe("should have correct style", () => {
    test("show note with correct style", () => {
      const {container} = render(createNote({showAuthors: true}));
      expect(container.firstChild).toMatchSnapshot();
    });
  });

  describe("should have note in stack", () => {
    test("check div with class name note__in-stack", () => {
      const {container} = render(
        createNote({
          showAuthors: true,
          overwrite: {
            notes: [getTestNote({id: "test-notes-id-1"}), getTestNote({id: "test-note-in-stack", position: {stack: "test-notes-id-1", column: "test-columns-id-1", rank: 0}})],
          },
        })
      );
      expect(container.querySelector(".note__root")!.lastChild).toHaveClass("note__in-stack");
    });
  });

  describe("Test NoteDialog created/not created", () => {
    beforeEach(() => {
      const portal = global.document.createElement("div");
      portal.setAttribute("id", "portal");
      global.document.querySelector("body")!.appendChild(portal);
    });

    test("NoteDialog is present: snapshot", () => {
      const {container} = render(
        createNote({
          showAuthors: true,
          overwrite: {
            board: {
              status: "ready",
              data: {
                id: "test-board-id",
                name: "test-board-name",
                accessPolicy: "PUBLIC",
                showAuthors: true,
                showNotesOfOtherUsers: true,
                allowStacking: true,
                sharedNote: "test-notes-id-1",
              },
            },
          },
        }),
        {
          container: global.document.querySelector("#portal")!,
        }
      );
      expect(container).toMatchSnapshot();
    });

    test("NoteDialog is present: class", () => {
      const {container} = render(
        createNote({
          showAuthors: true,
          overwrite: {
            board: {
              status: "ready",
              data: {
                id: "test-board-id",
                name: "test-board-name",
                accessPolicy: "PUBLIC",
                showAuthors: true,
                showNotesOfOtherUsers: true,
                allowStacking: true,
                sharedNote: "test-notes-id-1",
              },
            },
          },
        }),
        {
          container: global.document.querySelector("#portal")!,
        }
      );
      expect(container.querySelector(".note-dialog")).not.toBeNull();
    });

    test("NoteDialog is not present: snapshot", () => {
      const {container} = render(createNote({showAuthors: true}), {
        container: global.document.querySelector("#portal")!,
      });
      expect(container).toMatchSnapshot();
    });

    test("NoteDialog isn't present: class", () => {
      const {container} = render(createNote({showAuthors: true}), {
        container: global.document.querySelector("#portal")!,
      });
      expect(container.querySelector(".note-dialog")).toBeNull();
    });
  });

  describe("note clicked during moderation phase", () => {
    beforeEach(() => {
      const portal = global.document.createElement("div");
      portal.setAttribute("id", "portal");
      global.document.querySelector("body")!.appendChild(portal);
    });

    test("Note should be focused", () => {
      const useDispatchSpy = jest.spyOn(redux, "useDispatch");
      const dispatchMock = jest.fn();
      useDispatchSpy.mockReturnValue(dispatchMock);
      const {container} = render(createNote({showAuthors: true, moderating: true}));
      fireEvent.click(container.querySelector(".note__root")!);
      expect(dispatchMock).toHaveBeenCalledWith(Actions.shareNote("test-notes-id-1"));
    });

    test("Note shouldn't be focused", () => {
      const useDispatchSpy = jest.spyOn(redux, "useDispatch");
      const dispatchMock = jest.fn();
      useDispatchSpy.mockReturnValue(dispatchMock);
      const {container} = render(createNote({showAuthors: true}));
      fireEvent.click(container.querySelector(".note__root")!);
      expect(dispatchMock).not.toBeCalled();
    });
  });
});
