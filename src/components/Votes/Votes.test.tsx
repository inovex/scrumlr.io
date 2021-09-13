import {fireEvent, render} from "@testing-library/react";
import store from "store";
import {ActionFactory} from "store/action";
import {Votes} from "./Votes";

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
});
