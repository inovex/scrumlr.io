import {fireEvent, render, screen} from "@testing-library/react";
import {Provider} from "react-redux";
import {BrowserRouter as Router} from "react-router-dom";
import store from "store";
import {Actions} from "store/action";
import getTestStore from "utils/test/getTestStore";
import getTestParticipant from "utils/test/getTestParticipant";
import {TimerDialog} from "..";

const mockedUsedNavigate = jest.fn();
const storeDispatchSpy = jest.spyOn(store, "dispatch");

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockedUsedNavigate,
}));

jest.useFakeTimers("modern").setSystemTime(new Date(123456789).getTime());

const createTimerDialog = (isParticipant?: boolean) => (
  <Router>
    <Provider store={getTestStore({participants: {self: getTestParticipant({role: isParticipant ? "PARTICIPANT" : "MODERATOR"}), others: []}})}>
      <TimerDialog />
    </Provider>
  </Router>
);

describe("TimerDialog", () => {
  beforeEach(() => {
    const portal = global.document.createElement("div");
    portal.setAttribute("id", "portal");
    global.document.querySelector("body")?.appendChild(portal);
  });

  it("should match the snapshot", () => {
    const {container} = render(createTimerDialog(), {container: global.document.querySelector("#portal")!});
    expect(container.firstChild).toMatchSnapshot();
  });

  it("should redirect if the current user isn't a moderator", () => {
    render(createTimerDialog(true), {container: global.document.querySelector("#portal")!});
    expect(mockedUsedNavigate).toHaveBeenCalledWith("..");
  });

  it("should dispatch to store correctly on one minute button click", () => {
    render(createTimerDialog(), {container: global.document.querySelector("#portal")!});
    fireEvent.click(screen.getByTestId("timer-dialog__1-minute-button"));
    expect(storeDispatchSpy).toHaveBeenCalledWith(Actions.setTimer(1));
  });

  it("should dispatch to store correctly on three minute button click", () => {
    render(createTimerDialog(), {container: global.document.querySelector("#portal")!});
    fireEvent.click(screen.getByTestId("timer-dialog__3-minute-button"));
    expect(storeDispatchSpy).toHaveBeenCalledWith(Actions.setTimer(3));
  });

  it("should dispatch to store correctly on five minute button click", () => {
    render(createTimerDialog(), {container: global.document.querySelector("#portal")!});
    fireEvent.click(screen.getByTestId("timer-dialog__5-minute-button"));
    expect(storeDispatchSpy).toHaveBeenCalledWith(Actions.setTimer(5));
  });

  it("should dispatch to store correctly after custom time change", () => {
    render(createTimerDialog(), {container: global.document.querySelector("#portal")!});
    fireEvent.click(screen.getByTestId("timer-dialog__minus-button"));
    fireEvent.click(screen.getByTestId("timer-dialog__custom-minute-button"));
    expect(storeDispatchSpy).toHaveBeenCalledWith(Actions.setTimer(9));
    fireEvent.click(screen.getByTestId("timer-dialog__plus-button"));
    fireEvent.click(screen.getByTestId("timer-dialog__plus-button"));
    fireEvent.click(screen.getByTestId("timer-dialog__custom-minute-button"));
    expect(storeDispatchSpy).toHaveBeenCalledWith(Actions.setTimer(11));
  });
});
