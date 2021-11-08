import {UsersState} from "types/store";
import {usersReducer} from "store/reducer/users";
import {ActionFactory} from "store/action";
import {UserClientModel} from "types/user";
import {User} from "parse";
import {mocked} from "ts-jest/utils";
import {BoardClientModel} from "../../../types/board";

jest.mock("parse");

const mockedUser = mocked(User, true);

const createUser = (id: string, name: string, admin: boolean, ready = false): UserClientModel => ({
  id,
  displayName: name,
  admin,
  createdAt: new Date(),
  updatedAt: new Date(),
  ready,
  online: true,
});

describe("users reducer", () => {
  let initialState: UsersState;

  beforeEach(() => {
    initialState = {
      admins: [],
      basic: [],
      all: [],
      usersMarkedReady: [],
    };
  });

  test("add admins", () => {
    const admin = createUser("1", "John Doe", true);
    const newState = usersReducer(initialState, ActionFactory.setUsers([admin], true));

    expect(newState.admins).toEqual([admin]);
    expect(newState.all).toEqual([admin]);
    expect(newState.basic).toEqual([]);
  });

  test("add basic", () => {
    const user = createUser("2", "Jane Doe", false);
    const newState = usersReducer(initialState, ActionFactory.setUsers([user], false));

    expect(newState.basic).toEqual([user]);
    expect(newState.all).toEqual([user]);
    expect(newState.admins).toEqual([]);
  });

  test("merge admins and basic users", () => {
    const admin = createUser("1", "John Doe", true);
    const user = createUser("2", "Jane Doe", false);

    const state1 = usersReducer(initialState, ActionFactory.setUsers([user], false));
    const state2 = usersReducer(state1, ActionFactory.setUsers([admin], true));

    expect(state2.admins).toEqual([admin]);
    expect(state2.basic).toEqual([user]);
    expect(state2.all).toContainEqual(admin);
    expect(state2.all).toContainEqual(user);
  });

  test("set user status correctly offline/online", () => {
    const user = createUser("1", "Jane Doe", false);

    const state1 = usersReducer(initialState, ActionFactory.setUsers([user], false));
    expect(state1.all.find((u) => u.id === user.id)?.online).toBe(true);

    const state2 = usersReducer(state1, ActionFactory.setUserStatus(user.id, false));
    expect(state2.all.find((u) => u.id === user.id)?.online).toBe(false);

    const state3 = usersReducer(state2, ActionFactory.setUserStatus(user.id, true));
    expect(state3.all.find((u) => u.id === user.id)?.online).toBe(true);
  });

  describe("readiness of users", () => {
    test("set user as ready", () => {
      mockedUser.current = jest.fn(() => ({id: "1"} as never));

      const user = createUser("1", "John Doe", false, false);
      const state1 = usersReducer(initialState, ActionFactory.setUsers([user], false));
      expect(state1.usersMarkedReady).toHaveLength(0);

      const state2 = usersReducer(state1, ActionFactory.setUserReadyStatus(true));
      expect(state2.usersMarkedReady).toHaveLength(1);
      expect(state2.all[0].ready).toBeTruthy();
    });

    test("updated board will update ready status of users", () => {
      const user = createUser("1", "John Doe", false, false);

      const state1 = usersReducer(initialState, ActionFactory.setUsers([user], false));
      expect(state1.usersMarkedReady).toHaveLength(0);

      const state2 = usersReducer(
        state1,
        ActionFactory.updatedBoard({
          usersMarkedReady: ["1"],
        } as BoardClientModel)
      );
      expect(state2.usersMarkedReady).toHaveLength(1);
      expect(state2.all[0].ready).toBeTruthy();
    });
  });
});
