import {fireEvent, render, screen} from "@testing-library/react";
import configureStore from "redux-mock-store";
import {mocked} from "ts-jest/utils";
import {User} from "parse";
import {Provider} from "react-redux";
import {BrowserRouter} from "react-router-dom";
import store from "store";
import {TimerDialog} from "..";

const mockedUsedNavigate = jest.fn();
const storeDispatchSpy = jest.spyOn(store, "dispatch");

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockedUsedNavigate,
}));

const mockStore = configureStore();
const mockedUser = mocked(User, true);

const createTimerDialog = () => {
  const initialState = {
    users: {
      admins: [{id: "test-id"}],
    },
  };
  const mockedStore = mockStore(initialState);
  return (
    <BrowserRouter>
      <Provider store={mockedStore}>
        <TimerDialog />
      </Provider>
    </BrowserRouter>
  );
};

describe("TimerDialog", () => {
  beforeEach(() => {
    mockedUser.current = jest.fn(() => ({id: "test"} as never));
    const portal = global.document.createElement("div");
    portal.setAttribute("id", "portal");
    global.document.querySelector("body")!.appendChild(portal);
  });

  it("should match the snapshot", () => {
    const {container} = render(createTimerDialog(), {container: global.document.querySelector("#portal")!});
    expect(container.firstChild).toMatchSnapshot();
  });

  it("should redirect on close button click", () => {
    render(createTimerDialog(), {container: global.document.querySelector("#portal")!});
    fireEvent.click(screen.getByTestId("dialog__close-button"));
    expect(mockedUsedNavigate).toHaveBeenCalledWith("..");
  });

  it("should redirect if the current user isn't a moderator", () => {
    mockedUser.current = jest.fn(() => ({id: "something-else"} as never));
    render(createTimerDialog(), {container: global.document.querySelector("#portal")!});
    expect(mockedUsedNavigate).toHaveBeenCalledWith("..");
  });

  it("should dispatch to store on button click", () => {
    render(createTimerDialog(), {container: global.document.querySelector("#portal")!});
    fireEvent.click(screen.getByTestId("timer-dialog__1-minute-button"));
    fireEvent.click(screen.getByTestId("timer-dialog__3-minute-button"));
    fireEvent.click(screen.getByTestId("timer-dialog__5-minute-button"));
    fireEvent.click(screen.getByTestId("timer-dialog__custom-minute-button"));
    expect(storeDispatchSpy).toHaveBeenCalledTimes(4);
  });
});
