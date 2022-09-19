export type VotingStatus = "OPEN" | "CLOSED" | "ABORTED";

/**
 * The representation of a vote configuration on the server.
 */
export type Voting = {
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
};

export type CreateVotingRequest = {
  voteLimit: number;
  allowMultipleVotes: boolean;
  showVotesOfOthers: boolean;
};

export type VotingsState = {
  open?: Voting;
  past: Voting[];
};
