import {fireEvent, render} from "@testing-library/react";
import configureStore from "redux-mock-store";
import {Provider} from "react-redux";
import {wrapWithTestBackend} from "react-dnd-test-utils";
import Parse from "parse";
import {VoteClientModel} from "types/vote";
import store from "store";
import {ActionFactory} from "store/action";
import Note from "./Note";

const mockStore = configureStore();

jest.mock("store", () => ({
  ...jest.requireActual("store"),
  dispatch: jest.fn(),
}));

type TestProps = {
  text: string;
  authorId: string;
  showAuthors: boolean;
  votes: VoteClientModel[];
  focus: boolean;
  moderation: {userId: string; status: boolean};
  currentUserIsModerator: boolean;
};

const defaultVotes = [
  {
    id: "test-vote-0",
    board: "test-board",
    note: "test-id",
    user: "test-user-1",
    votingIteration: 1,
  },
  {
    id: "test-vote-1",
    board: "test-board",
    note: "test-id",
    user: "test-user-2",
    votingIteration: 1,
  },
  {
    id: "test-vote-2",
    board: "test-board",
    note: "test-id",
    user: "test-user-2",
    votingIteration: 1,
  },
];

const createNote = (props: Partial<TestProps>) => {
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
  const [NoteContext] = wrapWithTestBackend(Note);
  return (
    <Provider store={store}>
      <NoteContext
        key=""
        noteId="0"
        text={props.text || "Test Text"}
        authorId={props.authorId || "Test Author"}
        columnId=""
        columnName=""
        columnColor=""
        isAdmin
        activeVoting
        showAuthors={props.showAuthors || false}
        votes={props.votes || defaultVotes}
        childrenNotes={[
          {id: "1", columnId: "test_column", text: "", author: "", parentId: "0", dirty: true, authorName: "", votes: [], focus: false},
          {id: "2", columnId: "test_column", text: "", author: "", parentId: "0", dirty: true, authorName: "", votes: [], focus: false},
        ]}
        authorName=""
        activeModeration={props.moderation || {userId: "Test Author", status: false}}
        focus={props.focus || false}
        currentUserIsModerator={props.currentUserIsModerator || false}
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
      // @ts-ignore
      Parse.User.current = jest.fn(() => ({id: "Test Author"}));
      const {container} = render(createNote({showAuthors: true}));
      expect(container.querySelector(".note__root")!.firstChild).toHaveClass("note--own-card");
    });

    test("note--own-card is not present", () => {
      // @ts-ignore
      Parse.User.current = jest.fn(() => ({id: "Test Author"}));
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

    test("note author image is present", () => {
      const {container} = render(createNote({showAuthors: true}));
      expect(container.querySelector(".note__author")?.firstChild).toHaveClass("note__author-image");
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

  describe("Test amount of visible votes", () => {
    test("test-user-1 has one vote during vote phase", () => {
      // @ts-ignore
      Parse.User.current = jest.fn(() => ({id: "test-user-1"}));
      const {container} = render(createNote({showAuthors: true, authorId: "test-user-1"}));
      expect((container.querySelector(".dot-button")?.lastChild as HTMLSpanElement).innerHTML).toEqual("3");
    });

    test("test-user-2 has two votes during vote phase", () => {
      // @ts-ignore
      Parse.User.current = jest.fn(() => ({id: "test-user-2"}));
      const {container} = render(createNote({showAuthors: true, authorId: "test-user-2"}));
      expect((container.querySelector(".dot-button")?.lastChild as HTMLSpanElement).innerHTML).toEqual("3");
    });

    test("test-user-1 can see three votes", () => {
      // @ts-ignore
      Parse.User.current = jest.fn(() => ({id: "test-user-1"}));
      const {container} = render(createNote({showAuthors: true, authorId: "test-user-1"}));
      expect((container.querySelector(".dot-button")?.lastChild as HTMLSpanElement).innerHTML).toEqual("3");
    });

    test("test-user-2 can see three votes", () => {
      // @ts-ignore
      Parse.User.current = jest.fn(() => ({id: "test-user-2"}));
      const {container} = render(createNote({showAuthors: true, authorId: "test-user-2"}));
      expect((container.querySelector(".dot-button")?.lastChild as HTMLSpanElement).innerHTML).toEqual("3");
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
      const {container} = render(createNote({showAuthors: true, focus: false, moderation: {userId: "Test Author", status: true}, currentUserIsModerator: true}));
      fireEvent.click(container.querySelector(".note__root")!);
      expect(store.dispatch).toHaveBeenCalledWith(ActionFactory.editNote({id: "0", focus: true}));
    });

    test("Note shouldn't be focused", () => {
      const {container} = render(createNote({showAuthors: true, focus: true, moderation: {userId: "Test Author", status: true}, currentUserIsModerator: false}));
      fireEvent.click(container.querySelector(".note__root")!);
      expect(store.dispatch).not.toBeCalled();
    });
  });
});
