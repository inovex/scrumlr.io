import {render} from "@testing-library/react";
import configureStore from "redux-mock-store";
import {Provider} from "react-redux";
import {wrapWithTestBackend} from "react-dnd-test-utils";
import Note from "./Note";

const mockStore = configureStore();

const createNote = (text: string, authorId: string, showAuthors: boolean) => {
  const initialState = {
    board: {
      data: {
        columns: [{id: "TestID", name: "Testheader", hidden: false}],
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
        noteId=""
        text={text}
        authorId={authorId}
        columnId=""
        columnName=""
        columnColor=""
        isAdmin
        activeVoting
        showAuthors={showAuthors}
        votes={[
          {
            id: "test-id",
            board: "test-board",
            note: "test-note",
            user: "test-user",
          },
        ]}
        childrenNotes={[]}
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
      const {container} = render(createNote("Test Text", "Test Author", true));
      expect(container.firstChild).toHaveClass("note__root");
    });

    test("note is present", () => {
      const {container} = render(createNote("Test Text", "Test Author", true));
      expect(container.querySelector(".note__root")!.firstChild).toHaveClass("note");
    });

    test("note content is present", () => {
      const {container} = render(createNote("Test Text", "Test Author", true));
      expect(container.querySelector(".note")?.firstChild).toHaveClass("note__content");
    });

    test("note text is present", () => {
      const {container} = render(createNote("Test Text", "Test Author", true));
      expect(container.querySelector(".note__content")?.firstChild).toHaveClass("note__text");
    });

    test("note text has correct text", () => {
      const {container} = render(createNote("Test Text", "Test Author", true));
      expect(container.firstChild).toHaveTextContent("Test Text");
    });

    test("note footer is present", () => {
      const {container} = render(createNote("Test Text", "Test Author", true));
      expect(container.querySelector(".note")?.lastChild).toHaveClass("note__footer");
    });

    test("note author is present", () => {
      const {container} = render(createNote("Test Text", "Test Author", true));
      expect(container.querySelector(".note__footer")?.firstChild).toHaveClass("note__author");
    });

    test("note author is hidden", () => {
      const {container} = render(createNote("Test Text", "Test Author", false));
      expect(container.querySelector(".note__footer")).not.toHaveClass("note__author");
    });

    test("note author image is present", () => {
      const {container} = render(createNote("Test Text", "Test Author", true));
      expect(container.querySelector(".note__author")?.firstChild).toHaveClass("note__author-image");
    });

    test("note author name is present", () => {
      const {container} = render(createNote("Test Text", "Test Author", true));
      expect(container.querySelector(".note__author")?.lastChild).toHaveClass("note__author-name");
    });
  });

  describe("should have correct style", () => {
    test("show note with correct style", () => {
      const {container} = render(createNote("Test Text", "Test Author", true));
      expect(container.firstChild).toMatchSnapshot();
    });
  });
});
