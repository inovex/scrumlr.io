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
  },
}));

describe("users middleware", () => {
  test("edit user configurations", () => {
    passUsersMiddleware(
      stateAPI as MiddlewareAPI,
      jest.fn(),
      ActionFactory.editUserConfiguration({
        userConfiguration: {
          showHiddenColumns: true,
        },
      })
    );
    expect(API.editUserConfiguration).toHaveBeenCalledWith("boardId", {
      userConfiguration: {
        showHiddenColumns: true,
      },
    });
  });
});
