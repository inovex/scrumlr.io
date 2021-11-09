import {mapVoteServerToClientModel, VoteClientModel, VoteServerModel} from "../vote";

describe("Vote types", () => {
  test("mapVoteServerToClientModel", async () => {
    const map = {
      board: {id: "5"} as unknown as Parse.Object,
      note: {id: "5"} as unknown as Parse.Object,
      user: {id: "5"} as unknown as Parse.Object,
      votingIteration: 0,
    };

    const serverModel = {
      id: "test_id",
      get: (s: string) => map[s],
    } as unknown as VoteServerModel;

    const clientModel: VoteClientModel = mapVoteServerToClientModel(serverModel);

    expect(clientModel.id).toEqual(serverModel.id);
    expect(clientModel.board).toEqual(serverModel.get("board").id);
    expect(clientModel.note).toEqual(serverModel.get("note").id);
    expect(clientModel.user).toEqual(serverModel.get("user").id);
    expect(clientModel.votingIteration).toEqual(serverModel.get("votingIteration"));
  });
});
