import Parse from "parse";

/**
 * The representation of a vote configuration on the server.
 */
export interface VoteConfigurationServerModel extends Parse.Object {
  board: Parse.Object;
  votingIteration: number;
  voteLimit: number;
  allowMultipleVotesPerNote: boolean;
  showVotesOfOtherUsers: boolean;
}

/**
 * The representation of a vote configuration on the client.
 */
export interface VoteConfigurationClientModel {
  boardId: string;
  votingIteration: number;
  voteLimit: number;
  allowMultipleVotesPerNote: boolean;
  showVotesOfOtherUsers: boolean;
}

type EditableVoteConfigurationAttributes = {
  voteLimit: number;
  allowMultipleVotesPerNote: boolean;
  showVotesOfOtherUsers: boolean;
};

export type VoteConfiguration = {boardId: string} & EditableVoteConfigurationAttributes;

export const mapVoteConfigurationServerToClientModel = (voteConfiguration: VoteConfigurationServerModel): VoteConfigurationClientModel => ({
  boardId: voteConfiguration.get("board").id,
  votingIteration: voteConfiguration.get("votingIteration"),
  voteLimit: voteConfiguration.get("voteLimit"),
  allowMultipleVotesPerNote: voteConfiguration.get("allowMultipleVotesPerNote"),
  showVotesOfOtherUsers: voteConfiguration.get("showVotesOfOtherUsers"),
});
