import {render} from "@testing-library/react";
import configureStore from "redux-mock-store";
import {mocked} from "ts-jest/utils";
import {User} from "parse";
import {Provider} from "react-redux";
import {BrowserRouter} from "react-router-dom";
import {TimerDialog} from "..";

describe("TimerDialog", () => {
  const mockStore = configureStore();
  const mockedUser = mocked(User, true);

  const createTimerDialog = () => {
    const initialState = {
      board: {
        data: {
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
          <TimerDialog />
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

  it("should match the snapshot", () => {
    const {container} = render(createTimerDialog(), {container: global.document.querySelector("#portal")!});
    expect(container.firstChild).toMatchSnapshot();
  });
});
