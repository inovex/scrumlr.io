import {API} from "api";
import {passJoinRequestMiddleware} from "../joinRequest";
import {ActionFactory} from "../../action";

jest.mock("api", () => ({
    API: {
      acceptJoinRequest: jest.fn(),
      rejectJoinRequest: jest.fn(),
      acceptAllPendingJoinRequests: jest.fn(),
      rejectAllPendingJoinRequests: jest.fn(),
    },
  }));

beforeEach(() => {
  (API.acceptJoinRequest as jest.Mock).mockClear();
  (API.rejectJoinRequest as jest.Mock).mockClear();
  (API.acceptAllPendingJoinRequests as jest.Mock).mockClear();
  (API.rejectAllPendingJoinRequests as jest.Mock).mockClear();
});

describe("joinRequest middleware", () => {
  test("acceptJoinRequest", () => {
    passJoinRequestMiddleware(undefined as any, jest.fn(), ActionFactory.acceptJoinRequest("id", "boardId", "userId"));
    expect(API.acceptJoinRequest).toHaveBeenCalledWith("boardId", "userId");
  });

  test("rejectJoinRequest", () => {
    passJoinRequestMiddleware(undefined as any, jest.fn(), ActionFactory.rejectJoinRequest("id", "boardId", "userId"));
    expect(API.rejectJoinRequest).toHaveBeenCalledWith("boardId", "userId");
  });

  test("acceptAllPendingJoinRequests", () => {
    passJoinRequestMiddleware(undefined as any, jest.fn(), ActionFactory.acceptAllPendingJoinRequests("boardId"));
    expect(API.acceptAllPendingJoinRequests).toHaveBeenCalledWith("boardId");
  });

  test("rejectAllPendingJoinRequests", () => {
    passJoinRequestMiddleware(undefined as any, jest.fn(), ActionFactory.rejectAllPendingJoinRequests("boardId"));
    expect(API.rejectAllPendingJoinRequests).toHaveBeenCalledWith("boardId");
  });
});
