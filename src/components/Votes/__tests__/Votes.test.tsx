import {fireEvent} from "@testing-library/react";
import {Actions} from "store/action";
import {Provider} from "react-redux";
import {Votes} from "components/Votes";
import {render} from "testUtils";
import getTestStore from "utils/test/getTestStore";
import * as redux from "react-redux";
import {Dispatch, Action} from "redux";
import {Vote} from "types/vote";

const createVotes = (overwrite?: {votes?: number; activeVoting?: boolean; userVotes?: Vote[]}) => {
  return (
    <Provider store={getTestStore()}>
      <Votes noteId="test-id" votes={0} activeVoting={false} userVotes={[]} {...overwrite} />
    </Provider>
  );
};

describe("Votes", () => {
  describe("should render correctly", () => {
    test("with no votes and disabled voting", () => {
      const votes = render(createVotes());
      expect(votes.container).toMatchSnapshot();
    });
    test("with no votes and active voting", () => {
      const votes = render(createVotes({activeVoting: true}));
      expect(votes.container).toMatchSnapshot();
    });
    test("with votes and disabled voting", () => {
      const votes = render(createVotes({votes: 1, activeVoting: false}));
      expect(votes.container).toMatchSnapshot();
    });
    test("with votes and active voting", () => {
      const votes = render(createVotes({userVotes: [{voting: "test-id", note: "test-id"}], activeVoting: true}));
      expect(votes.container).toMatchSnapshot();
    });
  });

  describe("should dispatch to store on button press", () => {
    let mockDispatchFn: jest.Mock<any, any> | Dispatch<Action<any>>;
    beforeEach(() => {
      const useDispatchSpy = jest.spyOn(redux, "useDispatch");
      mockDispatchFn = jest.fn();
      useDispatchSpy.mockReturnValue(mockDispatchFn);
    });
    test("addVote", () => {
      const {container} = render(createVotes({activeVoting: true}));
      fireEvent.click(container.getElementsByClassName("dot-button")[0]);
      expect(mockDispatchFn).toHaveBeenCalledWith(Actions.addVote("test-id"));
    });

    test("deleteVote", () => {
      const {container} = render(createVotes({userVotes: [{voting: "test-id", note: "test-id"}], activeVoting: true}));
      fireEvent.click(container.getElementsByClassName("dot-button")[0]);
      expect(mockDispatchFn).toHaveBeenCalledWith(Actions.deleteVote("test-id"));
    });
  });

  describe("Test allowMultipleVotesPerNote works correctly", () => {
    test("allowMultipleVotesPerNote: false", () => {
      const {container} = render(
        createVotes({
          activeVoting: true,
          userVotes: [
            {voting: "test-id", note: "test-id"},
            {voting: "test-id", note: "test-id"},
          ],
        })
      );
      expect(container.querySelector(".votes")?.firstChild).toHaveClass("vote-button-remove");
      expect(container.querySelector(".votes")?.firstChild).toHaveClass("vote-button-remove--own-vote");
      expect(container.querySelector(".votes")?.childElementCount).toEqual(1);
      expect(container.querySelector(".vote-button-remove")?.firstChild).toHaveClass("vote-button-remove__folded-corner");
      expect((container.querySelector(".dot-button")?.lastChild as HTMLSpanElement).innerHTML).toEqual("2");
    });
  });
});
