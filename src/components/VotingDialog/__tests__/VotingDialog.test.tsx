import {fireEvent, render, screen} from "@testing-library/react";
import configureStore from "redux-mock-store";
import {mocked} from "ts-jest/utils";
import {User} from "parse";
import {Provider} from "react-redux";
import {BrowserRouter} from "react-router-dom";
import {VotingDialog} from "..";

const mockedUsedNavigate = jest.fn();

jest.mock("react-router-dom", () => ({
  ...(jest.requireActual("react-router-dom") as any),
  useNavigate: () => mockedUsedNavigate,
}));

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

  it("should redirect on close button click", () => {
    render(createVotingDialog(true), {container: global.document.querySelector("#portal")!});
    fireEvent.click(screen.getByTestId("dialog__close-button"));
    expect(mockedUsedNavigate).toHaveBeenCalledWith("..");
  });

  it("should redirect if the current user isn't a moderator", () => {
    mockedUser.current = jest.fn(() => ({id: "something-else"} as never));
    render(createVotingDialog(true), {container: global.document.querySelector("#portal")!});
    expect(mockedUsedNavigate).toHaveBeenCalledWith("..");
  });
});
