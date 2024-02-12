export type VotingStatus = "OPEN" | "CLOSED";

/**
 * The representation of a vote configuration on the server.
 */
export interface Voting {
  id: string;
  voteLimit: number;
  allowMultipleVotes: boolean;
  showVotesOfOthers: boolean;
  status: VotingStatus;
  votes?: {
    total: number;
    votesPerNote: {
      [noteId: string]: {
        total: number;
        userVotes?: {
          id: string;
          total: number;
        }[];
      };
    };
  };
}

export interface CreateVotingRequest {
  voteLimit: number;
  allowMultipleVotes: boolean;
  showVotesOfOthers: boolean;
}

export interface VotingsState {
  open?: Voting;
  past: Voting[];
}
