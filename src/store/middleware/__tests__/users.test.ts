import {ActionFactory} from "store/action";
import {API} from "api";
import {MiddlewareAPI} from "redux";
import {passUsersMiddleware} from "store/middleware/users";

const stateAPI = {
  getState: () => ({
    board: {
      data: {
        id: "boardId",
      },
    },
  }),
};

jest.mock("api", () => ({
  API: {
    editUserConfiguration: jest.fn(),
    setReadyStatus: jest.fn(),
  },
}));

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
});
