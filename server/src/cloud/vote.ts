import {StatusResponse} from "types";
import {requireValidBoardMember, getMemberRoleName} from "./permission";
import {api, newObject} from "./util";

export interface VoteRequest {
  boardId: string;
  noteId: string;
}

export const initializeVoteFunctions = () => {
  api<VoteRequest, StatusResponse>("addVote", async (user, request) => {
    await requireValidBoardMember(user, request.boardId);

    const board = await new Parse.Query("Board").get(request.boardId, {useMasterKey: true});
    // Check if the board exists
    if (!board) {
      return {status: "Error", description: `Board '${request.boardId}' does not exist`};
    }
    // Check if 'voting' is active
    if (board.get("voting") === "disabled") {
      return {status: "Error", description: "You cannot vote while voting is disabled"};
    }

    const votingIteration = await board.get("votingIteration");

    // Select votes of current iteration
    const voteQuery = new Parse.Query("Vote");
    voteQuery.equalTo("board", board);
    voteQuery.equalTo("user", user);
    voteQuery.equalTo("votingIteration", votingIteration);

    // Gets the vote configuration of the current voting iteration
    const voteConfigurationQuery = new Parse.Query("VoteConfiguration");
    voteConfigurationQuery.equalTo("board", board);
    const voteConfiguration = await voteConfigurationQuery.equalTo("votingIteration", votingIteration).first({useMasterKey: true});

    const count = await voteQuery.count({useMasterKey: true});
    const limit = await voteConfiguration.get("voteLimit");
    // Check if user exceeds his vote limit
    if (count >= limit) {
      return {status: "Error", description: "You have already cast all your votes"};
    }

    const note = Parse.Object.extend("Note").createWithoutData(request.noteId);

    voteQuery.equalTo("note", note);

    // Check if user has voted already on this note
    if ((await voteQuery.count({useMasterKey: true})) >= 1 && !(await voteConfiguration.get("allowMultipleVotesPerNote"))) {
      return {status: "Error", description: "You can't vote multiple times per note"};
    }

    const vote = newObject("Vote", {board, note, user, votingIteration}, {readRoles: [getMemberRoleName(request.boardId)]});

    await vote.save(null, {useMasterKey: true});
    return {status: "Success", description: "Your vote has been added"};
  });

  api<VoteRequest, StatusResponse>("removeVote", async (user, request) => {
    const note = Parse.Object.extend("Note").createWithoutData(request.noteId);
    const board = await new Parse.Query("Board").get(request.boardId, {useMasterKey: true});

    const voteQuery = new Parse.Query("Vote");
    voteQuery.equalTo("note", note);
    voteQuery.equalTo("user", user);
    const vote = await voteQuery.limit(1).first({useMasterKey: true});

    // Check if vote exists
    if (!vote) {
      return {status: "Error", description: `No votes for user '${user.id}' exist on note '${request.noteId}'`};
    }
    // Check if 'voting' is active
    if (board.get("voting") === "disabled") {
      return {status: "Error", description: "You cannot withdraw a vote while voting is disabled"};
    }
    // Delete corresponding vote
    await vote.destroy({useMasterKey: true});

    return {status: "Success", description: "Your vote was withdrawn"};
  });
};
