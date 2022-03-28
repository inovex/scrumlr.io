import {User} from "parse";
import {Provider} from "react-redux";
import configureStore from "redux-mock-store";
import {mocked} from "ts-jest/utils";
import {render} from "testUtils";
import {BoardSettings} from "../BoardSettings";

const mockStore = configureStore();
const mockedUser = mocked(User, true);

const createBoardSettings = (state: Record<string, unknown>) => {
  const store = mockStore(state);

  return (
    <Provider store={store}>
      <BoardSettings />
    </Provider>
  );
};

describe("BoardSettings", () => {
  beforeEach(() => {
    mockedUser.current = jest.fn(() => ({id: "testId"} as never));
  });

  test("should render all Settings for moderators", () => {
    const state = {
      users: {
        admins: [{id: "testId"}],
        all: [{id: "testId"}],
      },
      board: {
        data: {
          id: "test-id",
          moderation: {userId: "", status: "false"},
          name: "test-name",
          userConfigurations: [{id: "testId", showHiddenColumns: true}],
        },
      },
    };
    const {container} = render(createBoardSettings(state));
    expect(container.firstChild).toMatchSnapshot();
  });

  test("should only render BoardName and AccessPolicy for participants", () => {
    const state = {
      users: {
        admins: [],
        all: [],
      },
      board: {
        data: {
          id: "test-id",
          moderation: {userId: "", status: "active"},
          name: "test-name",
          userConfigurations: [{id: "test-config", showHiddenColumns: true}],
        },
      },
    };
    const {container} = render(createBoardSettings(state));
    expect(container.firstChild).toMatchSnapshot();
  });
});
