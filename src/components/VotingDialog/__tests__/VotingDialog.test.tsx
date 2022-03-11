import {fireEvent, render, screen} from "@testing-library/react";
import configureStore from "redux-mock-store";
import {mocked} from "ts-jest/utils";
import {User} from "parse";
import {Provider} from "react-redux";
import {BrowserRouter} from "react-router-dom";
import {ActionFactory} from "store/action";
import store from "store";
import {VotingDialog} from "..";

const mockedUsedNavigate = jest.fn();

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockedUsedNavigate,
}));

const storeDispatchSpy = jest.spyOn(store, "dispatch");

describe("VotingDialog", () => {
  const mockStore = configureStore();
  const mockedUser = mocked(User, true);

  const createVotingDialog = (activeVoting: boolean) => {
    const initialState = {
      board: {
        data: {
          voting: activeVoting ? "active" : "disabled",
          id: "test-board-id",
        },
      },
      users: {
        admins: [{id: "test-id"}],
      },
    };
    const mockedStore = mockStore(initialState);
    return (
      <BrowserRouter>
        <Provider store={mockedStore}>
          <VotingDialog />
        </Provider>
      </BrowserRouter>
    );
  };

  beforeEach(() => {
    mockedUser.current = jest.fn(() => ({id: "test"} as never));
    const portal = global.document.createElement("div");
    portal.setAttribute("id", "portal");
    global.document.querySelector("body")!.appendChild(portal);
  });

  it("should match the snapshot with no active voting", () => {
    const {container} = render(createVotingDialog(false), {container: global.document.querySelector("#portal")!});
    expect(container.firstChild).toMatchSnapshot();
  });

  it("should match the snapshot with active voting", () => {
    const {container} = render(createVotingDialog(true), {container: global.document.querySelector("#portal")!});
    expect(container.firstChild).toMatchSnapshot();
  });

  it("should redirect if the current user isn't a moderator", () => {
    mockedUser.current = jest.fn(() => ({id: "something-else"} as never));
    render(createVotingDialog(true), {container: global.document.querySelector("#portal")!});
    expect(mockedUsedNavigate).toHaveBeenCalledWith("..");
  });

  it("should dispatch to store correctly on start voting button click", () => {
    render(createVotingDialog(false), {container: global.document.querySelector("#portal")!});
    fireEvent.click(screen.getByTestId("voting-dialog__start-button"));
    expect(storeDispatchSpy).toHaveBeenCalledWith(
      ActionFactory.addVoteConfiguration({boardId: "test-board-id", voteLimit: 5, showVotesOfOtherUsers: true, allowMultipleVotesPerNote: false})
    );
    expect(storeDispatchSpy).toHaveBeenCalledWith(ActionFactory.editBoard({id: "test-board-id", voting: "active"}));
  });

  it("should dispatch to store correctly on start voting button click with custom vote configuration", () => {
    render(createVotingDialog(false), {container: global.document.querySelector("#portal")!});
    fireEvent.click(screen.getByTestId("voting-dialog__cumulative-voting-button"));
    fireEvent.click(screen.getByTestId("voting-dialog__anonymous-voting-button"));
    fireEvent.click(screen.getByTestId("voting-dialog__plus-button"));
    fireEvent.click(screen.getByTestId("voting-dialog__start-button"));
    expect(storeDispatchSpy).toHaveBeenCalledWith(
      ActionFactory.addVoteConfiguration({boardId: "test-board-id", voteLimit: 6, showVotesOfOtherUsers: false, allowMultipleVotesPerNote: true})
    );
  });

  it("should dispatch to store correctly on cancel voting button click", () => {
    render(createVotingDialog(true), {container: global.document.querySelector("#portal")!});
    fireEvent.click(screen.getByTestId("voting-dialog__cancel-button"));
    expect(storeDispatchSpy).toHaveBeenCalledWith(ActionFactory.cancelVoting("test-board-id"));
  });

  it("should dispatch to store correctly on stop voting button click", () => {
    render(createVotingDialog(true), {container: global.document.querySelector("#portal")!});
    fireEvent.click(screen.getByTestId("voting-dialog__stop-button"));
    expect(storeDispatchSpy).toHaveBeenCalledWith(ActionFactory.editBoard({id: "test-board-id", voting: "disabled"}));
  });
});
