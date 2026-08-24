export type VotingStatus = "OPEN" | "CLOSED";

export interface VotingResultsPerUser {
	id: string;
	total: number;
}

export interface VotingResultsPerNote {
	total: number;
	userVotes?: VotingResultsPerUser[];
}

export interface VotingResults {
	total: number;
	votesPerNote?: Record<string, VotingResultsPerNote>;
}

export interface Voting {
	id: string;
	voteLimit: number;
	allowMultipleVotes: boolean;
	showVotesOfOthers: boolean;
	isAnonymous: boolean;
	status: VotingStatus;
	votes?: VotingResults;
}
