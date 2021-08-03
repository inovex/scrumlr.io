import {JoinRequestClientModel} from "types/joinRequest";
import {joinRequestReducer} from "store/reducer/joinRequest";
import {ActionFactory} from "store/action";

const createJoinRequest = (id: string): JoinRequestClientModel => ({
  id,
  boardId: "boardId",
  userId: "userId",
  status: "accepted",
  displayName: "displayName",
});

describe("joinRequest reducer", () => {
  let initialState: JoinRequestClientModel[];

  beforeEach(() => {
    initialState = [createJoinRequest("1"), createJoinRequest("2")];
  });

  test("createJoinRequest", () => {
    const joinRequest = createJoinRequest("3");
    const newState = joinRequestReducer(initialState, ActionFactory.createJoinRequest(joinRequest));
    expect(newState.length).toEqual(3);

    const newJoinRequest = newState.find((jr) => jr.id === "3");
    expect(newJoinRequest?.boardId).toEqual("boardId");
    expect(newJoinRequest?.userId).toEqual("userId");
    expect(newJoinRequest?.status).toEqual("accepted");
  });

  test("updateJoinRequest", () => {
    const updatedJoinRequest = createJoinRequest("1");
    updatedJoinRequest.status = "rejected";
    const newState = joinRequestReducer(initialState, ActionFactory.updateJoinRequest(updatedJoinRequest));
    expect(newState.map((joinRequest) => joinRequest.status)).toEqual(["rejected", "accepted"]);
  });

  test("initializeJoinRequests", () => {
    const state = joinRequestReducer([], ActionFactory.initializeJoinRequests(initialState));
    expect(state).toEqual(initialState);
  });
});
