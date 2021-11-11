import {render} from "testUtils";
import {MenuBars} from "components/MenuBars";
import {User} from "parse";
import {Provider} from "react-redux";
import configureStore from "redux-mock-store";
import {mocked} from "ts-jest/utils";

const mockStore = configureStore();
const mockedUser = mocked(User, true);

const createMenuBars = (state: Record<string, unknown>) => {
  const store = mockStore(state);

  return (
    <Provider store={store}>
      <MenuBars />
    </Provider>
  );
};

describe("Menu", () => {
  beforeEach(() => {
    mockedUser.current = jest.fn(() => ({id: "testId"} as never));
  });

  test("should render both add- and settings-menu for moderators", () => {
    const state = {
      users: {
        admins: [{id: "testId"}],
        all: [{id: "testId"}],
      },
      board: {
        data: {
          id: "test-id",
          moderation: {userId: "", status: "false"},
        },
      },
    };
    const {container} = render(createMenuBars(state));
    expect(container.firstChild).toMatchSnapshot();
  });

  test("should only render add-menu for participants", () => {
    const state = {
      users: {
        admins: [],
        all: [],
      },
      board: {
        data: {
          id: "test-id",
          moderation: {userId: "", status: "active"},
        },
      },
    };
    const {container} = render(createMenuBars(state));
    expect(container.firstChild).toMatchSnapshot();
  });
});
