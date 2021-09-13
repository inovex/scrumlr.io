import {fireEvent, render} from "@testing-library/react";
import {wrapWithTestBackend} from "react-dnd-test-utils";
import store from "store";
import {ActionFactory} from "store/action";
import configureStore from "redux-mock-store";
import {Provider} from "react-redux";
import Parse from "parse";
import Note from "components/Note/Note";
import {Votes} from "./Votes";
import Board from "../Board/Board";
import Column from "../Column/Column";

const mockStore = configureStore();
const createNote = () => {
  const initialState = {
    board: {
      data: {
        columns: [{id: "test_column", name: "test_header", hidden: false}],
        votingIteration: 0,
      },
    },
    notes: [{}],
    users: {
      admins: [],
      basic: ["test-user-1", "test-user-2", "test-user-3"],
      all: [],
    },
  };

  const store = mockStore(initialState);

  const [NoteContext] = wrapWithTestBackend(Note);

  return (
    <Provider store={store}>
      <NoteContext
        key=""
        noteId="test-id"
        text=""
        authorId=""
        columnId="test_column"
        columnName=""
        columnColor=""
        isAdmin
        activeVoting
        showAuthors
        votes={[
          {
            id: "0",
            board: "test-board",
            note: "test-id",
            user: "test-user-1",
            votingIteration: 0,
          },
          {
            id: "1",
            board: "test-board",
            note: "test-id",
            user: "test-user-2",
            votingIteration: 0,
          },
          {
            id: "2",
            board: "test-board",
            note: "test-id",
            user: "test-user-2",
            votingIteration: 0,
          },
        ]}
        childrenNotes={[]}
        authorName=""
      />
    </Provider>
  );
};

const createVotes = (withVotes: boolean, activeVoting: boolean, className?: string) => (
  <Votes
    noteId="test-id"
    className={className}
    votes={
      withVotes
        ? [
            {
              id: "test-id",
              board: "test-board",
              note: "test-note",
              user: "test-user",
              votingIteration: 0,
            },
          ]
        : []
    }
    activeVoting={activeVoting}
  />
);

const createBoardWithColumns = () => {
  const initialState = {
    board: {
      data: {
        columns: [{id: "test_column", name: "Positive", hidden: false}],
      },
    },
    notes: [],
    users: {
      admins: [],
      basic: [],
      all: [],
    },
  };
  const store = mockStore(initialState);
  const [BoardContext] = wrapWithTestBackend(Board);

  return (
    <Provider store={store}>
      <BoardContext name="" boardstatus="" currentUserIsModerator>
        <Column key="backlog-blue" id="test_column" color="backlog-blue" name="Positive" />
      </BoardContext>
    </Provider>
  );
};

describe("Votes", () => {
  describe("should render correctly", () => {
    test("with no votes and disabled voting", () => {
      const votes = render(createVotes(false, false));
      expect(votes.container).toMatchSnapshot();
    });
    test("with no votes and active voting", () => {
      const votes = render(createVotes(false, true));
      expect(votes.container).toMatchSnapshot();
    });
    test("with votes and disabled voting", () => {
      const votes = render(createVotes(true, false));
      expect(votes.container).toMatchSnapshot();
    });
    test("with votes and active voting", () => {
      const votes = render(createVotes(true, true));
      expect(votes.container).toMatchSnapshot();
    });
    test("with additional classname", () => {
      const votes = render(createVotes(false, false, "test-classname"));
      expect(votes.container).toMatchSnapshot();
    });
  });

  describe("should dispatch to store on button press", () => {
    const storeDispatchSpy = jest.spyOn(store, "dispatch");

    test("addVote", () => {
      const votes = render(createVotes(true, true));
      fireEvent.click(votes.container.getElementsByClassName("dot-button")[1]);
      expect(storeDispatchSpy).toHaveBeenCalledWith(ActionFactory.addVote("test-id"));
    });

    test("deleteVote", () => {
      const votes = render(createVotes(true, true));
      fireEvent.click(votes.container.getElementsByClassName("dot-button")[0]);
      expect(storeDispatchSpy).toHaveBeenCalledWith(ActionFactory.deleteVote("test-id"));
    });
  });

  describe("should dispatch to store on button press", () => {
    const storeDispatchSpy = jest.spyOn(store, "dispatch");

    test("addVote", () => {
      const votes = render(createVotes(true, true));
      fireEvent.click(votes.container.getElementsByClassName("dot-button")[1]);
      expect(storeDispatchSpy).toHaveBeenCalledWith(ActionFactory.addVote("test-id"));
    });

    test("deleteVote", () => {
      const votes = render(createVotes(true, true));
      fireEvent.click(votes.container.getElementsByClassName("dot-button")[0]);
      expect(storeDispatchSpy).toHaveBeenCalledWith(ActionFactory.deleteVote("test-id"));
    });
  });

  describe("Test amount of visible votes", () => {
    test("test-user-1 has one vote during vote phase", () => {
      Parse.User.current = jest.fn(() => ({id: "test-user-1"}));
      const {container} = render(createNote());
      expect((container.querySelector(".dot-button")?.lastChild as HTMLSpanElement).innerHTML).toEqual("1");
    });

    test("test-user-2 hast two votes during vote phase", () => {
      Parse.User.current = jest.fn(() => ({id: "test-user-2"}));
      const {container} = render(createNote());
      expect((container.querySelector(".dot-button")?.lastChild as HTMLSpanElement).innerHTML).toEqual("2");
    });

    test("test-user-3 hast zero votes during vote phase and has only the add vote button", () => {
      Parse.User.current = jest.fn(() => ({id: "test-user-3"}));
      const {container} = render(createNote());
      expect(container.querySelector(".note__votes")?.childElementCount).toEqual(1);
    });
  });
});
