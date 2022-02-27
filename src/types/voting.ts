export type VotingStatus = "OPEN" | "CLOSED" | "ABORTED";

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
    voterPerNote: {
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

export interface VotingState {
  open?: Voting;
  past: Voting[];
}
