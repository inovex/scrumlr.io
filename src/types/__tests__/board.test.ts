import {mocked} from "ts-jest/utils";
import {getBrowserServerTimeDifference} from "utils/timer";
import {mapBoardServerToClientModel, BoardServerModel, BoardClientModel} from "../board";

jest.mock("utils/timer");

const mockedTimer = mocked(getBrowserServerTimeDifference);

const testWrapper = async (timerUTCEndTimeNotNull: boolean) => {
  mockedTimer.mockImplementation(() => 0);

  const serverModel: BoardServerModel = {
    objectId: "test_objectId",
    name: "test_name",
    columns: {
      "test_id": {
        name: "test_name",
        color: "backlog-blue",
        hidden: false,
      },
    },
    userConfigurations: {
      "test_id": {
        showHiddenColumns: true,
      },
    },
    accessCode: "test_accessCode",
    accessPolicy: {
      type: "Public",
      salt: "test_salt",
      passphrase: "test_passphrase",
    },
    encryptedContent: false,
    showAuthors: false,
    timerUTCEndTime: timerUTCEndTimeNotNull
      ? {
          iso: new Date(0).toString(),
        }
      : null,
    voting: "active",
    moderation: {
      userId: "test_userId",
      status: "active",
    },
    votingIteration: 0,
    showNotesOfOtherUsers: false,
    createdAt: new Date(1234).toUTCString(),
    updatedAt: new Date(1234).toUTCString(),
    owner: {
      objectId: "test_objectId",
    },
    usersMarkedReady: [],
  };

  const clientModel: BoardClientModel = await mapBoardServerToClientModel(serverModel);

  expect(clientModel.id).toEqual(serverModel.objectId);
  expect(clientModel.name).toEqual(serverModel.name);
  expect(clientModel.columns).toEqual([{columnId: "test_id", name: "test_name", color: "backlog-blue", hidden: false}]);
  expect(clientModel.userConfigurations).toEqual([{id: "test_id", showHiddenColumns: true}]);
  expect(clientModel.accessCode).toEqual(serverModel.accessCode);
  expect(clientModel.accessPolicy).toEqual(serverModel.accessPolicy.type);
  expect(clientModel.encryptedContent).toEqual(serverModel.encryptedContent);
  expect(clientModel.voting).toEqual(serverModel.voting);
  expect(clientModel.votingIteration).toEqual(serverModel.votingIteration);
  expect(clientModel.showNotesOfOtherUsers).toEqual(serverModel.showNotesOfOtherUsers);
  expect(clientModel.createdAt).toEqual(new Date(serverModel.createdAt));
  expect(clientModel.updatedAt).toEqual(new Date(serverModel.updatedAt));
  expect(clientModel.dirty).toEqual(false);
  expect(clientModel.owner).toEqual(serverModel.owner.objectId);
  expect(clientModel.moderation).toEqual(serverModel.moderation);
  expect(clientModel.usersMarkedReady).toEqual(serverModel.usersMarkedReady);
  if (serverModel.timerUTCEndTime == null) {
    expect(clientModel.timerUTCEndTime).toEqual(undefined);
  } else {
    expect(clientModel.timerUTCEndTime).toEqual(new Date(0));
  }
};

describe("Board types", () => {
  test("timerUTCEndTime is available", async () => {
    await testWrapper(true);
  });

  test("timerUTCEndTime isn't available", async () => {
    await testWrapper(false);
  });
});
