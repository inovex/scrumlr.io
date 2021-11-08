import {mapUserServerToClientModel, UserClientModel, UserServerModel} from "../user";

describe("User types", () => {
  test("mapVoteServerToClientModel", async () => {
    const serverModel: UserServerModel = {
      objectId: "test_objectId",
      displayName: "test_displayName",
      createdAt: new Date(1234),
      updatedAt: new Date(1234),
    };

    const clientModel: UserClientModel = mapUserServerToClientModel(serverModel, {admin: false, online: false});

    expect(clientModel.id).toEqual(serverModel.objectId);
    expect(clientModel.displayName).toEqual(serverModel.displayName);
    expect(clientModel.createdAt).toEqual(serverModel.createdAt);
    expect(clientModel.updatedAt).toEqual(serverModel.updatedAt);
    expect(clientModel.ready).toEqual(false);
    expect(clientModel.online).toEqual(false);
    expect(clientModel.admin).toEqual(false);
  });
});
