import {requireValidBoardAdmin, getAdminRoleName, getMemberRoleName} from "./permission";
import {api, newObject} from "./util";

export interface VoteConfiguration {
  board: string;
  voteLimit: number;
  multipleVotesPerNote: boolean;
  hideVotesDuringVotingPhase: boolean;
}

export const initializeVoteConfigurationFunctions = () => {
  // Add vote configuration
  api<VoteConfiguration, {status: string; description: string}>("addVoteConfiguration", async (user, request) => {
    await requireValidBoardAdmin(user, request.board);
    const board = await new Parse.Query("Board").get(request.board, {useMasterKey: true});

    // Check if the board exists
    if (!board) {
      return {status: "Error", description: `Board '${request.board}' does not exist`};
    }

    // Voting iteraion will incremented after pressing the start voting phase button
    const voteConfiguration = newObject(
      "VoteConfiguration",
      {
        board: Parse.Object.extend("Board").createWithoutData(request.board),
        votingIteration: (await board.get("votingIteration")) + 1,
        voteLimit: request.voteLimit,
        multipleVotesPerNote: request.multipleVotesPerNote,
        hideVotesDuringVotingPhase: request.hideVotesDuringVotingPhase,
      },
      {
        readRoles: [getMemberRoleName(request.board), getAdminRoleName(request.board)],
        writeRoles: [getAdminRoleName(request.board)],
      }
    );

    await voteConfiguration.save(null, {useMasterKey: true});

    return {status: "Success", description: "Your vote configuration has been added"};
  });

  // Update vote configuration
  api<VoteConfiguration, {status: string; description: string}>("updateVoteConfiguration", async (user, request) => {
    await requireValidBoardAdmin(user, request.board);
    const board = await new Parse.Query("Board").get(request.board, {useMasterKey: true});

    // Check if the board exists
    if (!board) {
      return {status: "Error", description: `Board '${request.board}' does not exist`};
    }

    const voteConfigurationQuery = new Parse.Query("VoteConfiguration");
    voteConfigurationQuery.equalTo("board", board);
    // Voting iteraion will incremented after pressing the start voting phase button
    const voteConfiguration = await voteConfigurationQuery.get("votingIteration", board.get("votingIteration") + 1);

    if (request.voteLimit) {
      voteConfiguration.set("voteLimit", request.voteLimit);
    }
    if (request.multipleVotesPerNote != null) {
      voteConfiguration.set("voteLimit", request.multipleVotesPerNote);
    }
    if (request.hideVotesDuringVotingPhase != null) {
      voteConfiguration.set("hideVotesDuringVotingPhase", request.hideVotesDuringVotingPhase);
    }

    await voteConfiguration.save(null, {useMasterKey: true});
    return {status: "Success", description: "Your vote configuration has been updated"};
  });

  // Cancle voting during voting phase
  api<{board: string}, {status: string; description: string}>("removeVoteConfiguration", async (user, request) => {
    await requireValidBoardAdmin(user, request.board);
    const board = await new Parse.Query("Board").get(request.board, {useMasterKey: true});

    // Check if the board exists
    if (!board) {
      return {status: "Error", description: `Board '${request.board}' does not exist`};
    }

    const voteConfigurationQuery = new Parse.Query("VoteConfiguration");
    voteConfigurationQuery.equalTo("board", board);
    // Voting iteraion already incremented
    const voteConfiguration = await voteConfigurationQuery.get("votingIteration", board.get("votingIteration"));

    await voteConfiguration.destroy({useMasterKey: true});

    return {status: "Success", description: "Your vote configuration was withdrawn"};
  });
};
