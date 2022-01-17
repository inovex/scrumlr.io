import {Provider} from "react-redux";
import {render} from "testUtils";
import configureStore from "redux-mock-store";
import {User} from "parse";
import {mocked} from "ts-jest/utils";
import {SettingsDialog} from "..";

const mockStore = configureStore();
const mockedUser = mocked(User, true);
mockedUser.current = jest.fn(() => ({id: "test-id"} as never));

const initialState = {
  board: {
    data: {
      id: "boardId",
    },
  },
  users: {
    all: [
      {
        id: "test-id",
        displayName: "Max Mustermann",
      },
    ],
  },
};

const createSettingsDialog = () => {
  const mockedStore = mockStore(initialState);
  return (
    <Provider store={mockedStore}>
      <SettingsDialog />
    </Provider>
  );
};

describe("SettingsDialog", () => {
  beforeEach(() => {
    mockedUser.current = jest.fn(() => ({id: "test-id"} as never));
    const portal = global.document.createElement("div");
    portal.setAttribute("id", "portal");
    global.document.querySelector("body")!.appendChild(portal);
  });

  test("should render correctly", () => {
    const {container} = render(createSettingsDialog(), {container: global.document.querySelector("#portal")!});
    expect(container).toMatchSnapshot();
  });
});
