import {ParticipantsState} from "types/store";
import {usersReducer} from "store/reducer/participants";
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
  raisedHand: false,
});

describe("users reducer", () => {
  let initialState: ParticipantsState;

  beforeEach(() => {
    initialState = {
      moderators: [],
      basic: [],
      participants: [],
      ready: [],
      raisedHands: [],
    };
  });

  test("add admins", () => {
    const admin = createUser("1", "John Doe", true);
    const newState = usersReducer(initialState, ActionFactory.setParticipants([admin], true));

    expect(newState.moderators).toEqual([admin]);
    expect(newState.participants).toEqual([admin]);
    expect(newState.basic).toEqual([]);
  });

  test("add basic", () => {
    const user = createUser("2", "Jane Doe", false);
    const newState = usersReducer(initialState, ActionFactory.setParticipants([user], false));

    expect(newState.basic).toEqual([user]);
    expect(newState.participants).toEqual([user]);
    expect(newState.moderators).toEqual([]);
  });

  test("merge admins and basic users", () => {
    const admin = createUser("1", "John Doe", true);
    const user = createUser("2", "Jane Doe", false);

    const state1 = usersReducer(initialState, ActionFactory.setParticipants([user], false));
    const state2 = usersReducer(state1, ActionFactory.setParticipants([admin], true));

    expect(state2.moderators).toEqual([admin]);
    expect(state2.basic).toEqual([user]);
    expect(state2.participants).toContainEqual(admin);
    expect(state2.participants).toContainEqual(user);
  });

  test("set user status correctly offline/online", () => {
    const user = createUser("1", "Jane Doe", false);

    const state1 = usersReducer(initialState, ActionFactory.setParticipants([user], false));
    expect(state1.participants.find((u) => u.id === user.id)?.online).toBe(true);

    const state2 = usersReducer(state1, ActionFactory.setUserStatus(user.id, false));
    expect(state2.participants.find((u) => u.id === user.id)?.online).toBe(false);

    const state3 = usersReducer(state2, ActionFactory.setUserStatus(user.id, true));
    expect(state3.participants.find((u) => u.id === user.id)?.online).toBe(true);
  });

  describe("readiness of users", () => {
    test("set user as ready", () => {
      mockedUser.current = jest.fn(() => ({id: "1"} as never));

      const user = createUser("1", "John Doe", false, false);
      const state1 = usersReducer(initialState, ActionFactory.setParticipants([user], false));
      expect(state1.ready).toHaveLength(0);

      const state2 = usersReducer(state1, ActionFactory.setUserReadyStatus(true));
      expect(state2.ready).toHaveLength(1);
      expect(state2.participants[0].ready).toBeTruthy();
    });

    test("updated board will update ready status of users", () => {
      const user = createUser("1", "John Doe", false, false);

      const state1 = usersReducer(initialState, ActionFactory.setParticipants([user], false));
      expect(state1.ready).toHaveLength(0);

      const state2 = usersReducer(
        state1,
        ActionFactory.updatedBoard({
          usersMarkedReady: ["1"],
        } as BoardClientModel)
      );
      expect(state2.ready).toHaveLength(1);
      expect(state2.participants[0].ready).toBeTruthy();
    });
  });
});
