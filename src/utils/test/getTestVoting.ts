import {Voting} from "store/features/votings/types";

export default function getTestVoting(overwrite?: Partial<Voting>): Voting {
  return {
    id: "test-votings-open-id-1",
    voteLimit: 5,
    allowMultipleVotes: false,
    showVotesOfOthers: false,
    status: "OPEN",
    isAnonymous: true,
    ...overwrite,
  };
}
