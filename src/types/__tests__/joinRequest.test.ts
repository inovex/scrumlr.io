import {mapJoinRequestServerToClientModel, JoinRequestClientModel, JoinRequestServerModel} from "../joinRequest";

describe("JoinRequest types", () => {
  test("mapJoinRequestServerToClientModel", async () => {
    const mapUser = {
      displayName: "test_displayName",
    };

    const map = {
      user: {
        id: "5",
        get: (s: string) => mapUser[s],
      } as unknown as Parse.Object,
      board: {id: "5"} as unknown as Parse.Object,
      status: "pending",
    };

    const serverModel = {
      id: "5",
      get: (s: string) => map[s],
    } as unknown as JoinRequestServerModel;

    const clientModel: JoinRequestClientModel = mapJoinRequestServerToClientModel(serverModel);

    expect(clientModel.id).toEqual(serverModel.id);
    expect(clientModel.userId).toEqual(serverModel.get("user").id);
    expect(clientModel.boardId).toEqual(serverModel.get("board").id);
    expect(clientModel.status).toEqual(serverModel.get("status"));
    expect(clientModel.displayName).toEqual(serverModel.get("user").get("displayName"));
  });
});
