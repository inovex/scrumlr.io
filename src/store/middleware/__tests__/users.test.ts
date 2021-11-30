import {ActionFactory} from "store/action";
import {API} from "api";
import {MiddlewareAPI} from "redux";
import {passUsersMiddleware} from "store/middleware/users";
import {Toast} from "utils/Toast";
import {BoardClientModel} from "types/board";
import {User} from "parse";
import {mocked} from "ts-jest/utils";

const stateAPI = {
  getState: () => ({
    board: {
      data: {
        id: "boardId",
      },
    },
    users: {
      all: [
        {
          id: "1",
          displayName: "Positive Penguin",
          admin: true,
          createdAt: new Date(),
          updatedAt: new Date(),
          ready: false,
          online: true,
        },
        {
          id: "2",
          displayName: "Great Goose",
          admin: false,
          createdAt: new Date(),
          updatedAt: new Date(),
          ready: true,
          online: true,
        },
      ],
    },
  }),
};

jest.mock("parse");
jest.mock("api", () => ({
  API: {
    editUserConfiguration: jest.fn(),
    setReadyStatus: jest.fn(),
    setRaisedHandStatus: jest.fn(),
  },
}));

const mockedUser = mocked(User, true);

describe("users middleware", () => {
  test("edit user configurations", () => {
    passUsersMiddleware(
      stateAPI as MiddlewareAPI,
      jest.fn(),
      ActionFactory.editUserConfiguration({
        showHiddenColumns: true,
      })
    );
    expect(API.editUserConfiguration).toHaveBeenCalledWith("boardId", {
      showHiddenColumns: true,
    });
  });

  test("set user ready status", () => {
    passUsersMiddleware(stateAPI as MiddlewareAPI, jest.fn(), ActionFactory.setUserReadyStatus(true));
    expect(API.setReadyStatus).toHaveBeenCalledWith("boardId", true);
  });

  test("set raised hand status", () => {
    passUsersMiddleware(stateAPI as MiddlewareAPI, jest.fn(), ActionFactory.setRaisedHandStatus({userId: [], raisedHand: false}));
    expect(API.setRaisedHandStatus).toHaveBeenCalledWith("boardId", {userId: [], raisedHand: false});
  });

  test("last unready user gets hurry-up notification", () => {
    const spy = jest.spyOn(Toast, "error");

    mockedUser.current = jest.fn(() => ({id: "1"} as never));

    passUsersMiddleware(stateAPI as MiddlewareAPI, jest.fn(), ActionFactory.updatedBoard({} as BoardClientModel));
    expect(spy).toHaveBeenCalled();
  });
});
