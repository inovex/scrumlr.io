import {requireValidBoardAdmin, getAdminRoleName, getMemberRoleName} from "./permission";
import {api, newObject} from "./util";

export interface EditableVoteConfigurationAttributes {
  voteLimit: number;
  allowMultipleVotesPerNote: boolean;
  showVotesOfOtherUsers: boolean;
}

export type VoteConfiguration = {board: string} & Partial<EditableVoteConfigurationAttributes>;

export const initializeVoteConfigurationFunctions = () => {
  /**
   * Add vote configurtaions for each voting iteration.
   */
  api<{voteConfiguration: VoteConfiguration}, {status: string; description: string}>("addVoteConfiguration", async (user, request) => {
    await requireValidBoardAdmin(user, request.voteConfiguration.board);
    const board = await new Parse.Query("Board").get(request.voteConfiguration.board, {useMasterKey: true});

    // Check if the board exists
    if (!board) {
      return {status: "Error", description: `Board '${request.voteConfiguration.board}' does not exist`};
    }

    // Voting iteraion will incremented after pressing the start voting phase button
    const voteConfiguration = newObject(
      "VoteConfiguration",
      {
        board: Parse.Object.extend("Board").createWithoutData(request.voteConfiguration.board),
        votingIteration: (await board.get("votingIteration")) + 1,
        voteLimit: request.voteConfiguration.voteLimit,
        allowMultipleVotesPerNote: request.voteConfiguration.allowMultipleVotesPerNote,
        showVotesOfOtherUsers: request.voteConfiguration.showVotesOfOtherUsers,
      },
      {
        readRoles: [getMemberRoleName(request.voteConfiguration.board), getAdminRoleName(request.voteConfiguration.board)],
        writeRoles: [getAdminRoleName(request.voteConfiguration.board)],
      }
    );

    await voteConfiguration.save(null, {useMasterKey: true});

    return {status: "Success", description: "Your vote configuration has been added"};
  });

  /**
   * Remove vote configurtaions for each voting iteration.
   */
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
    const voteConfiguration = await voteConfigurationQuery.equalTo("votingIteration", await board.get("votingIteration")).first();

    await voteConfiguration.destroy({useMasterKey: true});

    return {status: "Success", description: "Your vote configuration was withdrawn"};
  });

  /**
   * Update vote configurtaions for each voting iteration.
   */
  api<{voteConfiguration: VoteConfiguration}, {status: string; description: string}>("updateVoteConfiguration", async (user, request) => {
    await requireValidBoardAdmin(user, request.voteConfiguration.board);
    const board = await new Parse.Query("Board").get(request.voteConfiguration.board, {useMasterKey: true});

    // Check if the board exists
    if (!board) {
      return {status: "Error", description: `Board '${request.voteConfiguration.board}' does not exist`};
    }

    const voteConfigurationQuery = new Parse.Query("VoteConfiguration");
    voteConfigurationQuery.equalTo("board", board);
    const voteConfiguration = await voteConfigurationQuery.equalTo("votingIteration", (await board.get("votingIteration")) + 1).first();

    if (request.voteConfiguration.voteLimit) {
      voteConfiguration.set("voteLimit", request.voteConfiguration.voteLimit);
    }
    if (request.voteConfiguration.allowMultipleVotesPerNote !== undefined) {
      voteConfiguration.set("allowMultipleVotesPerNote", request.voteConfiguration.allowMultipleVotesPerNote);
    }
    if (request.voteConfiguration.showVotesOfOtherUsers !== undefined) {
      voteConfiguration.set("voteLimit", request.voteConfiguration.showVotesOfOtherUsers);
    }

    await voteConfiguration.save(null, {useMasterKey: true});

    return {status: "Success", description: "Your vote configuration has been added"};
  });
};
