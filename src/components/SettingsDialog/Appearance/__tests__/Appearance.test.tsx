import {User} from "parse";
import {Provider} from "react-redux";
import configureStore from "redux-mock-store";
import {mocked} from "ts-jest/utils";
import {render} from "testUtils";
import {Appearance} from "../Appearance";

const mockStore = configureStore();
const mockedUser = mocked(User, true);

const createAppearance = (state: Record<string, unknown>) => {
  const store = mockStore(state);

  return (
    <Provider store={store}>
      <Appearance />
    </Provider>
  );
};

describe("Appearance", () => {
  beforeEach(() => {
    mockedUser.current = jest.fn(() => ({id: "testId"} as never));
  });

  test("should render all Settings correctly", () => {
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
    const {container} = render(createAppearance(state));
    expect(container.firstChild).toMatchSnapshot();
  });
});
