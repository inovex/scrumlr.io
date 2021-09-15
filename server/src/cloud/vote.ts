import {requireValidBoardMember, getMemberRoleName} from "./permission";
import {api, newObject} from "./util";

export interface VoteRequest {
  board: string;
  note: string;
}

export const initializeVoteFunctions = () => {
  api<VoteRequest, {status: string; description: string}>("addVote", async (user, request) => {
    await requireValidBoardMember(user, request.board);

    const board = await new Parse.Query("Board").get(request.board, {useMasterKey: true});
    // Check if the board exists
    if (!board) {
      return {status: "Error", description: `Board '${request.board}' does not exist`};
    }
    // Check if 'voting' is active
    if (board.get("voting") === "disabled") {
      return {status: "Error", description: "You cannot vote while voting is disabled"};
    }
    // Check if user will exceed vote limit
    const voteQuery = new Parse.Query("Vote");
    voteQuery.equalTo("board", board);
    voteQuery.equalTo("user", user);
    voteQuery.equalTo("votingIteration", board.get("votingIteration"));
    if ((await voteQuery.count({useMasterKey: true})) >= board.get("voteLimit")) {
      return {status: "Error", description: "You have already cast all your votes"};
    }
    // Create vote for corresponding note, user and board
    const note = Parse.Object.extend("Note").createWithoutData(request.note);
    const vote = newObject("Vote", {board, note, user, votingIteration: await board.get("votingIteration")}, {readRoles: [getMemberRoleName(request.board)]});
    await vote.save(null, {useMasterKey: true});

    return {status: "Success", description: "Your vote has been added"};
  });

  api<VoteRequest, {status: string; description: string}>("removeVote", async (user, request) => {
    const note = Parse.Object.extend("Note").createWithoutData(request.note);
    const board = await new Parse.Query("Board").get(request.board, {useMasterKey: true});

    const voteQuery = new Parse.Query("Vote");
    voteQuery.equalTo("note", note);
    voteQuery.equalTo("user", user);
    const vote = await voteQuery.limit(1).first({useMasterKey: true});

    // Check if vote exists
    if (!vote) {
      return {status: "Error", description: `No votes for user '${user.id}' exist on note '${request.note}'`};
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
