import {requireValidBoardAdmin, getAdminRoleName, getMemberRoleName} from "./permission";
import {api, newObject} from "./util";

export type EditableVoteConfigurationAttributes = {
  voteLimit: number;
  allowMultipleVotesPerNote: boolean;
  showVotesOfOtherUsers: boolean;
};

export type VoteConfiguration = {boardId: string} & Partial<EditableVoteConfigurationAttributes>;

export const initializeVoteConfigurationFunctions = () => {
  /**
   * Add vote configurtaions for each voting iteration.
   */
  api<{voteConfiguration: VoteConfiguration}, {status: string; description: string}>("addVoteConfiguration", async (user, request) => {
    await requireValidBoardAdmin(user, request.voteConfiguration.boardId);
    const board = await new Parse.Query("Board").get(request.voteConfiguration.boardId, {useMasterKey: true});

    // Check if the board exists
    if (!board) {
      return {status: "Error", description: `Board '${request.voteConfiguration.boardId}' does not exist`};
    }

    // Voting iteraion will incremented after pressing the start voting phase button
    const voteConfiguration = newObject(
      "VoteConfiguration",
      {
        board: Parse.Object.extend("Board").createWithoutData(request.voteConfiguration.boardId),
        votingIteration: (await board.get("votingIteration")) + 1,
        voteLimit: request.voteConfiguration.voteLimit,
        allowMultipleVotesPerNote: request.voteConfiguration.allowMultipleVotesPerNote,
        showVotesOfOtherUsers: request.voteConfiguration.showVotesOfOtherUsers,
      },
      {
        readRoles: [getMemberRoleName(request.voteConfiguration.boardId), getAdminRoleName(request.voteConfiguration.boardId)],
        writeRoles: [getAdminRoleName(request.voteConfiguration.boardId)],
      }
    );

    await voteConfiguration.save(null, {useMasterKey: true});

    return {status: "Success", description: "Your vote configuration has been added"};
  });
};
