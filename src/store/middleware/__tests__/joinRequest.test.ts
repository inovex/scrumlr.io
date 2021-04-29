import {API} from "api";
import {passJoinRequestMiddleware} from "../joinRequest";
import {ActionFactory} from "../../action";

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
    passJoinRequestMiddleware(undefined as any, jest.fn(), ActionFactory.acceptJoinRequests("boardId", ["userId"]));
    expect(API.acceptJoinRequests).toHaveBeenCalledWith("boardId", ["userId"]);
  });

  test("rejectJoinRequest", () => {
    passJoinRequestMiddleware(undefined as any, jest.fn(), ActionFactory.rejectJoinRequests("boardId", ["userId"]));
    expect(API.rejectJoinRequests).toHaveBeenCalledWith("boardId", ["userId"]);
  });
});
