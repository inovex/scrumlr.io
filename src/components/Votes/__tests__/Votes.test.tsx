import {fireEvent} from "@testing-library/react";
import {Actions} from "store/action";
import {Provider} from "react-redux";
import {Votes} from "components/Votes";
import {render} from "testUtils";
import getTestStore from "utils/test/getTestStore";
import * as redux from "react-redux";
import {Dispatch, Action} from "redux";
import {ApplicationState} from "types";
import getTestVoting from "utils/test/getTestVoting";

const createVotes = (overwrite?: Partial<ApplicationState>) => {
  return (
    <Provider store={getTestStore(overwrite)}>
      <Votes noteId="test-notes-id-1" />
    </Provider>
  );
};

describe("Votes", () => {
  describe("should render correctly", () => {
    test("with no votes and disabled voting", () => {
      const votes = render(createVotes({votings: {open: undefined, past: []}, votes: []}));
      expect(votes.container).toMatchSnapshot();
    });
    test("with no votes and active voting", () => {
      const votes = render(createVotes({votes: []}));
      expect(votes.container).toMatchSnapshot();
    });
    test("with votes and disabled voting", () => {
      const votes = render(
        createVotes({
          votings: {
            open: undefined,
            past: [
              getTestVoting({
                status: "CLOSED",
                votes: {
                  total: 1,
                  votesPerNote: {
                    "test-notes-id-1": {
                      total: 1,
                      userVotes: [
                        {
                          id: "1",
                          total: 1,
                        },
                      ],
                    },
                  },
                },
              }),
            ],
          },
        })
      );
      expect(votes.container).toMatchSnapshot();
    });
    test("with votes and active voting", () => {
      const votes = render(createVotes());
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
      const {container} = render(createVotes({votes: []}));
      fireEvent.click(container.getElementsByClassName("dot-button")[0]);
      expect(mockDispatchFn).toHaveBeenCalledWith(Actions.addVote("test-notes-id-1"));
    });

    test("deleteVote", () => {
      const {container} = render(createVotes());
      fireEvent.click(container.getElementsByClassName("dot-button")[0]);
      expect(mockDispatchFn).toHaveBeenCalledWith(Actions.deleteVote("test-notes-id-1"));
    });
  });

  describe("Test allowMultipleVotesPerNote works correctly", () => {
    test("allowMultipleVotesPerNote: false", () => {
      const {container} = render(createVotes());
      expect(container.querySelector(".votes")?.firstChild).toHaveClass("vote-button-remove");
      expect(container.querySelector(".votes")?.firstChild).toHaveClass("vote-button-remove--own-vote");
      expect(container.querySelector(".vote-button-add")).toBeNull();
      expect(container.querySelector(".votes")?.childElementCount).toEqual(1);
      expect(container.querySelector(".vote-button-remove")?.firstChild).toHaveClass("vote-button-remove__folded-corner");
    });
  });
});
