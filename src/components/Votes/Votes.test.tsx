import {fireEvent, render} from "@testing-library/react";
import store from "store";
import {ActionFactory} from "store/action";
import {Votes} from "./Votes";

describe("Votes", () => {
  describe("should render correctly", () => {
    test("with no votes and disabled voting", () => {
      const votes = render(<Votes noteId="test-id" votes={[]} activeVoting={false} />);
      expect(votes.container).toMatchSnapshot();
    });
    test("with no votes and active voting", () => {
      const votes = render(<Votes noteId="test-id" votes={[]} activeVoting />);
      expect(votes.container).toMatchSnapshot();
    });
    test("with votes and disabled voting", () => {
      const votes = render(
        <Votes
          noteId="test-id"
          votes={[
            {
              id: "test-id",
              board: "test-board",
              note: "test-note",
              user: "test-user",
            },
          ]}
          activeVoting={false}
        />
      );
      expect(votes.container).toMatchSnapshot();
    });
    test("with votes and active voting", () => {
      const votes = render(
        <Votes
          noteId="test-id"
          votes={[
            {
              id: "test-id",
              board: "test-board",
              note: "test-note",
              user: "test-user",
            },
          ]}
          activeVoting
        />
      );
      expect(votes.container).toMatchSnapshot();
    });
    test("with additional classname", () => {
      const votes = render(<Votes className="test-classname" noteId="test-id" votes={[]} activeVoting={false} />);
      expect(votes.container).toMatchSnapshot();
    });
  });

  describe("should dispatch to store on button press", () => {
    const storeDispatchSpy = jest.spyOn(store, "dispatch");

    test("addVote", () => {
      const votes = render(
        <Votes
          noteId="test-id"
          votes={[
            {
              id: "test-id",
              board: "test-board",
              note: "test-note",
              user: "test-user",
            },
          ]}
          activeVoting
        />
      );
      fireEvent.click(votes.container.getElementsByClassName("dot-button")[1]);
      expect(storeDispatchSpy).toHaveBeenCalledWith(ActionFactory.addVote("test-id"));
    });

    test("deleteVote", () => {
      const votes = render(
        <Votes
          noteId="test-id"
          votes={[
            {
              id: "test-id",
              board: "test-board",
              note: "test-note",
              user: "test-user",
            },
          ]}
          activeVoting
        />
      );
      fireEvent.click(votes.container.getElementsByClassName("dot-button")[0]);
      expect(storeDispatchSpy).toHaveBeenCalledWith(ActionFactory.deleteVote("test-id"));
    });
  });
});
