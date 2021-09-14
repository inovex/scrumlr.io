import Parse from "parse";

/**
 * The representation of a vote configuration on the server.
 */
export interface VoteConfigurationServerModel extends Parse.Object {
  board: Parse.Object;
  votingIteration: number;
  voteLimit: number;
  multipleVotesPerNote: boolean;
  hideVotesDuringVotingPhase: boolean;
}

/**
 * The representation of a vote configuration on the client.
 */
export interface VoteConfigurationClientModel {
  board: string;
  votingIteration: number;
  voteLimit: number;
  multipleVotesPerNote: boolean;
  hideVotesDuringVotingPhase: boolean;
}

type EditableVoteConfigurationAttributes = {
  voteLimit: number;
  multipleVotesPerNote: boolean;
  hideVotesDuringVotingPhase: boolean;
};

export type VoteConfiguration = {board: string} & Partial<EditableVoteConfigurationAttributes>;

export const mapVoteConfigurationServerToClientModel = (voteConfiguration: VoteConfigurationServerModel): VoteConfigurationClientModel => ({
  board: voteConfiguration.get("board").id,
  votingIteration: voteConfiguration.get("votingIteration"),
  voteLimit: voteConfiguration.get("voteLimit"),
  multipleVotesPerNote: voteConfiguration.get("multipleVotesPerNote"),
  hideVotesDuringVotingPhase: voteConfiguration.get("hideVotesDuringVotingPhase"),
});
