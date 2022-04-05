import {fireEvent} from "@testing-library/react";
import {Note} from "components/Note";
import {wrapWithTestBackend} from "react-dnd-test-utils";
import {Provider} from "react-redux";
import {Actions} from "store/action";
import {Vote} from "types/vote";
import {render} from "testUtils";
import getTestStore from "utils/test/getTestStore";
import getTestParticipant from "utils/test/getTestParticipant";
import * as redux from "react-redux";

type TestProps = {
  text: string;
  authorId: string;
  showAuthors: boolean;
  votes: Vote[];
  focus: boolean;
  moderating: boolean;
  currentUserIsModerator: boolean;
};

const defaultVotes = [
  {
    id: "test-vote-0",
    board: "test-board",
    note: "test-id",
    user: "test-user-1",
    votingEnabled: 1,
  },
  {
    id: "test-vote-1",
    board: "test-board",
    note: "test-id",
    user: "test-user-2",
    votingEnabled: 1,
  },
  {
    id: "test-vote-2",
    board: "test-board",
    note: "test-id",
    user: "test-user-2",
    votingEnabled: 1,
  },
];

const createNote = (props: Partial<TestProps>) => {
  const [NoteContext] = wrapWithTestBackend(Note);
  return (
    <Provider store={getTestStore()}>
      <NoteContext
        key=""
        noteId="0"
        text={props.text || "Test Text"}
        authorId={props.authorId || "Test Author"}
        columnId=""
        columnName=""
        columnColor=""
        activeVoting
        showAuthors={props.showAuthors || false}
        votes={props.votes?.length || defaultVotes.length}
        allVotesOfUser={[]}
        childrenNotes={[
          {id: "1", text: "", author: "", authorName: "", position: {column: "test-column", stack: "0", rank: 0}, votes: 0, allVotesOfUser: []},
          {id: "2", text: "", author: "", authorName: "", position: {column: "test-column", stack: "0", rank: 1}, votes: 0, allVotesOfUser: []},
        ]}
        authorName=""
        moderating={props.moderating || false}
        focus={props.focus || false}
        viewer={getTestParticipant(props.currentUserIsModerator ? {role: "MODERATOR"} : {role: "PARTICIPANT"})}
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
      const {container} = render(createNote({showAuthors: true, authorId: "test-participant-id"}));
      expect(container.querySelector(".note__root")!.firstChild).toHaveClass("note--own-card");
    });

    test("note--own-card is not present", () => {
      const {container} = render(createNote({showAuthors: true, authorId: "Test Author 2"}));
      expect(container.querySelector(".note__root")!.firstChild).not.toHaveClass("note--own-card");
    });

    test("note content is present", () => {
      const {container} = render(createNote({showAuthors: true}));
      expect(container.querySelector(".note")?.firstChild).toHaveClass("note__content");
    });

    test("note text is present", () => {
      const {container} = render(createNote({showAuthors: true}));
      expect(container.querySelector(".note__content")?.firstChild).toHaveClass("note__text");
    });

    test("note text has correct text", () => {
      const {container} = render(createNote({showAuthors: true}));
      expect(container.firstChild).toHaveTextContent("Test Text");
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
  });

  describe("should have correct style", () => {
    test("show note with correct style", () => {
      const {container} = render(createNote({showAuthors: true}));
      expect(container.firstChild).toMatchSnapshot();
    });
  });

  describe("should have note in stack", () => {
    test("check div with class name note__in-stack", () => {
      const {container} = render(createNote({showAuthors: true}));
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
      const {container} = render(createNote({showAuthors: true, focus: true, moderation: {userId: "Test Author", status: true}}), {
        container: global.document.querySelector("#portal")!,
      });
      expect(container).toMatchSnapshot();
    });

    test("NoteDialog is present: class", () => {
      const {container} = render(createNote({showAuthors: true, focus: true, moderation: {userId: "Test Author", status: true}}), {
        container: global.document.querySelector("#portal")!,
      });
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
      const {container} = render(createNote({showAuthors: true, focus: false, moderating: true, currentUserIsModerator: true}));
      fireEvent.click(container.querySelector(".note__root")!);
      expect(dispatchMock).toHaveBeenCalledWith(Actions.shareNote("0"));
    });

    test("Note shouldn't be focused", () => {
      const useDispatchSpy = jest.spyOn(redux, "useDispatch");
      const dispatchMock = jest.fn();
      useDispatchSpy.mockReturnValue(dispatchMock);
      const {container} = render(createNote({showAuthors: true, focus: true, moderating: false, currentUserIsModerator: false}));
      fireEvent.click(container.querySelector(".note__root")!);
      expect(dispatchMock).not.toBeCalled();
    });
  });
});
