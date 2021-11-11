import {render} from "@testing-library/react";
import configureStore from "redux-mock-store";
import {Provider} from "react-redux";
import {BoardUsers} from "components/BoardUsers";
import {User} from "parse";
import {getRandomName} from "constants/name";
import {ApplicationState, BoardStatus} from "types/store";
import {mocked} from "ts-jest/utils";
import {UserClientModel} from "types/user";

const mockStore = configureStore();
const mockedUser = mocked(User, true);

const createBoardUsers = (state: ApplicationState) => {
  const store = mockStore(state);

  return (
    <Provider store={store}>
      <BoardUsers />
    </Provider>
  );
};

describe("users", () => {
  beforeEach(() => {
    mockedUser.current = jest.fn(() => ({id: "@_online"} as never));
  });

  const currentUser = {
    id: "@_online",
    displayName: "Admin Mustermann",
    admin: true,
    online: true,
    createdAt: new Date(1234567),
    updatedAt: new Date(1234567),
    ready: false,
  };

  const otherOnlineUsers = [...new Array(9)].map((_, i) => ({
    id: `${i}_online`,
    displayName: getRandomName(),
    admin: i % 2 === 0,
    online: true,
    createdAt: new Date(1234567),
    updatedAt: new Date(1234567),
    ready: false,
  }));

  const adminWithOtherOnlineUsers = [currentUser, ...otherOnlineUsers];

  const offlineUsers = [...new Array(10)].map((_, i) => ({
    id: `${i}_offline`,
    displayName: getRandomName(),
    admin: i % 2 !== 0,
    online: false,
    createdAt: new Date(1234567),
    updatedAt: new Date(1234567),
    ready: false,
  }));

  const getDefaultState = (first: UserClientModel[], second: UserClientModel[]) => ({
    users: {
      all: [...first, ...second],
      usersMarkedReady: [],
      admins: [],
      basic: [],
    },
    board: {status: "unknown" as BoardStatus},
    notes: [],
    votes: [],
    voteConfiguration: {
      boardId: "test-board",
      votingIteration: 1,
      voteLimit: 5,
      allowMultipleVotesPerNote: false,
      showVotesOfOtherUsers: false,
    },
    joinRequests: [],
  });

  test("only online users are shown & their names are used as tooltips", () => {
    const state = getDefaultState(offlineUsers, adminWithOtherOnlineUsers);

    const {container} = render(createBoardUsers(state));

    const renderdUsersnames = Array.from(container.querySelectorAll(".user-avatar"))
      .map((ui) => ui.getAttribute("title"))
      .join(":");
    const onlineUsernames = [...otherOnlineUsers.slice(0, 3), currentUser].map((u) => u.displayName).join(":");
    expect(renderdUsersnames).toBe(onlineUsernames);
  });

  test("correct number of online users & count of rest users", () => {
    // 4 online users -> display 4
    const state = getDefaultState(offlineUsers, adminWithOtherOnlineUsers.slice(0, 4));

    const boardUsers = render(createBoardUsers(state));
    expect(boardUsers.container.querySelectorAll(".user-avatar")).toHaveLength(4);

    // 5 online users -> display 5
    const newState1 = getDefaultState(offlineUsers, adminWithOtherOnlineUsers.slice(0, 5));
    const newBoardUsers1 = render(createBoardUsers(newState1));
    expect(newBoardUsers1.container.querySelectorAll(".user-avatar")).toHaveLength(5);

    // 6 online users -> display 4 & rest user count of 2
    const newState2 = getDefaultState(offlineUsers, adminWithOtherOnlineUsers.slice(0, 6));
    const newBoardUsers2 = render(createBoardUsers(newState2));
    expect(newBoardUsers2.container.querySelectorAll(".user-avatar")).toHaveLength(4);
    expect(newBoardUsers2.container.querySelector(".rest-users__count")).toHaveTextContent("2");
  });
});
