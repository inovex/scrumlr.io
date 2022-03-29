import {User} from "parse";
import {Provider} from "react-redux";
import configureStore from "redux-mock-store";
import {mocked} from "ts-jest/utils";
import {render} from "testUtils";
import {Participants} from "../Participants";

const mockStore = configureStore();
const mockedUser = mocked(User, true);

const createParticipants = (state: Record<string, unknown>) => {
  const store = mockStore(state);

  return (
    <Provider store={store}>
      <Participants />
    </Provider>
  );
};

describe("Participants", () => {
  beforeEach(() => {
    mockedUser.current = jest.fn(() => ({id: "testId"} as never));
  });

  test("should render filter and participants correctly", () => {
    const state = {
      users: {
        admins: [{id: "testId"}],
        all: [{id: "testId"}, {id: "testParticipant-1"}, {id: "testParticipant-1"}],
      },
      board: {
        data: {
          id: "test-id",
          moderation: {userId: "", status: "false"},
        },
      },
    };
    const {container} = render(createParticipants(state));
    expect(container.firstChild).toMatchSnapshot();
  });
});
