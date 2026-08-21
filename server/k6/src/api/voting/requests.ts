export interface CreateVotingRequest {
  voteLimit: number;
  allowMultipleVotes: boolean;
  showVotesOfOthers: boolean;
  isAnonymous: boolean;
}
