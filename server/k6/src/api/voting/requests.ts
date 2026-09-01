import { VotingStatus } from "../../types/voting";

export interface CreateVotingRequest {
	voteLimit: number;
	allowMultipleVotes: boolean;
	showVotesOfOthers: boolean;
	isAnonymous: boolean;
}

export interface UpdateVotingRequest {
  status: VotingStatus
}
