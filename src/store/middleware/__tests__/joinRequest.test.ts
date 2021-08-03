import {API} from "api";
import {passJoinRequestMiddleware} from "store/middleware/joinRequest";
import {ActionFactory} from "store/action";
import {MiddlewareAPI} from "redux";

jest.mock("api", () => ({
  API: {
    acceptJoinRequests: jest.fn(),
    rejectJoinRequests: jest.fn(),
  },
}));

beforeEach(() => {
  (API.acceptJoinRequests as jest.Mock).mockClear();
  (API.rejectJoinRequests as jest.Mock).mockClear();
});

describe("joinRequest middleware", () => {
  test("acceptJoinRequest", () => {
    passJoinRequestMiddleware({} as MiddlewareAPI, jest.fn(), ActionFactory.acceptJoinRequests("boardId", ["userId"]));
    expect(API.acceptJoinRequests).toHaveBeenCalledWith("boardId", ["userId"]);
  });

  test("rejectJoinRequest", () => {
    passJoinRequestMiddleware({} as MiddlewareAPI, jest.fn(), ActionFactory.rejectJoinRequests("boardId", ["userId"]));
    expect(API.rejectJoinRequests).toHaveBeenCalledWith("boardId", ["userId"]);
  });
});
