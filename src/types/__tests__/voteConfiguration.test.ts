import {mapVoteConfigurationServerToClientModel, VoteConfigurationServerModel, VoteConfigurationClientModel} from "../voteConfiguration";

describe("VoteConfiguration types", () => {
  test("mapVoteConfigurationServerToClientModel", async () => {
    const map = {
      board: {id: "5"} as unknown as Parse.Object,
      votingIteration: 0,
      voteLimit: 0,
      allowMultipleVotesPerNote: false,
      showVotesOfOtherUsers: false,
    };

    const serverModel = {
      get: (s: string) => map[s],
    } as unknown as VoteConfigurationServerModel;

    const clientModel: VoteConfigurationClientModel = mapVoteConfigurationServerToClientModel(serverModel);

    expect(clientModel.boardId).toEqual(serverModel.get("board").id);
    expect(clientModel.votingIteration).toEqual(serverModel.get("votingIteration"));
    expect(clientModel.voteLimit).toEqual(serverModel.get("voteLimit"));
    expect(clientModel.allowMultipleVotesPerNote).toEqual(serverModel.get("allowMultipleVotesPerNote"));
    expect(clientModel.showVotesOfOtherUsers).toEqual(serverModel.get("showVotesOfOtherUsers"));
  });
});
