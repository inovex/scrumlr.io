import {Voting} from "types/voting";

export default (overwrite?: Partial<Voting>): Voting => ({
  id: "test-votings-open-id-1",
  voteLimit: 5,
  allowMultipleVotes: false,
  showVotesOfOthers: false,
  status: "OPEN",
  ...overwrite,
});
