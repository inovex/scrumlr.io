import {fireEvent, render} from "@testing-library/react";
import store from "store";
import {ActionFactory} from "store/action";
import {Votes} from "./Votes";

describe("Votes", () => {
  describe("should render correctly", () => {
    test("with no votes and disabled voting", () => {
      const votes = render(<Votes noteId="test-id" numberOfVotes={0} activeVoting={false} />);
      expect(votes.container).toMatchSnapshot();
    });
    test("with no votes and active voting", () => {
      const votes = render(<Votes noteId="test-id" numberOfVotes={0} activeVoting />);
      expect(votes.container).toMatchSnapshot();
    });
    test("with votes and disabled voting", () => {
      const votes = render(<Votes noteId="test-id" numberOfVotes={10} activeVoting={false} />);
      expect(votes.container).toMatchSnapshot();
    });
    test("with votes and active voting", () => {
      const votes = render(<Votes noteId="test-id" numberOfVotes={10} activeVoting />);
      expect(votes.container).toMatchSnapshot();
    });
    test("with additional classname", () => {
      const votes = render(<Votes className="test-classname" noteId="test-id" numberOfVotes={0} activeVoting={false} />);
      expect(votes.container).toMatchSnapshot();
    });
  });

  describe("should dispatch to store on button press", () => {
    const storeDispatchSpy = jest.spyOn(store, "dispatch");

    test("addVote", () => {
      const votes = render(<Votes noteId="test-id" numberOfVotes={10} activeVoting />);
      fireEvent.click(votes.container.getElementsByClassName("dot-button")[1]);
      expect(storeDispatchSpy).toHaveBeenCalledWith(ActionFactory.addVote("test-id"));
    });

    test("deleteVote", () => {
      const votes = render(<Votes noteId="test-id" numberOfVotes={10} activeVoting />);
      fireEvent.click(votes.container.getElementsByClassName("dot-button")[0]);
      expect(storeDispatchSpy).toHaveBeenCalledWith(ActionFactory.deleteVote("test-id"));
    });
  });
});
