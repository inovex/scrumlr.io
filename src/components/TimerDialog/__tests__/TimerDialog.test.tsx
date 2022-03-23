import {fireEvent, render, screen} from "@testing-library/react";
import configureStore from "redux-mock-store";
import {mocked} from "ts-jest/utils";
import {User} from "parse";
import {Provider} from "react-redux";
import {BrowserRouter} from "react-router-dom";
import store from "store";
import {ActionFactory} from "store/action";
import {TimerDialog} from "..";

const mockedUsedNavigate = jest.fn();
const storeDispatchSpy = jest.spyOn(store, "dispatch");

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockedUsedNavigate,
}));

const mockStore = configureStore();
const mockedUser = mocked(User, true);

jest.useFakeTimers("modern").setSystemTime(new Date(123456789).getTime());

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

  it("should redirect if the current user isn't a moderator", () => {
    mockedUser.current = jest.fn(() => ({id: "something-else"} as never));
    render(createTimerDialog(), {container: global.document.querySelector("#portal")!});
    expect(mockedUsedNavigate).toHaveBeenCalledWith("..");
  });

  it("should dispatch to store correctly on one minute button click", () => {
    render(createTimerDialog(), {container: global.document.querySelector("#portal")!});
    fireEvent.click(screen.getByTestId("timer-dialog__1-minute-button"));
    expect(storeDispatchSpy).toHaveBeenCalledWith(ActionFactory.setTimer(new Date(new Date(123456789).getTime() + 1 * 60 * 1000)));
  });

  it("should dispatch to store correctly on three minute button click", () => {
    render(createTimerDialog(), {container: global.document.querySelector("#portal")!});
    fireEvent.click(screen.getByTestId("timer-dialog__3-minute-button"));
    expect(storeDispatchSpy).toHaveBeenCalledWith(ActionFactory.setTimer(new Date(new Date(123456789).getTime() + 3 * 60 * 1000)));
  });

  it("should dispatch to store correctly on five minute button click", () => {
    render(createTimerDialog(), {container: global.document.querySelector("#portal")!});
    fireEvent.click(screen.getByTestId("timer-dialog__5-minute-button"));
    expect(storeDispatchSpy).toHaveBeenCalledWith(ActionFactory.setTimer(new Date(new Date(123456789).getTime() + 5 * 60 * 1000)));
  });

  it("should dispatch to store correctly after custom time change", () => {
    render(createTimerDialog(), {container: global.document.querySelector("#portal")!});
    fireEvent.click(screen.getByTestId("timer-dialog__minus-button"));
    fireEvent.click(screen.getByTestId("timer-dialog__custom-minute-button"));
    expect(storeDispatchSpy).toHaveBeenCalledWith(ActionFactory.setTimer(new Date(new Date(123456789).getTime() + 9 * 60 * 1000)));
    fireEvent.click(screen.getByTestId("timer-dialog__plus-button"));
    fireEvent.click(screen.getByTestId("timer-dialog__plus-button"));
    fireEvent.click(screen.getByTestId("timer-dialog__custom-minute-button"));
    expect(storeDispatchSpy).toHaveBeenCalledWith(ActionFactory.setTimer(new Date(new Date(123456789).getTime() + 11 * 60 * 1000)));
  });
});
